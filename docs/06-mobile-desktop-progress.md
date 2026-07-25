# Phase 6 — Mobile & desktop applications (progress report)

## Status: Completed (scaffolds + runnable clients)

Mentra is the same product idea across clients: **realtime collaborative tutoring whiteboards + session management**. Phase 6 adds Android (Expo) and desktop (Tauri + Rust) shells that connect to the Mentra web backend. **iOS is optional** (macOS required) and was not required for this submission.

---

## Same project idea

Independent tutors run live lessons with students using a shared whiteboard, chat, sessions, payments tracking, and notifications — available on:

| Client | Stack | Location |
|--------|--------|----------|
| Web | Next.js | `apps/web` |
| Android | React Native Expo | `apps/mobile` |
| Desktop | Tauri 2 + Rust | `apps/desktop` |
| (Optional) iOS | Expo on macOS | same `apps/mobile` project |

---

## Android — React Native Expo

**What was built**
- Expo app (`@mentra/mobile`) with Mentra branding
- Home screen: set **App URL**, enter **guest join code**
- Actions: **Join session**, **Open login**, **Tutor dashboard**
- Loads Mentra routes in a **WebView** so mobile reuses the same auth, canvas room, chat, and payments UI

**Key files**
- `apps/mobile/App.tsx`
- `apps/mobile/app.json` (Android package `app.mentra.mobile`)
- `apps/mobile/package.json` / `README.md`

**How to run**
```bash
# terminal 1 — web backend
npm run dev

# terminal 2 — Expo
npm run mobile
```
On a physical Android device, set App URL to the computer’s **LAN IP** (e.g. `http://192.168.x.x:3000`), not `localhost`. Use Expo Go or an emulator.

**iOS:** Optional — same Expo project; requires macOS + Xcode.

---

## Desktop — Tauri + Rust

**What was built**
- Tauri 2 desktop shell (`@mentra/desktop`)
- Rust backend (`src-tauri`) with command `mentra_default_url` (reads `MENTRA_APP_URL` or defaults to `http://localhost:3000`)
- Native window UI: sidebar to open **Login**, **Dashboard**, or **Join session** by code; main pane embeds Mentra in an iframe/webview

**Key files**
- `apps/desktop/src-tauri/src/lib.rs` / `main.rs` / `Cargo.toml`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/ui/` (shell HTML/CSS/JS)
- `apps/desktop/README.md`

**How to run**
1. Install [Rust](https://rustup.rs) (`rustup`) if not installed  
2. Start Mentra web: `npm run dev`  
3. `cd apps/desktop && npm install && npm run dev`  
   Or from root: `npm run desktop`

**Build installer:** `npm run build` inside `apps/desktop`.

---

## How this meets the phase requirement

| Requirement | Mentra |
|-------------|--------|
| Android with React Native Expo | `apps/mobile` |
| Desktop with Tauri and Rust | `apps/desktop` + `src-tauri` Rust crate |
| Same project idea | Tutoring whiteboard + sessions against shared Mentra URL |
| iOS optional | Documented; not required without macOS |

---

## One-line summary

> Built Mentra Android (React Native Expo WebView companion) and Mentra Desktop (Tauri + Rust shell) that connect to the same Mentra web app for login, dashboard, and live session join — iOS left optional without macOS.
