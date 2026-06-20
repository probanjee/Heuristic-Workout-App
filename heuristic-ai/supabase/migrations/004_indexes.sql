-- Database Migration: 004_indexes.sql
-- Description: Create indexes on firebase_uid, session_id, and timestamp columns to optimize queries.

-- Sessions Table Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_firebase_uid ON public.sessions(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON public.sessions(completed_at);

-- Workout Sets Table Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON public.workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_firebase_uid ON public.workout_sets(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id ON public.workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_created_at ON public.workout_sets(created_at);

-- Heuristic Metrics Table Indexes
CREATE INDEX IF NOT EXISTS idx_heuristic_metrics_firebase_uid ON public.heuristic_metrics(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_heuristic_metrics_created_at ON public.heuristic_metrics(created_at);

-- Sync Log Table Indexes
CREATE INDEX IF NOT EXISTS idx_sync_log_firebase_uid ON public.sync_log(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON public.sync_log(created_at);
