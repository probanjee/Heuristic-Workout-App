# HeuristicAI Workout App (Prototype)

> ⚠️ **PROTOTYPE NOTICE:** This project is currently an incomplete prototype and is under active development. It is not ready for production use. It serves as a portfolio piece demonstrating React Native/Expo architecture, heuristic-driven engines, and modern mobile app design.

*A personal strength coach that learns your limits in real-time.*
**Brutalist-Tech Dark** React Native mobile app. Offline-first, heuristic-driven, zero AI mythology.

---

## Current Status
**Status:** Prototype / Under Development
This application is a work-in-progress prototype. While foundational structures (navigation, local DB, state management) are established, several features and modules remain incomplete or mock-driven.

## Current Features
- **Offline-First Storage:** Integrated WatermelonDB for local device-first data tracking.
- **State Management:** Zustand stores configured for workout session state and user sync.
- **Heuristic Rule Engine:** A pure TypeScript rule engine to adaptively calculate workout fatigue and recovery (evaluated locally).
- **Navigation Flow:** Tabbed Expo Router implementation for workout, library, progress, and profile.
- **Design System:** NativeWind (TailwindCSS) with Brutalist-Tech Dark aesthetic.

## Planned Features
- **Authentication:** Completion of Firebase Auth and Supabase user management integration.
- **Advanced Tracking:** Live rep and RPE tracking with dynamic heuristic adjustments.
- **Analytics Dashboard:** Comprehensive visualization of lifting progress and volume over time.
- **Cloud Sync:** Seamless conflict-free syncing between local WatermelonDB and Supabase.
- **AI-Assisted Recommendations:** Personalized workout generation and form feedback.

## Known Limitations
- Firebase and Supabase integrations are currently partially configured and require valid environment credentials to function fully.
- Cloud syncing is not yet complete.
- Some screens and components contain placeholder UI or mock data.
- Camera/pose tracking features may require real-device testing to function properly.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.85 + Expo SDK 56 |
| Navigation | Expo Router |
| State | Zustand |
| Local DB | WatermelonDB (SQLite) |
| Cloud | Supabase + Firebase (Auth) |
| Styling | NativeWind v4 (Tailwind) |
| Animation | Reanimated 3 + Moti |
| Camera/Pose | Expo Camera + MediaPipe Tasks Vision |
| TTS | Expo Speech |
| Auth storage | Expo Secure Store |

---

## Folder Structure

```text
heuristic-ai/
├── app/                      # Expo Router screens & navigation
├── components/               # Reusable UI elements
├── constants/                # Theme tokens, exercise seeds
├── database/                 # WatermelonDB schema, models, and migrations
├── heuristic-engine/         # Pure TypeScript rule engine for workout logic
├── hooks/                    # Custom React hooks
├── lib/                      # Helper utilities
├── services/                 # External integrations (Supabase, Firebase, Sync)
├── store/                    # Zustand state stores
└── types/                    # TypeScript interfaces and types
```

---

## Setup Instructions

**Disclaimer:** You will need to provide your own Firebase and Supabase backend credentials to run the app in a fully integrated state.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/probanjee/heuristicai-workout-app.git
   cd heuristic-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to create your own `.env` file.
   ```bash
   cp .env.example .env
   ```
   Fill in the necessary keys for your Supabase and Firebase projects. Never commit your `.env` file containing real credentials.

4. **Run with Expo:**
   ```bash
   npm run start
   ```
   Press `a` to open on Android, `i` to open on iOS, or scan the QR code with the Expo Go app.

5. **Testing:**
   To run the Jest test suite for the Heuristic Engine:
   ```bash
   npm run test
   ```
   To view test coverage:
   ```bash
   npm run test:coverage
   ```

---

## Disclaimer
This project is an experimental prototype intended to demonstrate software architecture and mobile development skills. It is provided "as is" without warranties of any kind.
