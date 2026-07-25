# Phase 7 — Submission links & project idea

Fill in after deploy / Loom recording.

| Item | Link |
|------|------|
| **Vercel** | _pending deploy_ |
| **GitHub** | _pending push_ |
| **Loom** | _you record — see script below_ |

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

## Loom recording script (you must record this)

1. **Web** — Login tutor → dashboard → students/sessions CRUD → payments  
2. **Canvas** — Open live room → draw on whiteboard → download PNG  
3. **Realtime** — Second tab same room → chat + board sync; show notification bell  
4. **Chrome extension** — Overview / Pay / Invoices / Alerts  
5. **Android** — Expo Go join/login (or screen record emulator)  
6. **Desktop** — Tauri window login/dashboard/join (if Rust installed; otherwise show project + README run steps)  

Upload to Loom → paste share link into the table above.
