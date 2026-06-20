/**
 * File: services/sync/__tests__/profile-sync.test.ts
 * Purpose: Unit tests for profile sync logic
 */

// Mock SecureStore
import { uploadProfile, downloadProfile } from '../profile-sync';
import { supabase } from '../../../lib/supabase';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('firebase-auth-token-123'),
  setItemAsync: jest.fn().mockResolvedValue(true),
  deleteItemAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../lib/supabase', () => {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const eq = jest.fn().mockResolvedValue({ data: [{ id: 'p1', firebase_uid: 'u1' }], error: null });
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

describe('ProfileSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a profile successfully', async () => {
    const mockProfile = { id: 'local-u1', firebaseUid: 'u1', createdAt: Date.now(), updatedAt: Date.now() };
    const result = await uploadProfile(mockProfile);
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(1);
    const fromObj = supabase.from('profiles') as any;
    expect(fromObj.upsert).toHaveBeenCalled();
  });

  it('should download profiles successfully', async () => {
    const profiles = await downloadProfile('u1');
    expect(profiles.length).toBe(1);
    expect(profiles[0].id).toBe('p1');
    const fromObj = supabase.from('profiles') as any;
    expect(fromObj.select().eq).toHaveBeenCalledWith('firebase_uid', 'u1');
  });
});
