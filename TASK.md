# HeuristicAI — Task Breakdown (TASK.md)

**Version:** 1.0.0  
**Methodology:** Feature-driven sprints (1 week each)  
**Total estimated effort:** 11 weeks solo  

Legend: `[ ]` = todo · `[x]` = done · `[~]` = in progress · `[!]` = blocked

---

## Phase 0 — Foundation (Week 1)

### 0.1 Project Bootstrap
- [ ] Initialize Expo project with TypeScript template (`expo init heuristic-ai --template expo-template-blank-typescript`)
- [ ] Configure Expo Router (file-based routing)
- [ ] Set up NativeWind (Tailwind for RN) with config
- [ ] Configure absolute imports (`@/` alias in tsconfig.json)
- [ ] Install all dependencies from TRD stack (Zustand, WatermelonDB, Reanimated 3, Moti, expo-camera, expo-av, expo-haptics, expo-speech, netinfo)
- [ ] Create `.env.example` with all required env vars
- [ ] Configure ESLint + Prettier + Husky pre-commit hooks
- [ ] Set up GitHub Actions CI workflow (lint + type-check + test)
- [ ] Create initial Sentry project and integrate SDK

### 0.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Run schema migrations (sessions, sets, heuristic_profiles tables)
- [ ] Enable Row Level Security + add policies
- [ ] Configure Supabase Auth (email + Google OAuth)
- [ ] Create initial Edge Functions scaffold (`sync-session`, `generate-summary`)
- [ ] Seed exercises table with 25 exercise records
- [ ] Upload 25 exercise demo videos to Supabase Storage (≤5MB each)
- [ ] Set CORS policy on storage bucket

### 0.3 Local Database
- [ ] Install WatermelonDB + SQLite adapter
- [ ] Define schema.ts (all 6 tables)
- [ ] Create model classes for each table (User, Exercise, Session, Set, HeuristicProfile, RecoveryFlag)
- [ ] Write initial database seed for exercise library (25 exercises)
- [ ] Test DB read/write cycle in isolation

### 0.4 Design System Foundation
- [ ] Create `constants/theme.ts` with color tokens, spacing, typography
- [ ] Build `components/ui/Typography.tsx` (H1, H2, Body, Caption variants)
- [ ] Build `components/ui/Button.tsx` (Primary, Secondary, Ghost, Danger variants)
- [ ] Build `components/ui/Card.tsx` (default, elevated, glass variants)
- [ ] Build `components/ui/Badge.tsx`
- [ ] Build `components/ui/ProgressBar.tsx`

---

## Phase 1 — Onboarding (Week 2)

### 1.1 Onboarding Screens
- [ ] `app/(onboarding)/welcome.tsx` — App intro, tagline, "Get Started" CTA
- [ ] `app/(onboarding)/goals.tsx` — Goal selection (Strength / Hypertrophy / Endurance / Fat Loss)
- [ ] `app/(onboarding)/level.tsx` — Training level selection
- [ ] `app/(onboarding)/equipment.tsx` — Equipment multi-select
- [ ] `app/(onboarding)/injuries.tsx` — Injury flag multi-select
- [ ] `app/(onboarding)/baseline.tsx` — Optional baseline test screen
- [ ] `app/(onboarding)/account.tsx` — Email signup / skip (guest mode)

### 1.2 Onboarding Logic
- [ ] Zustand store: `store/user.store.ts` with onboarding state
- [ ] Persist onboarding data to WatermelonDB User model
- [ ] Progress indicator (dots) component across onboarding steps
- [ ] Skip logic: skip baseline test → go directly to home
- [ ] Onboarding complete flag in SecureStore (prevents re-showing)
- [ ] Navigation: redirect to `(tabs)` on completion

### 1.3 Onboarding Tests
- [ ] Unit: user store reducers
- [ ] Integration (Detox): full onboarding happy path
- [ ] Integration (Detox): skip baseline, reach home screen

---

## Phase 2 — Exercise Library (Week 3)

### 2.1 Exercise Library Screen
- [ ] `app/(tabs)/library/index.tsx` — Exercise list with search + filter
- [ ] `app/(tabs)/library/[slug].tsx` — Exercise detail page
- [ ] `components/library/ExerciseCard.tsx` — Card with thumbnail, name, muscle tags
- [ ] `components/library/DemoPlayer.tsx` — Looping video player with expo-av
- [ ] `components/library/FormChecklist.tsx` — Animated checklist items
- [ ] `components/library/MuscleTag.tsx` — Colored muscle group badge
- [ ] Filter bar: Equipment filter (chips), Muscle group filter (chips), Difficulty filter
- [ ] Search: real-time local search via WatermelonDB query

### 2.2 Video Caching Logic
- [ ] `services/video-cache.ts` — Download and cache videos locally after first view
- [ ] Cache status indicator on exercise card (cloud icon vs. checkmark)
- [ ] Background download queue (low priority, WiFi-only option)
- [ ] Cache eviction policy: evict least-recently-viewed after 500MB limit

### 2.3 Audio Cue System
- [ ] `services/audio-cues.ts` — Queue form cue strings for TTS
- [ ] TTS via `expo-speech` with natural voice settings
- [ ] Volume control respect (system mute = no audio cues)
- [ ] Test: verify TTS fires at correct rep count

---

## Phase 3 — Workout Engine (Week 4)

### 3.1 Heuristic Engine (Core)
- [ ] `heuristic-engine/types.ts` — All interfaces (SetInput, HeuristicDecision, RuleResult)
- [ ] `heuristic-engine/rules.ts` — All 6 rules (RPERepFailure, EasySet, FormDegradation, SessionFatigue, DeloadTrigger, ActiveRecoveryFlag)
- [ ] `heuristic-engine/evaluator.ts` — Priority-based rule evaluator
- [ ] `heuristic-engine/1rm.ts` — Epley formula + Brzycki formula (average)
- [ ] `heuristic-engine/recovery.ts` — Recovery flag creation and expiry logic
- [ ] `heuristic-engine/__tests__/rules.test.ts` — Unit tests for ALL rules (100% coverage)
- [ ] `heuristic-engine/__tests__/evaluator.test.ts` — Integration tests for rule priority
- [ ] `heuristic-engine/__tests__/1rm.test.ts` — Formula accuracy tests

### 3.2 Workout State Store
- [ ] `store/workout.store.ts` — Active session state (current exercise, set, weight, reps, RPE, heuristic decision)
- [ ] Actions: startSession, logSet, submitRPE, acceptHeuristicSuggestion, overrideSuggestion, endSession
- [ ] Session fatigue index calculation (rolling average, updates after each RPE input)
- [ ] Persistence: save active session to WatermelonDB after every set (resume-on-crash)

---

## Phase 4 — Live Workout Screen (Week 5)

### 4.1 Workout UI
- [ ] `app/(tabs)/workout/index.tsx` — Active workout main screen
- [ ] `components/workout/WorkoutHeader.tsx` — Exercise name, set progress (3/5), elapsed time
- [ ] `components/workout/SetCard.tsx` — Current set: weight, target reps, completed reps (tappable counter)
- [ ] `components/workout/RepCounter.tsx` — Large haptic-feedback tap counter
- [ ] `components/workout/RestTimer.tsx` — Countdown ring animation (Reanimated 3), skip button
- [ ] `components/workout/RPESlider.tsx` — Full-screen card with 1–10 colored buttons, 15s auto-dismiss
- [ ] `components/workout/HeuristicBanner.tsx` — Slide-in suggestion banner with accept/override
- [ ] `components/workout/ExerciseSwipeList.tsx` — Horizontal swipe between exercises in session
- [ ] `components/workout/SessionProgress.tsx` — Bottom bar: total volume, sets done, time

### 4.2 Workout Interactions
- [ ] Haptic feedback on: rep tap, set complete, rest start, RPE submit
- [ ] Auto-scroll to next set after logging
- [ ] Swipe right on set card → mark complete with animation
- [ ] Shake device (expo-sensors) → trigger "I'm tired" quick shortcut (reduce volume by 15%)
- [ ] Long press on weight → manual override keyboard input
- [ ] Swipe up on workout screen → mini exercise demo player overlay

### 4.3 Exercise Substitution Flow
- [ ] Substitution trigger: user taps "Swap Exercise" OR heuristic suggests substitution
- [ ] Bottom sheet with 3 alternative exercises (filtered by equipment + injury flags)
- [ ] Swap animation: exercise name fades and slides in

---

## Phase 5 — Camera & Form Analysis (Week 6)

### 5.1 MediaPipe Integration
- [ ] Install and configure `@mediapipe/tasks-vision` (WASM bundle)
- [ ] `services/pose-detection.ts` — PoseLandmarker initialization with GPU delegate
- [ ] Frame processing pipeline: expo-camera → canvas → MediaPipe → landmarks
- [ ] FPS throttle: skip to 24 FPS to save battery
- [ ] Graceful degradation: if GPU delegate fails, fall back to CPU
- [ ] Performance test: measure FPS on Android emulator + real device

### 5.2 Form Rule Evaluators
- [ ] `services/form-rules/squat.ts` — Knee valgus, depth, torso lean
- [ ] `services/form-rules/pushup.ts` — Elbow flare, hip drop, pike
- [ ] `services/form-rules/deadlift.ts` — Lumbar rounding, bar path
- [ ] `services/form-rules/lunge.ts` — Front knee tracking
- [ ] `services/form-rules/plank.ts` — Hip drop, neck crane
- [ ] `services/form-rules/__tests__/` — Unit tests with mock landmark data

### 5.3 Camera Overlay UI
- [ ] `components/workout/CameraOverlay.tsx` — Canvas overlay rendering skeleton
- [ ] Toggle button: camera on/off without interrupting workout
- [ ] Form feedback banner: slides in with issue text + color-coded severity
- [ ] Form score badge: real-time 0–100 score in corner
- [ ] Debug mode toggle: show raw landmark dots (for portfolio demo)
- [ ] Privacy notice on first camera activation

---

## Phase 6 — Post-Workout Summary + Progress (Week 7)

### 6.1 Post-Workout Summary
- [ ] `app/(tabs)/workout/summary.tsx` — Full summary screen
- [ ] `components/workout/SummaryHero.tsx` — Total volume, duration, avg RPE
- [ ] `components/workout/RPEChart.tsx` — Line chart (Victory Native or react-native-gifted-charts)
- [ ] `components/workout/FormSummary.tsx` — Form scores per exercise
- [ ] `components/workout/CoachNotes.tsx` — Top 3 heuristic recommendations
- [ ] `components/workout/RecoveryBadge.tsx` — 24h / 48h / 72h recommendation
- [ ] Share card generator: render summary as image (react-native-view-shot), share to OS
- [ ] "Start Again" and "Done" CTAs

### 6.2 Progress Dashboard
- [ ] `app/(tabs)/progress/index.tsx`
- [ ] `components/progress/VolumeChart.tsx` — Stacked bar by muscle group (weekly)
- [ ] `components/progress/RPETrendChart.tsx` — Line chart over 30 days
- [ ] `components/progress/OneRMChart.tsx` — 1RM progression per exercise
- [ ] `components/progress/FrequencyHeatmap.tsx` — Calendar heatmap
- [ ] Time range picker: 7d / 30d / 90d / All-time
- [ ] Tap drill-down: tap bar → show that session's summary

---

## Phase 7A — Firebase Authentication (Week 8A)

### 7.1 Firebase Auth Integration
- [ ] Configure Firebase project and download config files (`google-services.json` and `GoogleService-Info.plist`)
- [ ] Install `@react-native-firebase/app` and `@react-native-firebase/auth` packages
- [ ] Implement Firebase SDK initialization in `lib/auth.ts` (replacing Supabase Auth calls)
- [ ] Set up secure token storage for Firebase ID/refresh tokens in `expo-secure-store`
- [ ] Create UI components and screens for: Google Sign-In, Email/Password login/signup, Password Reset
- [ ] Implement Email OTP / Magic Link passwordless flow
- [ ] Implement Phone Number + OTP verification screen and login flow

### 7.2 Guest Mode & Account Upgrade
- [ ] Support Anonymous Guest Mode (no credentials required, local-only SQLite writes)
- [ ] Implement Guest → Registered Account upgrade flow (link anonymous Firebase account to permanent Google/Email/Phone credential)
- [ ] Write WatermelonDB transaction to rewrite guest user profile records with the new permanent `firebase_uid`
- [ ] Integrate biometric authentication lock option (Face ID / Fingerprint via `expo-local-authentication`)
- [ ] Add unit tests for Firebase auth state listener and credential linking

---

## Phase 7B — Supabase Sync Integration (Week 8B)

### 7.3 Sync Engine Adaptation
- [ ] Update WatermelonDB User model schema to replace `supabase_id` with `firebase_uid`
- [ ] Update `services/sync.ts` to attach Firebase ID tokens in request headers (`x-firebase-auth` / Bearer)
- [ ] Implement background sync utilizing `expo-background-fetch`
- [ ] Build the conflict resolution layer (local-wins rule based on timestamps) mapped to `firebase_uid`
- [ ] Add sync status indicator (idle, syncing, error, synced) and manual sync trigger in header

### 7.4 Cloud Schema & Edge Functions
- [ ] Run Supabase database migration to replace `user_id UUID REFERENCES auth.users` with `firebase_uid TEXT` on `sessions`, `sets`, and `heuristic_profiles` tables
- [ ] Apply updated Postgres RLS policies checking `auth.firebase_uid() = firebase_uid`
- [ ] Deploy `sync-session` Supabase Edge Function with Firebase ID token validation (fetch and cache Firebase JWKS)
- [ ] Deploy `auth-broker` Supabase Edge Function to issue custom Supabase JWTs for direct PostgREST reads
- [ ] Deploy `generate-summary` Edge Function
- [ ] Integrate rate limiting via Upstash Redis and validation via Zod on all Edge Functions
- [ ] End-to-end test: perform offline workout → connect internet → verify successful sync to Supabase with Firebase identity

---

## Phase 8 — Notifications & Polish (Week 9)

### 8.1 Notifications
- [ ] `services/notifications.ts` — Notification scheduling
- [ ] Recovery reminder: notify when recovery period ends ("You're good to squat again!")
- [ ] Rest day nudge: if no workout in 3 days → motivational prompt
- [ ] Permission request flow (non-intrusive, shown after first workout)

### 8.2 Animations & Micro-interactions
- [ ] Page transition animations (slide, fade) via Expo Router layout
- [ ] Set complete celebration: particle burst (Moti + custom SVG)
- [ ] Weight number ticker animation on heuristic adjustment
- [ ] Rest timer ring fill animation (SVG + Reanimated)
- [ ] HeuristicBanner slide-in spring animation
- [ ] RPE color gradient animation on slider
- [ ] Skeleton loading states on all data screens
- [ ] Haptic patterns: light (rep tap), medium (set complete), heavy (heuristic warning)

### 8.3 Accessibility
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Color contrast WCAG 2.1 AA on all text
- [ ] Large text mode support (RN dynamic type)
- [ ] Screen reader test (VoiceOver + TalkBack)
- [ ] Reduce motion option (disables Reanimated animations)

---

## Phase 9 — Testing, Performance & Launch Prep (Week 10)

### 9.1 Testing
- [ ] Achieve ≥ 80% unit test coverage (heuristic engine: 100%)
- [ ] Run full Detox E2E suite (onboarding + workout + sync)
- [ ] Performance profiling: Flipper memory + FPS during camera session
- [ ] Crash-free rate baseline: simulate 5 crash scenarios, verify Sentry captures
- [ ] Offline test: airplane mode full workout → reconnect → verify sync

### 9.2 Demo Preparation (Portfolio)
- [ ] Record 2-minute demo video (onboarding → workout → heuristic adjustment → form feedback → summary)
- [ ] Create architecture diagram (draw.io or Excalidraw)
- [ ] Write thorough README with setup instructions, architecture notes, feature list
- [ ] Create Figma link for design documentation
- [ ] Deploy web companion dashboard to Vercel
- [ ] Ensure Expo Go QR code works for quick demo

### 9.3 App Store Prep
- [ ] EAS Build: production binary for iOS + Android
- [ ] App Store screenshots (6 per platform, from Figma)
- [ ] App Store metadata: title, description, keywords, category
- [ ] Privacy policy page (Vercel static page)
- [ ] EAS Submit to TestFlight + Play Store Internal Testing

---

## Backlog (Post-MVP / Phase 2+)

- [ ] Voice commands: "I'm tired" / "Too easy" via expo-speech recognition
- [ ] LLM-generated workout programs (Supabase Edge Function + Claude API)
- [ ] Heart rate integration (Apple HealthKit / Google Fit)
- [ ] Wearable support (Apple Watch companion)
- [ ] Social features: friend challenges, leaderboards
- [ ] PT marketplace: trainers sell custom programs
- [ ] Velocity-based training: barbell speed tracking via phone accelerometer
- [ ] Custom program builder (drag-and-drop)
- [ ] Nutrition logging (macro tracker)
- [ ] AI coach chat interface (ask questions about form, programming)
