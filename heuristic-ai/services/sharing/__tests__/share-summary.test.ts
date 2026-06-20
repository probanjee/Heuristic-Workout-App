/**
 * HeuristicAI — Unit Tests: Share Summary Service
 * Source of truth: TASK.md (M6 Task 12, 25)
 */

import { shareWorkoutSummary } from '../share-summary';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// Mock react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

describe('Share Workout Summary Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns error when viewRef is null or undefined', async () => {
    const result1 = await shareWorkoutSummary(null as any);
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('View reference is not defined');

    const result2 = await shareWorkoutSummary({ current: null });
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('View reference is not defined');
  });

  test('returns error when expo-sharing is not available on platform', async () => {
    const mockRef = { current: {} };
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    const result = await shareWorkoutSummary(mockRef);
    expect(result.success).toBe(false);
    expect(result.error).toContain('OS sharing is not available');
    expect(captureRef).not.toHaveBeenCalled();
  });

  test('executes screenshot capture and launches native share sheet successfully', async () => {
    const mockRef = { current: {} };
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (captureRef as jest.Mock).mockResolvedValue('file://test-path/image.png');
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

    const result = await shareWorkoutSummary(mockRef);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    
    expect(captureRef).toHaveBeenCalledWith(mockRef, {
      format: 'png',
      quality: 0.9,
    });
    
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file://test-path/image.png', {
      mimeType: 'image/png',
      dialogTitle: 'My HeuristicAI Workout Summary',
      UTI: 'public.png',
    });
  });

  test('handles screenshot capture exceptions gracefully', async () => {
    const mockRef = { current: {} };
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (captureRef as jest.Mock).mockRejectedValue(new Error('Capture failed due to graphics context'));

    const result = await shareWorkoutSummary(mockRef);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Capture failed due to graphics');
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  test('handles native sharing exceptions gracefully', async () => {
    const mockRef = { current: {} };
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (captureRef as jest.Mock).mockResolvedValue('file://test-path/image.png');
    (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('User cancelled sharing'));

    const result = await shareWorkoutSummary(mockRef);
    expect(result.success).toBe(false);
    expect(result.error).toContain('User cancelled sharing');
  });
});
