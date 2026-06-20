-- Mirror of local schema with sync metadata
-- Row Level Security enforced: users can only read/write their own data

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  total_volume_kg NUMERIC(8,2),
  avg_rpe NUMERIC(3,1),
  heuristic_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, local_id)
);

CREATE TABLE public.sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  UNIQUE(user_id, local_id)
);

CREATE TABLE public.heuristic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_slug TEXT NOT NULL,
  estimated_1rm_kg NUMERIC(6,2),
  avg_rpe_last_5 NUMERIC(3,1),
  consecutive_high_rpe INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_slug)
);

CREATE TABLE public.exercises (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  equipment TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
