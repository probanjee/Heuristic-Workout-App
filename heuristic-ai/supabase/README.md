# Supabase Backend for HeuristicAI

## Architecture

This backend serves as the cloud synchronization and backup layer for the HeuristicAI mobile application. The primary data source is the local WatermelonDB database on the user's device, ensuring offline-first functionality. Supabase provides PostgreSQL for cloud storage, Auth for user management, and Storage for exercise demo videos.

## Local → Cloud Flow

1. The user logs workouts completely offline, which are saved in the local WatermelonDB SQLite database.
2. A background `sync-engine` detects network connectivity via NetInfo.
3. Upon reconnect or app foreground, un-synced records are batched and uploaded to Supabase using standard REST APIs (PostgREST).
4. Records synced successfully are marked as `synced = true` locally.
5. In case of conflicts, local data generally wins for active sessions, and server data wins for historical cross-device synchronization.

## RLS (Row Level Security) Explanation

Row Level Security (RLS) is enabled on all user-facing tables (`sessions`, `sets`, `heuristic_profiles`). 
This means the API keys exposed to the client application can only ever read and write data that belongs to the currently authenticated user.
The policies are enforced at the database level by checking `auth.uid() = user_id`. Public or anonymous access to user data is completely blocked.

## Auth Flow

- Authentication relies on Supabase Auth (JWT).
- The user signs up or signs in using Email/Password.
- The JWT and refresh token are stored locally using `expo-secure-store` to prevent unauthorized extraction.
- The client-side `lib/supabase.ts` singleton handles refreshing tokens automatically.

## Storage Flow

- Exercise demo videos are stored in the public `exercise-videos` bucket.
- The client app retrieves the public URL using the `getExerciseVideoUrl(slug)` helper and caches the video locally using Expo AV and filesystem utilities.
- Videos are small (<5MB) and looped during exercises.

## Sync Flow

1. `SyncEngine` monitors the network state.
2. When online, `SyncEngine` invokes `SessionSync` and `ProfileSync` to push pending changes.
3. `session-sync.ts` uploads completed sessions and their associated sets.
4. `profile-sync.ts` keeps the heuristic limits up-to-date across devices.
5. Failed uploads due to network issues are placed back into a retry queue with exponential backoff.

## Developer Onboarding

1. Ensure you have the Supabase CLI installed.
2. Link your local project to the Supabase cloud project: `supabase link --project-ref your-project-id`
3. Apply migrations: `supabase db push`
4. Create the `exercise-videos` bucket in the Supabase Dashboard and set it to public.
5. Copy your URL and Anon Key into `.env.local` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
6. Use `app/dev/supabase-test.tsx` in the app to verify your connection and auth setup.
