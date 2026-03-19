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
    const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    
    console.error("---------- AI_GENERATION_FAILED: API DIAGNOSTICS ----------");
    console.error("Timestamp:", new Date().toISOString());
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
  model: 'googleai/gemini-2.5-flash-image',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
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
  prompt: 
  `
    You are an elite visual effects artist creating high-end, stylized imagery. Your task is to reimagine the provided subject based on a specific artistic direction and environmental context.

    STEP 1: THEME & CONTEXT
    {{#if scene}}
    Setting: "{{{scene}}}"
    Action: "{{{activity}}}"
    {{else}}
    Analyze the original photo's composition. Select the most fitting context from the following options:
    {{#each themeVariations}}
    Option {{@index}}: Setting: "{{{this.scene}}}", Action: "{{{this.activity}}}"
    {{/each}}
    {{/if}}

    STEP 2: ARTISTIC EXECUTION
    Apply the following stylistic and medium requirements:
    {{#each details}}
    - {{{this}}}
    {{/each}}

    STEP 3: INTEGRATION RULES (STRICT)
    1. SUBJECT LIKENESS: Maintain the structural silhouette, recognizable features, and core visual essence of the original subject.
    2. HARMONY: If the artistic style dictates a specific setting (e.g., "on a computer desk"), that takes precedence. Otherwise, blend the subject seamlessly into the Theme Setting.
    3. LIGHTING: Ensure the lighting on the subject matches the environmental lighting perfectly.

    STEP 4: REQUIRED OUTPUT (TEXT AND IMAGE)
    You MUST provide BOTH the text description AND generate the final image.

    TEXT FORMAT (Start your response with these exact lines):
    SELECTED_SCENE: [The chosen setting]
    SELECTED_ACTIVITY: [The chosen action]
    DESCRIPTION: [A detailed, 2-sentence visual description of the image, describing the stylistic medium, the subject, and the environment]

    IMAGE GENERATION:
    After outputting the text above, you MUST generate the image based on your DESCRIPTION.

    Photo: {{media url=photoDataUri}}
  `,

});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    const { text, media } = await themedPhotoPrompt(input);

    if (!media) {
      throw new Error('AI failed to generate the stylized image part of the response.');
    }

    const lines = text ? text.split('\n') : [];
    const cleanStr = (str: string) => str.replace(/^Variation \d+ (Scene|Activity): /i, '').trim();

    const selectedScene = cleanStr(
      lines.find(l => l.startsWith('SELECTED_SCENE:'))?.replace('SELECTED_SCENE:', '').trim() 
      || input.scene 
      || (input.themeVariations?.[0]?.scene || 'Unknown Scene')
    );
      
    const selectedActivity = cleanStr(
      lines.find(l => l.startsWith('SELECTED_ACTIVITY:'))?.replace('SELECTED_ACTIVITY:', '').trim() 
      || input.activity 
      || (input.themeVariations?.[0]?.activity || 'Unknown Activity')
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