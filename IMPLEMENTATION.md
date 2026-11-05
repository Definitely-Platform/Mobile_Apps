# IMPLEMENTATION PLAN: Definitely One Mobile Application

**Ecosystem:** Definitely One  
**Platform Target:** iOS & Android  
**Core Framework:** React Native with Expo (TypeScript)  
**Parent Ecosystem Parity:** Vite + React (Web), Tauri (Desktop)  

---

## 1. Executive Summary & Vision

**Definitely One** is a unified super-platform providing seamless, single-identity access to an entire suite of tools, services, and products. Having established the web platform (Vite + React) and desktop platform (Tauri), the mobile application serves as the user's pocket command center.

### Core Philosophy: "One Identity, Infinite Capabilities"
- **One Account (SSO):** Authenticate once; access every service without re-authenticating.
- **Unified Service Catalog:** Dynamic dashboard showcasing all tools and products with role-based access.
- **Cross-Platform Sync:** Sessions, preferences, and workspace data sync across Web, Desktop (Tauri), and Mobile.
- **Native Polish:** Mobile-first ergonomics, biometric unlock (Face ID / Fingerprint), instant offline caching, and push notifications.

---

## 2. Platform Comparison: Mobile vs. Web & Desktop

To maximize efficiency and maintain consistency with your existing Vite + React and Tauri projects:

| Architectural Layer | Web (Vite + React) | Desktop (Tauri) | Mobile (Expo React Native) | Synergies / Reusability |
| :--- | :--- | :--- | :--- | :--- |
| **Language & Runtime** | TypeScript / Browser | TypeScript / Webview + Rust | TypeScript / Hermes Engine | 100% TypeScript shared types & logic |
| **Styling** | Tailwind CSS / CSS | Tailwind CSS | **NativeWind (Tailwind v4)** | >90% identical utility class naming |
| **Routing** | React Router / Browser History | React Router / Window Navigation | **Expo Router** (File-based) | Deep-linking parity (`definitelyone://`) |
| **Auth Token Storage** | `localStorage` / HTTP Cookies | Tauri Store / Keyring | **`expo-secure-store` / Keychain** | Same JWT / Refresh Token exchange lifecycle |
| **State & API Cache** | TanStack Query / Zustand | TanStack Query / Zustand | **TanStack Query / Zustand** | **100% shareable API client and hooks** |
| **Hardware Access** | Browser Web APIs | Tauri Rust Plugins | **Expo SDK** (Biometrics, Camera, Notifications) | Dedicated native APIs for iOS/Android |

---

## 3. Recommended Architecture & Tech Stack

```
Mobile_App/
├── client/                       # Mobile Application (React Native / Expo SDK 58)
│   ├── src/
│   │   ├── app/                  # Expo Router (File-based screens & layouts)
│   │   │   ├── _layout.tsx       # Root layout: Theme, AppTabs, Splash
│   │   │   ├── index.tsx         # Definitely One Hub (Ecosystem Dashboard)
│   │   │   └── explore.tsx       # Platform Architecture & Sync telemetry
│   │   ├── components/           # UI Components
│   │   │   ├── auth/             # SSO Login & Quick Demo Screens
│   │   │   ├── hub/              # Header, ServiceCard, Modals (Lock, Launcher, Notifications, Profile)
│   │   │   └── ui/               # Themed Text, Views, Tabs
│   │   ├── hooks/                # useBiometrics, useTheme, useColorScheme
│   │   ├── store/                # authStore (Zustand + SecureStore), ecosystemStore
│   │   ├── types/                # auth, ecosystem, and global type declarations
│   │   └── utils/                # secureStorage (Keychain/Keystore wrapper)
│   ├── assets/                   # App icons, splash screens, tab assets
│   ├── app.json                  # Expo config (definitelyone scheme, bundle IDs)
│   ├── package.json              # Mobile dependencies & scripts
│   └── tsconfig.json
├── server/                       # Backend API & Gateway (Node.js + TypeScript)
│   ├── src/
│   │   └── index.ts              # REST Gateway (SSO Auth, Service Registry, Alerts)
│   ├── package.json              # Server dependencies & scripts
│   └── tsconfig.json
├── package.json                  # Root monorepo orchestrator (scripts for client & server)
├── IMPLEMENTATION.md
└── README.md
```

---

## 4. Key Strategic Recommendations for "Definitely One"

### 💡 Recommendation 1: Hybrid Service Integration Strategy
For an ecosystem with multiple tools and products, porting every single tool to native mobile screens on day one can take months. 
- **Tier 1 (Core Tools):** Build fully native UI in React Native for maximum performance (e.g. Chat, Tasks, Dashboard, Notifications).
- **Tier 2 (Complex Web Tools):** Use a high-performance **Authenticated Embedded Webview** (`react-native-webview`) with secure JWT token injection. Users can immediately use existing web apps inside the mobile app with their active session, without writing new mobile UI. As time progresses, graduate Tier 2 tools into native screens.

### 💡 Recommendation 2: Hardware-Grade Biometric SSO
Implement instant app unlocking using `expo-local-authentication`. When users open the app:
1. Valid session token in `expo-secure-store`.
2. Face ID or Fingerprint prompt pops up.
3. Access granted instantly without password re-entry.

### 💡 Recommendation 3: Dynamic Service Registry
Rather than hardcoding services in the mobile app, fetch an **Ecosystem Service Registry** from your backend:
- Returns available tools, icons, access tiers, and feature flags based on the user's subscription.
- Adding a new tool to "Definitely One" on the backend instantly makes it show up on Web, Desktop, and Mobile without requiring an App Store release!

### 💡 Recommendation 4: Deep Linking Scheme
Configure `definitelyone://` scheme and Universal Links (`https://app.definitelyone.com/service/*`). Tapping a link in an email or web browser seamlessly opens the exact tool inside the mobile app.

---

## 5. Step-by-Step Implementation Roadmap

### Phase 1: Project Scaffolding & Core Infrastructure
- [x] Initialize Expo SDK with TypeScript (`npx create-expo@latest`).
- [x] Configure theme tokens and typography system matching Vite/Tauri.
- [x] Set up **Expo Router** with file-based routing architecture.
- [x] Configure `app.json` with app scheme (`definitelyone`), bundle IDs (`com.definitelyone.app`), and icons.
- [x] Set up vector icons (`@expo/vector-icons`).

### Phase 2: Unified Authentication & SSO Layer
- [x] Implement `secureStorage.ts` utilizing `expo-secure-store` (hardware-backed iOS Keychain & Android Keystore).
- [x] Implement biometric verification hook `useBiometrics.ts` (`expo-local-authentication`).
- [x] Build Auth Screens:
  - [x] SSO Login Screen with email authentication & quick demo access.
  - [x] Biometric lock screen modal (`BiometricLockModal.tsx`).
- [x] Connect global auth state via Zustand with persistent secure login (`authStore.ts`).

### Phase 3: The "Definitely One" Hub & Service Marketplace
- [x] Design and build the **Hub Dashboard** (`src/app/index.tsx`):
  - [x] Organization/workspace header with active plan badge.
  - [x] Quick access pinned tools carousel.
  - [x] Real-time search filter and category pills.
  - [x] Ecosystem status banner and metrics.
- [x] Build **Services Catalog & Launchers**:
  - [x] Service Cards with category tags, custom accent glows, and tier requirements (`ServiceCard.tsx`).
  - [x] Service Launcher Modal with web link bridge & feature integration breakdown (`ServiceLauncherModal.tsx`).
- [x] Build **Notifications & Profile Modals**:
  - [x] Ecosystem Activity feed with priority markers and read states (`NotificationsModal.tsx`).
  - [x] Unified Profile & Security Center showing active Web, Desktop (Tauri), and Mobile sessions (`ProfileModal.tsx`).
- [x] Build Platform & Architecture screen (`src/app/explore.tsx`).

### Phase 4: Shared Services & Offline Experience
- [x] Install and configure **TanStack Query (React Query)** (`@tanstack/react-query`) with custom `QueryClientProvider` and caching rules (`client/src/lib/queryClient.ts`).
- [x] Implement React Query hooks (`useServicesQuery`, `useNotificationsQuery`, `useRefreshEcosystem`) with automatic background refetch and pull-to-refresh (`client/src/hooks/useEcosystemQueries.ts`).
- [ ] Connect production backend API endpoints with JWT refresh interceptor.
- [ ] Real-time WebSocket sync for live alerts.

### Phase 5: Push Notifications & Deep Linking
- [ ] Configure **Expo Notifications** (`expo-notifications`) for ecosystem alerts.
- [ ] Connect Universal Links & deep link handlers (`definitelyone://service/*`).

### Phase 6: Testing, Hardening & Deployment Setup
- [ ] Configure **EAS (Expo Application Services)** build profiles (`eas.json`).
- [ ] OTA updates with `expo-updates`.
- [ ] Production TestFlight and Google Play Store build.

---

## 6. Next Steps to Begin

1. **Review and approve this implementation plan.**
2. **Initialize the Expo project codebase** right here in the repository.
3. **Configure NativeWind and dependencies.**
4. **Build the Unified SSO and Ecosystem Hub layout.**
