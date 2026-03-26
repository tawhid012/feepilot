# FeePilot SaaS

## Run locally

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

## Deploy on Netlify

This project is already configured with `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: all routes -> `/index.html` (required for `/dashboard/*` and `/admin*`)

### Netlify setup steps

1. Push this project to GitHub.
2. In Netlify, click **Add new site** -> **Import from Git**.
3. Select your repository and deploy.
4. In **Site configuration -> Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID` (optional for app runtime, but used in project setup)
5. Trigger a new deploy.

## Admin dashboard security (important)

The admin panel uses Supabase Edge Functions. Set these **Supabase function secrets** (not Netlify env):

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Deploy the functions:

- `supabase functions deploy admin-login`
- `supabase functions deploy admin-dashboard`

Then set secrets:

- `supabase secrets set ADMIN_USERNAME=... ADMIN_PASSWORD=... ADMIN_SESSION_SECRET=...`
