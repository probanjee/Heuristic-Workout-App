/**
 * HeuristicAI — Account Linking & Guest Upgrade
 * Handles linking anonymous guests to permanent credentials and updating local DB profile.
 */

import {
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { database, usersCollection } from '../../database';

import { syncEngine } from '../sync/sync-engine';

/**
 * Upgrade guest using Email and Password
 */
export async function linkGuestWithEmail(email: string, password: string): Promise<UserCredential> {
  const user = auth.currentUser;
  if (!user) throw new Error('No active user session');
  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(user, credential);
  await updateLocalDatabaseUid(user.uid, email);
  syncEngine.processQueue().catch(e => console.error('[AccountLinking] Failed to trigger sync:', e));
  return result;
}

/**
 * Upgrade guest using Google OAuth ID Token
 */
export async function linkGuestWithGoogle(idToken: string): Promise<UserCredential> {
  const user = auth.currentUser;
  if (!user) throw new Error('No active user session');
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await linkWithCredential(user, credential);
  await updateLocalDatabaseUid(user.uid, user.email || 'Athlete');
  syncEngine.processQueue().catch(e => console.error('[AccountLinking] Failed to trigger sync:', e));
  return result;
}

/**
 * Upgrade guest using Phone OTP verification
 */
export async function linkGuestWithPhone(verificationId: string, code: string): Promise<UserCredential> {
  const user = auth.currentUser;
  if (!user) throw new Error('No active user session');
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await linkWithCredential(user, credential);
  await updateLocalDatabaseUid(user.uid, 'Phone Athlete');
  syncEngine.processQueue().catch(e => console.error('[AccountLinking] Failed to trigger sync:', e));
  return result;
}

/**
 * Updates the local WatermelonDB profile with the permanent user identity information.
 */
export async function updateLocalDatabaseUid(firebaseUid: string, emailOrName: string): Promise<void> {
  const users = await usersCollection.query().fetch();
  const displayName = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;

  await database.write(async () => {
    if (users.length > 0) {
      const localUser = users[0];
      await localUser.update((u) => {
        u.firebaseUid = firebaseUid;
        if (!u.displayName || u.displayName === 'Athlete') {
          u.displayName = displayName;
        }
      });
    } else {
      await usersCollection.create((u: any) => {
        u.firebaseUid = firebaseUid;
        u.displayName = displayName;
        u.goal = 'strength';
        u.trainingLevel = 'intermediate';
        u._equipment = JSON.stringify(['bodyweight']);
        u._injuryFlags = JSON.stringify([]);
        u.syncedAt = null;
      });
    }
  });
}
