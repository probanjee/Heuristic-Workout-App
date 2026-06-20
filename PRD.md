# HeuristicAI — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Active  
**Owner:** Prosun Banerjee  
**Last Updated:** 2025  

---

## 1. Executive Summary

HeuristicAI is a mobile-first adaptive workout coaching application that replaces static workout plans with a real-time heuristic engine. Unlike conventional fitness apps that deliver pre-scripted programs, HeuristicAI observes user performance signals — RPE (Rate of Perceived Exertion), rep completion, camera-based form analysis, and fatigue markers — and modifies the session in-flight. The result is a digital personal trainer that learns your limits mid-session, not post-session.

**Target launch:** MVP in 10 weeks on Expo (iOS + Android) + web dashboard.

---

## 2. Problem Statement

### 2.1 The Core Failure of Existing Apps

| What users need | What apps deliver |
|---|---|
| A trainer who adapts when you're struggling | Static sets, reps, weight — no modification |
| Corrections when form breaks down | Text instructions nobody reads mid-workout |
| A plan that accounts for today's energy | The same plan every Monday regardless of recovery |
| Offline-first in a signal-dead gym basement | Apps that crash without LTE |

### 2.2 User Pain Points (Validated)

1. **Plateau blindness** — App never increases difficulty; user stagnates without knowing.
2. **Injury risk** — No feedback on form degradation under fatigue.
3. **Motivation collapse** — Rigid plans feel punishing on low-energy days.
4. **Gym connectivity** — Most gym apps fail when there's no WiFi/LTE.
5. **Cognitive load** — Users shouldn't need to think. The app should think.

---

## 3. Goals & Non-Goals

### 3.1 Goals (MVP)

- [ ] Deliver a heuristic engine that modifies reps, weight, and rest in real-time based on RPE + performance data.
- [ ] Provide camera-based form feedback for 5 foundational exercises (squat, pushup, deadlift, lunge, plank).
- [ ] Full offline functionality with background sync.
- [ ] Exercise library with micro-demo clips (10–15 sec loops) for 25 exercises.
- [ ] Post-workout AI summary with next-session recommendations.
- [ ] Progress dashboard: volume trends, RPE trends, estimated 1RM.

### 3.2 Non-Goals (MVP)

- No social/community features.
- No nutrition tracking.
- No wearable integrations (Phase 2).
- No custom program builder (Phase 2).
- No AI-generated programs from scratch (Phase 2 — uses LLM).
- No Apple Watch / Wear OS support (Phase 3).

---

## 4. Target Users

### 4.1 Primary Persona — "The Self-Coached Intermediate"

- **Name:** Arjun, 22–30
- **Context:** 6–18 months of training. Knows the basics. Has hit a plateau. Can't afford a PT but wants PT-level intelligence.
- **Behavior:** Trains 4× /week, uses phone in gym, frustrated by generic plans, wants feedback but not hand-holding.
- **Pain point:** "My app doesn't know I'm exhausted today. It still tells me to squat 80kg."

### 4.2 Secondary Persona — "The Busy Professional"

- **Name:** Neha, 28–38
- **Context:** Limited gym time (30–45 min sessions). Needs workouts that auto-compress or auto-extend based on energy.
- **Pain point:** "I never know whether to push through or back off."

---

## 5. Feature Specifications

### 5.1 Feature: Heuristic Engine (P0 — Core Differentiator)

**Description:** A rule-based decision engine that runs after every set and adjusts the remaining workout based on observed signals.

**Input signals:**
- RPE reported by user (1–10 slider)
- Reps completed vs. reps programmed
- Rest duration chosen (passive signal)
- Form score (from camera module, 0–100)
- Session fatigue index (rolling calculation across sets)

**Output actions:**
- Increase / decrease next set weight (±5–10%)
- Add / remove a drop set
- Extend / reduce rest period (±15–60s)
- Substitute an exercise (e.g., swap barbell squat → goblet squat)
- Trigger early session termination recommendation
- Flag recovery warning for next 24–48 hours

**Acceptance Criteria:**
- Engine re-evaluates after every completed set within 500ms.
- All outputs display to user with a one-line explanation ("You reported RPE 9 — reducing weight by 10%").
- User can override any suggestion with a single tap.
- Engine state is persisted locally; sync to server on reconnect.

---

### 5.2 Feature: RPE Input System (P0)

**Description:** After each set, user rates perceived exertion on a 1–10 scale. This is the primary heuristic signal.

**UI:** Full-screen swipe card slides in after set timer expires. Large numbered buttons (1–10) with color gradient (green → orange → red). Auto-dismiss in 15s with default RPE of 6.

**Acceptance Criteria:**
- RPE input appears within 1s of set completion.
- Rating logged to local DB with timestamp and set ID.
- If skipped, defaults to RPE 6 (logged as "estimated").

---

### 5.3 Feature: Camera Form Analysis (P1)

**Description:** Optional camera overlay using MediaPipe BlazePose to detect joint positions and flag common form errors.

**Exercises supported (MVP):** Squat, pushup, deadlift, lunge, plank.

**Detectable errors:**
- Squat: knee valgus (knees caving inward), depth below parallel, torso lean > 45°
- Pushup: elbow flare > 60°, hip drop / pike
- Deadlift: rounded lumbar, bar path drift
- Lunge: front knee tracking past toes
- Plank: hip drop, neck crane

**Output:** Real-time overlay skeleton + text cue at bottom of screen. Form score (0–100) logged per set.

**Acceptance Criteria:**
- Works at 24 FPS on mid-range devices (Snapdragon 720G / A14 equivalent).
- False positive rate < 15% on test set of 100 labeled reps.
- Toggle on/off without interrupting workout.
- Processes on-device only — no frames sent to server.

---

### 5.4 Feature: Exercise Library (P0)

**Description:** 25+ exercises with looping micro-demo clips, form checklist, audio cues, and muscle group tags.

**Content per exercise:**
- 10–15 sec silent looping video (eccentric + concentric phase)
- 3–5 bullet form checklist
- 1–2 audio cue strings (played via TTS on rep count)
- Primary + secondary muscle tags
- Difficulty tier (Beginner / Intermediate / Advanced)
- Equipment tag (Bodyweight / Barbell / Dumbbell / Cable / Band)

**Acceptance Criteria:**
- Videos load in < 2s on WiFi, available offline after first view.
- Search + filter by muscle group and equipment.
- Library accessible from workout screen without exiting session.

---

### 5.5 Feature: Offline-First Architecture (P0)

**Description:** All workout functionality operates without internet. Data syncs silently when connection is restored.

**What works offline:**
- Full workout execution
- Heuristic engine
- Form analysis (on-device ML)
- Exercise demos (cached after first view)
- Progress tracking

**What requires connectivity:**
- Initial account creation
- Demo video first-load
- Progress sync across devices

**Acceptance Criteria:**
- App never shows a connectivity error during an active workout.
- Sync happens automatically within 30s of reconnection, no user action required.
- Conflict resolution: local data wins if server data is older.

---

### 5.6 Feature: Post-Workout Summary (P1)

**Description:** After session ends, a heuristic coach card displays performance analysis and next-session guidance.

**Content:**
- Total volume (sets × reps × weight)
- RPE trend across session (line chart)
- Form score summary (if camera used)
- Top 3 heuristic coach notes (e.g., "Consider deload on squats — 3 consecutive RPE 9+ sessions")
- Estimated 1RM for primary lift (Epley formula)
- Recovery recommendation: 24h / 48h / 72h

**Acceptance Criteria:**
- Summary generated within 3s of session end.
- Exportable as image (share to Instagram/WhatsApp).
- Stored locally and synced to server.

---

### 5.7 Feature: Progress Dashboard (P1)

**Description:** Visual analytics for training history.

**Charts:**
- Weekly volume per muscle group (stacked bar)
- RPE trend over last 30 days (line)
- Estimated 1RM progression for tracked lifts (line)
- Workout frequency heatmap (calendar view)
- Session duration over time (bar)

**Acceptance Criteria:**
- All charts render from local data.
- Selectable time range: 7d / 30d / 90d / All-time.
- Tapping a bar/point shows that session's detail.

---

### 5.8 Feature: Onboarding Flow (P0)

**Description:** Collects goal, training level, available equipment, injury flags, and runs a baseline strength test.

**Steps:**
1. Welcome + app philosophy (1 screen)
2. Goal selection: Strength / Hypertrophy / Endurance / Fat Loss
3. Training level: Beginner / Intermediate / Advanced
4. Equipment availability: Bodyweight / Home Gym / Full Gym
5. Injury flags (multi-select: knees, lower back, shoulders, wrists)
6. Baseline test (optional): max reps of pushups + air squats (form-checked via camera)

**Acceptance Criteria:**
- Onboarding completable in < 3 minutes.
- All data stored locally; optional account creation at end.
- Injury flags immediately filter exercise substitutions in heuristic engine.

---

### 5.9 Feature: Authentication and Identity Management (P0)

**Description:** An authentication layer powered by Firebase Authentication (replacing Supabase Auth) that manages user sessions, credentials, and guest accounts. This layer is responsible for authenticating users, persisting sessions, and enabling anonymous guests to upgrade to registered accounts without data loss.

**Login Methods Supported:**
1. **Google Sign-In:** Native OAuth login flow.
2. **Email + Password:** Traditional email signup and sign-in.
3. **Email OTP / Magic Link:** Passwordless authentication using email links/verification codes.
4. **Phone Number + OTP:** SMS-based verification and registration.
5. **Anonymous Guest Mode:** Access to all core workout, library, and progress tracking functions without account creation.

**Guest Mode Upgrade Flow:**
- Users can start workouts immediately in Anonymous Guest Mode.
- When the user decides to register (e.g., from Profile or Post-Workout screen), the app triggers the Firebase credential linking flow.
- Upon successful upgrade, the local guest profile, history, and sets stored in WatermelonDB are linked to the newly generated Firebase UID and subsequently synced to the Supabase cloud database.

**Account Recovery & Password Reset:**
- Standard password reset request via email.
- Send password reset link to user email, handling redirect deep-links (`heuristicai://auth/reset?token=...`).

**Security Requirements:**
- All Firebase ID tokens, access tokens, and refresh tokens must be stored securely using `expo-secure-store` (Keychain/Keystore).
- Bypasses Supabase Auth completely; Supabase client is initialized using Firebase JWT verification or passing Firebase UID inside the request payload headers.
- All communication with Firebase and Supabase must use TLS 1.3/HTTPS.

---

## 6. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Day-7 retention | ≥ 40% |
| Sessions per active user per week | ≥ 3 |
| RPE input completion rate per set | ≥ 75% |
| Camera feature activation rate | ≥ 30% of users |
| Offline session ratio | ≥ 60% of all sessions |
| App Store rating | ≥ 4.4 |
| Crash-free sessions | ≥ 99% |

---

## 7. Constraints

- **Budget:** $0 infrastructure (free tiers of Supabase, Render, Cloudinary).
- **Team:** Solo developer.
- **Timeline:** 10-week MVP.
- **Device targets:** Android 9+ (API 28+), iOS 15+.
- **Performance:** Cold start < 3s, no frame drops during camera overlay.
- **Accessibility:** WCAG 2.1 AA for core screens.

---

## 8. Assumptions & Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| MediaPipe too slow on low-end Android | Medium | Fallback to basic rep counter without pose detection |
| Exercise video licensing issues | Low | Record own 10-sec clips on phone, CC license |
| Heuristic engine produces bad suggestions | Medium | All suggestions are overridable; collect override data to tune rules |
| Supabase free tier limits hit | Low | Self-host on Render if needed |
| User drops off after onboarding | Medium | Keep onboarding < 3 min, make baseline test optional |

---

## 9. Out-of-Scope (Future Phases)

- **Phase 2:** LLM-generated custom programs, wearable heart rate integration, social challenges.
- **Phase 3:** Apple Watch / WearOS native companion, PT marketplace (trainers sell custom programs).
- **Phase 4:** Computer vision via rear camera (not front), barbell tracking, velocity-based training.
