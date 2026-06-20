/**
 * File: services/sync/__tests__/sync-engine-write.test.ts
 * Purpose: Regression tests for C-04 (nested write transaction isolation) and C-02 (WatermelonDB write correctness).
 */

import { syncEngine } from '../sync-engine';
import { database, setsCollection, usersCollection } from '../../../database';
import { downloadProfile } from '../profile-sync';
import { downloadSessions } from '../session-sync';
import { downloadSets } from '../workout-set-sync';
import { downloadMetrics } from '../metrics-sync';

const mockSecureStore: Record<string, any> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockSecureStore[key] || null),
  setItemAsync: jest.fn(async (key, val) => {
    mockSecureStore[key] = val;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete mockSecureStore[key];
  }),
}));

// Mock Supabase Sync Calls
jest.mock('../profile-sync', () => ({
  downloadProfile: jest.fn().mockResolvedValue([
    {
      id: 'cloud-user-uuid',
      firebase_uid: 'firebase-user-123',
      display_name: 'Test Athlete',
      goal: 'strength',
      training_level: 'intermediate',
      equipment: ['barbell'],
      injuries: ['knees'],
      units: 'kg',
      preferences: { defaultRestSeconds: 90 },
    },
  ]),
}));

jest.mock('../session-sync', () => ({
  downloadSessions: jest.fn().mockResolvedValue([]),
}));

jest.mock('../workout-set-sync', () => ({
  downloadSets: jest.fn().mockResolvedValue([
    {
      id: 'set-uuid-1',
      session_id: 'session-uuid-1',
      firebase_uid: 'firebase-user-123',
      exercise_id: 'squat',
      reps: 5,
      weight: 100,
      rpe: 8,
      created_at: new Date(Date.now() - 10000).toISOString(),
    },
    {
      id: 'set-uuid-2',
      session_id: 'session-uuid-1',
      firebase_uid: 'firebase-user-123',
      exercise_id: 'squat',
      reps: 5,
      weight: 100,
      rpe: 9,
      created_at: new Date(Date.now()).toISOString(),
    },
  ]),
}));

jest.mock('../metrics-sync', () => ({
  downloadMetrics: jest.fn().mockResolvedValue([]),
}));

// Mock Firebase Auth
jest.mock('../../auth/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'firebase-user-123',
    },
  },
}));

// Spy/Mock WatermelonDB
let writeCallCount = 0;
let lastWriteCallback: Function | null = null;

const mockUserRecord = {
  id: 'local-user-id',
  firebaseUid: null,
  displayName: '',
  createdAt: new Date(),
  update: jest.fn(async (cb) => {
    const record = { displayName: '', goal: '', trainingLevel: '', _raw: {} as any, syncedAt: null };
    await cb(record);
    mockUserRecord.displayName = record.displayName;
    (mockUserRecord as any)._raw = record._raw;
  }),
};

const mockSet1 = {
  id: 'set-uuid-1',
  sessionId: 'session-uuid-1',
  exerciseId: 'squat',
  setNumber: 1,
  completedAt: Date.now() - 10000,
  update: jest.fn(async (cb) => {
    const record = { setNumber: 1 };
    await cb(record);
    mockSet1.setNumber = record.setNumber;
  }),
};

const mockSet2 = {
  id: 'set-uuid-2',
  sessionId: 'session-uuid-1',
  exerciseId: 'squat',
  setNumber: 1, // Start mismatched, will trigger secondary pass update
  completedAt: Date.now(),
  update: jest.fn(async (cb) => {
    const record = { setNumber: 1 };
    await cb(record);
    mockSet2.setNumber = record.setNumber;
  }),
};

jest.mock('../../../database', () => {
  return {
    database: {
      write: jest.fn(async (cb) => {
        writeCallCount++;
        lastWriteCallback = cb;
        return await cb();
      }),
    },
    usersCollection: {
      query: jest.fn(() => ({
        fetch: jest.fn().mockResolvedValue([mockUserRecord]),
      })),
      create: jest.fn(async (cb) => {
        const record = { firebaseUid: '', displayName: '', goal: '', trainingLevel: '', _raw: {} as any, syncedAt: null };
        await cb(record);
        return { id: 'created-user-id', _raw: record._raw };
      }),
    },
    sessionsCollection: {
      query: jest.fn(() => ({
        fetch: jest.fn().mockResolvedValue([]),
      })),
      create: jest.fn(async (cb) => {
        const record = { _raw: {} as any };
        await cb(record);
        return record;
      }),
    },
    setsCollection: {
      query: jest.fn(() => ({
        fetch: jest.fn().mockResolvedValue([mockSet1, mockSet2]),
      })),
      create: jest.fn(async (cb) => {
        const record = { _raw: {} as any };
        await cb(record);
        return record;
      }),
    },
  };
});

describe('SyncEngine Isolation and Correctness', () => {
  beforeEach(() => {
    writeCallCount = 0;
    jest.clearAllMocks();
    mockSet1.setNumber = 1;
    mockSet2.setNumber = 1;
  });

  it('C-04 regression: pullData should perform secondary set-numbering outside main write transaction', async () => {
    await syncEngine.pullData();

    // The first write reconciles profiles, sessions, sets.
    // The second write updates set numbers from the secondary pass.
    // So there should be exactly 2 write transactions!
    expect(writeCallCount).toBe(2);

    // Verify set numbers are correctly reassigned
    expect(mockSet1.setNumber).toBe(1);
    expect(mockSet2.setNumber).toBe(2); // Updated to 2 in secondary pass
  });

  it('C-02 regression: profile sync updates write to record._raw.equipment and record._raw.injury_flags', async () => {
    await syncEngine.pullData();

    // Verify localUser update callback wrote to _raw columns, not read-only property fields
    expect(mockUserRecord.displayName).toBe('Test Athlete');
    expect((mockUserRecord as any)._raw.equipment).toBe(JSON.stringify(['barbell']));
    expect((mockUserRecord as any)._raw.injury_flags).toBe(JSON.stringify(['knees']));
  });
});
