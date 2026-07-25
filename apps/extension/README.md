# Mentra Chrome Extension

Manifest V3 companion for payments, invoices, notifications, and app data.

## Useful actions

1. **Record a payment / invoice** — Pay tab fills Mentra `/payments` (and POSTs when you are logged in).
2. **View invoices** — Invoices tab lists amounts/status from `/api/extension/snapshot`.
3. **Receive notifications** — Background alarm reminds you about overdue invoices; Alerts tab links to Mentra notifications + live sessions.
4. **Assess application data** — Overview shows student/session counts, open balance, and health (demo vs Supabase+Prisma).

## Load unpacked

1. Run Mentra: `npm run dev` (repo root).
2. Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `apps/extension`.
3. Set **App URL** to `http://localhost:3000` or your Vercel URL.
