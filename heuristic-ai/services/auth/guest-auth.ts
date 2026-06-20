/**
 * HeuristicAI — Anonymous Guest Authentication
 * Handles signing in anonymously using Firebase Auth
 */

import { signInAnonymously, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

export async function loginAsGuest(): Promise<UserCredential> {
  return await signInAnonymously(auth);
}
