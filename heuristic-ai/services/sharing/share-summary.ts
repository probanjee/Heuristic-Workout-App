/**
 * HeuristicAI — Share Summary Service
 * Captures visual cards as images and shares them via the OS share sheet.
 * Source of truth: TASK.md (M6 Task 9), PRD.md § 5.6
 */

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Captures the specified component view and triggers the native sharing UI.
 *
 * @param viewRef - Ref pointing to the View containing the summary card
 * @returns Promise resolving to an object indicating success or error
 */
export async function shareWorkoutSummary(
  viewRef: React.RefObject<any>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!viewRef || !viewRef.current) {
      return { success: false, error: 'View reference is not defined' };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'OS sharing is not available on this platform' };
    }

    // Capture screenshot of the component reference
    const localUri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
    });

    // Share via OS sheet
    await Sharing.shareAsync(localUri, {
      mimeType: 'image/png',
      dialogTitle: 'My HeuristicAI Workout Summary',
      UTI: 'public.png',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[shareWorkoutSummary] Capture and sharing failed:', err);
    return {
      success: false,
      error: err?.message || 'Unknown error occurred during sharing',
    };
  }
}
