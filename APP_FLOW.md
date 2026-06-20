# HeuristicAI — Application Flow (APP_FLOW.md)

**Version:** 1.0.0  
**Last Updated:** 2025  

---

## 1. Top-Level Navigation Architecture

```
App Entry (index.tsx)
│
├── [First Launch] → Onboarding Stack
│   ├── /welcome
│   ├── /goals
│   ├── /level
│   ├── /equipment
│   ├── /injuries
│   ├── /baseline (optional)
│   └── /account (optional)
│
├── [Returning User, Not Logged In] → App with Guest Tag
│   └── → (tabs) directly
│
└── [Returning User, Logged In] → (tabs)
    ├── /workout      (tab 1 — Home/Active Workout)
    ├── /library      (tab 2 — Exercise Library)
    ├── /progress     (tab 3 — Analytics)
    └── /profile      (tab 4 — Settings / Account)
```

---

## 2. Onboarding Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING FLOW                              │
└──────────────────────────────────────────────────────────────────────┘

[Screen 1: Welcome]
  • Full-screen hero with animated logo
  • Tagline: "Your workout adapts. You just show up."
  • CTA: "Let's Build Your Profile" → [Screen 2]
  • Skip link → [App Home] (guest mode, minimal setup)

[Screen 2: Goals]
  • Heading: "What's your primary goal?"
  • 4 large tap cards:
      ● 💪 Strength      → focus: heavy compound, low reps, long rest
      ● 📈 Hypertrophy   → focus: moderate weight, 8-12 reps, volume
      ● 🏃 Endurance     → focus: light weight, high reps, short rest
      ● 🔥 Fat Loss      → focus: circuits, supersets, minimal rest
  • Selection required, single-select
  • "Continue" → [Screen 3]

[Screen 3: Training Level]
  • Heading: "How long have you been training consistently?"
  • 3 cards:
      ● Beginner   (< 6 months)
      ● Intermediate (6 months – 2 years)
      ● Advanced   (> 2 years)
  • → [Screen 4]

[Screen 4: Equipment]
  • Heading: "What do you have access to?"
  • Multi-select chips:
      ● Bodyweight only
      ● Dumbbells
      ● Barbell + Rack
      ● Cable Machine
      ● Resistance Bands
      ● Full Commercial Gym
  • → [Screen 5]

[Screen 5: Injuries]
  • Heading: "Any areas to avoid or be careful with?"
  • Multi-select (optional):
      ● Knees
      ● Lower Back
      ● Shoulders
      ● Wrists
      ● Hips
      ● None
  • "Skip" or "Continue" → [Screen 6]

[Screen 6: Baseline Test — Optional]
  • Heading: "Optional: Quick strength check"
  • Subheading: "Helps us calibrate your starting weights. Takes 3 minutes."
  • "Do it" → [Baseline Test Flow]
  • "Skip for now" → [Screen 7]

  [Baseline Test Sub-flow]
    • Test 1: Max pushups until failure (camera monitors form)
    • Test 2: Max air squats in 60s (camera monitors depth)
    • Test 3: Input known weights (bench, squat, deadlift — optional fields)
    • Results stored → heuristic profiles seeded
    → [Screen 7]

[Screen 7: Account Creation]
  • Heading: "Save your progress across devices"
  • Email + Password form
  • "Continue with Google"
  • "Skip — I'll train as a guest"
  → Profile stored in WatermelonDB
  → Navigate to (tabs)/workout
```

---

## 2.1 Detailed Authentication & Account Flows

### Google Sign-In Flow
1. User taps "Continue with Google" on Onboarding Account screen or Login screen.
2. App triggers native Google Sign-In helper modal (Google Identity Services on Android, native GIDSignIn on iOS).
3. User selects Google account and authenticates.
4. App retrieves Google auth credential and exchanges it with Firebase:
   `auth().signInWithCredential(GoogleAuthProvider.credential(idToken))`
5. Firebase returns signed-in user object and `firebase_uid`.
6. App saves user profile in WatermelonDB with `firebase_uid`.
7. App routes user to `(tabs)/workout`.

### Email Login Flow
1. User enters email and password on Login screen, taps "Sign In".
2. App calls Firebase Auth: `auth().signInWithEmailAndPassword(email, password)`.
3. Firebase verifies credentials and returns user payload.
4. App stores ID/refresh tokens in `expo-secure-store`.
5. App updates local WatermelonDB profile with user's verified `firebase_uid`.
6. App redirects to `(tabs)/workout` and triggers a background Pull Sync.

### Email OTP Login Flow
1. User taps "Sign In with Email Link" on Login screen.
2. User enters email, taps "Send Login Link".
3. App calls Firebase Auth: `auth().sendSignInLinkToEmail(email, actionCodeSettings)`.
4. Firebase sends an authentication email link.
5. User clicks the link on their mobile device.
6. The link is intercepted via deep linking (`heuristicai://auth/login?email=...&link=...`).
7. App completes authentication: `auth().signInWithEmailLink(email, deepLink)`.
8. User is logged in, token is stored in SecureStore, and app redirects to `(tabs)/workout`.

### Phone OTP Login Flow
1. User selects "Sign In with Phone" on Login/Onboarding screen.
2. User enters phone number and taps "Send Verification Code".
3. App triggers Firebase verification: `auth().signInWithPhoneNumber(phoneNumber)`.
4. Firebase transmits SMS verification code to user.
5. Screen transitions to Code Entry screen.
6. User enters 6-digit code, and app confirms credential verification.
7. Upon validation, Firebase returns user session.
8. App writes `firebase_uid` to WatermelonDB and routes to `(tabs)/workout`.

### Guest Account Flow
1. User taps "Skip — I'll train as a guest" on Onboarding Account screen.
2. App triggers anonymous sign-in: `auth().signInAnonymously()`.
3. Firebase assigns an anonymous UID.
4. App stores the profile locally in WatermelonDB with the anonymous UID (or null).
5. App sets `onboarding_complete = true` in SecureStore.
6. User is redirected to `(tabs)/workout` to start logging workouts offline.

### Guest Upgrade Flow
1. While logged in as an Anonymous Guest, user initiates account upgrade (from Settings or post-workout nudge).
2. User selects registration method (Google, Email/Password, Email OTP, or Phone OTP) and enters details.
3. App obtains credentials for the selected method.
4. App calls Firebase linking API:
   `auth().currentUser.linkWithCredential(newCredential)`
5. Anonymous user account is permanently upgraded, keeping the same `firebase_uid`.
6. WatermelonDB profile is updated, marking the account as registered.
7. The Sync Layer is triggered, pushing all local historical workouts and logs (previously stored offline) to Supabase PostgreSQL using the permanent `firebase_uid`.

### Password Reset Flow
1. User taps "Forgot Password?" on Login screen.
2. User inputs email and taps "Send Reset Link".
3. App calls: `auth().sendPasswordResetEmail(email)`.
4. User receives password reset email, clicks link.
5. Link redirects to recovery page in-app (`heuristicai://auth/reset?token=...`) or Firebase default web interface.
6. User submits new password; Firebase updates the credentials.
7. User returns to HeuristicAI app to login with new password.

### Account Recovery Flow
1. When user installs app on a new device or logs back in:
2. User completes verified sign-in using Google, Email, or Phone.
3. Firebase confirms user identity and returns the user's `firebase_uid`.
4. App performs a Pull Sync request to Supabase, pulling all historical sessions, sets, and heuristic profiles matching the verified `firebase_uid` down to the local WatermelonDB.
5. User's full training history and settings are recovered locally.

### Logout Flow
1. User taps "Sign Out" in Profile Settings.
2. Confirmation dialog is shown.
3. On confirmation, app calls: `auth().signOut()`.
4. App deletes Firebase JWTs and refresh tokens from `expo-secure-store`.
5. App resets active workout and user Zustand stores.
6. App soft-clears local WatermelonDB data or marks it as inactive.
7. App routes user back to Onboarding Welcome screen.

---

## 3. Main Workout Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ACTIVE WORKOUT FLOW                             │
└──────────────────────────────────────────────────────────────────────┘

[Workout Home — /workout/index.tsx]
  • Today's suggested workout card (based on goal + recovery flags)
  • "Start Workout" CTA (opens quick-start)
  • "Build Custom" CTA (exercise picker)
  • Recent sessions mini-list
  • Recovery flags banner if active (e.g., "Leg volume reduced today")

  ↓ "Start Workout"

[Exercise Overview Screen]
  • List of exercises for the session (e.g., Squat 4×6, Bench 3×8, RDL 3×10)
  • Estimated duration
  • "Let's Go" CTA → [Active Set Screen]

════════════════════════════════════════
     ACTIVE SESSION LOOP
════════════════════════════════════════

[Active Set Screen]
  ┌─────────────────────────────────┐
  │  Exercise: Barbell Squat        │
  │  Set 2 of 4                     │
  │                                 │
  │  Weight: 75 kg    Reps: 6       │
  │                                 │
  │  [  - kg  ]  [ TAP REP COUNT ] │
  │     72.5          ① ② ③ ④ ⑤  │
  │                                 │
  │  📹 Camera ON (toggle)          │
  │                                 │
  │  [Complete Set]                 │
  └─────────────────────────────────┘

  ↓ "Complete Set" tapped

[RPE Input Card — Full Screen Overlay]
  ┌─────────────────────────────────┐
  │  How was that set?              │
  │                                 │
  │  [1][2][3][4][5][6][7][8][9][10]│
  │   😊           😐           😤  │
  │                                 │
  │  (auto-dismiss in 15s → RPE 6)  │
  └─────────────────────────────────┘

  ↓ RPE submitted

[Heuristic Engine Evaluation — 500ms]
  → Rule evaluator runs
  → Decision produced

[CASE A: No significant change]
  ↓ → [Rest Timer Screen]
  • Countdown ring (default 90s, modified by engine)
  • "Skip Rest" button
  • Next set preview: "Next: 75kg × 6"
  • Subtle coach tip in footer
  ↓ Timer ends → [Active Set Screen, next set]

[CASE B: Heuristic Suggestion]
  ↓ → [Heuristic Banner] slides up over Rest Timer
  ┌─────────────────────────────────┐
  │  🤖 Coach Suggestion            │
  │                                 │
  │  RPE 9 on set 2. Reducing       │
  │  weight by 10% and adding       │
  │  30 seconds rest.               │
  │                                 │
  │  Next set: 67.5kg × 6           │
  │  Rest: 2:00 min                 │
  │                                 │
  │  [Accept ✓]    [Override]       │
  └─────────────────────────────────┘

  ↓ Accept → engine decision applied → [Rest Timer Screen]
  ↓ Override → user manually adjusts weight/reps → [Rest Timer Screen]

[CASE C: Terminate Session Warning]
  ┌─────────────────────────────────┐
  │  ⚠️ High Fatigue Alert          │
  │                                 │
  │  Your average RPE this session  │
  │  is 8.7. Consider ending here   │
  │  to protect recovery.           │
  │                                 │
  │  [Keep Going]  [End Session]    │
  └─────────────────────────────────┘

════════════════════════════════════════
     SESSION END
════════════════════════════════════════

  ↓ All sets complete OR "End Early" tapped

[Session End Confirmation]
  • "Great work!" animation
  • Summary numbers: Volume X kg, Time Y min, Avg RPE Z
  • "See Full Summary" → [Post-Workout Summary Screen]
```

---

## 4. Camera Form Analysis Flow

```
[During Active Set — Camera Enabled]
  │
  ├── Camera view renders in top portion of screen (portrait)
  │
  ├── MediaPipe processes every 3rd frame (≈24 FPS)
  │
  ├── Form rules evaluate every 500ms
  │
  ├── [No Issues Detected]
  │     → Green checkmark in form score badge
  │     → Score updates silently
  │
  ├── [Minor Issue — Score 60–79]
  │     → Yellow banner slides in from bottom
  │     → Text: "Slight knee cave — push knees out"
  │     → Auto-dismisses in 4s
  │     → Haptic: light tap
  │
  └── [Major Issue — Score < 60]
        → Red banner (persistent until next rep)
        → Text: "Stop — significant form breakdown detected"
        → TTS: "Check your form" (expo-speech)
        → Haptic: heavy pulse
        → Form score logged to set record
```

---

## 5. Exercise Library Flow

```
[Library Tab — /library/index.tsx]
  │
  ├── Search bar (real-time filter)
  ├── Filter chips: All / Chest / Back / Legs / Shoulders / Arms / Core
  ├── Equipment filter chips
  │
  ├── Exercise cards grid (2-column)
  │   Each card: thumbnail, name, primary muscle, equipment tag
  │
  ↓ Tap exercise card

[Exercise Detail — /library/[slug].tsx]
  │
  ├── Looping demo video (auto-plays, muted, loops)
  ├── Exercise name + muscle group tags
  ├── Difficulty badge
  ├── Form checklist (animated check-in items)
  ├── Audio cue button: "Play Tips" → TTS reads form cues
  ├── "Add to Workout" button → exercise picker for today's session
  ├── Heuristic history: "Your last 5 sessions" (if data exists)
  └── Related exercises (same muscle group, different equipment)
```

---

## 6. Progress Dashboard Flow

```
[Progress Tab — /progress/index.tsx]
  │
  ├── Time range selector: 7d | 30d | 90d | All
  │
  ├── Section: Volume
  │   └── Stacked bar chart (weekly volume per muscle group)
  │       ↓ Tap bar → [Session Detail Modal]
  │
  ├── Section: Effort
  │   └── RPE trend line (rolling 7-day average)
  │
  ├── Section: Strength
  │   └── Estimated 1RM progress chart
  │       └── Exercise selector (squat, bench, deadlift, etc.)
  │
  ├── Section: Consistency
  │   └── Calendar heatmap (GitHub-style)
  │       ↓ Tap day → [Session Detail Modal]
  │
  └── Section: Insights
      └── 3 auto-generated text insights (e.g., "Volume up 18% vs last month")

[Session Detail Modal — bottom sheet]
  ├── Date, duration, total volume
  ├── Exercise list with sets logged
  └── "View Full Summary" CTA → [Post-Workout Summary Screen]
```

---

## 7. Settings / Profile Flow

```
[Profile Tab — /profile/index.tsx]
  │
  ├── Account section
  │   ├── Display name, email
  │   ├── "Sign In" / "Sign Out" CTA
  │   └── Sync status + "Sync Now" button
  │
  ├── Preferences
  │   ├── Units: kg / lbs toggle
  │   ├── Default rest timer duration
  │   ├── Camera default: on / off
  │   ├── Audio cues: on / off
  │   └── Haptics: on / off
  │
  ├── Training Profile
  │   ├── Edit goal, level, equipment, injuries
  │   └── Re-run baseline test
  │
  ├── Recovery & Scheduling
  │   ├── Rest day schedule
  │   ├── Active recovery flags list (with manual dismiss)
  │   └── Notification settings
  │
  └── App Info
      ├── Version, changelog
      ├── Privacy policy
      └── Export data (JSON download)
```

---

## 8. Offline / Connectivity State Machine

```
States: ONLINE | OFFLINE | RECONNECTING | SYNCING

ONLINE
  │ NetInfo: isConnected = false
  ▼
OFFLINE
  • Toast: "Offline — all data saved locally"
  • All workout features work normally
  • Sync status badge: 🔴 Offline
  │ NetInfo: isConnected = true
  ▼
RECONNECTING
  • Brief state (500ms) while checking server reachability
  │ Server reachable
  ▼
SYNCING
  • Background sync begins (max 50 records/batch)
  • Sync status badge: 🔄 Syncing...
  • User can continue working
  │ All records synced
  ▼
ONLINE
  • Sync status badge: ✅ Synced (timestamp)
  • Toast: "Sync complete"

SYNCING → Error
  │ HTTP 5xx or timeout
  ▼
ONLINE (with retry scheduled)
  • Retry with exponential backoff: 30s → 2min → 10min
  • Badge: ⚠️ Sync pending
```

---

## 9. Notification Flow

```
Triggers:
  ├── Recovery flag expires
  │     → "Your [exercise] recovery period is over. Back to full volume!"
  │     → Scheduled via expo-notifications at flag.activeUntil
  │
  ├── Rest day nudge (no workout in 3+ days)
  │     → "3 days since your last session. Even 20 min counts."
  │     → Scheduled as background check
  │
  └── Weekly summary (Sunday 8pm local)
        → "This week: X sessions, Y kg total volume"
        → Tapping → deep link to /progress

Notification tap handling:
  recovery_flag  → open /workout (workout home)
  rest_nudge     → open /workout (workout home)
  weekly_summary → open /progress
```

---

## 10. Deep Link Schema

```
heuristicai://workout              → open workout tab
heuristicai://library/{slug}       → open exercise detail
heuristicai://progress             → open progress tab
heuristicai://session/{id}         → open session detail
heuristicai://auth/reset?token=    → password reset (from email)
```

---

## 11. Error State Flows

```
[DB Initialization Failure]
  → Show "Something went wrong" screen with "Retry" and "Contact Support"
  → Log to Sentry with device info

[Camera Permission Denied]
  → Camera toggle becomes disabled
  → Show settings deep-link: "Enable in Settings > Privacy > Camera"
  → Workout continues without form analysis

[Sync Conflict]
  → Log conflict to Sentry
  → Apply local-wins rule silently
  → Show subtle toast: "Sync conflict resolved"

[MediaPipe Model Load Failure]
  → Camera overlay disabled for session
  → Toast: "Form analysis unavailable — model failed to load"
  → Workout continues normally

[Network Error during Sync]
  → Retry with backoff
  → After 3 failures: badge shows "Sync pending"
  → Data preserved locally indefinitely until sync succeeds
```
