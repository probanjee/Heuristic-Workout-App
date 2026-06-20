/**
 * HeuristicAI — Pose Detection Engine
 * Integrates MediaPipe Tasks-Vision on Web and falls back to Pose Simulator on Native.
 * Source of truth: TASK.md § 1, TRD.md § 6
 */

import { Platform } from 'react-native';
import type { PoseLandmark, PoseResult } from './pose-types';

let poseLandmarker: any = null;
let isInitializing = false;
let activeExercise: string = 'squat';

// Standard 33 landmarks default template
const createBaselineLandmarks = (): PoseLandmark[] => {
  const landmarks: PoseLandmark[] = [];
  for (let i = 0; i < 33; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 });
  }
  return landmarks;
};

// Set the active exercise for the simulator
export function setSimulatorExercise(exerciseName: string) {
  const normalized = exerciseName.toLowerCase();
  if (normalized.includes('squat')) {
    activeExercise = 'squat';
  } else if (normalized.includes('pushup') || normalized.includes('push-up')) {
    activeExercise = 'pushup';
  } else if (normalized.includes('deadlift')) {
    activeExercise = 'deadlift';
  } else if (normalized.includes('lunge')) {
    activeExercise = 'lunge';
  } else if (normalized.includes('plank')) {
    activeExercise = 'plank';
  } else {
    activeExercise = 'squat'; // default
  }
}

/**
 * Initializes the Pose Engine.
 * Resolves MediaPipe assets on Web or sets up the Native simulator.
 */
export async function initializePoseEngine(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    // Native fallback: nothing to load, simulator is ready
    console.log('[PoseEngine] Initializing on Native: using Pose Simulator');
    return true;
  }

  if (poseLandmarker) return true;
  if (isInitializing) return false;

  isInitializing = true;
  try {
    const { FilesetResolver, PoseLandmarker } = require('@mediapipe/tasks-vision');
    console.log('[PoseEngine] Initializing MediaPipe FilesetResolver...');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
    );
    
    console.log('[PoseEngine] Creating PoseLandmarker instance...');
    // We try local bundle path first, then fall back to direct CDN link if require resolution fails
    let modelPath = '';
    try {
      modelPath = require('../../assets/models/pose_landmarker_lite.task');
    } catch {
      modelPath = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
    }

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    console.log('[PoseEngine] MediaPipe PoseLandmarker initialized successfully.');
    isInitializing = false;
    return true;
  } catch (error) {
    console.warn('[PoseEngine] GPU Initialization failed, falling back to CPU delegate...', error);
    try {
      const { FilesetResolver, PoseLandmarker } = require('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      console.log('[PoseEngine] PoseLandmarker initialized on CPU successfully.');
      isInitializing = false;
      return true;
    } catch (cpuError) {
      console.error('[PoseEngine] PoseEngine failed to initialize on Web:', cpuError);
      isInitializing = false;
      return false;
    }
  }
}

/**
 * Runs pose detection on the given frame / video element.
 * If on native, returns simulated landmarks simulating rhythmic execution of the active exercise.
 */
export function detectPose(imageSource: any, timestampMs: number = Date.now()): PoseResult | null {
  if (Platform.OS !== 'web') {
    // Simulator Mode
    const landmarks = createBaselineLandmarks();
    const cycle = (timestampMs % 4000) / 4000; // 4 second rep cycle
    const sinValue = Math.sin(cycle * Math.PI * 2); // -1 to +1
    const progress = (sinValue + 1) / 2; // 0 (start/top) to 1 (max depth/bottom)

    // Trigger minor or major errors periodically for visual inspection
    const hasMinorError = (timestampMs % 16000) < 4000;
    const hasMajorError = (timestampMs % 16000) >= 8000 && (timestampMs % 16000) < 12000;

    // Map common landmarks
    // 11,12: shoulders; 13,14: elbows; 15,16: wrists; 23,24: hips; 25,26: knees; 27,28: ankles; 31,32: toes
    if (activeExercise === 'squat') {
      // Squat Simulation (side/front view mix)
      const depthOffset = progress * 0.28; // Hip going down
      const torsoLean = progress * 0.12;  // Shoulder leaning forward

      // Shoulders (11, 12)
      landmarks[11] = { x: 0.45 + torsoLean, y: 0.3 + depthOffset * 0.9, z: 0.1, visibility: 0.95 };
      landmarks[12] = { x: 0.55 + torsoLean, y: 0.3 + depthOffset * 0.9, z: -0.1, visibility: 0.95 };

      // Hips (23, 24)
      landmarks[23] = { x: 0.43, y: 0.55 + depthOffset, z: 0.1, visibility: 0.95 };
      landmarks[24] = { x: 0.57, y: 0.55 + depthOffset, z: -0.1, visibility: 0.95 };

      // Knees (25, 26)
      // If minor error (caving), knees move inward (closer x distance)
      const valgusOffset = hasMinorError && progress > 0.6 ? 0.05 : 0;
      landmarks[25] = { x: 0.42 + valgusOffset, y: 0.72 + depthOffset * 0.3, z: 0.1, visibility: 0.95 };
      landmarks[26] = { x: 0.58 - valgusOffset, y: 0.72 + depthOffset * 0.3, z: -0.1, visibility: 0.95 };

      // Ankles (27, 28)
      landmarks[27] = { x: 0.41, y: 0.9, z: 0.1, visibility: 0.95 };
      landmarks[28] = { x: 0.59, y: 0.9, z: -0.1, visibility: 0.95 };

      // Nose (0)
      landmarks[0] = { x: 0.5 + torsoLean, y: 0.18 + depthOffset * 0.9, z: 0.15, visibility: 0.95 };

      // Back rounding simulation (major error)
      if (hasMajorError && progress > 0.5) {
        // Leaning too far forward (torso lean > 45 deg)
        landmarks[11].x = 0.32; // excessive lean
        landmarks[12].x = 0.42;
        landmarks[0].x = 0.35;
      }
    } else if (activeExercise === 'pushup') {
      // Pushup Simulation (horizontal view)
      // Starting: Shoulder at X=0.3, Hip at X=0.55, Ankle at X=0.85
      const pushupDepth = progress * 0.15; // Body going down

      // Hips drop or pike simulation
      let hipYOffset = 0;
      if (hasMajorError) {
        hipYOffset = -0.12; // Pike hip up
      } else if (hasMinorError) {
        hipYOffset = 0.10;  // Sag hip down
      }

      // Shoulders (11, 12)
      landmarks[11] = { x: 0.3, y: 0.55 + pushupDepth, z: 0.1, visibility: 0.95 };
      landmarks[12] = { x: 0.3, y: 0.55 + pushupDepth, z: -0.1, visibility: 0.95 };

      // Hips (23, 24)
      landmarks[23] = { x: 0.55, y: 0.60 + pushupDepth + hipYOffset, z: 0.15, visibility: 0.95 };
      landmarks[24] = { x: 0.55, y: 0.60 + pushupDepth + hipYOffset, z: -0.15, visibility: 0.95 };

      // Ankles (27, 28)
      landmarks[27] = { x: 0.85, y: 0.65, z: 0.2, visibility: 0.95 };
      landmarks[28] = { x: 0.85, y: 0.65, z: -0.2, visibility: 0.95 };

      // Elbows (13, 14)
      // Elbow flare is minor error: elbows move outward (wider y/z)
      const flare = hasMinorError ? 0.08 : 0.02;
      landmarks[13] = { x: 0.22, y: 0.64 + pushupDepth + flare, z: 0.25, visibility: 0.95 };
      landmarks[14] = { x: 0.22, y: 0.64 + pushupDepth - flare, z: -0.25, visibility: 0.95 };

      // Wrists (15, 16)
      landmarks[15] = { x: 0.3, y: 0.72, z: 0.2, visibility: 0.95 };
      landmarks[16] = { x: 0.3, y: 0.72, z: -0.2, visibility: 0.95 };

      // Nose (0)
      landmarks[0] = { x: 0.22, y: 0.52 + pushupDepth, z: 0.1, visibility: 0.95 };
    } else if (activeExercise === 'deadlift') {
      // Deadlift Simulation (side view)
      // Starting: Standing tall, straight body. Concentric: Hip goes back and down.
      const hipOffset = progress * 0.18; 
      const leanOffset = progress * 0.25;

      // Hips (23, 24)
      landmarks[23] = { x: 0.45 - hipOffset, y: 0.55 + hipOffset * 0.5, z: 0.1, visibility: 0.95 };
      landmarks[24] = { x: 0.45 - hipOffset, y: 0.55 + hipOffset * 0.5, z: -0.1, visibility: 0.95 };

      // Shoulders (11, 12)
      // Rounding error simulation
      const rounding = hasMajorError && progress > 0.4 ? 0.08 : 0;
      landmarks[11] = { x: 0.45 + leanOffset - rounding, y: 0.28 + leanOffset, z: 0.1, visibility: 0.95 };
      landmarks[12] = { x: 0.45 + leanOffset - rounding, y: 0.28 + leanOffset, z: -0.1, visibility: 0.95 };

      // Knees (25, 26)
      // Hip shoot up: knees straighten early while shoulders are down
      const kneeExtension = hasMinorError && progress > 0.4 ? 0.08 : 0;
      landmarks[25] = { x: 0.43 - kneeExtension, y: 0.73 + kneeExtension * 0.3, z: 0.15, visibility: 0.95 };
      landmarks[26] = { x: 0.43 - kneeExtension, y: 0.73 + kneeExtension * 0.3, z: -0.15, visibility: 0.95 };

      // Ankles (27, 28)
      landmarks[27] = { x: 0.44, y: 0.9, z: 0.1, visibility: 0.95 };
      landmarks[28] = { x: 0.44, y: 0.9, z: -0.1, visibility: 0.95 };

      // Wrists (15, 16)
      // Bar path drift: wrists drift forward
      const drift = hasMinorError ? 0.16 : 0.04;
      landmarks[15] = { x: 0.45 + leanOffset + drift, y: 0.55 + leanOffset, z: 0.2, visibility: 0.95 };
      landmarks[16] = { x: 0.45 + leanOffset + drift, y: 0.55 + leanOffset, z: -0.2, visibility: 0.95 };
    } else if (activeExercise === 'lunge') {
      // Lunge Simulation (side view, front leg bending)
      const lungeDepth = progress * 0.22;

      // Front Foot Ankle (27 - left is front)
      landmarks[27] = { x: 0.35, y: 0.9, z: 0.1, visibility: 0.95 };
      landmarks[28] = { x: 0.70, y: 0.88, z: -0.1, visibility: 0.95 };

      // Front Knee (25)
      // Front knee travel past toes (minor error)
      const travel = hasMinorError ? -0.10 : -0.01;
      landmarks[25] = { x: 0.35 + travel, y: 0.76 + lungeDepth * 0.4, z: 0.1, visibility: 0.95 };
      landmarks[26] = { x: 0.62, y: 0.78 + lungeDepth * 0.5, z: -0.1, visibility: 0.95 };

      // Hips (23, 24)
      landmarks[23] = { x: 0.52, y: 0.55 + lungeDepth, z: 0.1, visibility: 0.95 };
      landmarks[24] = { x: 0.52, y: 0.55 + lungeDepth, z: -0.1, visibility: 0.95 };

      // Instability (Major error: shoulders tilted)
      const tilt = hasMajorError ? 0.09 : 0.01;
      landmarks[11] = { x: 0.52, y: 0.28 + lungeDepth - tilt, z: 0.1, visibility: 0.95 };
      landmarks[12] = { x: 0.52, y: 0.28 + lungeDepth + tilt, z: -0.1, visibility: 0.95 };
      landmarks[0] = { x: 0.52, y: 0.18 + lungeDepth, z: 0.15, visibility: 0.95 };
    } else if (activeExercise === 'plank') {
      // Plank Simulation (static hold with minor shakes)
      const shake = Math.sin(timestampMs * 0.02) * 0.005;

      // Hip sag / pike
      let sagY = 0;
      if (hasMajorError) {
        sagY = -0.10; // Hip pike
      } else if (hasMinorError) {
        sagY = 0.09;  // Hip sag
      }

      // Shoulders (11, 12)
      landmarks[11] = { x: 0.3, y: 0.60 + shake, z: 0.1, visibility: 0.95 };
      landmarks[12] = { x: 0.3, y: 0.60 + shake, z: -0.1, visibility: 0.95 };

      // Hips (23, 24)
      landmarks[23] = { x: 0.58, y: 0.61 + shake + sagY, z: 0.15, visibility: 0.95 };
      landmarks[24] = { x: 0.58, y: 0.61 + shake + sagY, z: -0.15, visibility: 0.95 };

      // Ankles (27, 28)
      landmarks[27] = { x: 0.85, y: 0.62, z: 0.2, visibility: 0.95 };
      landmarks[28] = { x: 0.85, y: 0.62, z: -0.2, visibility: 0.95 };

      // Neck craning error
      const neckY = hasMinorError ? -0.10 : 0;
      landmarks[0] = { x: 0.20, y: 0.56 + shake + neckY, z: 0.1, visibility: 0.95 };
    }

    return {
      landmarks,
    };
  }

  // Web Real Implementation
  if (!poseLandmarker) return null;
  try {
    const results = poseLandmarker.detectForVideo(imageSource, timestampMs);
    if (results && results.landmarks && results.landmarks.length > 0) {
      return {
        landmarks: results.landmarks[0],
      };
    }
  } catch (err) {
    console.error('[PoseEngine] detectPose failed:', err);
  }
  return null;
}

/**
 * Disposes the Pose Engine, releasing resources.
 */
export async function disposePoseEngine(): Promise<void> {
  if (Platform.OS !== 'web') {
    console.log('[PoseEngine] Disposed Pose Simulator');
    return;
  }

  if (poseLandmarker) {
    try {
      await poseLandmarker.close();
      console.log('[PoseEngine] MediaPipe PoseLandmarker closed successfully.');
    } catch (err) {
      console.error('[PoseEngine] Error closing PoseLandmarker:', err);
    }
    poseLandmarker = null;
  }
}
