# Phase 2 — Supabase + Prisma setup

Mentra keeps the **existing UI**. When env vars are present, auth and CRUD go through Supabase Auth + Prisma (Postgres). Without them, the Zustand demo store remains the source of truth.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run in order:
   - `supabase/migrations/001_mentra_schema.sql`
   - `supabase/migrations/002_avatars_storage.sql`
   - `supabase/migrations/003_chat_messages.sql`

## 2. Env vars (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Prisma (Settings → Database → Connection string)
# Prefer Transaction pooler for Vercel serverless:
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

Copy the same Prisma vars into the monorepo root `.env` if you run Prisma CLI from the root.

## 3. Generate Prisma client

```bash
cd apps/web
npx prisma generate
```

Schema: `apps/web/prisma/schema.prisma` (mirrors the SQL migrations).

## 4. Auth + CRUD surface

| Feature | Endpoint / path | Tech |
|---------|-----------------|------|
| Health | `GET /api/health` | mode detection |
| Profile sync | `POST /api/auth/profile` | Supabase session + Prisma upsert |
| Students CRUD | `/api/students`, `/api/students/[id]` | Prisma |
| Sessions CRUD | `/api/sessions`, `/api/sessions/[id]` | Prisma |
| Chat | `/api/sessions/[id]/messages` | Prisma + Realtime |
| Strokes | `/api/sessions/[id]/strokes` | Prisma |
| Login / signup UI | `/login`, `/signup` | Supabase Auth when configured; demo otherwise |

## 5. Verify

```bash
npm run dev
curl http://localhost:3000/api/health
```

Expect `"mode":"supabase+prisma"` when both Supabase and `DATABASE_URL` are set.
