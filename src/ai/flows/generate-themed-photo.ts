'use server';
/**
 * @fileOverview A Genkit flow for transforming a user's photo into a themed, stylized masterpiece using a structured prompt builder.
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
  scene: z.string().describe('The primary scene or location (e.g., "at an improv theatre class").'),
  activity: z.string().describe('The activity the user is performing (e.g., "reciting Hamlet").'),
  details: z.array(z.string()).describe('Specific stylistic or background details to include.'),
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
  model: 'googleai/gemini-2.5-flash-image',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
  prompt: `You are an expert photo editor and artistic AI. Your task is to transform the provided photo into a stylized masterpiece based on the structured prompt provided, while strictly maintaining the subject's likeness and original pose.

Imagine the user: "{{{scene}}}"
While: "{{{activity}}}"
With the following details:
{{#each details}}
- {{{this}}}
{{/each}}

Artistic style should be cinematic, high-quality, and evoke a sense of professional photography or digital art. Generate an image that incorporates these elements. Also provide a concise textual description of the created scene.

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
      throw new Error('Failed to generate image and/or description from the prompt.');
    }

    return {
      transformedPhotoDataUri: media.url,
      description: text,
    };
  }
);
