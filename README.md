# Mentra

Realtime collaborative whiteboard and tutoring session manager for independent tutors and their students.

Mentra is organized as a monorepo so web, Chrome extension, mobile, and desktop clients can share brand tokens and domain types.

```
mentra/
  apps/
    web/          # Next.js App Router product (primary)
    extension/    # Chrome MV3 session companion
    mobile/       # React Native Expo (Android)
    desktop/      # Tauri + Rust desktop shell
  packages/
    shared/       # Types, demo data, design tokens
    brand/        # Mentra logo + CSS tokens
  supabase/       # SQL schema, RLS, seed notes
  docs/           # Internship phase research + setup
```

## Quick start (demo mode)

Demo mode works with **no Supabase credentials**.

```bash
cd mentra
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins

| Role    | Email                 | Password  |
|---------|-----------------------|-----------|
| Tutor   | `amelia@mentra.app`   | `demo1234` |
| Student | `daniel@student.app`  | `demo1234` |

Or use **Demo tutor** / **Demo student** on the login page.

Guest join demo code: `CALC32` → `/join/CALC32`

## Product surfaces

- Landing page
- Auth (login, signup with tutor/student role, password reset placeholder)
- Tutor dashboard (matches Mentra design reference)
- Students list + student detail
- Sessions list/calendar + new session flow
- Live session room with freehand whiteboard
- Join-by-code guest flow
- Session summary / snapshots
- Student “My sessions”
- Settings

## reCAPTCHA v3 (optional)

Set in `apps/web/.env.local`:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

Used on **login**, **signup**, and **forgot-password**. When keys are omitted, verification is bypassed for local demo.

## Profile avatars

Settings → Profile uses `react-easy-crop` and stores **only** WebP thumbnails at **48 / 96 / 256px**.
With Supabase configured, files go to the `avatars` bucket (`supabase/migrations/002_avatars_storage.sql`). In demo mode they persist as optimized data URLs in the local profile store.

## Supabase setup (optional)

1. Create a Supabase project.
2. Copy `.env.example` to `apps/web/.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run migrations in the SQL editor (in order):
   `001_mentra_schema.sql`, `002_avatars_storage.sql`, `003_chat_messages.sql`.
4. Add Prisma `DATABASE_URL` + `DIRECT_URL` (see `.env.example` and `docs/02-supabase-prisma-setup.md`).
5. `npm run prisma:generate`
6. Create auth users; profile rows sync via `/api/auth/profile` on login/signup.

Never put the **service role** key in browser code.

## Internship phases

See [`docs/PHASES-CHECKLIST.md`](docs/PHASES-CHECKLIST.md). Research notes, Prisma setup, and Vercel/Loom submission steps live under `docs/`.

To force demo mode even with env vars present:

```env
NEXT_PUBLIC_FORCE_DEMO=true
```

## Scripts

```bash
npm run dev              # start web app
npm run build            # production build (includes prisma generate)
npm run start            # start production server
npm run lint             # lint web app
npm run mobile           # Expo Android companion
npm run desktop          # Tauri desktop (requires Rust toolchain)
npm run prisma:generate  # regenerate Prisma client
```

### Chrome extension

Chrome → `chrome://extensions` → Load unpacked → `apps/extension`.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + Radix/shadcn-style UI
- Zustand demo store (local persistence when env unset)
- Supabase Auth / Postgres / Realtime (when configured)
- Prisma ORM over Supabase Postgres (server API CRUD)
- Custom canvas whiteboard (freehand, colors, stroke width, eraser, undo/redo, PNG export)
- Chrome extension, Expo mobile, Tauri desktop shells

## Notes for future clients

- Import domain models from `@mentra/shared`
- Import logo/tokens from `@mentra/brand`
- Keep feature logic out of UI shells so extension/mobile/desktop can reuse the same contracts
