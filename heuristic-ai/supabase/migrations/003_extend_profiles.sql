-- Database Migration: 003_extend_profiles.sql
-- Description: Extend public.profiles with columns to support bi-directional onboarding sync.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS training_level TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS injuries JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS injury_flags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS units TEXT DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
