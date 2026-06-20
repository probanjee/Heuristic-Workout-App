/**
 * File: lib/supabase.ts
 * Purpose: Supabase client initialization with secure storage and session recovery
 * Dependencies: @supabase/supabase-js, expo-secure-store, lib/env
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { storageAdapter } from '../services/storage/storage-adapter';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => storageAdapter.getItem(key),
  setItem: (key: string, value: string) => storageAdapter.setItem(key, value),
  removeItem: (key: string) => storageAdapter.removeItem(key),
};

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});