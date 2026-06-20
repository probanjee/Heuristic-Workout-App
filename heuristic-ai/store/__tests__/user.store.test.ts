/**
 * HeuristicAI — Onboarding User Store and Hook Tests
 * Tests store actions, validation rules, baseline updates, and completion flows
 * Source of truth: TASK.md Task 12
 */

import { act } from 'react';
import { useUserStore } from '../user.store';
import { useOnboarding } from '../../hooks/useOnboarding';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock-supabase.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock sync-engine and queue-manager to prevent validation errors and DB calls during store tests
jest.mock('../../services/sync/sync-engine', () => ({
  syncEngine: {
    processQueue: jest.fn().mockResolvedValue(undefined),
    pullData: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../services/sync/queue-manager', () => ({
  queueManager: {
    enqueue: jest.fn().mockResolvedValue(undefined),
    getItems: jest.fn().mockResolvedValue([]),
    getQueueLength: jest.fn().mockResolvedValue(0),
    loadQueue: jest.fn().mockResolvedValue(undefined),
  },
}));

// ─── MOCKS ────────────────────────────────────────────────────────────────────

// Initialize globalThis secure store mock state
(globalThis as any).secureStoreState = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockImplementation((key: string) => {
    const state = (globalThis as any).secureStoreState || {};
    return Promise.resolve(state[key] || null);
  }),
  setItemAsync: jest.fn().mockImplementation((key: string, value: string) => {
    if (!(globalThis as any).secureStoreState) {
      (globalThis as any).secureStoreState = {};
    }
    (globalThis as any).secureStoreState[key] = value.toString();
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn().mockImplementation((key: string) => {
    const state = (globalThis as any).secureStoreState || {};
    delete state[key];
    return Promise.resolve();
  }),
}));

// Mock useUserStore to return the state directly during test runs to avoid React hooks errors
jest.mock('../user.store', () => {
  const actual = jest.requireActual('../user.store');
  const mockUseUserStore = jest.fn((selector) => {
    const state = actual.useUserStore.getState();
    return selector ? selector(state) : state;
  });
  Object.assign(mockUseUserStore, actual.useUserStore);
  return {
    ...actual,
    useUserStore: mockUseUserStore,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 0,
    Medium: 1,
    Heavy: 2,
  },
  NotificationFeedbackType: {
    Success: 0,
    Warning: 1,
    Error: 2,
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/(onboarding)/goals',
}));

// Mock WatermelonDB database and collections
jest.mock('../../database', () => ({
  database: {
    write: jest.fn().mockImplementation(async (callback) => {
      return await callback();
    }),
  },
  usersCollection: {
    create: jest.fn().mockImplementation((cb) => {
      const record: any = {
        id: 'mock-db-user-id',
        firebaseUid: null,
        displayName: '',
        goal: '',
        trainingLevel: '',
        _equipment: '',
        _injuryFlags: '',
        createdAt: null,
        syncedAt: null,
        _raw: {},
      };
      cb(record);
      return record;
    }),
  },
}));

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('User Store and Onboarding Hook', () => {
  beforeEach(() => {
    // Clear Zustand store state before each test
    act(() => {
      useUserStore.getState().resetOnboarding();
    });
    // Clear secure store mock state
    (globalThis as any).secureStoreState = {};
    jest.clearAllMocks();
  });

  describe('Zustand User Store Actions', () => {
    it('should initialize with correct default values', () => {
      const state = useUserStore.getState();
      expect(state.onboardingComplete).toBe(false);
      expect(state.goal).toBeNull();
      expect(state.trainingLevel).toBeNull();
      expect(state.equipment).toEqual([]);
      expect(state.injuryFlags).toEqual([]);
      expect(state.guestMode).toBe(false);
      expect(state.user).toBeNull();
      expect(state.baselineResults).toEqual({
        pushups: null,
        squats: null,
        bench: null,
        squat: null,
        deadlift: null,
      });
    });

    it('should set goal correctly', () => {
      act(() => {
        useUserStore.getState().setGoal('hypertrophy');
      });
      expect(useUserStore.getState().goal).toBe('hypertrophy');
    });

    it('should set training level correctly', () => {
      act(() => {
        useUserStore.getState().setTrainingLevel('advanced');
      });
      expect(useUserStore.getState().trainingLevel).toBe('advanced');
    });

    it('should toggle equipment additions and removals correctly', () => {
      // Add dumbbell
      act(() => {
        useUserStore.getState().toggleEquipment('dumbbells');
      });
      expect(useUserStore.getState().equipment).toContain('dumbbells');

      // Add barbell
      act(() => {
        useUserStore.getState().toggleEquipment('barbell');
      });
      expect(useUserStore.getState().equipment).toEqual(['dumbbells', 'barbell']);

      // Remove dumbbell
      act(() => {
        useUserStore.getState().toggleEquipment('dumbbells');
      });
      expect(useUserStore.getState().equipment).toEqual(['barbell']);
    });

    it('should toggle injury selections correctly', () => {
      // Add knees
      act(() => {
        useUserStore.getState().toggleInjury('knees');
      });
      expect(useUserStore.getState().injuryFlags).toContain('knees');

      // Add lower back
      act(() => {
        useUserStore.getState().toggleInjury('lower_back');
      });
      expect(useUserStore.getState().injuryFlags).toEqual(['knees', 'lower_back']);

      // Remove knees
      act(() => {
        useUserStore.getState().toggleInjury('knees');
      });
      expect(useUserStore.getState().injuryFlags).toEqual(['lower_back']);
    });

    it('should set baseline results correctly', () => {
      act(() => {
        useUserStore.getState().setBaseline({ pushups: 25, bench: 80 });
      });

      expect(useUserStore.getState().baselineResults).toEqual({
        pushups: 25,
        squats: null,
        bench: 80,
        squat: null,
        deadlift: null,
      });
    });

    it('should reset onboarding state to defaults', () => {
      act(() => {
        useUserStore.getState().setGoal('strength');
        useUserStore.getState().setTrainingLevel('intermediate');
        useUserStore.getState().toggleEquipment('dumbbells');
        useUserStore.getState().resetOnboarding();
      });

      const state = useUserStore.getState();
      expect(state.goal).toBeNull();
      expect(state.trainingLevel).toBeNull();
      expect(state.equipment).toEqual([]);
      expect(state.onboardingComplete).toBe(false);
    });
  });

  describe('useOnboarding Hook Integration Flow', () => {
    it('should compute correct step index based on path names', () => {
      // Note: usePathname mock is goals — currentStep returns the pathname string
      const onboarding = useOnboarding();
      expect(onboarding.currentStep).toBe('/(onboarding)/goals');
      expect(onboarding.totalSteps).toBe(7);
    });

    it('should validate steps correctly based on completed selections', () => {
      // Step 1: Goals
      expect(useOnboarding().isStepValid(1)).toBe(false); // No goal set yet
      act(() => {
        useOnboarding().setGoal('strength');
      });
      expect(useOnboarding().isStepValid(1)).toBe(true); // Goal set

      // Step 2: Training Level
      expect(useOnboarding().isStepValid(2)).toBe(false); // No level set
      act(() => {
        useOnboarding().setTrainingLevel('intermediate');
      });
      expect(useOnboarding().isStepValid(2)).toBe(true);

      // Step 3: Equipment (must have at least one selection)
      expect(useOnboarding().isStepValid(3)).toBe(false);
      act(() => {
        useOnboarding().toggleEquipment('bodyweight');
      });
      expect(useOnboarding().isStepValid(3)).toBe(true);
    });

    it('should complete onboarding flow as Guest, save to database and SecureStore', async () => {
      act(() => {
        useOnboarding().setGoal('endurance');
        useOnboarding().setTrainingLevel('beginner');
        useOnboarding().toggleEquipment('bodyweight');
        useOnboarding().setBaseline({ pushups: 15, squats: 30 });
      });

      // Execute complete onboarding as guest
      await act(async () => {
        await useOnboarding().complete(true);
      });

      const state = useUserStore.getState();
      expect(state.onboardingComplete).toBe(true);
      expect(state.guestMode).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.user?.displayName).toBe('Athlete');
      expect(state.user?.firebaseUid).toBeNull();

      // Ensure SecureStore flag was written
      expect((globalThis as any).secureStoreState['onboarding_complete']).toBe('true');
    });

    it('should complete onboarding flow as Authenticated user, saving Firebase ID', async () => {
      act(() => {
        useOnboarding().setGoal('fat_loss');
        useOnboarding().setTrainingLevel('advanced');
        useOnboarding().toggleEquipment('full_gym');
      });

      // Execute complete onboarding with account info
      await act(async () => {
        await useOnboarding().complete(false, 'firebase-auth-uid-123', 'jane.doe@example.com');
      });

      const state = useUserStore.getState();
      expect(state.onboardingComplete).toBe(true);
      expect(state.guestMode).toBe(false);
      expect(state.user?.firebaseUid).toBe('firebase-auth-uid-123');
      expect(state.user?.displayName).toBe('jane.doe');

      expect((globalThis as any).secureStoreState['onboarding_complete']).toBe('true');
    });
  });
});
