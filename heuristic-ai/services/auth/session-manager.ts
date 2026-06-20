/**
 * HeuristicAI — Session Manager
 * Manages Firebase session state, token refreshes, and expo-secure-store persistence.
 */

import { storageAdapter } from '../storage/storage-adapter';
import { onIdTokenChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { supabase } from '../../lib/supabase';

const ID_TOKEN_KEY = 'firebase_id_token';
const USER_INFO_KEY = 'firebase_user_info';

export interface CachedUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

/**
 * Initializes token change listeners to automatically cache ID tokens
 */
export function startSessionListener(onUserChanged?: (user: User | null) => void): () => void {
  return onIdTokenChanged(auth, async (user) => {
    if (user) {
      try {
        const idToken = await user.getIdToken(true);
        await storageAdapter.setItem(ID_TOKEN_KEY, idToken);

        // Update Supabase Client Session with Firebase Custom JWT
        await supabase.auth.setSession({
          access_token: idToken,
          refresh_token: '',
        });

        const userInfo: CachedUserInfo = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous,
        };
        await storageAdapter.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      } catch (e) {
        console.error('[Session Manager] Failed to cache token/user info:', e);
      }
    } else {
      try {
        await storageAdapter.removeItem(ID_TOKEN_KEY);
        await storageAdapter.removeItem(USER_INFO_KEY);
      } catch (e) {
        console.error('[Session Manager] Failed to clear cached session:', e);
      }
    }

    if (onUserChanged) {
      onUserChanged(user);
    }
  });
}

/**
 * Retrieves the currently cached ID token
 */
export async function getCachedIdToken(): Promise<string | null> {
  try {
    return await storageAdapter.getItem(ID_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieves cached user info
 */
export async function getCachedUserInfo(): Promise<CachedUserInfo | null> {
  try {
    const raw = await storageAdapter.getItem(USER_INFO_KEY);
    return raw ? (JSON.parse(raw) as CachedUserInfo) : null;
  } catch {
    return null;
  }
}

/**
 * Terminate the user session and clear cache
 */
export async function terminateSession(): Promise<void> {
  await signOut(auth);
  await storageAdapter.removeItem(ID_TOKEN_KEY);
  await storageAdapter.removeItem(USER_INFO_KEY);
}

/**
 * Force refresh the active Firebase Token
 */
export async function forceTokenRefresh(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken(true);
  await storageAdapter.setItem(ID_TOKEN_KEY, token);

  // Update Supabase Client Session with refreshed Firebase Custom JWT
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: '',
  });

  return token;
}
