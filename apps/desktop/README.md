# Mentra Desktop (Tauri + Rust)

Native desktop shell that embeds the Mentra web application.

## Prerequisites

1. Install [Rust](https://www.rust-lang.org/tools/install) (`rustup`) — required to compile `src-tauri`.
2. Install OS dependencies for Tauri 2 (WebView2 on Windows is usually already present).
3. Run the Mentra web app (`npm run dev` from the monorepo root).

## Develop

```bash
cd apps/desktop
npm install
npm run dev
```

Optional env:

```bash
set MENTRA_APP_URL=http://localhost:3000
```

## Useful actions

- Open login / dashboard
- Join a session with a guest code
- Rust command `mentra_default_url` supplies the default app URL

## Build installer

```bash
npm run build
```
