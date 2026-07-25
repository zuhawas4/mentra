# Phase 7 — Deployment, demonstration, submission

## Deploy web app on Vercel

1. Push the monorepo to a **public** GitHub repository.
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Configure:
   - **Root Directory:** `apps/web` (or use monorepo settings with `npm run build -w @mentra/web` from root)
   - **Install:** `npm install` (from repo root if using workspaces)
   - **Build:** `npm run build -w @mentra/web` or `cd apps/web && npx prisma generate && next build`
   - **Output:** Next.js default
4. Add environment variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL
   - `DATABASE_URL` (Supabase pooler)
   - `DIRECT_URL` (Supabase direct)
   - Optional: reCAPTCHA keys
5. Redeploy and open `/api/health`.

### Monorepo tip

If Vercel cannot resolve workspaces from `apps/web` alone, set Root Directory to the **repository root** and:

```
Build Command: npm run build
Output: (Next.js auto from apps/web via workspace script)
```

Ensure `apps/web/package.json` `build` runs `prisma generate && next build`.

## Make GitHub public

```bash
git init   # if needed
git add .
git commit -m "Mentra internship phases: web, Prisma, realtime, extension, mobile, desktop"
gh repo create mentra --public --source=. --remote=origin --push
```

Do **not** commit `.env.local` or real database passwords.

## Loom demo checklist

Record a walkthrough covering:

1. Web app login (demo tutor) → dashboard
2. Students / sessions **CRUD**
3. Live room: **HTML canvas** whiteboard + PNG download
4. **Realtime** chat / notifications (two tabs)
5. Chrome extension: join code → Mentra
6. Android Expo app: join session WebView
7. Desktop Tauri shell (after Rust installed): open dashboard / join

## Submission links template

| Item | URL |
|------|-----|
| Vercel | `https://….vercel.app` |
| GitHub | `https://github.com/YOU/mentra` |
| Loom | `https://www.loom.com/share/…` |

## Final two weeks — real-world project idea

**Working title:** *Mentra Insights — AI session coach for independent tutors*

**Problem:** Independent tutors lose hours writing post-session summaries, spotting struggling students, and preparing the next lesson from messy whiteboard captures.

**Idea:** After each Mentra session, an AI pipeline:

1. Takes the board PNG + chat transcript + tutor notes
2. Generates a structured session summary and homework checklist
3. Flags progress risk on the student profile
4. Suggests the next-session agenda

**Why it fits the internship:** Reuses Mentra’s canvas, realtime room, Prisma/Supabase data, and multi-client shells; adds an AI product layer with clear tutor value and measurable time savings.

**MVP scope (2 weeks):** summary generation API, “Send summary” email/PDF, risk badge on student list — no payments, no video.
