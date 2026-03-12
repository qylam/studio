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
    console.error("Full Error Object:", errorDetails);
    
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

    // Return a generic, safe error message for the UI
    return { 
      success: false, 
      error: "The AI was unable to process your request. This can happen due to safety filters or technical timeouts. Please try a different style or photo."
    };
  }
}

/**
 * MASTER PROMPT TEMPLATE
 * Instructs Gemini to analyze the user's photo and either use the provided scene/activity 
 * or select the best fit from the provided variations.
 */
const themedPhotoPrompt = ai.definePrompt({
  name: 'themedPhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  model: 'googleai/gemini-3.1-flash-image-preview',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: '1:1',
      imageSize: "2K"
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
  prompt: `You are an expert high-end photo editor and cinematic AI artist working for a luxury lifestyle magazine. Your task is to transform the provided photo of an executive into a stylized, aspirational masterpiece.

STEP 1: IDENTIFY THE THEME
{{#if scene}}
Use the provided scene: "{{{scene}}}" and activity: "{{{activity}}}"
{{else}}
Analyze the user's pose, expression, and clothing in the photo. From the following list of variations, select the ONE that would result in the most natural and cinematic transformation for this specific person:
{{#each themeVariations}}
Option {{@index}}: Scene: "{{{this.scene}}}", Activity: "{{{this.activity}}}"
{{/each}}
{{/if}}

STEP 2: APPLY ARTISTIC STYLE & INTEGRATION
Transform the subject based on the chosen theme. You MUST adhere to these strict constraints:
1. IDENTITY PRESERVATION: Do NOT alter the subject's facial features, identity, gender, age, or ethnicity. The face must remain instantly recognizable.
2. POSE MATCHING: Keep the subject's original body pose and structural silhouette intact.
3. ENVIRONMENTAL BLENDING: Seamlessly integrate the subject into the new scene. Cast appropriate environmental lighting, reflections, and shadows onto the subject so they do not look like a pasted sticker.
4. PREMIUM TONE: The final image must feel expensive, aspirational, and high-quality.

Include these specific stylistic details:
{{#each details}}
- {{{this}}}
{{/each}}

TEXT OUTPUT FORMAT:
You MUST output ONLY the following three lines at the very beginning of your response. Do not include any conversational filler, markdown formatting, or greetings.

SELECTED_SCENE: [The chosen scene]
SELECTED_ACTIVITY: [The chosen activity]
DESCRIPTION: [A highly detailed, 2-sentence visual description of the final image, integrating the subject, the scene, and the lighting]

Photo: {{media url=photoDataUri}}`,
});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    const { text, media } = await themedPhotoPrompt(input);

    // LOGGING THE FULL RESPONSE DATA
    console.log("---------- AI RESPONSE START ----------");
    console.log("RAW TEXT RESPONSE:\n", text);
    console.log("IMAGE GENERATED:", media ? "YES" : "NO");
    if (media) {
      console.log("IMAGE CONTENT TYPE:", media.contentType);
      console.log("IMAGE DATA LENGTH:", media.url?.length || 0);
    }
    console.log("---------- AI RESPONSE END ------------");

    if (!media) {
      throw new Error('AI failed to generate the stylized image part of the response.');
    }

    // Manual parsing of the text response to extract selections. 
    const lines = text ? text.split('\n') : [];
    
    // Helper to strip internal prefixes from theme strings
    const cleanStr = (str: string) => str.replace(/^Variation \d+ (Scene|Activity): /i, '').trim();

    const selectedScene = cleanStr(
      lines.find(l => l.startsWith('SELECTED_SCENE:'))?.replace('SELECTED_SCENE:', '').trim() 
      || input.scene 
      || (input.themeVariations && input.themeVariations.length > 0 ? input.themeVariations[0].scene : 'Unknown Scene')
    );
      
    const selectedActivity = cleanStr(
      lines.find(l => l.startsWith('SELECTED_ACTIVITY:'))?.replace('SELECTED_ACTIVITY:', '').trim() 
      || input.activity 
      || (input.themeVariations && input.themeVariations.length > 0 ? input.themeVariations[0].activity : 'Unknown Activity')
    );
      
    const description = lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() 
      || 'A personalized AI vision of your future free time.';

    return {
      transformedPhotoDataUri: media.url,
      description: description,
      selectedScene: selectedScene,
      selectedActivity: selectedActivity,
    };
  }
);
