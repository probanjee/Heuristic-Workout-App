# HeuristicAI — Technical Requirements Document (TRD)

**Version:** 1.0.0  
**Status:** Active  
**Owner:** Prosun Banerjee  
**Last Updated:** 2025  

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Mobile)                                │
│                                                                             │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Firebase SDK  │  │ React Native │  │  Heuristic   │  │  MediaPipe    │  │
│  │  (Auth Module)  │  │ + Expo       │  │  Engine (TS) │  │  BlazePose    │  │
│  └───────┬────────┘  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│          │                  │                 │                  │          │
│          │           ┌──────▼─────────────────▼──────────────────▼──────┐  │
│          └──────────►│             SQLite (SQLCipher encrypted)         │  │
│                      │             WatermelonDB ORM                     │  │
│                      └────────────────────────┬─────────────────────────┘  │
│                                               │ NetInfo + Background Sync   │
└───────────────────────────────────────────────┼─────────────────────────────┘
                                                │ HTTPS / REST (Firebase Auth Token)
┌───────────────────────────────────────────────┼─────────────────────────────┐
│                          BACKEND / CLOUD SERVICES                           │
│                                                                             │
│  ┌─────────────────────────┐        ┌────────────────────────────────────┐  │
│  │ Firebase Authentication │        │          SUPABASE (BaaS)           │  │
│  │                         │        │                                    │  │
│  │ - Google Sign-In        │        │  ┌─────────────┐  ┌─────────────┐  │  │
│  │ - Email/Password, OTP   │        │  │  PostgREST  │  │  Storage    │  │  │
│  │ - Phone Number + OTP    │        │  │  (REST API) │  │  (Videos)   │  │  │
│  │ - Anonymous Guest Mode  │        │  └──────┬──────┘  └─────────────┘  │  │
│  └───────────┬─────────────┘        │         │                          │  │
│              │                      │         │                          │  │
│              │ Firebase UID         │         │                          │  │
│              └──────────────────────┼─────────▼────────────────────────┐ │  │
│                                     │         PostgreSQL Database      │ │  │
│                                     │         - firebase_uid mapping   │ │  │
│                                     │         - Custom JWT RLS policies│ │  │
│                                     └──────────────────────────────────┘ │  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Mobile Client

| Layer | Technology | Justification |
|---|---|---|
| Framework | React Native 0.74+ via Expo SDK 51 | Cross-platform, strong camera/ML plugin ecosystem, Expo Go for demo |
| Language | TypeScript 5.x | Type-safety for heuristic rule engine |
| Navigation | Expo Router (file-based) | Cleaner routing, web-compatible |
| State Management | Zustand 4.x | Lightweight, no boilerplate, works great with offline-first |
| Local DB | WatermelonDB + SQLite | Reactive queries, high-perf offline sync protocol |
| Pose Detection | MediaPipe Tasks Vision (WASM/GPU) via `@mediapipe/tasks-vision` | Best accuracy/perf ratio, on-device, no server calls |
| Camera | `expo-camera` | Maintained, works with MediaPipe canvas overlay |
| Video Player | `expo-av` | Hardware-accelerated, looping support |
| Animations | React Native Reanimated 3 + Moti | 60fps on UI thread, gesture-driven |
| Styling | NativeWind (Tailwind for RN) | Fast prototyping + consistent design tokens |
| Icons | `@expo/vector-icons` (Ionicons) | Native, no web font dependency |
| Haptics | `expo-haptics` | iOS/Android haptic feedback on set complete |
| Audio | `expo-speech` (TTS) | Form cues without storing audio files |
| Network Detection | `@react-native-community/netinfo` | Online/offline transitions |
| Background Tasks | `expo-background-fetch` + `expo-task-manager` | Sync on reconnect even in background |
| Notifications | `expo-notifications` | Recovery reminders, rest day prompts |
| Secure Storage | `expo-secure-store` | Firebase tokens (ID/Refresh) and user preferences |
| Analytics | PostHog (self-hosted or cloud) | Event tracking, funnel analysis |

### 2.2 Backend (Supabase — BaaS & Firebase Auth)

| Layer | Technology | Justification |
|---|---|---|
| Database | PostgreSQL 15 (via Supabase) | ACID, JSON support, custom JWT RLS policies for Firebase UIDs |
| Auth | Firebase Authentication | Google, Email/Password, Email OTP, Phone OTP, Anonymous Guests |
| REST API | PostgREST (auto-generated) | Zero boilerplate for CRUD endpoints, authenticated via custom token/header |
| Realtime | Supabase Realtime (optional, Phase 2) | Cross-device live sync |
| File Storage | Supabase Storage | Exercise demo videos (≤ 5MB each) |
| Edge Functions | Deno (Supabase Edge Functions) | Heuristic summary generation, server-side validation, sync processing |
| Caching | Redis (Upstash free tier) | Cache user heuristic profiles, exercise metadata |

### 2.3 Dev & Deployment

| Tool | Purpose |
|---|---|
| Expo EAS Build | Binary builds for iOS/Android |
| Expo EAS Submit | App Store + Play Store submission |
| Vercel | Web companion dashboard (Next.js) |
| GitHub Actions | CI: lint, type-check, unit tests on PR |
| Sentry | Error monitoring (free tier) |
| Figma | Design source of truth |

---

## 3. Data Models

### 3.1 Local Database (WatermelonDB Schema)

```typescript
// schema.ts

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [

    // USER PROFILE
    tableSchema({
      name: 'users',
      columns: [
        { name: 'firebase_uid', type: 'string', isOptional: true },
        { name: 'display_name', type: 'string' },
        { name: 'goal', type: 'string' }, // strength | hypertrophy | endurance | fat_loss
        { name: 'training_level', type: 'string' }, // beginner | intermediate | advanced
        { name: 'equipment', type: 'string' }, // JSON array: ['barbell', 'dumbbell', ...]
        { name: 'injury_flags', type: 'string' }, // JSON array: ['knees', 'lower_back', ...]
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),

    // EXERCISE LIBRARY (seeded locally)
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'slug', type: 'string' }, // e.g., 'barbell-squat'
        { name: 'name', type: 'string' },
        { name: 'muscle_primary', type: 'string' },
        { name: 'muscle_secondary', type: 'string' }, // JSON array
        { name: 'equipment', type: 'string' },
        { name: 'difficulty', type: 'string' },
        { name: 'video_url', type: 'string' },
        { name: 'video_cached', type: 'boolean' },
        { name: 'form_checklist', type: 'string' }, // JSON array of strings
        { name: 'audio_cues', type: 'string' }, // JSON array
        { name: 'pose_model', type: 'string', isOptional: true }, // which pose rules apply
      ],
    }),

    // WORKOUT SESSIONS
    tableSchema({
      name: 'sessions',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'started_at', type: 'number' },
        { name: 'ended_at', type: 'number', isOptional: true },
        { name: 'status', type: 'string' }, // active | completed | abandoned
        { name: 'total_volume_kg', type: 'number', isOptional: true },
        { name: 'avg_rpe', type: 'number', isOptional: true },
        { name: 'heuristic_summary', type: 'string', isOptional: true }, // JSON
        { name: 'synced', type: 'boolean' },
      ],
    }),

    // SETS (individual set log)
    tableSchema({
      name: 'sets',
      columns: [
        { name: 'session_id', type: 'string' },
        { name: 'exercise_id', type: 'string' },
        { name: 'set_number', type: 'number' },
        { name: 'target_reps', type: 'number' },
        { name: 'completed_reps', type: 'number' },
        { name: 'target_weight_kg', type: 'number' },
        { name: 'actual_weight_kg', type: 'number' },
        { name: 'rpe', type: 'number', isOptional: true },
        { name: 'rpe_estimated', type: 'boolean' },
        { name: 'form_score', type: 'number', isOptional: true }, // 0-100
        { name: 'rest_seconds', type: 'number', isOptional: true },
        { name: 'heuristic_action', type: 'string', isOptional: true }, // JSON: what engine decided
        { name: 'completed_at', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),

    // HEURISTIC PROFILES (per-exercise learned limits)
    tableSchema({
      name: 'heuristic_profiles',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'exercise_id', type: 'string' },
        { name: 'estimated_1rm_kg', type: 'number', isOptional: true },
        { name: 'avg_rpe_last_5', type: 'number', isOptional: true },
        { name: 'best_volume_session', type: 'number', isOptional: true },
        { name: 'consecutive_high_rpe', type: 'number' }, // counter for deload trigger
        { name: 'last_session_id', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // RECOVERY LOG
    tableSchema({
      name: 'recovery_flags',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'exercise_id', type: 'string', isOptional: true }, // null = full-body flag
        { name: 'flag_type', type: 'string' }, // volume_reduction | rest_day | deload
        { name: 'active_until', type: 'number' }, // timestamp
        { name: 'reason', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),

  ],
});
```

### 3.2 Supabase PostgreSQL Schema (Server Mirror)

```sql
-- Mirror of local schema with sync metadata
-- Row Level Security enforced: users can only read/write their own data using Firebase UIDs

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT NOT NULL,
  firebase_uid TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('completed', 'abandoned')),
  total_volume_kg NUMERIC(8,2),
  avg_rpe NUMERIC(3,1),
  heuristic_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(firebase_uid, local_id)
);

CREATE TABLE public.sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL,
  exercise_slug TEXT NOT NULL,
  set_number INTEGER,
  target_reps INTEGER,
  completed_reps INTEGER,
  target_weight_kg NUMERIC(6,2),
  actual_weight_kg NUMERIC(6,2),
  rpe NUMERIC(3,1),
  rpe_estimated BOOLEAN DEFAULT FALSE,
  form_score NUMERIC(5,2),
  rest_seconds INTEGER,
  heuristic_action JSONB,
  completed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(firebase_uid, local_id)
);

CREATE TABLE public.heuristic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT NOT NULL,
  exercise_slug TEXT NOT NULL,
  estimated_1rm_kg NUMERIC(6,2),
  avg_rpe_last_5 NUMERIC(3,1),
  consecutive_high_rpe INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(firebase_uid, exercise_slug)
);

-- Helper to extract Firebase UID from JWT claims (sub field)
CREATE OR REPLACE FUNCTION auth.firebase_uid() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

-- Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heuristic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their sessions" ON public.sessions
  USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users own their sets" ON public.sets
  USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users own their profiles" ON public.heuristic_profiles
  USING (auth.firebase_uid() = firebase_uid);
```

---

## 4. Heuristic Engine Specification

### 4.1 Engine Interface

```typescript
// heuristic-engine/types.ts

export interface SetInput {
  exerciseSlug: string;
  setNumber: number;
  targetReps: number;
  completedReps: number;
  targetWeightKg: number;
  rpe: number | null;
  rpeEstimated: boolean;
  formScore: number | null; // 0–100, null if camera off
  sessionFatigueIndex: number; // rolling average of session RPEs so far
  recoveryFlags: RecoveryFlag[];
  heuristicProfile: HeuristicProfile;
}

export interface HeuristicDecision {
  nextSetWeightKg: number;
  nextSetTargetReps: number;
  additionalRestSeconds: number;
  addDropSet: boolean;
  substituteExercise: string | null;
  terminateSessionWarning: boolean;
  recoveryFlagToCreate: RecoveryFlag | null;
  coachNote: string; // human-readable explanation
  confidenceScore: number; // 0–1, how certain the engine is
}

export type RuleResult = Partial<HeuristicDecision> & { matched: boolean };
```

### 4.2 Rule Engine (Core Rules)

```typescript
// heuristic-engine/rules.ts

import { SetInput, RuleResult } from './types';

// Rule 1: High RPE + rep failure → weight reduction + rest extension
export function ruleRPERepFailure(input: SetInput): RuleResult {
  const repDeficit = input.targetReps - input.completedReps;
  if ((input.rpe ?? 6) >= 8 && repDeficit >= 2) {
    return {
      matched: true,
      nextSetWeightKg: input.targetWeightKg * 0.90,
      additionalRestSeconds: 45,
      addDropSet: input.rpe !== null && input.rpe >= 9,
      coachNote: `RPE ${input.rpe} with ${repDeficit} missed reps. Reducing weight 10% and adding rest.`,
    };
  }
  return { matched: false };
}

// Rule 2: RPE too low → progressive overload trigger
export function ruleEasySet(input: SetInput): RuleResult {
  if ((input.rpe ?? 6) <= 4 && input.completedReps >= input.targetReps) {
    return {
      matched: true,
      nextSetWeightKg: input.targetWeightKg * 1.05,
      coachNote: `RPE ${input.rpe} — you have capacity. Adding 5% weight next set.`,
    };
  }
  return { matched: false };
}

// Rule 3: Form breakdown → substitute or reduce
export function ruleFormDegradation(input: SetInput): RuleResult {
  if (input.formScore !== null && input.formScore < 60) {
    const severe = input.formScore < 40;
    return {
      matched: true,
      nextSetWeightKg: severe ? input.targetWeightKg * 0.85 : input.targetWeightKg * 0.95,
      additionalRestSeconds: severe ? 60 : 30,
      coachNote: `Form score ${input.formScore}/100. ${severe ? 'Significant' : 'Minor'} technique breakdown detected. ${severe ? 'Reducing weight 15%.' : 'Reducing weight 5%.'}`,
    };
  }
  return { matched: false };
}

// Rule 4: Session fatigue index critical → terminate warning
export function ruleSessionFatigue(input: SetInput): RuleResult {
  if (input.sessionFatigueIndex >= 8.5 && input.setNumber >= 4) {
    return {
      matched: true,
      terminateSessionWarning: true,
      coachNote: `Average session RPE is ${input.sessionFatigueIndex.toFixed(1)}. Consider ending here to protect recovery.`,
    };
  }
  return { matched: false };
}

// Rule 5: Consecutive high-RPE sessions → deload flag
export function ruleDeloadTrigger(input: SetInput): RuleResult {
  if (input.heuristicProfile.consecutiveHighRpe >= 3) {
    return {
      matched: true,
      recoveryFlagToCreate: {
        exerciseSlug: input.exerciseSlug,
        flagType: 'volume_reduction',
        activeUntilHours: 48,
        reason: '3 consecutive high-RPE sessions detected. Reducing volume for recovery.',
      },
      coachNote: `3 consecutive tough sessions on ${input.exerciseSlug}. Volume reduced 30% for 48h.`,
    };
  }
  return { matched: false };
}

// Rule 6: Recovery flag active → pre-emptive modification
export function ruleActiveRecoveryFlag(input: SetInput): RuleResult {
  const activeFlag = input.recoveryFlags.find(
    f => f.exerciseSlug === input.exerciseSlug && f.activeUntil > Date.now()
  );
  if (activeFlag && activeFlag.flagType === 'volume_reduction') {
    return {
      matched: true,
      nextSetWeightKg: input.targetWeightKg * 0.70,
      nextSetTargetReps: Math.ceil(input.targetReps * 0.80),
      coachNote: `Recovery flag active: volume reduced. ${activeFlag.reason}`,
    };
  }
  return { matched: false };
}
```

### 4.3 Engine Evaluator

```typescript
// heuristic-engine/evaluator.ts

import { SetInput, HeuristicDecision } from './types';
import * as Rules from './rules';

const RULE_PRIORITY = [
  Rules.ruleActiveRecoveryFlag,   // highest priority
  Rules.ruleFormDegradation,
  Rules.ruleSessionFatigue,
  Rules.ruleDeloadTrigger,
  Rules.ruleRPERepFailure,
  Rules.ruleEasySet,              // lowest priority
];

export function evaluate(input: SetInput): HeuristicDecision {
  const base: HeuristicDecision = {
    nextSetWeightKg: input.targetWeightKg,
    nextSetTargetReps: input.targetReps,
    additionalRestSeconds: 0,
    addDropSet: false,
    substituteExercise: null,
    terminateSessionWarning: false,
    recoveryFlagToCreate: null,
    coachNote: 'Keep it up. Good set.',
    confidenceScore: 0.5,
  };

  let matched = false;
  for (const rule of RULE_PRIORITY) {
    const result = rule(input);
    if (result.matched) {
      Object.assign(base, result);
      matched = true;
      base.confidenceScore = 0.85;
      break; // first matching rule wins (priority order)
    }
  }

  return base;
}
```

---

## 5. API Contracts

### 5.1 Sync Endpoints (Supabase PostgREST + Custom Edge Functions)

```
POST /functions/v1/sync-session
Body: { session: SessionPayload, sets: SetPayload[], heuristicProfile: HeuristicProfilePayload }
Response: { syncedAt: ISO8601, conflicts: ConflictRecord[] }

POST /functions/v1/generate-summary
Body: { sessionId: string }
Response: { summary: HeuristicSummary }

GET /rest/v1/exercises?select=*
Response: ExerciseRecord[]
Headers: Range: 0-49 (pagination)

GET /rest/v1/sessions?user_id=eq.{uid}&order=started_at.desc&limit=30
Response: SessionRecord[]
```

### 5.2 Offline Sync Protocol

```
1. On reconnect detected (NetInfo):
   a. Query WatermelonDB for all records where synced = false
   b. Batch into payload (max 50 records per request)
   c. POST to /functions/v1/sync-session
   d. On 200 response: mark records as synced = true
   e. On conflict: server wins for historical data, local wins for active session

2. Pull sync (on app open if online):
   a. Fetch latest server timestamp from /functions/v1/sync-status
   b. Pull any server records newer than local last-sync timestamp
   c. Upsert into local WatermelonDB
```

---

## 6. Camera & Pose Detection Pipeline

### 6.1 MediaPipe Integration

```typescript
// services/pose-detection.ts

import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class PoseDetectionService {
  private poseLandmarker: PoseLandmarker | null = null;

  async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: require('../assets/models/pose_landmarker_lite.task'),
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  }

  detectFrame(videoElement: HTMLVideoElement, timestampMs: number) {
    return this.poseLandmarker?.detectForVideo(videoElement, timestampMs);
  }
}
```

### 6.2 Form Rule Evaluators (Squat Example)

```typescript
// services/form-rules/squat.ts
// Uses MediaPipe landmark indices: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export function evaluateSquatForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  // Knee valgus detection
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  const leftHip = landmarks[23];
  const kneeOffset = leftKnee.x - leftAnkle.x;
  if (kneeOffset > 0.05) {
    issues.push('Left knee caving inward');
    score -= 20;
  }

  // Depth check (thigh below parallel = hip below knee y position)
  const hipY = leftHip.y;
  const kneeY = leftKnee.y;
  if (hipY < kneeY - 0.03) {
    issues.push('Good depth ✓'); // positive feedback
  } else {
    issues.push('Squat deeper — hip below knee');
    score -= 15;
  }

  // Torso lean (shoulder vs hip angle)
  const leftShoulder = landmarks[11];
  const torsoAngle = Math.atan2(leftShoulder.y - leftHip.y, leftShoulder.x - leftHip.x);
  const torsoAngleDeg = Math.abs(torsoAngle * (180 / Math.PI));
  if (torsoAngleDeg > 45) {
    issues.push('Excessive forward lean — brace your core');
    score -= 15;
  }

  return { score: Math.max(0, score), issues, timestamp: Date.now() };
}
```

---

## 7. Performance Requirements

| Metric | Requirement |
|---|---|
| App cold start | < 3 seconds (JS bundle + DB init) |
| Heuristic engine evaluation | < 500ms per set |
| Pose detection FPS | ≥ 24 FPS on Snapdragon 720G equivalent |
| Video demo load (cached) | < 300ms |
| SQLite write (set log) | < 100ms |
| Offline sync batch (50 records) | < 5 seconds on 4G |
| JS bundle size | < 6MB (gzipped) |
| Memory usage during camera | < 250MB |

---

## 8. Security Requirements

### 8.1 Firebase Authentication & Token Persistence
- **Firebase SDK Integration:** Use the official `@react-native-firebase/app` and `@react-native-firebase/auth` (in bare workflow) or the standard web Firebase JS SDK initialized with React Native compat layers for Expo managed workflow.
- **Secure Token Storage:** All Firebase tokens (ID token, access token, and refresh token) must be stored in `expo-secure-store` (keychain/keystore) to prevent unauthorized access. plaintext session information must never be logged.
- **Session Persistence:** Configured using Firebase's local persistence adapters so users remain logged in across app restarts without manual re-authentication.

### 8.2 Firebase UID Mapping & Database Security
- **UID Mapping Strategy:** The `auth.users` relationship is completely removed from all tables. The primary user identifier is `firebase_uid` stored as a `TEXT` field in all table structures on both local (WatermelonDB) and cloud (Supabase PostgreSQL) databases.
- **Offline Guest-to-Registered Flow:** Guest users operate with a local `firebase_uid = null` or a temporary anonymous Firebase UID. Once upgraded, all local records are rewritten with the updated Firebase UID via WatermelonDB write transactions.

### 8.3 Firebase → Supabase Sync Architecture & JWT Validation
Because Supabase PostgREST uses HS256 JWTs signed with the Supabase JWT secret, while Firebase uses RS256 JWTs signed with Firebase asymmetric private keys, direct PostgREST calls with a Firebase Bearer token require translation. Two security models are supported:

```
[Option A: Sync Broker (Recommended for Sync writes)]
Client (Firebase ID Token) ──► Supabase Edge Function (sync-session) ──► Postgres (Service Role)
                                     │ (Verifies Firebase Token via JWKS)
                                     ▼
                               Extracts firebase_uid & performs batch upsert

[Option B: Custom JWT Token Swap (Recommended for direct REST reads)]
Client (Firebase ID Token) ──► Supabase Edge Function (auth-broker) ──► Client (Supabase JWT)
                                     │ (Verifies & signs Supabase JWT with firebase_uid claim)
                                     ▼
Client (Supabase JWT)      ──► Supabase PostgREST (Direct Query)    ──► Postgres RLS evaluated
```

- **Option A (Sync Broker - Primary):** The sync service invokes the `sync-session` Edge Function, passing the Firebase ID token in the custom `x-firebase-auth` header. The Edge Function verifies the signature using Firebase's public keys (fetched from `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`), extracts the `sub` claim, and performs batch writes with the service role client, ensuring secure verification before writing to Postgres.
- **Option B (Direct REST - RLS):** For direct database reads, a helper Edge Function `/functions/v1/auth-broker` verifies the Firebase ID token and issues a short-lived custom Supabase JWT containing `{ "sub": "<firebase_uid>" }` signed with Supabase's HS256 secret. The client uses this token for subsequent direct PostgREST queries, allowing custom RLS policies to evaluate security via `auth.firebase_uid()`.

### 8.4 General Security Rules
- All user data in local SQLite encrypted with SQLCipher (AES-256).
- No exercise video files or camera frames ever leave the device or are uploaded to the cloud.
- HTTPS/TLS 1.3 only; no HTTP fallback allowed.

---

## 9. Testing Strategy

### 9.1 Unit Tests (Jest + ts-jest)

- Heuristic engine rules (100% coverage required)
- Form score evaluators (mock landmark data)
- Sync protocol logic (mock WatermelonDB)
- 1RM calculation (Epley formula)

### 9.2 Integration Tests (Detox)

- Onboarding flow (happy path + skip)
- Complete a workout session (start → sets → RPE → end)
- Offline mode: complete session, go online, verify sync

### 9.3 Performance Tests

- Frame rate profiler on camera overlay (Flipper)
- Memory leak detection during 30-min simulated session
- DB read/write benchmarks under 1000+ set records

---

## 10. Development Environment Setup

```bash
# Prerequisites
node >= 20.x
yarn >= 4.x
expo-cli >= latest
eas-cli >= latest

# Clone + install
git clone https://github.com/probanjee/heuristic-ai.git
cd heuristic-ai
yarn install

# Environment
cp .env.example .env.local
# Fill: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

# Run on simulator
yarn expo start

# Run tests
yarn test              # unit
yarn test:e2e          # detox (requires device/emulator)

# Build for production
eas build --platform all --profile production
```

### 10.1 Folder Structure

```
heuristic-ai/
├── app/                        # Expo Router screens
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── goals.tsx
│   │   └── baseline.tsx
│   ├── (tabs)/
│   │   ├── workout/
│   │   │   ├── index.tsx       # Active workout
│   │   │   └── summary.tsx
│   │   ├── library/
│   │   │   ├── index.tsx       # Exercise list
│   │   │   └── [slug].tsx      # Exercise detail
│   │   ├── progress/
│   │   │   └── index.tsx
│   │   └── profile/
│   │       └── index.tsx
│   └── _layout.tsx
├── components/
│   ├── workout/
│   │   ├── SetCard.tsx
│   │   ├── RPESlider.tsx
│   │   ├── HeuristicBanner.tsx
│   │   ├── RestTimer.tsx
│   │   └── CameraOverlay.tsx
│   ├── library/
│   │   ├── ExerciseCard.tsx
│   │   └── DemoPlayer.tsx
│   ├── progress/
│   │   ├── VolumeChart.tsx
│   │   └── RPETrendChart.tsx
│   └── ui/                     # Base design system
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Typography.tsx
├── heuristic-engine/
│   ├── evaluator.ts
│   ├── rules.ts
│   ├── types.ts
│   └── __tests__/
│       └── rules.test.ts
├── services/
│   ├── pose-detection.ts
│   ├── form-rules/
│   │   ├── squat.ts
│   │   ├── pushup.ts
│   │   ├── deadlift.ts
│   │   ├── lunge.ts
│   │   └── plank.ts
│   ├── sync.ts
│   └── audio-cues.ts
├── db/
│   ├── schema.ts
│   ├── models/
│   └── migrations/
├── store/
│   ├── workout.store.ts
│   ├── user.store.ts
│   └── sync.store.ts
├── constants/
│   ├── exercises.ts            # Seed data: 25 exercises
│   ├── heuristic-config.ts     # Tunable thresholds
│   └── theme.ts
├── assets/
│   ├── models/
│   │   └── pose_landmarker_lite.task
│   └── videos/                 # Bundled exercise demos
└── supabase/
    ├── migrations/
    ├── functions/
    │   ├── sync-session/
    │   └── generate-summary/
    └── seed.sql
```
