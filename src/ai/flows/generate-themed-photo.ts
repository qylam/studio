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

export async function generateThemedPhoto(input: GenerateThemedPhotoInput): Promise<GenerateThemedPhotoOutput> {
  return generateThemedPhotoFlow(input);
}

/**
 * MASTER PROMPT TEMPLATE
 * Instructs Gemini to analyze the user's photo and either use the provided scene/activity 
 * or select the best fit from the provided variations.
 * 
 * NOTE: We remove the 'output' schema here because multimodal image generation models
 * often don't support strict JSON mode. We parse the text response instead.
 */
const themedPhotoPrompt = ai.definePrompt({
  name: 'themedPhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  model: 'googleai/gemini-2.5-flash-image',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  prompt: `You are an expert photo editor and artistic AI. Your task is to transform the provided photo into a stylized masterpiece.

STEP 1: IDENTIFY THE THEME
{{#if scene}}
Use the provided scene: "{{{scene}}}" and activity: "{{{activity}}}"
{{else}}
Analyze the user's pose, expression, and clothing in the photo. From the following list of variations, select the ONE that would result in the most natural and cinematic transformation for this specific person:
{{#each themeVariations}}
Option {{@index}}: Scene: "{{{this.scene}}}", Activity: "{{{this.activity}}}"
{{/each}}
{{/if}}

STEP 2: APPLY ARTISTIC STYLE
Transform the subject based on the chosen theme.
Include these specific stylistic details:
{{#each details}}
- {{{this}}}
{{/each}}

Strictly maintain the subject's likeness and original pose. The style should be cinematic and high-quality.

TEXT OUTPUT FORMAT:
You MUST provide the following three lines at the very beginning of your text response:
SELECTED_SCENE: [The chosen scene]
SELECTED_ACTIVITY: [The chosen activity]
DESCRIPTION: [A short, 1-sentence description of the final image]

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

    if (!media || !text) {
      throw new Error('Failed to generate image or extract response text.');
    }

    // Manual parsing of the text response to extract selections
    const lines = text.split('\n');
    const selectedScene = lines.find(l => l.startsWith('SELECTED_SCENE:'))?.replace('SELECTED_SCENE:', '').trim() || input.scene || 'Unknown Scene';
    const selectedActivity = lines.find(l => l.startsWith('SELECTED_ACTIVITY:'))?.replace('SELECTED_ACTIVITY:', '').trim() || input.activity || 'Unknown Activity';
    const description = lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() || 'A personalized AI vision.';

    return {
      transformedPhotoDataUri: media.url,
      description: description,
      selectedScene: selectedScene,
      selectedActivity: selectedActivity,
    };
  }
);
