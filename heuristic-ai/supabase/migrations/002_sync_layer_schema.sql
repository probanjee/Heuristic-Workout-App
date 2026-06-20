-- Database Migration: 002_sync_layer_schema.sql
-- Description: Drop legacy tables and set up new schema with Firebase UID mapping and custom RLS policies.

-- Drop legacy tables if they exist
DROP TABLE IF EXISTS public.sets CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.heuristic_profiles CASCADE;

-- Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create public.sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  avg_rpe NUMERIC(3,1),
  volume NUMERIC(8,2),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create public.workout_sets table
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  rpe NUMERIC(3,1),
  created_at TIMESTAMPTZ NOT NULL
);

-- Create public.heuristic_metrics table
CREATE TABLE IF NOT EXISTS public.heuristic_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT NOT NULL,
  fatigue_score NUMERIC(3,1),
  recovery_score NUMERIC(3,1),
  readiness_score NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create public.sync_log table
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper to extract Firebase UID from JWT claims (sub claim)
CREATE OR REPLACE FUNCTION auth.firebase_uid() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heuristic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "users_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_own_sessions" ON public.sessions;
DROP POLICY IF EXISTS "users_own_workout_sets" ON public.workout_sets;
DROP POLICY IF EXISTS "users_own_heuristic_metrics" ON public.heuristic_metrics;
DROP POLICY IF EXISTS "users_own_sync_log" ON public.sync_log;

-- Recreate RLS Policies
CREATE POLICY "users_own_profiles" ON public.profiles 
  FOR ALL USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users_own_sessions" ON public.sessions 
  FOR ALL USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users_own_workout_sets" ON public.workout_sets 
  FOR ALL USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users_own_heuristic_metrics" ON public.heuristic_metrics 
  FOR ALL USING (auth.firebase_uid() = firebase_uid);

CREATE POLICY "users_own_sync_log" ON public.sync_log 
  FOR ALL USING (auth.firebase_uid() = firebase_uid OR firebase_uid IS NULL);
