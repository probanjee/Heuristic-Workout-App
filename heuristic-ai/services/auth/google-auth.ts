/**
 * HeuristicAI — Google Authentication
 * Exchanges Google OAuth ID Tokens for Firebase Auth Credentials
 */

import { signInWithCredential, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

export async function loginWithGoogle(idToken: string): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  return await signInWithCredential(auth, credential);
}
