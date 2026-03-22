'use server';
/**
 * @fileOverview A Genkit flow for transforming a user's photo into a themed, stylized masterpiece.
 *
 * - generateThemedPhoto - A function that handles the photo transformation process.
 * - GenerateThemedPhotoInput - The input type for the generateThemedPhoto function.
 * - GenerateThemedPhotoOutput - The return type for the generateThemedPhoto function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ThemeVariationSchema = z.object({
  scene: z.string().describe('The primary scene or location.'),
  activity: z.string().describe('The activity the user is performing.'),
});

const GenerateThemedPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  themeVariations: z.array(ThemeVariationSchema).optional().describe('A list of potential theme variations for Gemini to choose from.'),
  scene: z.string().optional().describe('A specific scene (overrides variations if provided).'),
  activity: z.string().optional().describe('A specific activity (overrides variations if provided).'),
  details: z.array(z.string()).describe('Specific stylistic or background details to include.'),
});
export type GenerateThemedPhotoInput = z.infer<typeof GenerateThemedPhotoInputSchema>;

const GenerateThemedPhotoOutputSchema = z.object({
  transformedPhotoDataUri: z.string().describe('The data URI of the generated and stylized photo.'),
  description: z.string().describe('A textual description of the generated image scene.'),
  selectedScene: z.string().describe('The scene variation chosen by the AI.'),
  selectedActivity: z.string().describe('The activity variation chosen by the AI.'),
});
export type GenerateThemedPhotoOutput = z.infer<typeof GenerateThemedPhotoOutputSchema>;

/**
 * Wrapper function for the Server Action to handle errors gracefully.
 */
export async function generateThemedPhoto(input: GenerateThemedPhotoInput): Promise<{ success: boolean; data?: GenerateThemedPhotoOutput; error?: string }> {
  try {
    const result = await generateThemedPhotoFlow(input);
    return { success: true, data: result };
  } catch (error: any) {
    // LOGGING THE TRUE REASON FOR FAILURE
    // We use Object.getOwnPropertyNames to ensure we capture non-enumerable properties like 'message' and 'stack'
    const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    
    console.error("---------- AI_GENERATION_FAILED: API DIAGNOSTICS ----------");
    console.error("Timestamp:", new Date().toISOString());
    // console.error("Full Error Object:", errorDetails);
    console.error("Full Error Object:")
    console.dir(error, { depth: null, colors: true });
    
    // Auto-Diagnosis
    if (error?.message?.toLowerCase().includes("safety") || errorDetails.toLowerCase().includes("safety")) {
      console.error("DIAGNOSIS: The request was likely blocked by Gemini's Safety Filters.");
    } else if (error?.status === 429 || error?.message?.includes("429")) {
      console.error("DIAGNOSIS: API Rate Limit Exceeded (Quota).");
    } else if (error?.status === 500 || error?.status === 503) {
      console.error("DIAGNOSIS: Google AI Server Error or Overload.");
    }
    
    console.error("Input Context (Redacted Image):", { ...input, photoDataUri: "REDACTED_FOR_LOGS" });
    console.error("-----------------------------------------------------------");

    let specificErrorMsg = "The AI was unable to process your request. Please try a different style or photo.";
    
    // Aggressively extract the REAL error from Genkit/Google AI
    if (error?.originalMessage) {
      specificErrorMsg = `AI Error: ${error.originalMessage}`;
    } else if (error?.detail && typeof error.detail === 'string') {
      specificErrorMsg = `AI Error: ${error.detail}`;
    } else if (error?.message) {
      // Fallback to the top-level message if original/detail are missing
      specificErrorMsg = `AI Error: ${error.message}`;
    }

    // Still keep our friendly overrides for common UX issues
    if (specificErrorMsg.toLowerCase().includes("safety") || specificErrorMsg.includes("HARM_CATEGORY")) {
      specificErrorMsg = "Safety filter triggered. Please try a more neutral theme or photo. (" + specificErrorMsg + ")";
    } else if (error?.status === 429 || specificErrorMsg.includes("429")) {
      specificErrorMsg = "The AI service is currently busy (Quota Exceeded). Please wait a moment and try again.";
    }

    return { 
      success: false, 
      error: specificErrorMsg
    };
  }
}

/**
 * Directly passes UI selections and the photo to the multimodal preview model.
 */
const themedPhotoPrompt = ai.definePrompt({
  name: 'themedPhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  model: 'googleai/gemini-3.1-flash-image-preview',
  config: {
    responseModalities: ['IMAGE'],
    imageConfig: {
      aspectRatio: '1:1',
      imageSize: "1K"
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
  prompt: `You are an expert cinematic AI artist. Your task is to generate a high-end stylized portrait.

CRITICAL INSTRUCTION: First, analyze the reference photo to determine the exact number of people present. You MUST keep the exact same number of individuals in your generation. You MUST use the provided reference photo to maintain the subject's (or subjects') exact facial features, identity, gender, age, ethnicity, and structural silhouette. Do NOT alter their likenesses.

Apply the following environment, lighting, and artistic style to the subject:
- Scene: {{{scene}}}
- Activity: {{{activity}}}
{{#each details}}
- {{{this}}}
{{/each}}

Reference Photo: {{media url=photoDataUri}}`,
});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    // --- SINGLE STEP EXECUTION ---
    console.log("---------- AI IMAGE GENERATION START ----------");
    const response = await themedPhotoPrompt(input);
    const media = response.media;
    
    console.log("IMAGE GENERATED:", media ? "YES" : "NO");
    if (media) {
      console.log("IMAGE CONTENT TYPE:", media.contentType);
      console.log("IMAGE DATA LENGTH:", media.url?.length || 0);
    }
    console.log("---------- AI IMAGE GENERATION END ------------");

    if (!media) {
      throw new Error('AI failed to generate the stylized image part of the response.');
    }

    return {
      transformedPhotoDataUri: media.url,
      description: "Direct image generation without text analysis.",
      selectedScene: input.scene || "Unknown Scene",
      selectedActivity: input.activity || "Unknown Activity",
    };
  }
);
