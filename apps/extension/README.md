# Mentra Chrome Extension

Manifest V3 companion for payments, invoices, notifications, and app data.

## Useful actions

1. **Record a payment / invoice** — Pay tab opens Mentra `/payments` with fields filled (instant).
2. **View invoices** — Invoices tab lists amounts/status from `/api/extension/snapshot`.
3. **Alerts** — Shortcuts to notifications + quick join by code.
4. **App data** — Overview shows student/session counts and health.

## Load / reload after updates

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `apps/extension`  
   Or click **Reload** on the Mentra card if already loaded.
4. Set **App URL** to `https://mentra-sable.vercel.app` (default) or `http://localhost:3000` for local.

Buttons open Mentra in a new tab immediately and do **not** wait on slow API calls.
