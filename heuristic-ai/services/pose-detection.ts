/**
 * HeuristicAI — Pose Detection Service
 * MediaPipe Tasks Vision integration for on-device pose estimation
 * Source of truth: TRD.md § 6.1
 * All processing on-device — no frames sent to server (TRD § 8)
 */

import type { NormalizedLandmark, FormResult } from '../heuristic-engine/types';

// ─── MEDIAPIPE TYPES ─────────────────────────────────────────────────────────
// These match @mediapipe/tasks-vision API surface

interface PoseLandmarkerResult {
  landmarks: NormalizedLandmark[][];
  worldLandmarks?: NormalizedLandmark[][];
}

interface PoseLandmarkerOptions {
  baseOptions: {
    modelAssetPath: string;
    delegate?: 'GPU' | 'CPU';
  };
  runningMode: 'IMAGE' | 'VIDEO';
  numPoses: number;
  minPoseDetectionConfidence?: number;
  minPosePresenceConfidence?: number;
  minTrackingConfidence?: number;
}

// ─── MEDIAPIPE LANDMARK INDICES ──────────────────────────────────────────────
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export const LandmarkIndex = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
} as const;

// ─── POSE DETECTION SERVICE ───────────────────────────────────────────────────

export class PoseDetectionService {
  private poseLandmarker: unknown = null;
  private isInitialized = false;
  private isInitializing = false;
  private lastFrameTimestamp = 0;
  private readonly FPS_TARGET = 24; // TRD performance requirement
  private readonly FRAME_INTERVAL_MS = 1000 / this.FPS_TARGET;

  // ── INITIALIZATION ───────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;

    try {
      // Dynamic import — MediaPipe is only available in web/JSI environment
      // In React Native, this requires the WASM bundle to be bundled with the app
      const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
      );

      // Try GPU delegate first, fall back to CPU (TRD § 6.1)
      try {
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: require('../assets/models/pose_landmarker_lite.task'),
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        } as PoseLandmarkerOptions);
      } catch (gpuError) {
        console.warn('[PoseDetection] GPU delegate failed, falling back to CPU:', gpuError);
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: require('../assets/models/pose_landmarker_lite.task'),
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        } as PoseLandmarkerOptions);
      }

      this.isInitialized = true;
      console.log('[PoseDetection] Initialized successfully');
    } catch (error) {
      console.error('[PoseDetection] Failed to initialize:', error);
      throw error; // APP_FLOW § 11: MediaPipe Model Load Failure
    } finally {
      this.isInitializing = false;
    }
  }

  // ── FRAME DETECTION ───────────────────────────────────────────────────────

  /**
   * Processes a video frame. Throttles to FPS_TARGET (24fps) to save battery.
   * @returns landmarks if frame processed, null if skipped
   */
  detectFrame(
    videoElement: HTMLVideoElement,
    timestampMs: number,
  ): NormalizedLandmark[] | null {
    if (!this.isInitialized || !this.poseLandmarker) return null;

    // FPS throttle — skip frames to maintain 24fps budget
    const elapsed = timestampMs - this.lastFrameTimestamp;
    if (elapsed < this.FRAME_INTERVAL_MS) return null;
    this.lastFrameTimestamp = timestampMs;

    try {
      const landmarker = this.poseLandmarker as {
        detectForVideo: (video: HTMLVideoElement, ts: number) => PoseLandmarkerResult;
      };
      const result = landmarker.detectForVideo(videoElement, timestampMs);

      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0]; // first pose only (numPoses: 1)
      }
      return null;
    } catch (error) {
      console.error('[PoseDetection] Frame detection error:', error);
      return null;
    }
  }

  // ── CLEANUP ───────────────────────────────────────────────────────────────

  async close(): Promise<void> {
    if (this.poseLandmarker) {
      try {
        (this.poseLandmarker as { close: () => void }).close();
      } catch {
        // Ignore cleanup errors
      }
      this.poseLandmarker = null;
      this.isInitialized = false;
    }
  }

  get ready(): boolean {
    return this.isInitialized;
  }
}

// ─── SINGLETON INSTANCE ───────────────────────────────────────────────────────

export const poseDetectionService = new PoseDetectionService();

// ─── ANGLE CALCULATION HELPERS ────────────────────────────────────────────────

export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark, // vertex
  c: NormalizedLandmark,
): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAB = Math.sqrt(abx * abx + aby * aby);
  const magCB = Math.sqrt(cbx * cbx + cby * cby);

  if (magAB === 0 || magCB === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

export function calculateDistance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
