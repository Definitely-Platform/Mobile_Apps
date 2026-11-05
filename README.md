# Definitely One — Mobile Companion App

**Definitely One** (`definitely-one-ecosystem`) is the official mobile companion app for the Definitely Platform Ecosystem. Built with **Expo SDK 58**, **React Native 0.88**, and **React 19.3**.

---

## Architecture

The mobile workspace follows a dual-tier standard:
- `client/`: Mobile client application built with Expo Router (file-based navigation in `src/app/`).
- `server/`: Dedicated Node.js REST Gateway (`definitely-one-server` on port `8085`) providing service registry caching and mobile-optimized telemetry.

---

## Key Features

- **SSO & Biometric Security**: Integrates with `accounts.definitely.live` via custom deep-link scheme (`definitelyone://`). Hardware-backed token storage via `expo-secure-store` and instant biometric unlock (Face ID, Touch ID, Android Biometrics) via `expo-local-authentication`.
- **Ecosystem Service Catalog**: Unified dashboard connecting users to Definitely Hub, Prefly (AI Interviews), and Meet (Live Video).
- **Design System Consistency**: Native UI aligned with the Definitely tokenized design system (3-tier typography, laser gradient accents).
- **Offline Resiliency**: TanStack React Query with cache persistence.

---

## Getting Started

### Prerequisites
- Node.js ≥ 22.0.0
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```
From the interactive terminal prompt, you can:
- Press `i` to launch on the iOS Simulator
- Press `a` to launch on the Android Emulator / Device
- Scan the QR code using Expo Go or a development build

### 3. Typecheck & Health Check
```bash
npx tsc --noEmit
npx expo-doctor
```

---

## Build & Distribution (EAS)

Builds are managed via Expo Application Services (EAS):
```bash
npx eas-cli build --profile development
npx eas-cli build --profile production
```
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
