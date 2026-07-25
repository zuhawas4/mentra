# What you must do (step by step)

## Short answers

| Question | Answer |
|----------|--------|
| Did Cursor create a **live** Supabase database? | **No.** Only SQL migrations + Prisma schema were added in the repo. **You** create the Supabase project and paste credentials. |
| Does the app work without Supabase? | **Yes.** Demo mode (`npm run dev`) uses local Zustand data. |
| Is realtime added? | **Yes.** Live chat, board sync, presence, notifications (BroadcastChannel in demo; Supabase Realtime when configured). |
| Is HTML canvas added? | **Yes.** Collaborative whiteboard in `/room/[id]` with pen/eraser/undo + PNG download. |
| Is the Chrome extension ready? | **Yes.** Payments, invoices, alerts, app data snapshot in `apps/extension`. |

---

## Path A — Demo only (fastest, no cloud account)

1. Open a terminal in `C:\Users\User\Desktop\mentra`.
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000  
   Login: `amelia@mentra.app` / `demo1234`
4. Try:
   - Dashboard, Students, Sessions (CRUD)
   - **Payments** (record invoice)
   - Live room whiteboard (canvas) + chat (open two browser tabs)
   - Notifications bell
5. Load Chrome extension:
   - `chrome://extensions` → Developer mode → Load unpacked → `apps/extension`
   - App URL = `http://localhost:3000`
   - Use **Pay / Invoices / Alerts / Overview** tabs

This is enough to demo most internship features without Supabase.

---

## Path B — Production (Supabase + Prisma + Vercel) — do this for a real database

### 1) Create Supabase project

1. Go to https://supabase.com → **New project**
2. Set a database password (save it)
3. Wait until the project is ready

### 2) Run SQL migrations

In Supabase → **SQL Editor**, run these files **in order** (copy/paste each):

1. `supabase/migrations/001_mentra_schema.sql`
2. `supabase/migrations/002_avatars_storage.sql`
3. `supabase/migrations/003_chat_messages.sql`
4. `supabase/migrations/004_payments.sql`

### 3) Copy API keys

Supabase → **Project Settings → API**:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4) Copy database URLs (Prisma)

Supabase → **Project Settings → Database → Connection string**:

- **Transaction** pooler (port **6543**) → `DATABASE_URL`  
  Append `?pgbouncer=true` if not already present.
- **Session** / direct (port **5432**) → `DIRECT_URL`

### 5) Create `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

### 6) Generate Prisma client & run locally

```bash
npm run prisma:generate
npm run dev
```

7. Open `/api/health` — expect `"mode":"supabase+prisma"`.
8. **Sign up** a new tutor (or create a user in Supabase Auth) and use the app.  
   Profiles sync via `/api/auth/profile`. Students/sessions/payments persist in Postgres.

### 7) Deploy to Vercel

1. Push repo to a **public** GitHub repository.
2. Import into Vercel (root of monorepo).
3. Add the same env vars (set `NEXT_PUBLIC_APP_URL` to your Vercel URL).
4. Deploy.
5. Point the Chrome extension **App URL** to the Vercel URL.

### 8) Loom video

Record: web CRUD, payments, canvas room, realtime (two tabs), extension (pay/invoices/alerts), mobile/desktop if you run them.

Details: `docs/07-deployment-and-submission.md`

---

## Optional clients

| Client | Command / action | Extra requirement |
|--------|------------------|-------------------|
| Chrome extension | Load `apps/extension` | None |
| Android Expo | `npm run mobile` | Expo Go + LAN IP instead of localhost |
| Desktop Tauri | `npm run desktop` | Install [Rust](https://rustup.rs) first |

---

## Production checklist

- [ ] Supabase migrations applied
- [ ] `.env.local` / Vercel env set (never commit secrets)
- [ ] `/api/health` shows `supabase+prisma` in production
- [ ] Auth signup/login works against Supabase
- [ ] Create student + session + payment invoice
- [ ] Two users/tabs see realtime chat/board updates
- [ ] Canvas PNG download works
- [ ] Extension shows invoices + can open record-payment flow
- [ ] Public GitHub + Vercel URL + Loom link ready for submission
