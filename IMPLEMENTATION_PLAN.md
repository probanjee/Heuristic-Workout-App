# HeuristicAI — Implementation Plan

**Version:** 1.0.0  
**Duration:** 11 weeks (solo developer)  
**Start:** Week 1  
**Target MVP:** Week 10 (11th week) — Expo production build + demo video  

---

## Milestone Summary

| Milestone | Week | Deliverable |
|---|---|---|
| M0: Foundation | 1 | Working Expo app, Supabase connected, DB schema, design system tokens |
| M1: Onboarding | 2 | Full onboarding flow, goal/level/equipment capture, guest mode |
| M2: Exercise Library | 3 | 25 exercises, demo videos, form checklists, search/filter |
| M3: Heuristic Engine | 4 | Rule engine fully tested, Zustand workout store |
| M4: Live Workout UI | 5 | Active session screen, RPE input, rest timer, heuristic banner |
| M5: Camera & Form | 6 | MediaPipe integration, 5 form evaluators, camera overlay |
| M6: Summary + Progress | 7 | Post-workout summary, progress charts, 1RM calculation |
| M7A: Firebase Auth | 8A | Firebase SDK, token storage, Google/Email/Phone login, guest upgrade |
| M7B: Sync Layer | 8B | Local DB update, custom JWT validation, JWKS sync, conflict resolution |
| M8: Polish | 9 | Animations, haptics, a11y, notifications, performance |
| M9: Ship | 10 | EAS production build, app store prep, demo video, README |

---

## Week 1 — Foundation

### Goal
A running Expo app with design system scaffolding and a connected Supabase backend.

### Implementation Steps

**Day 1–2: Project Scaffold**
```bash
# 1. Init Expo project
npx create-expo-app heuristic-ai --template expo-template-blank-typescript
cd heuristic-ai

# 2. Install core dependencies
npx expo install expo-router expo-font expo-status-bar

# 3. Install UI + state
yarn add nativewind zustand @nozbe/watermelondb better-sqlite3

# 4. Install motion + UX
npx expo install react-native-reanimated moti expo-haptics expo-av expo-camera
npx expo install expo-speech @react-native-community/netinfo expo-secure-store

# 5. Dev tooling
yarn add -D typescript @types/react eslint prettier husky lint-staged jest ts-jest
```

**Day 2–3: NativeWind + Theme**
- Configure `tailwind.config.js` with custom design tokens from UI/UX Brief.
- Load Google Fonts via `expo-google-fonts`: Syne (700, 800), IBM Plex Sans (400, 500), DM Mono (400, 700).
- Create `constants/theme.ts` with full color, spacing, and typography exports.
- Build 6 base UI components: Typography, Button, Card, Badge, ProgressBar, Skeleton.

**Day 3–4: WatermelonDB Schema**
- Implement full schema from TRD (6 tables).
- Create model files for each table.
- Write migration file v1.
- Verify DB read/write in a test screen.

**Day 4–5: Supabase Setup**
- Create Supabase project via dashboard.
- Run SQL migration for all 3 server tables.
- Enable RLS + add user policies.
- Seed 25 exercises via `supabase/seed.sql`.
- Upload 25 exercise demo videos to storage bucket.
- Test PostgREST endpoint from Expo (GET /exercises).

**Day 5: CI/CD**
- GitHub repo: initial commit, branch protection on main.
- GitHub Actions: `.github/workflows/ci.yml` — runs `tsc`, `eslint`, `jest` on every PR.
- Sentry: initialize with DSN, verify error capture.

### Deliverable Check
- [ ] `yarn expo start` opens app on simulator with no errors
- [ ] Design system colors render correctly on dark background
- [ ] WatermelonDB schema initializes without crash
- [ ] Supabase exercises endpoint returns 25 records
- [ ] CI pipeline passes on GitHub

---

## Week 2 — Onboarding

### Goal
A complete onboarding flow that captures user goals, level, equipment, and injuries, with optional account creation and guest mode.

### Implementation Steps

**Day 1–2: Screen Shells + Navigation**
- Configure Expo Router layouts: `(onboarding)` group, `(tabs)` group.
- Build redirect logic in `app/index.tsx`: check SecureStore for `onboarding_complete` flag.
- Implement `app/(onboarding)/_layout.tsx` with shared progress indicator.

**Day 2–4: Individual Screens**
- Welcome screen: Animated logo (Moti), tagline, CTA.
- Goals screen: 4 large tap cards with icons, single-select, smooth selection animation.
- Level screen: 3 cards with descriptions.
- Equipment screen: Multi-select chip grid, "Select All" shortcut.
- Injuries screen: Multi-select + "None" option with clear-all logic.
- Baseline screen: Exercise instructions, camera request, rep counter.
- Account screen: Email/password form, Google OAuth button, skip option.

**Day 4–5: State + Persistence**
- `store/user.store.ts` with Zustand: onboarding state + actions.
- On "Account Creation" complete: write User model to WatermelonDB.
- Store `onboarding_complete = true` in SecureStore.
- Navigation to `(tabs)/workout` on completion.

### Test Coverage
- Unit: user store state transitions
- Detox: full happy-path onboarding (goals → account → home)
- Detox: skip baseline + skip account → guest mode home

---

## Week 3 — Exercise Library

### Goal
Full exercise library with 25 exercises, searchable, filterable, with looping demo videos and form checklists.

### Implementation Steps

**Day 1: Data Seed**
- Create `constants/exercises.ts`: array of 25 exercise objects (slug, name, muscles, equipment, difficulty, video URL, form checklist, audio cues).
- Write DB migration to seed exercises into local WatermelonDB on first run.

**Day 2–3: Library Screen**
- Build `ExerciseCard` component: thumbnail (aspect 4:3), name, muscle tags, equipment badge.
- Library index screen: 2-column grid, search bar (local filter), filter chips.
- Implement WatermelonDB query with `Q.where` for muscle/equipment filters.
- Real-time search: debounce 200ms → re-query.

**Day 3–4: Exercise Detail Screen**
- `DemoPlayer`: expo-av video, autoplay, loop, muted, 10–15s clip.
- Form checklist: animated expanding list (Moti stagger).
- Audio cue button: queues all cue strings to expo-speech TTS.
- "Add to Workout" button: adds to active session or prompts to start session.

**Day 4–5: Video Caching**
- `services/video-cache.ts`: download video to FileSystem cache on first view.
- Cache manifest stored in WatermelonDB (exercise.video_cached = true).
- Background download: queue via expo-background-fetch (WiFi-only option).
- Cache size tracker; evict LRU at 500MB limit.

---

## Week 4 — Heuristic Engine

### Goal
A fully tested, production-ready heuristic rule engine with 100% unit test coverage.

### Implementation Steps

**Day 1–2: Types + Rules**
- Implement all types from TRD: `SetInput`, `HeuristicDecision`, `RuleResult`.
- Implement all 6 rules from TRD (plus 2 additional: `ruleDropSetReadiness`, `ruleConsistentFormImprovement`).
- Implement `1rm.ts`: Epley formula + Brzycki, average the two.
- Implement `recovery.ts`: create/check/expire recovery flags.

**Day 2–3: Evaluator**
- Priority-ordered rule evaluator.
- Fallback: if no rule matches → maintain current values + coach note "Good set. Keep the pace."
- `sessionFatigueIndex` calculation: rolling average of all RPEs in session so far.
- Confidence scoring: rules that match get 0.85, fallback gets 0.5.

**Day 3–4: Unit Tests (Mandatory 100% on engine)**
```typescript
// Examples of test cases:
describe('ruleRPERepFailure', () => {
  it('triggers at RPE 8 with 2 missed reps', () => { ... });
  it('does not trigger at RPE 8 with 0 missed reps', () => { ... });
  it('adds drop set at RPE 9+', () => { ... });
  it('does not trigger when rpe is null (estimated)', () => { ... });
});

describe('Evaluator priority', () => {
  it('activeRecoveryFlag beats rpeRepFailure', () => { ... });
  it('sessionFatigue warning fires at fatigueIndex >= 8.5', () => { ... });
});
```

**Day 4–5: Workout Store**
- `store/workout.store.ts`:
  - State: `currentSession`, `currentExercise`, `sets[]`, `heuristicDecision`, `sessionFatigueIndex`
  - Actions: `startSession`, `logSet`, `submitRPE`, `acceptDecision`, `overrideDecision`, `endSession`
- Persist active session to WatermelonDB after every set (crash recovery).
- Resume logic: on app open, check for in-progress session in DB → offer to resume.

---

## Week 5 — Live Workout Screen

### Goal
The active workout experience — the screen users stare at for 45 minutes.

### Implementation Steps

**Day 1–2: Core Workout UI**
- `WorkoutHeader`: exercise name, set progress (X/Y), elapsed session timer (DM Mono).
- `SetCard`: weight display (DM Mono 64px), rep counter (tap-to-increment), +/− weight buttons.
- `RepCounter`: haptic on each tap, visual ripple (Reanimated layout animation).
- Wire to workout store: display `currentSet.targetWeightKg`, `currentSet.targetReps`.

**Day 2–3: Rest Timer + RPE**
- `RestTimer`: SVG ring (Reanimated `withTiming` on stroke-dashoffset), countdown DM Mono 48px.
- Color transition: green → amber → red in last 20s.
- Skip button + +30s button.
- `RPESlider`: full-screen overlay (spring animation), 10 color-coded buttons, auto-dismiss timer.

**Day 3–4: Heuristic Banner + Exercise Swap**
- `HeuristicBanner`: slides up over rest timer, shows engine decision, accept/override.
- Override flow: bottom sheet with weight/reps pickers (WheelPicker style).
- Exercise substitution bottom sheet: 3 alternatives filtered by equipment + injury flags.
- Wire accept → update store → update rest timer duration.

**Day 4–5: Polish + UX Details**
- Swipe right on SetCard → complete set (gesture handler).
- Shake device → "I'm tired" shortcut (expo-sensors AccelerometerSensor).
- Long press weight → keyboard input for manual entry.
- Swipe up → mini exercise demo player overlay.
- Session end confirmation modal with summary preview.

---

## Week 6 — Camera & Form Analysis

### Goal
Working MediaPipe pose detection with 5 exercise-specific form evaluators running on-device.

### Implementation Steps

**Day 1–2: MediaPipe Setup**
```bash
yarn add @mediapipe/tasks-vision
# Download lite model
# Copy pose_landmarker_lite.task to assets/models/
```
- Initialize PoseLandmarker with GPU delegate.
- Test on simulator → fallback to CPU if GPU unavailable.
- Wire expo-camera to canvas via `useRef` + requestAnimationFrame loop.
- Implement frame rate throttle (every 3rd frame = ~24 FPS at 70 FPS camera).

**Day 2–3: Form Evaluators**
- Implement all 5 form rule files from TRD (squat, pushup, deadlift, lunge, plank).
- Each evaluator: returns `{ score: number, issues: string[] }`.
- Unit tests for each with mock landmark data (15 test cases each).
- Calibration: test on real device, adjust thresholds based on real-world accuracy.

**Day 3–4: Camera Overlay UI**
- `CameraOverlay` component: canvas rendering MediaPipe skeleton.
- Toggle button: hide/show overlay without interrupting camera processing.
- `FormFeedbackBanner`: slides from bottom, color-coded by severity, auto-dismiss 4s.
- Form score badge: top-right of camera view, live updating, DM Mono.
- Debug mode: raw landmark dots (toggle in dev builds only).

**Day 4–5: Integration + Performance**
- Integrate form score into `logSet` action in workout store.
- Verify FPS with Flipper on Android emulator.
- Memory leak check: run 30-min simulated session, watch heap size.
- Privacy notice: first-time camera activation triggers permission modal with explanation.

---

## Week 7 — Summary + Progress Dashboard

### Goal
Post-workout summary screen and full progress analytics dashboard.

### Implementation Steps

**Day 1–2: Post-Workout Summary**
- Implement `generate-summary` logic (client-side for MVP):
  - Total volume = Σ (weight × reps) per set.
  - Avg RPE = mean of all logged RPEs.
  - Top 3 heuristic notes = most frequent engine decisions from session.
  - Recovery recommendation = based on avg RPE: ≥ 8 → 72h, 6-8 → 48h, < 6 → 24h.
  - Estimated 1RM = Epley formula on heaviest set.
- `SummaryHero`: animated numbers counting up (Moti spring) on screen enter.
- `RPEChart`: Victory Native line chart, RPE per set, color-coded dots.
- `CoachNotes`: expandable list of heuristic suggestions.
- Share card: `react-native-view-shot` → capture summary view → share via OS share sheet.

**Day 2–3: Progress Dashboard**
- Aggregate queries from WatermelonDB:
  - Weekly volume by muscle group (nested GROUP BY).
  - Rolling 30-day RPE average (map over sessions).
  - 1RM progression for top 3 lifts.
  - Session frequency heatmap (calendar grid with color intensity).
- Build each chart component.
- Time range picker: filter queries by date range.

**Day 4–5: Drill-down + Session History**
- Tap any chart data point → Session Detail bottom sheet.
- Session history list: last 30 sessions, sorted by date.
- All data queries run locally (no server needed for progress dashboard).

---

## Week 8A — Firebase Authentication

### Goal
Integrating Firebase Authentication SDK and creating the user authentication interfaces and credential flows.

### Implementation Steps

**Day 1–2: SDK Setup & Auth Screens**
- Run:
  ```bash
  npx expo install @react-native-firebase/app @react-native-firebase/auth
  ```
  Or construct standard web SDK compat layer if using Expo managed without prebuilds.
- Initialize Firebase app and Auth module.
- Create `/auth/login`, `/auth/signup`, and `/auth/forgot` screens following Brutalist-Tech Dark guidelines.
- Enable `expo-secure-store` to cache Firebase ID tokens and access states.

**Day 2–3: Credential Flow Implementation**
- Integrate native Google Sign-in flow.
- Implement Email & Password signup/login.
- Implement passwordless Email OTP / Magic Link flow (intercept deep links `heuristicai://auth/login?email=...&link=...`).
- Implement Phone OTP verification (request SMS code, verification screen).

**Day 4–5: Guest Account & Upgrade Flow**
- Enable Anonymous Guest Sign-in: `auth().signInAnonymously()`.
- Implement credential linking logic: `auth().currentUser.linkWithCredential(newCredential)`.
- Write WatermelonDB transaction logic to replace guest user identifiers in the SQLite database with the newly registered permanent `firebase_uid`.
- Build Face ID / Fingerprint lock option via `expo-local-authentication`.

---

## Week 8B — Supabase Sync Integration

### Goal
Adapting the sync engine to communicate with Supabase utilizing the Firebase Authentication token verification.

### Implementation Steps

**Day 1–2: Local DB Adaptation & Sync Service**
- Modify local schema `users` table to replace `supabase_id` with `firebase_uid`.
- Update `services/sync.ts` push sync payload structure to map client operations using `firebase_uid`.
- Set custom headers in Supabase client instance:
  ```typescript
  // services/sync.ts
  const token = await SecureStore.getItemAsync('firebase_id_token');
  const { error } = await supabase.functions.invoke('sync-session', {
    body: payload,
    headers: {
      'x-firebase-auth': `Bearer ${token}`
    }
  });
  ```
- Implement `expo-background-fetch` queue to poll and push sync when network status changes.

**Day 3–4: Cloud Schema & RLS Changes**
- Run PostgreSQL migration `002_replace_auth_users.sql`:
  - Rename/drop `user_id UUID REFERENCES auth.users(id)` column.
  - Add `firebase_uid TEXT NOT NULL` to `sessions`, `sets`, and `heuristic_profiles`.
  - Add UNIQUE index `UNIQUE(firebase_uid, local_id)`.
- Implement `auth.firebase_uid()` custom postgres function in Supabase schema.
- Update RLS policies:
  ```sql
  CREATE POLICY "users own their sessions" ON public.sessions
    USING (auth.firebase_uid() = firebase_uid);
  ```
- Deploy `/functions/v1/auth-broker` to verify Firebase JWT and issue a Supabase-compatible JWT for direct database reads.

**Day 4–5: Sync Verification**
- Deploy `sync-session` Edge Function with JWKS asymmetric key verification (fetching Google public certificates).
- Implement local conflict resolver: compare local vs server modified timestamps (local changes win for active sessions).
- Run airplane mode workout simulation, reconnect, and verify full database replication.

---

## Week 9 — Polish, Animations, Accessibility

### Goal
The app feels like a premium product. Smooth, responsive, accessible, delightful.

### Implementation Steps

**Day 1–2: Animations**
- Implement full animation catalog from UI/UX Brief.
- Key: Set Complete → RPE Card → Rest Timer → Heuristic Banner — this 4-step chain must feel seamless.
- Session end celebration: Lottie particle burst (find free Lottie JSON or create in LottieFiles).
- Number ticker for weight changes.
- Skeleton loading states on all data screens.

**Day 2–3: Haptics + Audio**
- Implement haptic map from UI/UX Brief: light / medium / heavy / error / success.
- Form cue TTS: queue cue strings with 2s gaps between them.
- Rest timer end: haptic + short bell tone (expo-av AudioSoundObject).
- Respect system haptic/audio settings.

**Day 3–4: Accessibility Pass**
- Add `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` to all interactive elements.
- Verify color contrast with Figma A11y plugin (all text ≥ 4.5:1).
- Test with VoiceOver (iOS) and TalkBack (Android).
- Implement `reduceMotion` check: disable Reanimated animations if enabled.
- Dynamic type: test at accessibility large (200%) on iOS.

**Day 4–5: Notifications + Performance**
- expo-notifications: schedule recovery flag reminders + rest day nudges.
- Permission request flow (non-blocking, after first workout).
- Performance audit:
  - Expo bundle analyzer: target < 6MB gzipped.
  - Flipper: check for memory leaks, frame drops.
  - Hermes JS engine: enable if not already (faster startup).
- Fix top 3 performance issues found.

---

## Week 10 — Testing, Build & Ship

### Goal
Production-ready binary, App Store submission, portfolio demo assets.

### Implementation Steps

**Day 1–2: Testing Blitz**
```bash
# Unit tests
yarn test --coverage
# Target: ≥80% overall, 100% heuristic engine

# E2E (Detox)
yarn test:e2e --configuration ios.release
yarn test:e2e --configuration android.release

# Manual test checklist:
# ✓ Full onboarding (with + without baseline)
# ✓ Complete 45-min workout session (offline)
# ✓ Reconnect → verify sync
# ✓ Camera form detection (squat + pushup)
# ✓ RPE adjustment flow (end-to-end)
# ✓ Progress dashboard with 5+ sessions
# ✓ App crash recovery (force-kill mid-set → resume)
```

**Day 2–3: Demo Video Production**
Script (2 minutes):
```
0:00 – 0:15  App open, onboarding in 30 seconds (timelapse)
0:15 – 0:35  Start workout, first set, tap rep counter
0:35 – 0:50  RPE input (tap 9), heuristic banner slides up (slow-mo)
0:50 – 1:10  Accept suggestion, next set, camera form overlay
1:10 – 1:25  Form warning triggered (yellow banner)
1:25 – 1:45  End session, summary screen, coach notes
1:45 – 2:00  Progress dashboard, RPE trend chart
```
Record on real device. Use screen recording + external microphone for voiceover.

**Day 3–4: App Store Prep**
```bash
# EAS build
eas build --platform all --profile production

# App metadata
App Name:     HeuristicAI — Adaptive Coach
Subtitle:     Real-time workout intelligence
Category:     Health & Fitness
Keywords:     workout, adaptive, AI coach, fitness tracker, heuristic

# Screenshots (required sizes)
iOS: 6.7" (iPhone 14 Pro Max), 6.1" (iPhone 14), 12.9" iPad Pro
Android: Phone, 7-inch tablet
```

**Day 4: Portfolio Assets**
- Architecture diagram: Excalidraw → export as SVG.
- README.md: project overview, tech stack, setup instructions, demo GIF, architecture section, API key setup.
- Figma file: clean up, publish share link, add to README.
- GitHub topics: `react-native`, `expo`, `heuristic-ai`, `fitness-app`, `mediapipe`, `offline-first`.

**Day 5: Submit**
```bash
# EAS Submit
eas submit --platform ios    # to TestFlight
eas submit --platform android # to Play Store Internal Testing

# Deploy web dashboard
vercel deploy
```

---

## Risk Register & Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| MediaPipe too slow on low-end Android | High | Medium | Fallback mode: disable camera, show rep counter only. Profile early (Week 6 Day 1). |
| WatermelonDB migration conflict | Medium | Low | Test migrations on fresh install + DB upgrade. Keep migrations backward-compatible. |
| Expo SDK/plugin incompatibility | Medium | Medium | Lock dependency versions. Use `expo install` for all Expo packages. |
| EAS build failure (native modules) | High | Medium | Test EAS build at Week 5 (not Week 10). |
| Exercise demo videos over 5MB | Low | Low | Compress to H.264 720p, target ≤3MB. Use Cloudinary free tier if needed. |
| Supabase free tier limits | Low | Low | Monitor usage weekly. Self-host Postgres on Render if needed. |
| App Store rejection (permissions) | Medium | Low | Include privacy policy. Request camera permission with clear purpose string. |

---

## Definition of Done (MVP)

The MVP is complete when:

- [ ] Onboarding flow captures user profile and reaches home screen
- [ ] 25 exercises in library with working demo videos and form checklists
- [ ] Heuristic engine has 100% unit test coverage, all 6 rules working
- [ ] Complete workout session can be run fully offline
- [ ] RPE input → heuristic banner → modified next set chain works end-to-end
- [ ] Camera form analysis works for at least 3 exercises on real device
- [ ] Post-workout summary generates and is shareable
- [ ] Progress dashboard renders from local session data
- [ ] Offline sync completes within 30s of reconnection
- [ ] EAS production build installs and runs on physical iOS and Android device
- [ ] 2-minute demo video recorded and edited
- [ ] README complete with architecture diagram and setup instructions
- [ ] GitHub repo public with clean commit history and CI passing

---

## Interview Pitch Script (Practice This)

> "I built HeuristicAI — an adaptive workout coach that runs a rule-based heuristic engine in real-time. Most fitness apps are static libraries. Mine observes your RPE, rep completion, and camera-based form scores after every single set, then makes a data-driven decision: reduce weight, add rest, trigger a deload, or tell you to call it a day.
> 
> The technical challenge I'm most proud of is the offline-first architecture. I used WatermelonDB with a custom sync protocol so the app works completely without internet — critical for gym basements — and syncs silently when reconnected, with conflict resolution. The heuristic engine itself is fully unit-tested at 100% coverage because it directly impacts user training outcomes.
> 
> I also integrated MediaPipe BlazePose for on-device pose detection — no frames ever leave the device — to give real-time form corrections. It runs at 24 FPS on mid-range Android using the GPU delegate.
> 
> The stack is React Native + Expo, TypeScript, WatermelonDB, Supabase, Zustand, and Reanimated 3. The whole thing is designed to be deployed to both iOS and Android from a single codebase."
