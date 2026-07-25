# Mentra Mobile (React Native Expo)

Android-focused Expo app that connects to the Mentra web backend.

## Features

- Enter the Mentra web **App URL**
- **Join session** with a guest code (opens `/join/{code}` in a WebView)
- Open **login** / **dashboard** against the same deployment

## Run on Android

```bash
# from monorepo root
npm install
npm run mobile

# or
npm run android -w @mentra/mobile
```

1. Start the web app (`npm run dev`).
2. On a physical device, set App URL to your machine LAN IP (not `localhost`).
3. Use Expo Go or an Android emulator.

iOS is optional (requires macOS).

## Assets

Placeholder icons live in `assets/`. Replace before store submission.
