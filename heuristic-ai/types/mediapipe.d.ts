/**
 * HeuristicAI — Ambient type declaration for @mediapipe/tasks-vision
 * The real module is loaded at runtime via CDN/WASM on-device.
 * This stubs just the interfaces we use so TypeScript is happy.
 */

declare module '@mediapipe/tasks-vision' {
  export interface PoseLandmarker {
    detectForVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult;
    close(): void;
  }

  export interface PoseLandmarkerResult {
    landmarks: NormalizedLandmark[][];
    worldLandmarks: Landmark[][];
    segmentationMasks?: unknown[];
  }

  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export interface BaseOptions {
    modelAssetPath: string;
    delegate?: 'GPU' | 'CPU';
  }

  export interface PoseLandmarkerOptions {
    baseOptions: BaseOptions;
    runningMode: 'VIDEO' | 'IMAGE';
    numPoses?: number;
    minPoseDetectionConfidence?: number;
    minPosePresenceConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class FilesetResolver {
    static forVisionTasks(wasmFilePath: string): Promise<unknown>;
  }

  export class PoseLandmarker {
    static createFromOptions(
      vision: unknown,
      options: PoseLandmarkerOptions,
    ): Promise<PoseLandmarker>;

    detectForVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult;
    close(): void;
  }
}
