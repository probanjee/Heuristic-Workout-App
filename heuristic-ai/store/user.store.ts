/**
 * HeuristicAI — Zustand User Store
 * Manages onboarding state, user preferences, and profile persistence
 * Source of truth: TASK.md Task 2, TRD.md § 2.1
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageAdapter } from '@/services/storage/storage-adapter';
import type {
  GoalType,
  TrainingLevel,
  EquipmentType,
  InjuryFlag,
  UserProfile,
} from '../heuristic-engine/types';

// ─── STATE TYPES ──────────────────────────────────────────────────────────────

export interface BaselineResults {
  pushups: number | null;
  squats: number | null;
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
}

export interface UserPreferences {
  unitSystem: 'kg' | 'lbs';
  defaultRestSeconds: number;
  cameraDefaultOn: boolean;
  audioCuesEnabled: boolean;
  hapticsEnabled: boolean;
  workoutRemindersEnabled: boolean;
  recoveryAlertsEnabled: boolean;
}

interface UserState {
  // Onboarding State
  onboardingComplete: boolean;
  goal: GoalType | null;
  trainingLevel: TrainingLevel | null;
  equipment: EquipmentType[];
  injuryFlags: InjuryFlag[];
  baselineResults: BaselineResults;
  guestMode: boolean;
  user: UserProfile | null;
  profile: UserProfile | null; // Compatibility alias for user profile

  // Preferences
  preferences: UserPreferences;

  // Hydration helper state
  _hasHydrated: boolean;

  // Actions
  setGoal: (goal: GoalType | null) => void;
  setTrainingLevel: (level: TrainingLevel | null) => void;
  toggleEquipment: (item: EquipmentType) => void;
  setEquipment: (equipment: EquipmentType[]) => void;
  toggleInjury: (item: InjuryFlag) => void;
  setInjuryFlags: (flags: InjuryFlag[]) => void;
  setBaseline: (results: Partial<BaselineResults>) => void;
  completeOnboarding: (asGuest: boolean, userProfile: UserProfile) => void;
  resetOnboarding: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

// ─── INITIAL STATES ───────────────────────────────────────────────────────────

const initialBaseline: BaselineResults = {
  pushups: null,
  squats: null,
  bench: null,
  squat: null,
  deadlift: null,
};

const defaultPreferences: UserPreferences = {
  unitSystem: 'kg',
  defaultRestSeconds: 90,
  cameraDefaultOn: false,
  audioCuesEnabled: true,
  hapticsEnabled: true,
  workoutRemindersEnabled: true,
  recoveryAlertsEnabled: true,
};

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await storageAdapter.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await storageAdapter.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await storageAdapter.removeItem(key);
  },
};

// ─── STORE IMPLEMENTATION ─────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      goal: null,
      trainingLevel: null,
      equipment: [],
      injuryFlags: [],
      baselineResults: { ...initialBaseline },
      guestMode: false,
      user: null,
      profile: null,
      preferences: { ...defaultPreferences },
      _hasHydrated: false,

      setGoal: (goal) => set({ goal }),

      setTrainingLevel: (trainingLevel) => set({ trainingLevel }),

      toggleEquipment: (item) =>
        set((s) => {
          const isSelected = s.equipment.includes(item);
          const newEquipment = isSelected
            ? s.equipment.filter((e) => e !== item)
            : [...s.equipment, item];
          return { equipment: newEquipment };
        }),

      setEquipment: (equipment) => set({ equipment }),

      toggleInjury: (item) =>
        set((s) => {
          const isSelected = s.injuryFlags.includes(item);
          const newInjuries = isSelected
            ? s.injuryFlags.filter((i) => i !== item)
            : [...s.injuryFlags, item];
          return { injuryFlags: newInjuries };
        }),

      setInjuryFlags: (injuryFlags) => set({ injuryFlags }),

      setBaseline: (results) =>
        set((s) => ({
          baselineResults: { ...s.baselineResults, ...results },
        })),

      completeOnboarding: (asGuest, userProfile) =>
        set({
          onboardingComplete: true,
          guestMode: asGuest,
          user: userProfile,
          profile: userProfile,
        }),

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          goal: null,
          trainingLevel: null,
          equipment: [],
          injuryFlags: [],
          baselineResults: { ...initialBaseline },
          guestMode: false,
          user: null,
          profile: null,
        }),

      updatePreferences: (prefs) =>
        set((s) => ({
          preferences: { ...s.preferences, ...prefs },
        })),
    }),
    {
      name: 'heuristic-user-store',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
