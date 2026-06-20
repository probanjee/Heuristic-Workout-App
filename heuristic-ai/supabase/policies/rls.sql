-- Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heuristic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "users own their sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Sets policies
CREATE POLICY "users own their sets" ON public.sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sets" ON public.sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own sets" ON public.sets
  FOR UPDATE USING (auth.uid() = user_id);

-- Heuristic profiles policies
CREATE POLICY "users own their profiles" ON public.heuristic_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own profiles" ON public.heuristic_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own profiles" ON public.heuristic_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Exercises policies (Public read-only)
CREATE POLICY "anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);
