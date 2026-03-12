'use server';
/**
 * @fileOverview A Genkit flow for suggesting contextual artistic details based on a scene and activity.
 * 
 * - suggestDetails - A function that handles the suggestion process with error handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDetailsInputSchema = z.object({
  scene: z.string().describe('The primary scene or location.'),
  activity: z.string().describe('The activity being performed.'),
});
export type SuggestDetailsInput = z.infer<typeof SuggestDetailsInputSchema>;

const SuggestDetailsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3 creative stylistic or background details.'),
});
export type SuggestDetailsOutput = z.infer<typeof SuggestDetailsOutputSchema>;

/**
 * Wrapper function for the Server Action to handle errors gracefully.
 */
export async function suggestDetails(input: SuggestDetailsInput): Promise<{ success: boolean; data?: SuggestDetailsOutput; error?: string }> {
  try {
    const result = await suggestDetailsFlow(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("SUGGEST_DETAILS_FAILED:", {
      timestamp: new Date().toISOString(),
      error: error?.message || error,
      input
    });
    return { 
      success: false, 
      error: "Failed to generate suggestions. Please try again later." 
    };
  }
}

const suggestDetailsPrompt = ai.definePrompt({
  name: 'suggestDetailsPrompt',
  input: { schema: SuggestDetailsInputSchema },
  output: { schema: SuggestDetailsOutputSchema },
  prompt: `You are a creative prompt engineer for high-end AI image generation.

Based on the scene "{{{scene}}}" and the activity "{{{activity}}}", suggest 3 short, catchy, and highly visual stylistic or environmental details (3-5 words each) that would make an AI-generated photo look like a cinematic masterpiece.

Avoid generic terms. Be specific and evocative.
Examples: "golden hour lens flare", "floating holographic particles", "cyberpunk neon puddles", "vintage 35mm film grain".

Return exactly 3 unique suggestions in a list.`,
});

const suggestDetailsFlow = ai.defineFlow(
  {
    name: 'suggestDetailsFlow',
    inputSchema: SuggestDetailsInputSchema,
    outputSchema: SuggestDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await suggestDetailsPrompt(input);
    if (!output) throw new Error('Failed to generate suggestions.');
    return output;
  }
);
