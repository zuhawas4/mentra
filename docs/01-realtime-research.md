# Phase 1 — Realtime communication research

Mentra needs multi-user updates (session status, whiteboard strokes, chat, notifications) without full page reloads. This note compares WebSockets, realtime databases, and Supabase Realtime, and explains what changes when a Next.js app is deployed on Vercel.

## 1. WebSockets

**What they are:** A persistent, bidirectional TCP connection between client and server. After the HTTP upgrade handshake, either side can push frames at any time.

**Strengths**
- Lowest latency for custom protocols (drawing points, typing indicators).
- Full control over message shape, auth, and rooms.

**Weaknesses on Vercel**
- Classic Node WebSocket servers need a **long-lived process**. Vercel Serverless / Edge functions are **request-scoped** and do not host persistent sockets.
- To self-host WebSockets with a Next.js frontend on Vercel you typically run a separate realtime service (Fly.io, Railway, Render, AWS, or Supabase) and point the browser at that host.

**When to use:** Custom game loops, binary protocols, or when you already operate a dedicated realtime server.

## 2. Realtime databases / sync engines

Examples: Firebase Realtime Database, Firestore listeners, PartyKit, Liveblocks, Supabase Postgres + Realtime.

**Model:** Clients subscribe to a document/query/channel. The platform pushes diffs when data changes. Persistence and fan-out are handled for you.

**Strengths**
- Auth, storage, and presence often bundled.
- Works from serverless frontends because the **realtime hub is not your Next.js process**.

**Trade-offs**
- Vendor lock-in and pricing at scale.
- You design around the vendor’s consistency and security model (e.g. RLS).

## 3. Supabase Realtime

Supabase Realtime is a managed service in front of Postgres (and optional broadcast/presence). Mentra uses three complementary modes:

| Mode | Mentra use | Notes |
|------|------------|--------|
| **Broadcast** | Live bus events, board stroke fan-out, chat messages in a room | Ephemeral; great for high-frequency strokes. Does not require writing every point to Postgres first. |
| **Presence** | Who is in the session room | Tracks joins/leaves per channel. |
| **Postgres Changes** | `study_sessions` status, persisted `board_strokes` | Client receives `INSERT`/`UPDATE`/`DELETE` when RLS allows. Durable source of truth. |

**Client path in Mentra**
1. Browser opens a channel via `@supabase/supabase-js`.
2. App publishes board/chat/status events (`live-bus`, `board-sync`).
3. When configured, the same events can also persist through Prisma/API or direct table inserts so late joiners catch up.

**Security:** Channel access and `postgres_changes` filters respect Supabase Auth JWTs and Row Level Security policies defined in `supabase/migrations/`.

## 4. Next.js on Vercel + realtime

```
Browser ──HTTPS──► Vercel (Next.js SSR / Route Handlers / static)
                │
                └── cannot hold WebSocket rooms for all users
Browser ──WSS───► Supabase Realtime (or other dedicated hub)
Browser ──HTTPS──► Supabase Auth / Storage / Postgres (via Prisma server-side)
```

**Implications**
- **Auth & CRUD API routes** on Vercel are fine (short-lived). Prisma talks to Supabase Postgres (prefer the **pooler** URL on serverless).
- **Realtime fan-out** must go through Supabase Realtime (or another always-on service), not through `next start` on Vercel.
- **Demo mode** without env vars uses `BroadcastChannel` in the same browser profile so local development still feels “live” without a backend.

## 5. Mentra architecture decision

| Concern | Choice | Why |
|---------|--------|-----|
| Hosted web | Next.js on Vercel | Internship requirement; App Router already built |
| Auth + Postgres | Supabase Auth + Prisma over Supabase DB | Meets “Supabase + Prisma”; RLS + typed server CRUD |
| Live strokes / chat / status | Supabase Realtime (broadcast + postgres_changes) | Works with Vercel; no custom WS server |
| Offline / no keys | Zustand demo store + BroadcastChannel | Zero-config demos and UI unchanged |

## 6. References (concepts)

- WebSockets: RFC 6455
- Supabase Realtime docs: Broadcast, Presence, Postgres Changes
- Vercel: serverless limitations for sticky WebSocket servers; use external realtime
- Prisma + Supabase: `DATABASE_URL` (pooler) + `DIRECT_URL` (migrations)
