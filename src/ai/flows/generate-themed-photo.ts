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
 * This prompt instructs Gemini to analyze the user's photo and either use the provided scene/activity 
 * or select the best fit from the provided variations.
 */
const themedPhotoPrompt = ai.definePrompt({
  name: 'themedPhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  output: { schema: GenerateThemedPhotoOutputSchema },
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

OUTPUT:
1. The transformed image.
2. A description of the scene.
3. The 'selectedScene' and 'selectedActivity' used for the generation.

Photo: {{media url=photoDataUri}}`,
});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    const { output, media } = await themedPhotoPrompt(input);

    if (!media || !output) {
      throw new Error('Failed to generate image or extract selection data.');
    }

    return {
      transformedPhotoDataUri: media.url,
      description: output.description,
      selectedScene: output.selectedScene,
      selectedActivity: output.selectedActivity,
    };
  }
);
