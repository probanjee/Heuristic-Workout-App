/**
 * HeuristicAI — Exercise Seed Data (25 exercises)
 * Source of truth: IMPLEMENTATION_PLAN.md § Week 3
 * Covers all 6 muscle groups, 4 difficulty levels, all equipment types
 */

import type { ExerciseData } from '../heuristic-engine/types';

export const EXERCISES: ExerciseData[] = [

  // ─── CHEST ─────────────────────────────────────────────────────────────────

  {
    slug: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders', 'arms'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/barbell-bench-press.mp4',
    formChecklist: [
      'Retract scapula and set shoulder blades firmly on bench',
      'Grip should be slightly wider than shoulder width',
      'Bar touches lower chest at 75° elbow angle',
      'Feet flat on floor, arch maintained throughout',
    ],
    audioCues: [
      'Brace your core',
      'Drive your feet into the floor',
      'Bar to your chest, then press',
    ],
    poseModel: 'pushup',
  },

  {
    slug: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/dumbbell-fly.mp4',
    formChecklist: [
      'Slight bend in elbows throughout movement',
      'Lower until stretch in chest, not shoulder pain',
      'Squeeze pecs at the top',
    ],
    audioCues: ['Open your chest', 'Slight bend in the elbow', 'Squeeze at the top'],
    poseModel: null,
  },

  {
    slug: 'push-up',
    name: 'Push-up',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders', 'arms', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/push-up.mp4',
    formChecklist: [
      'Body in a straight plank line',
      'Elbows at 45° from torso',
      'Full range of motion — chest to floor',
    ],
    audioCues: ['Straight line from head to heels', 'Elbows in', 'Full range'],
    poseModel: 'pushup',
  },

  // ─── BACK ──────────────────────────────────────────────────────────────────

  {
    slug: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    musclePrimary: 'back',
    muscleSecondary: ['arms', 'core'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/barbell-row.mp4',
    formChecklist: [
      'Hinge at hips until torso is 45–70° angle',
      'Pull bar to lower chest, lead with elbows',
      'Neutral spine throughout — no rounding',
    ],
    audioCues: ['Hinge at hips', 'Pull to your belly', 'Keep your back flat'],
    poseModel: null,
  },

  {
    slug: 'pull-up',
    name: 'Pull-up',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/pull-up.mp4',
    formChecklist: [
      'Start from dead hang with shoulders packed',
      'Pull chest to bar, not chin',
      'Control the descent — 3 second negative',
    ],
    audioCues: ['Pack your shoulders', 'Chest to bar', 'Slow on the way down'],
    poseModel: null,
  },

  {
    slug: 'cable-lat-pulldown',
    name: 'Cable Lat Pulldown',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/lat-pulldown.mp4',
    formChecklist: [
      'Lean back 15–20° with chest tall',
      'Pull bar to upper chest leading with elbows',
      'Full stretch at the top — lat elongation',
    ],
    audioCues: ['Chest tall', 'Elbows down', 'Stretch at the top'],
    poseModel: null,
  },

  {
    slug: 'dumbbell-single-arm-row',
    name: 'Single-Arm Dumbbell Row',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/single-arm-row.mp4',
    formChecklist: [
      'Brace on bench with opposite hand and knee',
      'Pull elbow straight back toward hip',
      'Full ROM — full stretch at bottom',
    ],
    audioCues: ['Elbow to hip', 'Control down', 'Full stretch'],
    poseModel: null,
  },

  // ─── LEGS ──────────────────────────────────────────────────────────────────

  {
    slug: 'barbell-squat',
    name: 'Barbell Back Squat',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes', 'core'],
    equipment: 'barbell',
    difficulty: 'advanced',
    videoUrl: 'https://assets.heuristicai.app/exercises/barbell-squat.mp4',
    formChecklist: [
      'Bar position: high bar on traps, low bar below spine of scapula',
      'Hip crease below parallel at the bottom',
      'Knees track over toes — no valgus',
      'Brace core like a tree trunk throughout',
    ],
    audioCues: ['Big breath, brace', 'Sit between your heels', 'Drive your knees out', 'Stand tall'],
    poseModel: 'squat',
  },

  {
    slug: 'goblet-squat',
    name: 'Goblet Squat',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes', 'core'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/goblet-squat.mp4',
    formChecklist: [
      'Hold dumbbell at chest, elbows pointed down',
      'Descend with chest tall',
      'Knees out over toes',
    ],
    audioCues: ['Chest tall', 'Sit between your heels', 'Knees out'],
    poseModel: 'squat',
  },

  {
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    musclePrimary: 'hamstrings',
    muscleSecondary: ['glutes', 'back'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/romanian-deadlift.mp4',
    formChecklist: [
      'Push hips back, maintain neutral spine',
      'Bar stays close to legs throughout',
      'Feel hamstring stretch at bottom, not lower back',
    ],
    audioCues: ['Push your hips back', 'Bar close to legs', 'Hamstring stretch'],
    poseModel: 'deadlift',
  },

  {
    slug: 'conventional-deadlift',
    name: 'Conventional Deadlift',
    musclePrimary: 'back',
    muscleSecondary: ['hamstrings', 'glutes', 'legs'],
    equipment: 'barbell',
    difficulty: 'advanced',
    videoUrl: 'https://assets.heuristicai.app/exercises/deadlift.mp4',
    formChecklist: [
      'Bar over mid-foot, shoulder-width stance',
      'Neutral spine, lats engaged before pull',
      'Push floor away — hips and shoulders rise together',
      'Lock out glutes, do not hyperextend',
    ],
    audioCues: ['Lats tight', 'Push the floor', 'Stand tall — hips through'],
    poseModel: 'deadlift',
  },

  {
    slug: 'lunge',
    name: 'Walking Lunge',
    musclePrimary: 'quads',
    muscleSecondary: ['glutes', 'hamstrings'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/lunge.mp4',
    formChecklist: [
      'Step far enough so front knee stays behind toes',
      'Back knee approaches floor without touching',
      'Torso upright, core braced',
    ],
    audioCues: ['Big step', 'Knee back', 'Core tight'],
    poseModel: 'lunge',
  },

  // ─── SHOULDERS ─────────────────────────────────────────────────────────────

  {
    slug: 'overhead-press',
    name: 'Barbell Overhead Press',
    musclePrimary: 'shoulders',
    muscleSecondary: ['arms', 'core'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/ohp.mp4',
    formChecklist: [
      'Bar on front deltoids, elbows slightly in front',
      'Press in a vertical path — head moves back to clear bar',
      'Lock out at top, ribcage down throughout',
    ],
    audioCues: ['Ribcage down', 'Press straight up', 'Lock out'],
    poseModel: null,
  },

  {
    slug: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    musclePrimary: 'shoulders',
    muscleSecondary: [],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/lateral-raise.mp4',
    formChecklist: [
      'Lead with elbows, pinkies slightly up',
      'Raise to shoulder height only',
      'Slow 3-second descent for maximum tension',
    ],
    audioCues: ['Elbows lead', 'Shoulder height', 'Slow down'],
    poseModel: null,
  },

  {
    slug: 'band-face-pull',
    name: 'Band Face Pull',
    musclePrimary: 'shoulders',
    muscleSecondary: ['back'],
    equipment: 'bands',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/face-pull.mp4',
    formChecklist: [
      'Pull to face, elbows above shoulder height',
      'External rotation at the end of movement',
      'Control the return',
    ],
    audioCues: ['Elbows high', 'Pull to face', 'Rotate out'],
    poseModel: null,
  },

  // ─── ARMS ──────────────────────────────────────────────────────────────────

  {
    slug: 'barbell-curl',
    name: 'Barbell Curl',
    musclePrimary: 'arms',
    muscleSecondary: [],
    equipment: 'barbell',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/barbell-curl.mp4',
    formChecklist: [
      'Elbows fixed at sides — no swinging',
      'Supinate wrist at top for full contraction',
      '2-second negative for time under tension',
    ],
    audioCues: ['Elbows in', 'Squeeze at top', 'Slow down'],
    poseModel: null,
  },

  {
    slug: 'tricep-dip',
    name: 'Tricep Dip',
    musclePrimary: 'arms',
    muscleSecondary: ['chest', 'shoulders'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/tricep-dip.mp4',
    formChecklist: [
      'Keep torso upright for tricep focus',
      'Lower until arms at 90° — no further',
      'Full extension at top without locking',
    ],
    audioCues: ['Chest tall', '90 degrees', 'Press tall'],
    poseModel: null,
  },

  {
    slug: 'cable-tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    musclePrimary: 'arms',
    muscleSecondary: [],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/tricep-pushdown.mp4',
    formChecklist: [
      'Elbows fixed at sides throughout',
      'Full extension at bottom — squeeze triceps',
      'Control return to 90° at top',
    ],
    audioCues: ['Elbows tight', 'Full extension', 'Control up'],
    poseModel: null,
  },

  // ─── CORE ──────────────────────────────────────────────────────────────────

  {
    slug: 'plank',
    name: 'Plank',
    musclePrimary: 'core',
    muscleSecondary: ['shoulders', 'glutes'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/plank.mp4',
    formChecklist: [
      'Neutral spine — no sagging or piking',
      'Squeeze glutes and engage core throughout',
      'Head neutral — eyes to floor',
    ],
    audioCues: ['Squeeze your glutes', 'Core tight', 'Breathe'],
    poseModel: 'plank',
  },

  {
    slug: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    musclePrimary: 'core',
    muscleSecondary: ['shoulders', 'back'],
    equipment: 'bodyweight',
    difficulty: 'advanced',
    videoUrl: 'https://assets.heuristicai.app/exercises/ab-wheel.mp4',
    formChecklist: [
      'Start from knees, brace core hard',
      'Roll out until hips about to break',
      'Pull back with lats, not just arms',
    ],
    audioCues: ['Brace hard', 'Controlled', 'Pull with your lats'],
    poseModel: null,
  },

  {
    slug: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    musclePrimary: 'core',
    muscleSecondary: ['arms'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/hanging-leg-raise.mp4',
    formChecklist: [
      'Posterior pelvic tilt at the top of movement',
      'No swinging — controlled throughout',
      'Slow 2-second descent',
    ],
    audioCues: ['No swinging', 'Tuck pelvis', 'Slow down'],
    poseModel: null,
  },

  // ─── GLUTES / POSTERIOR CHAIN ─────────────────────────────────────────────

  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    musclePrimary: 'glutes',
    muscleSecondary: ['hamstrings'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: 'https://assets.heuristicai.app/exercises/hip-thrust.mp4',
    formChecklist: [
      'Shoulder blades on bench, bar on hip crease',
      'Drive hips to full extension — tuck pelvis at top',
      'Chin tucked throughout — no neck extension',
    ],
    audioCues: ['Drive through heels', 'Tuck pelvis at top', 'Squeeze'],
    poseModel: null,
  },

  {
    slug: 'cable-kickback',
    name: 'Cable Glute Kickback',
    musclePrimary: 'glutes',
    muscleSecondary: ['hamstrings'],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/cable-kickback.mp4',
    formChecklist: [
      'Hinge at hip, kick back and up at 45°',
      'Squeeze glute at full extension',
      'Control the return — 2 seconds',
    ],
    audioCues: ['Kick at 45 degrees', 'Squeeze', 'Control back'],
    poseModel: null,
  },

  // ─── CALVES ────────────────────────────────────────────────────────────────

  {
    slug: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    musclePrimary: 'calves',
    muscleSecondary: [],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/calf-raise.mp4',
    formChecklist: [
      'Rise on balls of feet, full plantar flexion',
      '2-second hold at top',
      'Full stretch at bottom — heels below platform if possible',
    ],
    audioCues: ['Rise high', 'Hold at top', 'Full stretch down'],
    poseModel: null,
  },

  {
    slug: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    musclePrimary: 'calves',
    muscleSecondary: [],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: 'https://assets.heuristicai.app/exercises/seated-calf-raise.mp4',
    formChecklist: [
      'Pad on distal thigh, not knee',
      'Full range — stretch to peak contraction',
      '3-second negative for soleus tension',
    ],
    audioCues: ['Full range', 'Slow down', 'Squeeze at top'],
    poseModel: null,
  },

];

// ─── EXERCISE LOOKUP ──────────────────────────────────────────────────────────

export const exerciseBySlug = new Map<string, ExerciseData>(
  EXERCISES.map((e) => [e.slug, e]),
);

export function getExercise(slug: string): ExerciseData | undefined {
  return exerciseBySlug.get(slug);
}

export function getExercisesByMuscle(muscle: string): ExerciseData[] {
  return EXERCISES.filter(
    (e) => e.musclePrimary === muscle || e.muscleSecondary.includes(muscle as ExerciseData['musclePrimary']),
  );
}

export function getExercisesByEquipment(equipment: string[]): ExerciseData[] {
  return EXERCISES.filter((e) => equipment.includes(e.equipment) || e.equipment === 'bodyweight');
}
