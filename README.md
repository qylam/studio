# Free-Time Machine | AI Photo Experience

This is a NextJS-based AI photo booth experience powered by Gemini (Nano Banana 2) and Firebase.

## Getting Started

### 1. Get your Gemini API Key
You need a Google AI API key to power the image generation:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a new API key.
3. Copy the key.

### 2. Local Environment Setup
Create a `.env` file in the root directory and add your key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Production Setup (Required for Publishing)
To make the AI work after you click **Publish**, you must add your API key as a Secret in Firebase:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `free-timemachine-ent-923-220cc`.
3. Navigate to **App Hosting** -> **Your Backend** -> **Settings**.
4. Click **Add Secret**.
5. Key: `GEMINI_API_KEY` (Note: Do not use a key starting with `GOOGLE_` as it is reserved).
6. Value: Paste your API key.

## Project Structure
- `src/app/page.tsx`: Landing page with consent.
- `src/app/kiosk/page.tsx`: Main photo booth flow.
- `src/ai/flows/`: Genkit AI logic for photo transformation.
- `src/firebase/`: Firebase configuration and hooks.
