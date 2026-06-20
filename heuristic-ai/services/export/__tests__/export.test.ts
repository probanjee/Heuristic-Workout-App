/**
 * HeuristicAI — Export Service Tests
 * Tests querying local WatermelonDB records, formatting data as JSON/CSV,
 * writing files to device cache, and presenting native share sheets.
 */

import { exportService } from '../export-service';
import { sessionsCollection, setsCollection, heuristicProfilesCollection } from '@/database';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  cacheDirectory: 'cache/',
  EncodingType: {
    UTF8: 'utf8',
  },
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock database
jest.mock('@/database', () => {
  const mockFetchSessions = jest.fn();
  const mockFetchSets = jest.fn();
  const mockFetchProfiles = jest.fn();
  return {
    sessionsCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchSessions,
    },
    setsCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchSets,
    },
    heuristicProfilesCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchProfiles,
    },
  };
});

describe('ExportService', () => {
  const mockSessions = [
    {
      id: 'session-1',
      startedAt: new Date('2026-06-01T10:00:00Z'),
      status: 'completed',
      totalVolumeKg: 1000,
      avgRpe: 8,
    },
  ];

  const mockSets = [
    {
      id: 'set-1',
      sessionId: 'session-1',
      exerciseId: 'squat',
      setNumber: 1,
      targetReps: 5,
      completedReps: 5,
      targetWeightKg: 100,
      actualWeightKg: 100,
      rpe: 8,
      rpeEstimated: false,
      formScore: 95,
      completedAt: new Date('2026-06-01T10:15:00Z'),
    },
  ];

  const mockProfiles = [
    {
      id: 'profile-1',
      exerciseId: 'squat',
      estimatedOneRmKg: 120,
      avgRpeLast5: 7.8,
      bestVolumeSession: 'session-1',
      consecutiveHighRpe: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock values
    (sessionsCollection.query().fetch as jest.Mock).mockResolvedValue(mockSessions);
    (setsCollection.query().fetch as jest.Mock).mockResolvedValue(mockSets);
    (heuristicProfilesCollection.query().fetch as jest.Mock).mockResolvedValue(mockProfiles);
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('fetchLocalData', () => {
    it('should query and return mapped data from all collections', async () => {
      const data = await exportService.fetchLocalData();

      expect(sessionsCollection.query().fetch).toHaveBeenCalled();
      expect(setsCollection.query().fetch).toHaveBeenCalled();
      expect(heuristicProfilesCollection.query().fetch).toHaveBeenCalled();

      expect(data.sessions.length).toBe(1);
      expect(data.sessions[0].id).toBe('session-1');
      expect(data.sets.length).toBe(1);
      expect(data.sets[0].exerciseId).toBe('squat');
      expect(data.profiles.length).toBe(1);
      expect(data.profiles[0].estimatedOneRmKg).toBe(120);
    });

    it('should throw error if database query fails', async () => {
      (sessionsCollection.query().fetch as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

      await expect(exportService.fetchLocalData()).rejects.toThrow('Database fetch failure during export');
    });
  });

  describe('exportAsJSON', () => {
    it('should write file to cache and invoke share sheet if sharing is available', async () => {
      const result = await exportService.exportAsJSON();

      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('cache/heuristic_ai_export_'),
        expect.any(String),
        { encoding: 'utf8' }
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('cache/heuristic_ai_export_'),
        expect.objectContaining({ mimeType: 'application/json' })
      );
      expect(result.success).toBe(true);
    });

    it('should return error status if sharing is not available on device', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const result = await exportService.exportAsJSON();

      expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('OS sharing is not available');
    });

    it('should return failure if writing to file system throws an error', async () => {
      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(new Error('Disk Full'));

      const result = await exportService.exportAsJSON();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Disk Full');
    });
  });

  describe('exportAsCSV', () => {
    it('should format data to CSV structure and invoke share sheet', async () => {
      const result = await exportService.exportAsCSV();

      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('cache/heuristic_ai_export_'),
        expect.stringContaining('Set ID,Session ID,Session Date,Exercise Name,Set Number'),
        { encoding: 'utf8' }
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('cache/heuristic_ai_export_'),
        expect.objectContaining({ mimeType: 'text/csv' })
      );
      expect(result.success).toBe(true);
    });

    it('should handle sets with missing session mapping gracefully', async () => {
      // Empty sessions array
      (sessionsCollection.query().fetch as jest.Mock).mockResolvedValue([]);

      const result = await exportService.exportAsCSV();

      expect(result.success).toBe(true);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"Unknown"'), // session date is unknown
        expect.any(Object)
      );
    });

    it('should return failure status when export throws exception', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockRejectedValue(new Error('Fatal error'));

      const result = await exportService.exportAsCSV();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fatal error');
    });
  });
});
