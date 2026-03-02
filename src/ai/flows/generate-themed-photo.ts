'use server';
/**
 * @fileOverview A Genkit flow for transforming a user's photo into a themed, stylized masterpiece using AI.
 *
 * - generateThemedPhoto - A function that handles the photo transformation process.
 * - GenerateThemedPhotoInput - The input type for the generateThemedPhoto function.
 * - GenerateThemedPhotoOutput - The return type for the generateThemedPhoto function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateThemedPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  theme: z.string().describe('The selected theme for the photo transformation (e.g., "take a well-earned break", "find my zen").'),
  styleOption1: z.string().describe('The first refinement option for artistic style.'),
  styleOption2: z.string().describe('The second refinement option for artistic style.'),
  styleOption3: z.string().describe('The third refinement option for artistic style.'),
});
export type GenerateThemedPhotoInput = z.infer<typeof GenerateThemedPhotoInputSchema>;

const GenerateThemedPhotoOutputSchema = z.object({
  transformedPhotoDataUri: z.string().describe('The data URI of the generated and stylized photo.'),
  description: z.string().describe('A textual description of the generated image scene.'),
});
export type GenerateThemedPhotoOutput = z.infer<typeof GenerateThemedPhotoOutputSchema>;

export async function generateThemedPhoto(input: GenerateThemedPhotoInput): Promise<GenerateThemedPhotoOutput> {
  return generateThemedPhotoFlow(input);
}

const themedPhotoPrompt = ai.definePrompt({
  name: 'themedPhotoPrompt',
  input: { schema: GenerateThemedPhotoInputSchema },
  // Note: output schema is intentionally omitted here because gemini-2.5-flash-image 
  // does not support JSON mode when generating IMAGE modalities.
  model: 'googleai/gemini-2.5-flash-image',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  prompt: `You are an expert photo editor and artistic AI. Your task is to transform the provided photo into a stylized masterpiece based on the given theme and artistic preferences, while strictly maintaining the subject's likeness and original pose. The goal is to depict the user in a scene that evokes having gained significant free time (up to 10 hours per week), aligning with the selected theme.

Theme: "{{{theme}}}"
Artistic Refinement 1: "{{{styleOption1}}}"
Artistic Refinement 2: "{{{styleOption2}}}"
Artistic Refinement 3: "{{{styleOption3}}}"

Generate an image that incorporates these elements. Also provide a concise textual description of the created scene.

Photo: {{media url=photoDataUri}}`,
});

const generateThemedPhotoFlow = ai.defineFlow(
  {
    name: 'generateThemedPhotoFlow',
    inputSchema: GenerateThemedPhotoInputSchema,
    outputSchema: GenerateThemedPhotoOutputSchema,
  },
  async (input) => {
    // Calling the prompt without a constrained output schema to avoid JSON mode errors
    const { text, media } = await themedPhotoPrompt(input);

    if (!media || !text) {
      throw new Error('Failed to generate image and/or description from the prompt.');
    }

    return {
      transformedPhotoDataUri: media.url,
      description: text,
    };
  }
);
