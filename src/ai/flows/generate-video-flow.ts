'use server';
/**
 * @fileOverview A Genkit flow for generating videos using Veo.
 *
 * - generateVideo - A function that handles the video generation process.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The description of the video to generate.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
  id: z.string().optional(),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    // Initiation of video generation using Veo model
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Polling for completion. Veo generation typically takes 30-60 seconds.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      if (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (operation.error) {
      throw new Error('Failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video in the model output.');
    }

    // Download and convert to base64 for the prototype
    const videoDownloadResponse = await fetch(
      `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (!videoDownloadResponse.ok) {
      throw new Error('Failed to fetch video content from the generation service.');
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      videoUrl: `data:video/mp4;base64,${base64}`,
    };
  }
);
