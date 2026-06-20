/**
 * HeuristicAI — Audio Cues Service (TTS)
 * Uses expo-speech to deliver form coaching cues during exercises
 */

import * as Speech from 'expo-speech';

interface CueOptions {
  rate?: number; // 0.1–1.0, default 0.85 (slightly slower for clarity)
  pitch?: number; // 0.5–2.0, default 1.0
  delayBetweenMs?: number; // gap between multiple cues
}

const DEFAULT_OPTIONS: CueOptions = {
  rate: 0.85,
  pitch: 1.0,
  delayBetweenMs: 2500,
};

// ─── SINGLE CUE ───────────────────────────────────────────────────────────────

export async function speakCue(text: string, options: CueOptions = {}): Promise<void> {
  const { rate, pitch } = { ...DEFAULT_OPTIONS, ...options };

  // Stop any currently speaking cue
  await Speech.stop();

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      rate,
      pitch,
      onDone: resolve,
      onError: (error) => {
        console.warn('[AudioCues] Speech error:', error);
        resolve(); // Don't reject — cue failure shouldn't crash workout
      },
    });
  });
}

// ─── CUE QUEUE ────────────────────────────────────────────────────────────────
// Plays multiple cues in sequence with a gap between them

export async function speakCueSequence(
  cues: string[],
  options: CueOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  for (let i = 0; i < cues.length; i++) {
    await speakCue(cues[i], opts);
    if (i < cues.length - 1) {
      await delay(opts.delayBetweenMs ?? 2500);
    }
  }
}

// ─── STOP ────────────────────────────────────────────────────────────────────

export async function stopAllCues(): Promise<void> {
  await Speech.stop();
}

// ─── IS SPEAKING ─────────────────────────────────────────────────────────────

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

// ─── PREDEFINED CUES ──────────────────────────────────────────────────────────

export const FormCues = {
  squat: {
    kneeValgus: 'Push your knees out',
    depth: 'Go deeper — hips below knees',
    torsoLean: 'Brace your core, stay upright',
    goodForm: 'Good depth, excellent form',
  },
  pushup: {
    elbowFlare: 'Keep elbows at 45 degrees',
    hipDrop: 'Keep your core tight',
    pike: 'Lower your hips',
    goodForm: 'Great push-up form',
  },
  deadlift: {
    lumbarRound: 'Brace your lower back',
    barDrift: 'Keep the bar close to your body',
    goodForm: 'Strong position',
  },
  lunge: {
    kneePastToe: 'Keep your front knee behind your toes',
    goodForm: 'Great lunge depth',
  },
  plank: {
    hipDrop: 'Squeeze your glutes, lift your hips',
    neckCrane: 'Keep your head neutral',
    goodForm: 'Strong plank position',
  },
} as const;

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
