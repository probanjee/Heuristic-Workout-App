/**
 * File: lib/env.ts
 * Purpose: Validates and exposes typed environment variables
 * Dependencies: None
 */

const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || (process.env.NODE_ENV === 'test' ? 'mock-api-key' : '');
const FIREBASE_AUTH_DOMAIN = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || (process.env.NODE_ENV === 'test' ? 'mock-auth-domain' : '');
const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || (process.env.NODE_ENV === 'test' ? 'mock-project-id' : '');
const FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || (process.env.NODE_ENV === 'test' ? 'mock-storage-bucket' : '');
const FIREBASE_MESSAGING_SENDER_ID = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (process.env.NODE_ENV === 'test' ? 'mock-sender-id' : '');
const FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || (process.env.NODE_ENV === 'test' ? 'mock-app-id' : '');
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || (process.env.NODE_ENV === 'test' ? 'https://mock-supabase-url.supabase.co' : '');
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || (process.env.NODE_ENV === 'test' ? 'mock-anon-key' : '');

if (!SUPABASE_URL) {
  throw new Error('Missing environment variable: EXPO_PUBLIC_SUPABASE_URL');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

if (process.env.NODE_ENV !== 'test') {
  if (!FIREBASE_API_KEY) throw new Error('Missing environment variable: EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!FIREBASE_AUTH_DOMAIN) throw new Error('Missing environment variable: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!FIREBASE_PROJECT_ID) throw new Error('Missing environment variable: EXPO_PUBLIC_FIREBASE_PROJECT_ID');
}

export const env = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
};
