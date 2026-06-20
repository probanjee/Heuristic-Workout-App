/**
 * File: services/sync/__tests__/session-sync.test.ts
 * Purpose: Unit tests for session sync logic
 */

// Mock SecureStore
import { uploadSession, downloadSessions } from '../session-sync';
import { supabase } from '../../../lib/supabase';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('firebase-auth-token-123'),
  setItemAsync: jest.fn().mockResolvedValue(true),
  deleteItemAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../lib/supabase', () => {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const eq = jest.fn().mockResolvedValue({ data: [{ id: 's1', firebase_uid: 'u1' }], error: null });
  const select = jest.fn().mockReturnValue({ eq });
  const fromObj = { upsert, select };
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
      uid: 'u1',
    },
  },
}));

describe('SessionSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a session successfully', async () => {
    const mockSession = { id: 's1', firebase_uid: 'u1', started_at: Date.now(), status: 'active', volume: 5000, avg_rpe: 8 };
    const result = await uploadSession(mockSession);
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(1);
    const fromObj = supabase.from('sessions') as any;
    expect(fromObj.upsert).toHaveBeenCalled();
  });

  it('should download sessions successfully', async () => {
    const sessions = await downloadSessions('u1');
    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe('s1');
    const fromObj = supabase.from('sessions') as any;
    expect(fromObj.select().eq).toHaveBeenCalledWith('firebase_uid', 'u1');
  });
});
