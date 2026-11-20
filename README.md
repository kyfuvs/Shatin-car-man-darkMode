<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8a94a7b2-389c-487e-bdd5-228e7c6f61c9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and replace `MY_GEMINI_API_KEY` with your Gemini API key. In PowerShell:
   `Copy-Item .env.example .env.local`
   Keep the key in this server-side environment file; do not put it in frontend code.
3. Run the app:
   `npm run dev`

The server loads `.env.local` (or `.env`) for local development. Restart `npm run dev` after changing the key.
