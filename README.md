# Gemini Free-Time Machine Kiosk

This is the codebase for the Gemini Free-Time Machine Kiosk, an interactive web application that uses Google's generative AI models to reimagine users in different scenarios and styles based on a captured photo.

## Tech Stack
*   **Framework**: Next.js (App Router), React
*   **Styling**: Tailwind CSS
*   **Backend/Services**: Firebase (Firestore, Storage, Auth), Firebase App Hosting, Google Cloud Run, Google AI/Genkit (Server Actions)

---

## 🛠 Project Structure & Key Pages

The application consists of several main views located within `src/app/`:

*   **`/` (Home)**: The landing page and starting point for the kiosk experience.
*   **`/kiosk`**: The main interactive flow. Handled by `src/components/kiosk/KioskFlow.tsx`, this manages the camera capture, theme/style selection, processing, and displaying results.
*   **`/share/[id]`**: The mobile-friendly view users see when they scan their generated QR code to download their vision.
*   **`/gallery`**: A grid view showcasing the generated AI images from users.
*   **`/videos`**: A view showcasing the generated AI video outputs.
*   **`/admin`**: An administrative dashboard for monitoring system health, generation stats, or managing generated content.
*   **`/details`**: Contains supplementary information about the Gemini educational study.
*   **`/download`**: An alternative or legacy download page for retrieving generated assets.

---

## 🌍 Internationalization (i18n) & Adding a New Language

The application uses a custom, lightweight i18n system built around `src/i18n/LanguageProvider.tsx` and `src/i18n/dictionaries.ts`. 

The active language is stored in `localStorage` on the Kiosk and passed via a `?lang=` URL parameter to the mobile share page.

### How to add a new language (e.g., Spanish - `es`):

1.  **Update the Type**: In `src/i18n/dictionaries.ts`, add the new language code to the `Language` type:
    ```typescript
    export type Language = 'en' | 'ko' | 'jp' | 'tc' | 'es';
    ```

2.  **Add the Dictionary**: Add the `es` object to the `dictionaries` export.
    *   **Pro-tip**: You only need to translate UI strings. If a key is missing in your new language, the `LanguageProvider` will automatically fall back to the English (`en`) string.
    *   **Do NOT translate AI Prompts**: `style_*_detail` and `theme_*_var*_scene`. The app specifically pulls these from the `en` dictionary for AI prompting to maintain high generation quality. You can safely omit them from your new language object.

### The `_short` Translation Variant

You may notice some keys in the dictionary ending with `_short` (e.g., `theme_zen_title_short`). 

This is a specific UI feature built for languages that require more compact text in constrained dropdown menus (specifically, the "Refine" step in the Kiosk flow). 

*   **How it works**: The app's `getDropdownText` function dynamically checks if the current language is Korean (`ko`). If it is, it attempts to look for a `_short` variant of the title or activity to display in the dropdown. 
*   **Fallback**: If the `_short` variant is missing (or if the language is not Korean), it gracefully falls back to the standard, full-length key.
*   **Maintenance**: You only need to define a `_short` key if the standard translation is physically too long to fit in the UI dropdown and you want to provide an explicit abbreviation.

---

## 🚀 Deployment & Hosting

### Current Setup: Firebase App Hosting

This application is currently **published and hosted on Firebase App Hosting**. Firebase App Hosting automatically builds and serves Next.js applications, managing both the static assets and the server-side rendering (SSR) functions.

#### Updating the Existing App (Without Firebase Studio)

Firebase App Hosting is tightly integrated with GitHub. When a new commit is pushed to the connected branch (typically `main` or `master`), App Hosting automatically triggers a new rollout.

To push an update to the live application:
1.  Make your changes locally and test them (`npm run dev`).
2.  Commit your changes using Git:
    ```bash
    git add .
    git commit -m "Your descriptive commit message"
    ```
3.  Push the commit to your connected GitHub repository branch:
    ```bash
    git push origin main
    ```
4.  Once pushed, Firebase App Hosting will automatically detect the commit, build the Next.js app, and deploy the new version. You can monitor the rollout status in the Firebase Console under **App Hosting**.

#### Deploying a New Instance on Firebase

If you need to deploy a brand new instance of the app on Firebase (e.g., for staging, a separate event, or if you are moving to a new Firebase project):

1.  Go to the Firebase Console for your target project.
2.  Navigate to **App Hosting** -> **Get Started**.
3.  Connect your GitHub repository containing this codebase.
4.  Select the branch you want to deploy.
5.  Configure your environment variables (Firebase config, Genkit API keys, etc.) during setup or in the App Hosting settings.
6.  Click **Deploy**. Every subsequent push to that branch will trigger an automatic update.

---

### Alternative Setup: Google Cloud Run

This Next.js application is also fully compatible with Google Cloud Run. Because Cloud Run supports source-based deployments via Google Cloud Buildpacks, you don't even need to write a `Dockerfile`.

#### Steps to Deploy to Cloud Run

1.  **Install the Google Cloud CLI (`gcloud`)** and initialize your project:
    ```bash
    gcloud init
    ```
2.  **Enable Required APIs** on your Google Cloud project (Cloud Run, Cloud Build, Artifact Registry):
    ```bash
    gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
    ```
3.  **Deploy directly from source** (Run this command in the root directory of the project):
    ```bash
    gcloud run deploy gemini-kiosk \
      --source . \
      --region us-central1 \
      --allow-unauthenticated
    ```
    *Cloud Build will automatically detect that this is a Next.js (Node.js) application, build the production container, and deploy it to Cloud Run.*
4.  **Configure Environment Variables**: Once deployed, you must set all required environment variables in the Cloud Run service configuration via the Google Cloud Console (or by passing `--set-env-vars="KEY=VALUE"` in your deploy command).

### Environment Variables

Regardless of whether you use Firebase App Hosting or Google Cloud Run, ensure all required environment variables are set in your deployment environment. You will typically need:
*   Firebase Client Configuration (API keys, project IDs).
*   Firebase Admin / Service Account credentials (if using server-side Firebase logic).
*   Google Genkit / AI API keys.
*   `NEXT_PUBLIC_SITE_URL` for absolute URL generation (e.g., for QR codes).