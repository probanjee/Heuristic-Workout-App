/**
 * File: database/seed/exercises.seed.ts
 * Purpose: Exercise seed data and database seeding logic for HeuristicAI
 * Dependencies: @nozbe/watermelondb, process
 */

import { Database } from '@nozbe/watermelondb';
import type { MuscleGroup, EquipmentType, ExerciseDifficulty } from '../../heuristic-engine/types';

interface SeedExercise {
  slug: string;
  name: string;
  musclePrimary: MuscleGroup;
  muscleSecondary: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: ExerciseDifficulty;
  videoUrl: string;
  videoCached: boolean;
  formChecklist: string[];
  audioCues: string[];
  poseModel: string | null;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tfuvcbukelgpfabbibfi.supabase.co';

export const SEED_EXERCISES: SeedExercise[] = [
  {
    slug: 'squat',
    name: 'Barbell Back Squat',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes', 'core'],
    equipment: 'barbell',
    difficulty: 'advanced',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/squat.mp4`,
    videoCached: false,
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
    slug: 'pushup',
    name: 'Push-up',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders', 'arms', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/pushup.mp4`,
    videoCached: false,
    formChecklist: [
      'Body in a straight plank line',
      'Elbows at 45° from torso',
      'Full range of motion — chest to floor',
    ],
    audioCues: ['Straight line from head to heels', 'Elbows in', 'Full range'],
    poseModel: 'pushup',
  },
  {
    slug: 'deadlift',
    name: 'Conventional Deadlift',
    musclePrimary: 'back',
    muscleSecondary: ['hamstrings', 'glutes', 'legs'],
    equipment: 'barbell',
    difficulty: 'advanced',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/deadlift.mp4`,
    videoCached: false,
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
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/lunge.mp4`,
    videoCached: false,
    formChecklist: [
      'Step far enough so front knee stays behind toes',
      'Back knee approaches floor without touching',
      'Torso upright, core braced',
    ],
    audioCues: ['Big step', 'Knee back', 'Core tight'],
    poseModel: 'lunge',
  },
  {
    slug: 'plank',
    name: 'Forearm Plank',
    musclePrimary: 'core',
    muscleSecondary: ['shoulders', 'glutes'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/plank.mp4`,
    videoCached: false,
    formChecklist: [
      'Neutral spine — no sagging or piking',
      'Squeeze glutes and engage core throughout',
      'Head neutral — eyes to floor',
    ],
    audioCues: ['Squeeze your glutes', 'Core tight', 'Breathe'],
    poseModel: 'plank',
  },
  {
    slug: 'bench-press',
    name: 'Barbell Bench Press',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders', 'arms'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/bench-press.mp4`,
    videoCached: false,
    formChecklist: [
      'Retract scapula and set shoulder blades firmly on bench',
      'Grip should be slightly wider than shoulder width',
      'Bar touches lower chest at 75° elbow angle',
      'Feet flat on floor, arch maintained throughout',
    ],
    audioCues: ['Brace your core', 'Drive your feet into the floor', 'Bar to your chest, then press'],
    poseModel: null,
  },
  {
    slug: 'row',
    name: 'Barbell Bent-Over Row',
    musclePrimary: 'back',
    muscleSecondary: ['arms', 'core'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/row.mp4`,
    videoCached: false,
    formChecklist: [
      'Hinge at hips until torso is 45–70° angle',
      'Pull bar to lower chest, lead with elbows',
      'Neutral spine throughout — no rounding',
    ],
    audioCues: ['Hinge at hips', 'Pull to your belly', 'Keep your back flat'],
    poseModel: null,
  },
  {
    slug: 'shoulder-press',
    name: 'Barbell Overhead Press',
    musclePrimary: 'shoulders',
    muscleSecondary: ['arms', 'core'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/shoulder-press.mp4`,
    videoCached: false,
    formChecklist: [
      'Bar on front deltoids, elbows slightly in front',
      'Press in a vertical path — head moves back to clear bar',
      'Lock out at top, ribcage down throughout',
    ],
    audioCues: ['Ribcage down', 'Press straight up', 'Lock out'],
    poseModel: null,
  },
  {
    slug: 'pullup',
    name: 'Pull-up',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/pullup.mp4`,
    videoCached: false,
    formChecklist: [
      'Start from dead hang with shoulders packed',
      'Pull chest to bar, not chin',
      'Control the descent — 3 second negative',
    ],
    audioCues: ['Pack your shoulders', 'Chest to bar', 'Slow on the way down'],
    poseModel: null,
  },
  {
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    musclePrimary: 'hamstrings',
    muscleSecondary: ['glutes', 'back'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/romanian-deadlift.mp4`,
    videoCached: false,
    formChecklist: [
      'Push hips back, maintain neutral spine',
      'Bar stays close to legs throughout',
      'Feel hamstring stretch at bottom, not lower back',
    ],
    audioCues: ['Push your hips back', 'Bar close to legs', 'Hamstring stretch'],
    poseModel: 'deadlift',
  },
  {
    slug: 'goblet-squat',
    name: 'Goblet Squat',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes', 'core'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/goblet-squat.mp4`,
    videoCached: false,
    formChecklist: [
      'Hold dumbbell at chest, elbows pointed down',
      'Descend with chest tall',
      'Knees out over toes',
    ],
    audioCues: ['Chest tall', 'Sit between your heels', 'Knees out'],
    poseModel: 'squat',
  },
  {
    slug: 'dumbbell-curl',
    name: 'Dumbbell Biceps Curl',
    musclePrimary: 'arms',
    muscleSecondary: [],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/dumbbell-curl.mp4`,
    videoCached: false,
    formChecklist: [
      'Elbows fixed at sides — no swinging',
      'Supinate wrist at top for full contraction',
      '2-second negative for time under tension',
    ],
    audioCues: ['Elbows in', 'Squeeze at top', 'Slow down'],
    poseModel: null,
  },
  {
    slug: 'triceps-pushdown',
    name: 'Cable Tricep Pushdown',
    musclePrimary: 'arms',
    muscleSecondary: [],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/triceps-pushdown.mp4`,
    videoCached: false,
    formChecklist: [
      'Elbows fixed at sides throughout',
      'Full extension at bottom — squeeze triceps',
      'Control return to 90° at top',
    ],
    audioCues: ['Elbows tight', 'Full extension', 'Control up'],
    poseModel: null,
  },
  {
    slug: 'lat-pulldown',
    name: 'Cable Lat Pulldown',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/lat-pulldown.mp4`,
    videoCached: false,
    formChecklist: [
      'Lean back 15–20° with chest tall',
      'Pull bar to upper chest leading with elbows',
      'Full stretch at the top — lat elongation',
    ],
    audioCues: ['Chest tall', 'Elbows down', 'Stretch at the top'],
    poseModel: null,
  },
  {
    slug: 'leg-press',
    name: 'Leg Press',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes', 'hamstrings'],
    equipment: 'full_gym',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/leg-press.mp4`,
    videoCached: false,
    formChecklist: [
      'Place feet shoulder-width on sled',
      'Lower until knees are at 90 degrees',
      'Do not lock knees at lockout',
    ],
    audioCues: ['Control down', 'Push through heels', 'Keep knees soft at top'],
    poseModel: null,
  },
  {
    slug: 'calf-raise',
    name: 'Standing Calf Raise',
    musclePrimary: 'calves',
    muscleSecondary: [],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/calf-raise.mp4`,
    videoCached: false,
    formChecklist: [
      'Rise on balls of feet, full plantar flexion',
      '2-second hold at top',
      'Full stretch at bottom — heels below platform',
    ],
    audioCues: ['Rise high', 'Hold at top', 'Full stretch down'],
    poseModel: null,
  },
  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    musclePrimary: 'glutes',
    muscleSecondary: ['hamstrings'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/hip-thrust.mp4`,
    videoCached: false,
    formChecklist: [
      'Shoulder blades on bench, bar on hip crease',
      'Drive hips to full extension — tuck pelvis at top',
      'Chin tucked throughout — no neck extension',
    ],
    audioCues: ['Drive through heels', 'Tuck pelvis at top', 'Squeeze'],
    poseModel: null,
  },
  {
    slug: 'face-pull',
    name: 'Band Face Pull',
    musclePrimary: 'shoulders',
    muscleSecondary: ['back'],
    equipment: 'bands',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/face-pull.mp4`,
    videoCached: false,
    formChecklist: [
      'Pull to face, elbows above shoulder height',
      'External rotation at the end of movement',
      'Control the return',
    ],
    audioCues: ['Elbows high', 'Pull to face', 'Rotate out'],
    poseModel: null,
  },
  {
    slug: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    musclePrimary: 'shoulders',
    muscleSecondary: [],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/lateral-raise.mp4`,
    videoCached: false,
    formChecklist: [
      'Lead with elbows, pinkies slightly up',
      'Raise to shoulder height only',
      'Slow 3-second descent for maximum tension',
    ],
    audioCues: ['Elbows lead', 'Shoulder height', 'Slow down'],
    poseModel: null,
  },
  {
    slug: 'chest-fly',
    name: 'Dumbbell Fly',
    musclePrimary: 'chest',
    muscleSecondary: ['shoulders'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/chest-fly.mp4`,
    videoCached: false,
    formChecklist: [
      'Slight bend in elbows throughout movement',
      'Lower until stretch in chest, not shoulder pain',
      'Squeeze pecs at the top',
    ],
    audioCues: ['Open your chest', 'Slight bend in the elbow', 'Squeeze at the top'],
    poseModel: null,
  },
  {
    slug: 'cable-row',
    name: 'Seated Cable Row',
    musclePrimary: 'back',
    muscleSecondary: ['arms'],
    equipment: 'cable',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/cable-row.mp4`,
    videoCached: false,
    formChecklist: [
      'Sit tall with knees slightly bent',
      'Pull handle to lower chest leading with elbows',
      'Squeeze shoulder blades together at contraction',
    ],
    audioCues: ['Sit tall', 'Pull with your elbows', 'Squeeze your back'],
    poseModel: null,
  },
  {
    slug: 'mountain-climber',
    name: 'Mountain Climber',
    musclePrimary: 'core',
    muscleSecondary: ['shoulders', 'legs'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/mountain-climber.mp4`,
    videoCached: false,
    formChecklist: [
      'Maintain strong high plank position',
      'Drive knees toward chest sequentially',
      'Keep hips low throughout movement',
    ],
    audioCues: ['Keep hips down', 'Drive knees', 'Fast but stable'],
    poseModel: null,
  },
  {
    slug: 'burpee',
    name: 'Burpee',
    musclePrimary: 'core',
    muscleSecondary: ['chest', 'legs', 'shoulders'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/burpee.mp4`,
    videoCached: false,
    formChecklist: [
      'Drop to plank, touch chest to floor',
      'Push up, snap feet under hips',
      'Jump up with arms extended overhead',
    ],
    audioCues: ['Chest to floor', 'Snap feet in', 'Jump tall'],
    poseModel: null,
  },
  {
    slug: 'glute-bridge',
    name: 'Glute Bridge',
    musclePrimary: 'glutes',
    muscleSecondary: ['hamstrings', 'core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/glute-bridge.mp4`,
    videoCached: false,
    formChecklist: [
      'Lie on back with knees bent, feet flat on floor',
      'Drive hips up by squeezing glutes',
      'Keep core braced — do not hyperextend spine',
    ],
    audioCues: ['Drive through heels', 'Squeeze glutes', 'Keep ribcage down'],
    poseModel: null,
  },
  {
    slug: 'hollow-hold',
    name: 'Hollow Hold',
    musclePrimary: 'core',
    muscleSecondary: [],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    videoUrl: `${supabaseUrl}/storage/v1/object/public/exercise-videos/hollow-hold.mp4`,
    videoCached: false,
    formChecklist: [
      'Press lower back firmly into the floor',
      'Raise feet and shoulder blades off floor',
      'Extend arms overhead, maintain tight hollow shape',
    ],
    audioCues: ['Lower back flat', 'Reach long', 'Point toes'],
    poseModel: null,
  },
];

/**
 * Seeds the database with the core 25 exercise records if the exercises collection is empty.
 *
 * @param database - The WatermelonDB instance to write the seed data to
 * @returns A promise that resolves when the seed check and potential inserts are finished
 */
export async function seedExercises(database: Database): Promise<void> {
  const exercisesCollection = database.get('exercises');
  const count = await exercisesCollection.query().fetchCount();

  if (count > 0) {
    console.log('[HeuristicAI] Exercises already seeded. Count:', count);
    return;
  }

  console.log('[HeuristicAI] Seeding 25 core exercises...');

  await database.write(async () => {
    const prepareCreate = SEED_EXERCISES.map((ex) =>
      exercisesCollection.prepareCreate((record: any) => {
        record.slug = ex.slug;
        record.name = ex.name;
        record.musclePrimary = ex.musclePrimary;
        record._muscleSecondary = JSON.stringify(ex.muscleSecondary);
        record.equipment = ex.equipment;
        record.difficulty = ex.difficulty;
        record.videoUrl = ex.videoUrl;
        record.videoCached = ex.videoCached;
        record._formChecklist = JSON.stringify(ex.formChecklist);
        record._audioCues = JSON.stringify(ex.audioCues);
        record.poseModel = ex.poseModel;
      })
    );

    await database.batch(...prepareCreate);
  });

  console.log('[HeuristicAI] Seeding complete.');
}
