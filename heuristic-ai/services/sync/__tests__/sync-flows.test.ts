/**
 * File: services/sync/__tests__/sync-flows.test.ts
 * Purpose: Unit tests validating metrics sync derivation, sets mapping, and retry/backoff flows.
 */

// Mock SecureStore
import { syncEngine, syncDevFlags } from '../sync-engine';
import { queueManager } from '../queue-manager';
import { uploadMetrics } from '../metrics-sync';
import { uploadSets } from '../workout-set-sync';
import { useSyncStore } from '@/store/sync.store';
import { supabase } from '@/lib/supabase';

const mockSecureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockImplementation((key) => Promise.resolve(mockSecureStore[key] || null)),
  setItemAsync: jest.fn().mockImplementation((key, val) => {
    mockSecureStore[key] = val;
    return Promise.resolve(true);
  }),
  deleteItemAsync: jest.fn().mockImplementation((key) => {
    delete mockSecureStore[key];
    return Promise.resolve(true);
  }),
}));

jest.mock('@/lib/supabase', () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const eq = jest.fn().mockResolvedValue({ data: [], error: null });
  const select = jest.fn().mockReturnValue({ eq });
  const fromObj = { insert, upsert, select };
  return {
    supabase: {
      from: jest.fn().mockReturnValue(fromObj),
    },
  };
});

// Mock Firebase Auth
jest.mock('../../auth/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'firebase-user-123',
    },
  },
}));

// Mock WatermelonDB
jest.mock('../../../database', () => ({
  database: {
    write: jest.fn().mockImplementation((cb) => cb())
  },
  sessionsCollection: {
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue([])
    }),
    find: jest.fn().mockResolvedValue({
      id: 'session-123',
      update: jest.fn().mockImplementation((cb) => cb({}))
    })
  },
  setsCollection: {
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue([])
    }),
    find: jest.fn().mockResolvedValue({
      id: 'set-123',
      update: jest.fn().mockImplementation((cb) => cb({}))
    })
  },
  usersCollection: {
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue([])
    })
  }
}));

describe('Sync Flow Operations', () => {
  beforeEach(async () => {
    await queueManager.clearQueue();
    syncDevFlags.mockFailure = false;
    syncDevFlags.mockOffline = false;
    jest.clearAllMocks();
  });

  describe('Heuristic Metrics derivation & sync', () => {
    it('should derive metrics from session average RPE and upload', async () => {
      const session = {
        firebase_uid: 'firebase-user-123',
        avg_rpe: 8,
        ended_at: new Date(),
      };
      
      const result = await uploadMetrics(session);
      expect(result.success).toBe(true);
      const fromObj = supabase.from('heuristic_metrics') as any;
      expect(fromObj.insert).toHaveBeenCalledWith({
        firebase_uid: 'firebase-user-123',
        fatigue_score: 8,
        recovery_score: 6, // 10 - (8 - 4) = 6
        readiness_score: 2, // 10 - 8 = 2
        created_at: expect.any(String),
      });
    });
  });

  describe('Workout Set upload', () => {
    it('should map local sets and upsert to Supabase', async () => {
      const mockSets = [
        {
          id: 'set-1',
          sessionId: 'session-1',
          exerciseSlug: 'squat',
          completedReps: 5,
          actualWeightKg: 100,
          rpe: 8,
          completedAt: Date.now(),
        },
      ];

      const result = await uploadSets(mockSets);
      expect(result.success).toBe(true);
      const fromObj = supabase.from('workout_sets') as any;
      expect(fromObj.upsert).toHaveBeenCalled();
    });
  });

  describe('Retry Logic and Backoff overrides', () => {
    it('should respect mock failure settings', async () => {
      syncDevFlags.mockFailure = true;
      await queueManager.enqueue('session', 's-fail', 'update');
      
      const syncStore = useSyncStore.getState();
      syncStore.setOnline(true);
      
      await syncEngine.processQueue();
      
      expect(useSyncStore.getState().status).toBe('Failed');
      
      const items = await queueManager.getItems();
      expect(items[0].retryCount).toBe(1);
    });
  });
});
