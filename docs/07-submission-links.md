# Phase 7 — Submission links & project idea

| Item | Link |
|------|------|
| **Vercel** | https://mentra-sable.vercel.app |
| **GitHub** | https://github.com/zuhawas4/mentra |
| **Loom** | _Record and paste your share link here_ |

Health check: https://mentra-sable.vercel.app/api/health

## Real-world project idea (final two weeks)

**Title:** Mentra Insights — AI session coach for independent tutors

**Problem:** Tutors spend too long after each lesson writing summaries, spotting who is falling behind, and planning the next session from messy whiteboard notes.

**Solution:** After a Mentra session ends, an AI pipeline uses:
1. Board PNG export  
2. Live chat transcript  
3. Tutor notes  

…to produce a structured session summary, homework checklist, student risk flag, and next-session agenda — stored on the student profile in Mentra.

**Why it fits:** Reuses canvas, realtime room, Supabase/Prisma data, and existing clients. Clear tutor value in two weeks without payments or video.

**MVP:** Summary API + PDF/email send + risk badge on students list.

## Loom recording script (you must record)

1. **Web** — Open Vercel URL → login (demo or Supabase) → dashboard → students/sessions/payments  
2. **Canvas** — Live room → draw on whiteboard → download PNG  
3. **Realtime** — Second tab same room → chat + board sync; notification bell  
4. **Chrome extension** — Overview / Pay / Invoices / Alerts (App URL = Vercel URL)  
5. **Android** — Expo Go with App URL = Vercel URL  
6. **Desktop** — Tauri shell (or show code + README if Rust not installed yet)  

Upload to [loom.com](https://www.loom.com) → paste share URL into the table above.
