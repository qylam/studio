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
 * STEP 1: THE DIRECTOR
 * Instructs Gemini to analyze the user's photo and either use the provided scene/activity 
 * or select the best fit from the provided variations. It then outputs structured JSON
 * containing the choices and a highly detailed image generation prompt.
 */
const analyzePhotoPrompt = ai.definePrompt({
  name: 'analyzePhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  model: 'googleai/gemini-2.5-flash',
  output: { 
    format: 'json',
    schema: z.object({
      selectedScene: z.string().describe("The scene variation chosen by the AI."),
      selectedActivity: z.string().describe("The activity variation chosen by the AI."),
      imagePrompt: z.string().describe("A highly detailed prompt for an image generation model, integrating the subject's description, the scene, and the lighting.")
    })
  },
  config: {
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
  prompt: `You are an expert high-end photo editor and cinematic AI Art Director working for a luxury lifestyle magazine. Your task is to analyze the provided photo of an executive and write a highly detailed image generation prompt to transform them into a stylized, aspirational masterpiece.

STEP 1: IDENTIFY THE THEME
{{#if scene}}
Use the provided scene: "{{{scene}}}" and activity: "{{{activity}}}"
{{else}}
Analyze the user's pose, expression, and clothing in the photo. From the following list of variations, select the ONE that would result in the most natural and cinematic transformation for this specific person:
{{#each themeVariations}}
Option {{@index}}: Scene: "{{{this.scene}}}", Activity: "{{{this.activity}}}"
{{/each}}
{{/if}}

STEP 2: WRITE THE IMAGE PROMPT
Write an incredibly detailed prompt for an image generation model based on the chosen theme. You MUST adhere to these strict constraints:
1. SUBJECT DESCRIPTION: Describe the subject's facial features, gender, age, ethnicity, and clothing in extreme detail so the image generator can recreate their exact identity.
2. POSE MATCHING: Describe the subject's exact body pose and structural silhouette.
3. ENVIRONMENTAL BLENDING: Describe how the subject is seamlessly integrated into the new scene with appropriate environmental lighting, reflections, and shadows.
4. PREMIUM TONE: The final image must feel expensive, aspirational, and high-quality.

Include these specific stylistic details in your image prompt:
{{#each details}}
- {{{this}}}
{{/each}}

Photo: {{media url=photoDataUri}}`,
});

/**
 * STEP 2: THE ARTIST
 * Takes the highly detailed prompt generated by Step 1 and passes it directly to the image model
 * ALONG with the original photo, forcing the model to strictly adhere to the user's likeness.
 */
const generateImagePrompt = ai.definePrompt({
  name: 'generateImagePrompt',
  input: { 
    schema: z.object({
      imagePrompt: z.string().describe("The highly detailed image generation prompt."),
      photoDataUri: z.string().describe("The original user photo for identity reference.")
    })
  },
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

CRITICAL INSTRUCTION: You MUST use the provided reference photo to maintain the subject's exact facial features, identity, and structural silhouette. Do NOT alter their likeness.

Apply the following environment, lighting, and artistic style to the subject:
{{{imagePrompt}}}

Reference Photo: {{media url=photoDataUri}}`,
});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    // Step 1: The Director (Text Analysis)
    console.log("---------- AI STEP 1: DIRECTOR START ----------");
    const directorResponse = await analyzePhotoPrompt(input);
    const directorData = directorResponse.output;
    console.log("DIRECTOR OUTPUT:\n", JSON.stringify(directorData, null, 2));
    console.log("---------- AI STEP 1: DIRECTOR END ------------");

    if (!directorData || !directorData.imagePrompt) {
      throw new Error('AI failed to generate the image prompt instructions.');
    }

    // Step 2: The Artist (Image Generation)
    console.log("---------- AI STEP 2: ARTIST START ----------");
    const artistResponse = await generateImagePrompt({ 
      imagePrompt: directorData.imagePrompt,
      photoDataUri: input.photoDataUri 
    });
    const media = artistResponse.media;
    console.log("IMAGE GENERATED:", media ? "YES" : "NO");
    if (media) {
      console.log("IMAGE CONTENT TYPE:", media.contentType);
      console.log("IMAGE DATA LENGTH:", media.url?.length || 0);
    }
    console.log("---------- AI STEP 2: ARTIST END ------------");

    if (!media) {
      throw new Error('AI failed to generate the stylized image part of the response.');
    }

    return {
      transformedPhotoDataUri: media.url,
      description: directorData.imagePrompt,
      selectedScene: directorData.selectedScene,
      selectedActivity: directorData.selectedActivity,
    };
  }
);
