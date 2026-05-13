<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# app.microcredentials.io – Brand Guide + AI Studio

Single-page React app that renders the brand guide, runs AI asset generation
through **Replicate**, and gates social-media posts behind a per-organisation
approval queue backed by **Supabase**.

## Run locally

Prerequisites: Node.js 18+.

1. Install dependencies: `npm install`
2. Create `.env.local`:
   ```env
   REPLICATE_API_TOKEN=r8_xxx
   # Optional same-origin proxy that forwards to https://api.replicate.com.
   # Required for production (Replicate's API does not send CORS headers).
   REPLICATE_PROXY_URL=

   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. Provision Supabase: open your project's SQL editor and run
   [`db/schema.sql`](./db/schema.sql). It creates `organizations`, `memberships`,
   and `social_posts` with row-level security.
4. Start the dev server: `npm run dev`

## AI generation

All generation is routed through `lib/replicate.ts`:

| Capability | Model |
| --- | --- |
| Images & refine | `black-forest-labs/flux-1.1-pro` (text-to-image) and `black-forest-labs/flux-redux-dev` (image-to-image) |
| Video | `kwaivgi/kling-v2.1` |
| Captions, grammar fix, voice audit, 7-day plan | `meta/meta-llama-3.1-405b-instruct` |

### Production: serverless proxy

`api/replicate/[...path].ts` is a Vercel Edge function that forwards every
request under `/api/replicate/*` to `https://api.replicate.com/*` and injects
`Authorization: Bearer $REPLICATE_API_TOKEN` server-side. Use it like this:

1. Deploy the repo to Vercel (it auto-detects Vite + the `/api` folder; the
   committed `vercel.json` pins this).
2. In **Project Settings → Environment Variables** add
   `REPLICATE_API_TOKEN` = your real token. **Do not** also add it as a build
   variable — `vite.config.ts` only bundles values from `.env*` files, so a
   Vercel-set env var stays server-only.
3. Add a `REPLICATE_PROXY_URL` build variable set to `/api/replicate`. This is
   the only Replicate-related value the browser sees; the bundle never
   contains the token.
4. (Optional) Test the proxy locally with `vercel dev` instead of
   `npm run dev` so the `/api/*` route is served too.

For local dev without the proxy, leave `REPLICATE_PROXY_URL` blank in
`.env.local` and the client will call Replicate directly with the token from
`REPLICATE_API_TOKEN` (browser CORS permitting).

## Organisations, users, and approvals

- Visitors sign in or sign up via Supabase Auth in the top bar.
- Any signed-in user can create an organisation; they become its `owner`.
- Owners/admins manage `memberships` and assign roles
  (`owner` · `admin` · `approver` · `member`).
- Members generate assets in the AI Generator and click **Submit for Approval**
  to push a draft into the org's queue.
- Approvers/admins/owners review pending posts in **Section 05. Approval Queue**
  and Approve or Reject. RLS prevents members from approving their own work.

## Project layout

```
App.tsx                Top-level page composition
api/
  replicate/[...path].ts  Vercel Edge proxy that adds Authorization
components/
  AIGenerator.tsx      Image/video/caption generator (Replicate)
  AdminTraining.tsx    Strategy hub + 7-day plan generator (Replicate)
  ApprovalQueue.tsx    Pending / Approved / Rejected tabs
  AuthBar.tsx          Sign-in/up + org switcher + create-org
  PostComposer.tsx     Submit-for-approval modal
lib/
  replicate.ts         Replicate REST wrapper (Flux + Kling + Llama)
  supabase.ts          Supabase client + domain types
  OrgContext.tsx       Auth + current-org React context
db/schema.sql          Supabase schema with row-level security
vercel.json            Vite framework + SPA fallback, leaves /api/* intact
```
