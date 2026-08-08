# Mateo Espinosa — portfolio

Interactive Vite + React portfolio with a hybrid guide grounded in the content of the site.

## Local setup

```bash
npm install
npm run dev
```

The portfolio guide searches the structured profile and project data with Fuse.js. High-confidence
questions can still be answered locally, while follow-ups and ambiguous questions use Gemini 3.5
Flash-Lite through a Vercel Function. If Gemini, Redis or the daily quota is unavailable, the local
assistant remains active.

## Gemini and daily limits

1. Create a Free Tier Gemini API key in Google AI Studio. Do not enable billing.
2. Deploy or import the repository as a Vercel project.
3. In the Vercel Marketplace, create a free Upstash Redis database and connect it to the project.
4. Add the variables from `.env.example` under Project Settings → Environment Variables.
5. Keep `GEMINI_DAILY_LIMIT=10` for a strict global limit and
   `GEMINI_VISITOR_DAILY_LIMIT=5` to prevent one visitor from consuming it all.
6. Redeploy after adding or changing environment variables.

The Redis counter resets by Bogotá calendar date. It reserves each Gemini attempt atomically before
calling Google, so concurrent requests cannot exceed the configured global limit. The Gemini API key
is only read inside `api/chat.js` and is never included in the browser bundle.

For local Gemini testing, link the Vercel project and run its development server:

```bash
npx vercel link
npx vercel env pull .env.local
npx vercel dev
```

Regular `npm run dev` still works, but `/api/chat` will not be available and the UI will use its local
fallback.

## Checks

```bash
npm test
npm run lint
npm run build
```
