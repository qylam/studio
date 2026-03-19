
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // We use GEMINI_API_KEY because Firebase App Hosting reserves the GOOGLE_ prefix.
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash-image', // Nano Banana 2
});
