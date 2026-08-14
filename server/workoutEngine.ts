import type { UserProfile } from "../drizzle/schema";

export type WorkoutReasonCode =
  | "GOAL_ALIGNMENT"
  | "EQUIPMENT_CONSTRAINT"
  | "TIME_CONSTRAINT"
  | "RECOVERY_ADJUSTMENT"
  | "PROGRESSIVE_OVERLOAD";

export type TutorialMedia = {
  src: string;
  sourceUrl: string;
  attribution: string;
  license: string;
};

export type CatalogExercise = {
  slug: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  movementPattern: string;
  instructions: string;
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  mode: "reps" | "timed";
  targetSeconds?: number;
  tutorialSteps: string[];
  tutorialMedia?: TutorialMedia;
};

export type GeneratedWorkoutExercise = CatalogExercise & {
  position: number;
  sets: number;
  reps: string;
  restSeconds: number;
};

export type GeneratedWorkout = {
  status: "ready" | "profile_needed";
  title: string | null;
  goal: string | null;
  durationMinutes: number | null;
  reasonCodes: WorkoutReasonCode[];
  exercises: GeneratedWorkoutExercise[];
};

export const VERIFIED_EXERCISES: CatalogExercise[] = [
  {
    slug: "bodyweight-squat",
    name: "Bodyweight Squat",
    primaryMuscle: "quads",
    equipment: "bodyweight",
    difficulty: "beginner",
    movementPattern: "squat",
    instructions:
      "Sit the hips back, keep the chest tall, and drive through the whole foot.",
    defaultSets: 3,
    defaultReps: "10-15",
    restSeconds: 60,
    mode: "reps",
    tutorialSteps: [
      "Stand tall with feet just outside hip width.",
      "Sit your hips back and bend both knees.",
      "Drive through the whole foot to stand.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/squats_0c27dda3.gif",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Squats-4-1.gif",
      attribution: "Everkinetic · Wikimedia Commons",
      license: "CC BY-SA 3.0",
    },
  },
  {
    slug: "push-up",
    name: "Push-up",
    primaryMuscle: "chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    movementPattern: "horizontal_push",
    instructions:
      "Brace the trunk, lower with control, and press the floor away.",
    defaultSets: 3,
    defaultReps: "6-12",
    restSeconds: 60,
    mode: "reps",
    tutorialSteps: [
      "Set your hands below your shoulders.",
      "Lower your chest while keeping one straight line from head to heel.",
      "Press the floor away without flaring your elbows.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/pushups_1aaeb7ee.gif",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Pushups.gif",
      attribution: "Wensceslao · Wikimedia Commons",
      license: "CC BY-SA 4.0",
    },
  },
  {
    slug: "reverse-lunge",
    name: "Reverse Lunge",
    primaryMuscle: "glutes",
    equipment: "bodyweight",
    difficulty: "beginner",
    movementPattern: "lunge",
    instructions:
      "Step back softly, keep the front knee tracking over the foot, and stand tall.",
    defaultSets: 3,
    defaultReps: "8/side",
    restSeconds: 60,
    mode: "reps",
    tutorialSteps: [
      "Step one foot back softly.",
      "Lower until both knees are comfortably bent.",
      "Push through the front foot and return to standing.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/reverse-lunge_944df161.gif",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Lunge-CDC_strength_training_for_older_adults.gif",
      attribution:
        "Centers for Disease Control and Prevention · Wikimedia Commons",
      license: "Public domain",
    },
  },
  {
    slug: "dumbbell-row",
    name: "Dumbbell Row",
    primaryMuscle: "back",
    equipment: "dumbbells",
    difficulty: "beginner",
    movementPattern: "horizontal_pull",
    instructions:
      "Hinge with a neutral spine and pull the elbow toward the ribs.",
    defaultSets: 3,
    defaultReps: "8-12/side",
    restSeconds: 75,
    mode: "reps",
    tutorialSteps: [
      "Hinge with a neutral spine.",
      "Pull the elbow toward your ribs.",
      "Lower the weight slowly and repeat on the other side.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/upward-row_e2e2fa37.gif",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Upward_row-CDC_strength_training_for_older_adults.gif",
      attribution:
        "Centers for Disease Control and Prevention · Wikimedia Commons",
      license: "Public domain",
    },
  },
  {
    slug: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    primaryMuscle: "shoulders",
    equipment: "dumbbells",
    difficulty: "beginner",
    movementPattern: "vertical_push",
    instructions:
      "Press overhead without shrugging and lower the weights under control.",
    defaultSets: 3,
    defaultReps: "8-12",
    restSeconds: 75,
    mode: "reps",
    tutorialSteps: [
      "Start with the weights at shoulder height.",
      "Press overhead without shrugging.",
      "Lower under control until the elbows are just below the shoulders.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/overhead-press_646ec757.gif",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Overhead_press-CDC_strength_training_for_older_adults.gif",
      attribution:
        "Centers for Disease Control and Prevention · Wikimedia Commons",
      license: "Public domain",
    },
  },
  {
    slug: "dumbbell-deadlift",
    name: "Dumbbell Romanian Deadlift",
    primaryMuscle: "hamstrings",
    equipment: "dumbbells",
    difficulty: "intermediate",
    movementPattern: "hinge",
    instructions:
      "Push the hips back, keep the weights close, and stand by driving the hips forward.",
    defaultSets: 3,
    defaultReps: "8-12",
    restSeconds: 90,
    mode: "reps",
    tutorialSteps: [
      "Push the hips back with a soft bend in the knees.",
      "Keep the weights close to your legs.",
      "Stand by driving the hips forward, not by leaning back.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/deadlift_67146115.gif",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif",
      attribution: "Videoplasty.com · Wikimedia Commons",
      license: "CC BY-SA 4.0",
    },
  },
  {
    slug: "plank",
    name: "Forearm Plank",
    primaryMuscle: "core",
    equipment: "bodyweight",
    difficulty: "beginner",
    movementPattern: "carry",
    instructions:
      "Brace as if preparing for contact and keep the ribs stacked over the pelvis.",
    defaultSets: 3,
    defaultReps: "30-45 sec",
    restSeconds: 45,
    mode: "timed",
    targetSeconds: 30,
    tutorialSteps: [
      "Place elbows under the shoulders.",
      "Brace the trunk and squeeze the glutes.",
      "Keep the ribs stacked over the pelvis while breathing steadily.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/plank-gymvisual_f5f1daae.gif",
      sourceUrl:
        "https://github.com/hasaneyldrm/exercises-dataset/blob/main/data/exercises.json",
      attribution: "GymVisual · used with attribution and usage notice",
      license:
        "Third-party media © GymVisual; dataset record 2135-VBAWRPG; source terms apply",
    },
  },
  {
    slug: "band-row",
    name: "Resistance Band Row",
    primaryMuscle: "back",
    equipment: "resistance_band",
    difficulty: "beginner",
    movementPattern: "horizontal_pull",
    instructions:
      "Anchor the band securely, pull the handles toward the ribs, and pause briefly.",
    defaultSets: 3,
    defaultReps: "10-15",
    restSeconds: 60,
    mode: "reps",
    tutorialSteps: [
      "Anchor the band securely at chest height.",
      "Pull the handles toward your ribs.",
      "Pause briefly, then return with control.",
    ],
    tutorialMedia: {
      src: "/fitness-storage/band-row_88fc93a7.gif",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Bent_over_rows_with_resistance_bands_01.gif",
      attribution: "GyorgyGajdos · Wikimedia Commons",
      license: "CC BY-SA 4.0",
    },
  },
];

function parseList(value: string | null | undefined) {
  if (!value) return new Set<string>();
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed))
      return new Set(parsed.map(String).map(item => item.toLowerCase()));
  } catch {
    return new Set(
      value
        .split(",")
        .map(item => item.trim().toLowerCase())
        .filter(Boolean)
    );
  }
  return new Set<string>();
}

function hasCompleteProfile(profile: UserProfile | null | undefined) {
  return Boolean(
    profile?.primaryGoal &&
      profile.workoutDurationMinutes &&
      profile.fitnessLevel
  );
}

export function generateDailyWorkout(
  profile: UserProfile | null | undefined
): GeneratedWorkout {
  if (
    !profile ||
    !hasCompleteProfile(profile) ||
    !profile.primaryGoal ||
    !profile.workoutDurationMinutes ||
    !profile.fitnessLevel
  ) {
    return {
      status: "profile_needed",
      title: null,
      goal: null,
      durationMinutes: null,
      reasonCodes: [],
      exercises: [],
    };
  }

  const equipment = parseList(profile.equipment);
  const exclusions = parseList(profile.exerciseExclusions);
  const experience = profile.fitnessLevel.toLowerCase();
  const goal = profile.primaryGoal.toLowerCase();
  const scheduleDays = profile.workoutDaysPerWeek ?? 3;
  const available = VERIFIED_EXERCISES.filter(
    exercise =>
      (exercise.equipment === "bodyweight" ||
        equipment.has(exercise.equipment)) &&
      !exclusions.has(exercise.slug) &&
      !exclusions.has(exercise.name.toLowerCase()) &&
      (experience !== "beginner" || exercise.difficulty !== "advanced")
  );
  const duration = profile.workoutDurationMinutes ?? 30;
  const recoveryLimited =
    (profile.fatigueLevel ?? 1) >= 4 || profile.recoveryFeeling === "poor";
  const scheduleLimited = scheduleDays >= 5;
  const exerciseCount = Math.max(
    3,
    Math.min(scheduleLimited ? 4 : 6, Math.floor(duration / 10))
  );
  const goalPatterns = goal.includes("strength")
    ? new Set(["squat", "hinge", "horizontal_push", "horizontal_pull"])
    : goal.includes("mobility")
      ? new Set(["lunge", "carry", "hinge"])
      : new Set([
          "squat",
          "lunge",
          "horizontal_push",
          "horizontal_pull",
          "hinge",
        ]);
  const prioritized = [...available].sort((left, right) => {
    const rightScore =
      Number(right.equipment !== "bodyweight") +
      Number(goalPatterns.has(right.movementPattern));
    const leftScore =
      Number(left.equipment !== "bodyweight") +
      Number(goalPatterns.has(left.movementPattern));
    return rightScore - leftScore;
  });
  const selected = prioritized.slice(0, exerciseCount);
  const reasons: WorkoutReasonCode[] = ["GOAL_ALIGNMENT"];
  if (selected.some(exercise => exercise.equipment !== "bodyweight"))
    reasons.push("EQUIPMENT_CONSTRAINT");
  if (duration <= 30) reasons.push("TIME_CONSTRAINT");
  if (recoveryLimited) reasons.push("RECOVERY_ADJUSTMENT");
  reasons.push("PROGRESSIVE_OVERLOAD");

  return {
    status: "ready",
    title: recoveryLimited
      ? "Recovery-aware foundation session"
      : `${profile.primaryGoal.replace(/_/g, " ")} foundation session`,
    goal: profile.primaryGoal,
    durationMinutes: duration,
    reasonCodes: reasons,
    exercises: selected.map((exercise, index) => ({
      ...exercise,
      position: index + 1,
      sets: recoveryLimited
        ? Math.max(2, exercise.defaultSets - 1)
        : exercise.defaultSets,
      reps: exercise.defaultReps,
      restSeconds: recoveryLimited
        ? exercise.restSeconds + 15
        : exercise.restSeconds,
    })),
  };
}
