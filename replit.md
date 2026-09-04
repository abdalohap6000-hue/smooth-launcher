# Replit setup

## Run the app

The project is a Vite + React application. Dependencies are installed with Bun.

```bash
bun run dev
```

The Replit workflow **Start application** runs this command and serves the preview on port 5000.

## Current setup notes

- Vite is configured for Replit previews with `0.0.0.0` on port `5000` and all proxied hosts allowed.
- The app starts at `/` and redirects to `/auth` when no authenticated Supabase session is present.
- The app icon uses the local `public/icon-192.png` asset so it works independently of the original hosted asset service.
- `bun run build` creates the production bundle in `dist/`.

## External configuration still needed

- Supabase URL and publishable key are required for authentication and credit/content services. Set them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` when the Supabase project is available.
- AI generation is handled by the Supabase `generate-content` Edge Function and requires its server-side provider configuration.
- Replace the placeholder Lemon Squeezy links in `src/pages/Premium.jsx` before enabling paid plans.