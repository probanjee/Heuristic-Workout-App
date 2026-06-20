-- Seed the primary 25 exercises with realistic metadata matching the local WatermelonDB seed.

INSERT INTO public.exercises (slug, name, muscle_group, difficulty, equipment, video_url) VALUES
('squat', 'Barbell Back Squat', 'legs', 'advanced', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/squat.mp4'),
('pushup', 'Push-up', 'chest', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/pushup.mp4'),
('deadlift', 'Conventional Deadlift', 'back', 'advanced', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/deadlift.mp4'),
('lunge', 'Walking Lunge', 'quads', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/lunge.mp4'),
('plank', 'Forearm Plank', 'core', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/plank.mp4'),
('bench-press', 'Barbell Bench Press', 'chest', 'intermediate', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/bench-press.mp4'),
('row', 'Barbell Bent-Over Row', 'back', 'intermediate', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/row.mp4'),
('shoulder-press', 'Barbell Overhead Press', 'shoulders', 'intermediate', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/shoulder-press.mp4'),
('pullup', 'Pull-up', 'back', 'intermediate', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/pullup.mp4'),
('romanian-deadlift', 'Romanian Deadlift', 'hamstrings', 'intermediate', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/romanian-deadlift.mp4'),
('goblet-squat', 'Goblet Squat', 'legs', 'beginner', 'dumbbells', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/goblet-squat.mp4'),
('dumbbell-curl', 'Dumbbell Biceps Curl', 'arms', 'beginner', 'dumbbells', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/dumbbell-curl.mp4'),
('triceps-pushdown', 'Cable Tricep Pushdown', 'arms', 'beginner', 'cable', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/triceps-pushdown.mp4'),
('lat-pulldown', 'Cable Lat Pulldown', 'back', 'beginner', 'cable', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/lat-pulldown.mp4'),
('leg-press', 'Leg Press', 'legs', 'beginner', 'full_gym', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/leg-press.mp4'),
('calf-raise', 'Standing Calf Raise', 'calves', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/calf-raise.mp4'),
('hip-thrust', 'Hip Thrust', 'glutes', 'intermediate', 'barbell', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/hip-thrust.mp4'),
('face-pull', 'Band Face Pull', 'shoulders', 'beginner', 'bands', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/face-pull.mp4'),
('lateral-raise', 'Dumbbell Lateral Raise', 'shoulders', 'beginner', 'dumbbells', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/lateral-raise.mp4'),
('chest-fly', 'Dumbbell Fly', 'chest', 'beginner', 'dumbbells', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/chest-fly.mp4'),
('cable-row', 'Seated Cable Row', 'back', 'beginner', 'cable', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/cable-row.mp4'),
('mountain-climber', 'Mountain Climber', 'core', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/mountain-climber.mp4'),
('burpee', 'Burpee', 'core', 'intermediate', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/burpee.mp4'),
('glute-bridge', 'Glute Bridge', 'glutes', 'beginner', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/glute-bridge.mp4'),
('hollow-hold', 'Hollow Hold', 'core', 'intermediate', 'bodyweight', 'https://tfuvcbukelgpfabbibfi.supabase.co/storage/v1/object/public/exercise-videos/hollow-hold.mp4')
ON CONFLICT (slug) DO NOTHING;
