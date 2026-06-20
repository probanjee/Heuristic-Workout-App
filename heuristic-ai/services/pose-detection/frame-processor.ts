/**
 * HeuristicAI — Frame Processor
 * Enforces frame skipping and throttles processing to achieve a stable 24 FPS.
 * Source of truth: TASK.md § 2, TRD.md § 7
 */

export class FrameProcessor {
  private frameCount = 0;
  private lastProcessedTime = 0;
  private readonly minFrameIntervalMs = 1000 / 24; // ~41.6ms interval for 24 FPS

  /**
   * Evaluates if the current frame should be processed.
   * Processes every 3rd frame, and ensures a minimum interval of 41.6ms has elapsed.
   */
  shouldProcess(timestampMs: number): boolean {
    this.frameCount++;
    
    // Process every 3rd frame to conserve battery/CPU
    if (this.frameCount % 3 !== 0) {
      return false;
    }

    const elapsed = timestampMs - this.lastProcessedTime;
    if (elapsed < this.minFrameIntervalMs) {
      return false;
    }

    this.lastProcessedTime = timestampMs;
    return true;
  }

  /**
   * Resets the processor counters (e.g. at the start of a set).
   */
  reset(): void {
    this.frameCount = 0;
    this.lastProcessedTime = 0;
  }
}
