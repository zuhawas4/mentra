# Phase 3 — Realtime functionality (progress report)

## Status: Completed

Mentra includes multiple realtime features. The internship asks for **at least one**; Mentra ships several that work together in the live session room and tutor dashboard.

## Technology choice

| Mode | When it runs | How |
|------|----------------|-----|
| **Demo realtime** | No Supabase env vars | Browser `BroadcastChannel` so two tabs of the same app sync instantly |
| **Production realtime** | Supabase configured | **Supabase Realtime** (broadcast + presence channels) |

Why not a custom WebSocket server on Vercel? Vercel serverless functions cannot host long-lived socket rooms. Supabase Realtime (or BroadcastChannel for local demo) is the correct approach for a Next.js + Vercel app.

Research notes: `docs/01-realtime-research.md`

---

## Features added

### 1. Realtime chat (primary demo feature)

- **Where:** Live session room → **Live chat** panel (`/room/[id]`)
- **What:** Participants type messages; other open Mentra tabs (and Supabase-connected clients) receive them without refresh
- **Implementation:** `SessionChat` publishes/subscribes via `live-bus` (`publishLiveEvent` / `subscribeLiveEvents`)
- **Persistence (when DB configured):** messages also POST to `/api/sessions/[id]/messages` (Prisma + `chat_messages` table)

### 2. Realtime notifications

- **Where:** Tutor dashboard → **notification bell**
- **What:** Live events appear in a dropdown (session went live, student joined, chat activity, tasks, etc.)
- **Implementation:** `RealtimeBridge` listens on the live bus and pushes into the Redux notifications store; `NotificationBell` UI shows unread state + mark-all-read

### 3. Live session status updates

- **Where:** Session room header + session list flows
- **What:** Status changes such as **scheduled → live → completed** are broadcast so other views can react
- **Implementation:** `useSessionActions` / room page call `publishLiveEvent` and `subscribeBoard` status broadcast; participants/presence update in the sidebar

### 4. Live whiteboard sync (canvas + realtime)

- **Where:** Same room as chat — HTML canvas board
- **What:** Strokes sync across tabs/clients in near real time
- **Implementation:** `board-sync.ts` uses Supabase channel broadcast when configured; demo mode uses the shared store + live bus patterns; strokes can persist via `/api/sessions/[id]/strokes`

### 5. Payment-related awareness (extension + data)

- Payment invoices are modeled in the app (`/payments`) and exposed to the Chrome extension snapshot API
- Extension background alarm can notify when invoices are **overdue** (useful realtime-adjacent alert about payments)
- Postgres table `payment_invoices` is added to Supabase Realtime publication for future live invoice updates when fully wired to authenticated clients

---

## How to verify (demo mode)

1. `npm run dev` → login `amelia@mentra.app` / `demo1234`
2. Open a **live room** (Sessions → Open room / Join whiteboard)
3. Open the **same room URL in a second browser tab**
4. Send a **chat** message in tab A → appears in tab B
5. Draw on the **canvas** in tab A → board updates in tab B (demo sync)
6. Open **Dashboard** → click the **notification bell** for live event history

With Supabase configured, the same flows use Supabase Realtime instead of only BroadcastChannel.

---

## Key files

| File | Role |
|------|------|
| `apps/web/src/lib/realtime/live-bus.ts` | Event bus (BroadcastChannel + Supabase broadcast) |
| `apps/web/src/lib/realtime/board-sync.ts` | Board + status + presence channels |
| `apps/web/src/components/room/session-chat.tsx` | Realtime chat UI |
| `apps/web/src/components/realtime/realtime-bridge.tsx` | Bridges live events → notifications |
| `apps/web/src/components/notifications/notification-bell.tsx` | Notification dropdown |
| `supabase/migrations/001_mentra_schema.sql` | Enables realtime on sessions/strokes |
| `supabase/migrations/003_chat_messages.sql` | Chat table + realtime publication |

---

## One-line summary (for submission forms)

> Added realtime **live chat**, **notifications**, and **live session/board status sync** using a shared live bus with **BroadcastChannel** (demo) and **Supabase Realtime** (production), plus optional persistence of chat/strokes through Prisma APIs.
