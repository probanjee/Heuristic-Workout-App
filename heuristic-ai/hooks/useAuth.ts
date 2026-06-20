/**
 * HeuristicAI — useAuth Custom Hook
 * Connects Firebase Auth session lifecycle with Zustand stores, WatermelonDB profiles, and routing.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { User } from 'firebase/auth';
import { useUserStore } from '../store/user.store';
import { usersCollection } from '../database';
import { Q } from '@nozbe/watermelondb';
import AuthService from '../services/auth/auth-service';
import type { UserProfile } from '../heuristic-engine/types';
import { syncEngine } from '../services/sync/sync-engine';

export function useAuth() {
  const router = useRouter();
  const store = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(AuthService.auth.currentUser);

  useEffect(() => {
    const unsubscribe = AuthService.startSessionListener(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Hydrate database and settings from cloud (new device / reinstall / restore flow)
          await syncEngine.pullData();

          // Query local user profile by firebase_uid
          const localUsers = await usersCollection
            .query(Q.where('firebase_uid', firebaseUser.uid))
            .fetch();

          if (localUsers.length > 0) {
            const localUser = localUsers[0];
            const profile: UserProfile = {
              id: localUser.id,
              firebaseUid: localUser.firebaseUid,
              displayName: localUser.displayName,
              goal: localUser.goal,
              trainingLevel: localUser.trainingLevel,
              equipment: localUser.equipment,
              injuryFlags: localUser.injuryFlags,
              createdAt: localUser.createdAt.getTime(),
              syncedAt: localUser.syncedAt ? localUser.syncedAt.getTime() : null,
            };
            store.completeOnboarding(firebaseUser.isAnonymous, profile);
          } else {
            // Create user profile record if none exists (fallback onboarding recovery)
            const displayName = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Athlete';
            await AuthService.updateLocalDatabaseUid(firebaseUser.uid, displayName);

            // Re-fetch created user profile
            const createdUsers = await usersCollection
              .query(Q.where('firebase_uid', firebaseUser.uid))
              .fetch();

            if (createdUsers.length > 0) {
              const localUser = createdUsers[0];
              const profile: UserProfile = {
                id: localUser.id,
                firebaseUid: localUser.firebaseUid,
                displayName: localUser.displayName,
                goal: localUser.goal || store.goal || 'strength',
                trainingLevel: localUser.trainingLevel || store.trainingLevel || 'intermediate',
                equipment: localUser.equipment.length > 0 ? localUser.equipment : store.equipment,
                injuryFlags: localUser.injuryFlags.length > 0 ? localUser.injuryFlags : store.injuryFlags,
                createdAt: localUser.createdAt.getTime(),
                syncedAt: null,
              };
              store.completeOnboarding(firebaseUser.isAnonymous, profile);
            }
          }
        } catch (e) {
          console.error('[useAuth] Failed to load local profile:', e);
          setError('Failed to synchronize local profile settings.');
        }
      } else {
        // Sign out / No active session
        store.resetOnboarding();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthService.terminateSession();
      router.replace('/auth/login');
    } catch (e) {
      console.error('[useAuth] Logout failed:', e);
      setError('Failed to complete logout session.');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous || false,
    firebaseUid: user?.uid || null,
    loading,
    error,
    logout: handleLogout,
  };
}

export default useAuth;
