/**
 * File: services/sync/__tests__/sync-engine.test.ts
 * Purpose: Unit tests for the sync engine queue, conflict resolution, and deterministic UUIDs.
 */

// Mock SecureStore
import { queueManager } from '../queue-manager';
import { resolveConflict } from '../conflict-resolver';
import { deterministicUuid } from '../types';
import { syncEngine } from '../sync-engine';
import { useSyncStore } from '../../../store/sync.store';

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

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true })
}));

// Mock Supabase
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    })
  }
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

// Mock Firebase Auth
jest.mock('../../auth/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'u1'
    }
  }
}));

describe('Sync Core Logic', () => {
  beforeEach(async () => {
    await queueManager.clearQueue();
    jest.clearAllMocks();
  });

  describe('Queue Manager & Deduplication', () => {
    it('should enqueue and deduplicate items correctly', async () => {
      await queueManager.enqueue('session', 's1', 'create');
      expect(await queueManager.getQueueLength()).toBe(1);

      // Duplicate enqueue should not increase size
      await queueManager.enqueue('session', 's1', 'update');
      expect(await queueManager.getQueueLength()).toBe(1);
      
      const items = await queueManager.getItems();
      expect(items[0].entityId).toBe('s1');
      expect(items[0].operation).toBe('create'); // merge rules: create remains create
    });

    it('should delete from queue if created then deleted', async () => {
      await queueManager.enqueue('session', 's2', 'create');
      expect(await queueManager.getQueueLength()).toBe(1);

      await queueManager.enqueue('session', 's2', 'delete');
      expect(await queueManager.getQueueLength()).toBe(0); // cancelled out
    });
  });

  describe('Conflict Resolver', () => {
    it('should resolve conflicts using Last-Write-Wins', () => {
      const local = { updated_at: 1000 };
      const cloud = { updated_at: 2000 };
      expect(resolveConflict(local, cloud)).toBe('cloud_wins');

      const localNewer = { updated_at: 3000 };
      expect(resolveConflict(localNewer, cloud)).toBe('local_wins');

      const equal = { updated_at: 2000 };
      expect(resolveConflict(equal, cloud)).toBe('skip');
    });
  });

  describe('Deterministic UUID Generator', () => {
    it('should generate valid deterministic UUIDs', () => {
      const id1 = 'abc123xyz7890def';
      const uuid1 = deterministicUuid(id1);
      const uuid2 = deterministicUuid(id1);
      expect(uuid1).toBe(uuid2); // Deterministic
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // Valid V4-like
    });
  });
});
