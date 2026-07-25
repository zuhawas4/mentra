# Internship phases checklist (Mentra)

| Phase | Requirement | Status in repo |
|-------|-------------|----------------|
| 1 | Research WebSockets, realtime DBs, Supabase Realtime, Vercel | `docs/01-realtime-research.md` |
| 2 | Next.js + Supabase + Prisma + auth + CRUD | Prisma schema, API routes, Supabase auth bridge; UI unchanged |
| 3 | ≥1 realtime feature | Live chat + board sync + notifications; chat/strokes APIs |
| 4 | HTML canvas meaningful feature | Collaborative whiteboard + PNG export |
| 5 | Chrome extension connected to app | `apps/extension` (payments, invoices, alerts, snapshot) |
| 6 | Android Expo + Tauri/Rust desktop | `apps/mobile`, `apps/desktop` |
| 7 | Vercel + public GitHub + Loom + project idea | `docs/07-deployment-and-submission.md` |

## Local demo (no backend)

```bash
npm install
npm run dev
```

Tutor: `amelia@mentra.app` / `demo1234`

## Full stack mode

See `docs/02-supabase-prisma-setup.md`.
