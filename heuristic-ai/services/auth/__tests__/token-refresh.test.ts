/**
 * File: services/auth/__tests__/token-refresh.test.ts
 * Purpose: Unit test verifying H-04 (token refresh on 401 Supabase response)
 */

import { withRetryAndTimeout } from '../../sync/network-utils';
import { forceTokenRefresh } from '../session-manager';
import { supabase } from '@/lib/supabase';

const mockSecureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockSecureStore[key] || null),
  setItemAsync: jest.fn(async (key, val) => {
    mockSecureStore[key] = val;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete mockSecureStore[key];
  }),
}));

// Mock session-manager forceTokenRefresh
jest.mock('../session-manager', () => {
  const actual = jest.requireActual('../session-manager');
  return {
    ...actual,
    forceTokenRefresh: jest.fn().mockResolvedValue('new-refreshed-firebase-token'),
  };
});

// Mock Supabase
jest.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        setSession: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

describe('Supabase 401 Auth Token Refresh Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should attempt token refresh and retry when a Supabase call fails with 401', async () => {
    let callCount = 0;
    const mockSupabaseCall = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // First call fails with 401
        const err: any = new Error('JWT expired or invalid token');
        err.status = 401;
        throw err;
      }
      // Second call succeeds
      return { data: 'success_data', error: null };
    });

    const result = await withRetryAndTimeout(mockSupabaseCall, 2, 50, 1000);

    expect(callCount).toBe(2);
    expect(result).toEqual({ data: 'success_data', error: null });
    expect(forceTokenRefresh).toHaveBeenCalledTimes(1);
  });
});
