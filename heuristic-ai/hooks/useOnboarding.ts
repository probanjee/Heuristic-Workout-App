/**
 * HeuristicAI — Onboarding Custom Hook
 * Connects store state and actions with router navigation
 * Source of truth: TASK.md Hook, TASK.md Task 11
 */

import { useRouter, usePathname } from 'expo-router';
import { storageAdapter } from '../services/storage/storage-adapter';
import { useUserStore } from '../store/user.store';
import { database, usersCollection } from '../database';
import type { GoalType, TrainingLevel, EquipmentType, InjuryFlag, UserProfile } from '../heuristic-engine/types';
import { syncEngine } from '../services/sync/sync-engine';
import { queueManager } from '../services/sync/queue-manager';

const ONBOARDING_STEPS = [
  '/(onboarding)/welcome',
  '/(onboarding)/goals',
  '/(onboarding)/level',
  '/(onboarding)/equipment',
  '/(onboarding)/injuries',
  '/(onboarding)/baseline',
  '/(onboarding)/account',
];

export function useOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useUserStore();

  const currentStepIndex = ONBOARDING_STEPS.indexOf(pathname);
  const currentStep = currentStepIndex !== -1 ? pathname : ONBOARDING_STEPS[0];

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      router.push(ONBOARDING_STEPS[currentStepIndex + 1] as any);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      router.back();
    }
  };

  const isStepValid = (step: number | string): boolean => {
    const stepStr = typeof step === 'number' ? ONBOARDING_STEPS[step] : step;
    switch (stepStr) {
      case '/(onboarding)/goals':
        return !!store.goal;
      case '/(onboarding)/level':
        return !!store.trainingLevel;
      case '/(onboarding)/equipment':
        return store.equipment.length > 0;
      default:
        return true;
    }
  };

  const complete = async (asGuest: boolean, firebaseUid?: string, email?: string) => {
    try {
      const displayName = email ? email.split('@')[0] : 'Athlete';

      let dbUserId = '';
      // 1. Save user profile to WatermelonDB
      await database.write(async () => {
        const newUser = await usersCollection.create((record: any) => {
          record.firebaseUid = firebaseUid || null;
          record.displayName = displayName;
          record.goal = store.goal || 'strength';
          record.trainingLevel = store.trainingLevel || 'intermediate';
          record._raw.equipment = JSON.stringify(store.equipment.length > 0 ? store.equipment : ['bodyweight']);
          record._raw.injury_flags = JSON.stringify(store.injuryFlags);
          record.syncedAt = null;
        });
        dbUserId = newUser.id;
      });

      // 2. Save onboarding_complete flag in storageAdapter
      await storageAdapter.setItem('onboarding_complete', 'true');

      // 3. Sync profile if authenticated (Phase 7 Sync Mock / Queueing)
      if (firebaseUid) {
        console.log('[HeuristicAI Sync] Profile synced for user:', firebaseUid);
        await queueManager.enqueue('profile', dbUserId, 'create');
        syncEngine.processQueue();
      }

      // 4. Update Zustand state
      const userProfile: UserProfile = {
        id: dbUserId,
        firebaseUid: firebaseUid || null,
        displayName,
        goal: store.goal || 'strength',
        trainingLevel: store.trainingLevel || 'intermediate',
        equipment: store.equipment.length > 0 ? store.equipment : ['bodyweight'],
        injuryFlags: store.injuryFlags,
        createdAt: Date.now(),
        syncedAt: null,
      };

      store.completeOnboarding(asGuest, userProfile);

      // 5. Navigate to workout tab
      router.replace('/(tabs)/workout');
    } catch (error) {
      console.error('[HeuristicAI] Failed to complete onboarding:', error);
      throw error;
    }
  };

  return {
    ...store,
    currentStep,
    totalSteps: ONBOARDING_STEPS.length,
    next: handleNext,
    back: handleBack,
    isCurrentStepValid: isStepValid(currentStep),
    isStepValid,
    complete,
  };
}
export default useOnboarding;
