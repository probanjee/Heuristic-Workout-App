/**
 * HeuristicAI — AuthService Unit Tests
 * Location: services/auth/__tests__/auth-service.test.ts
 */

import AuthService from '../auth-service';
import { storageAdapter } from '../../storage/storage-adapter';

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] || null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value.toString();
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
});

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock-supabase.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain';
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'mock-project-id';

// Mock sync-engine to prevent un-awaited background sync processes during auth tests
jest.mock('../../sync/sync-engine', () => ({
  syncEngine: {
    processQueue: jest.fn().mockResolvedValue(undefined),
    pullData: jest.fn().mockResolvedValue(undefined),
  },
}));

// ─── FIREBASE MOCKS ──────────────────────────────────────────────────────────

const mockUser = {
  uid: 'firebase-test-uid-123',
  email: 'test@example.com',
  displayName: 'Test Athlete',
  isAnonymous: false,
  getIdToken: jest.fn().mockResolvedValue('firebase-test-id-token-abc'),
  providerData: [{ providerId: 'password' }],
};

const mockAnonymousUser = {
  uid: 'firebase-anon-uid-456',
  email: null,
  displayName: null,
  isAnonymous: true,
  getIdToken: jest.fn().mockResolvedValue('firebase-anon-id-token-xyz'),
  providerData: [],
};

// Mock Firebase SDK
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => {
  const currentMockUser = { val: null as any };
  return {
    initializeAuth: jest.fn(() => ({
      get currentUser() {
        return currentMockUser.val;
      },
      set currentUser(v) {
        currentMockUser.val = v;
      },
    })),
    signInWithEmailAndPassword: jest.fn(async (_auth, email, _password) => {
      currentMockUser.val = { ...mockUser, email };
      return { user: currentMockUser.val };
    }),
    createUserWithEmailAndPassword: jest.fn(async (_auth, email, _password) => {
      currentMockUser.val = { ...mockUser, email };
      return { user: currentMockUser.val };
    }),
    sendPasswordResetEmail: jest.fn(async () => {}),
    signInWithCredential: jest.fn(async () => {
      currentMockUser.val = { ...mockUser, providerData: [{ providerId: 'google.com' }] };
      return { user: currentMockUser.val };
    }),
    GoogleAuthProvider: {
      credential: jest.fn((token) => ({ providerId: 'google.com', token })),
    },
    EmailAuthProvider: {
      credential: jest.fn((email, password) => ({ providerId: 'password', email, password })),
    },
    sendSignInLinkToEmail: jest.fn(async () => {}),
    signInWithEmailLink: jest.fn(async () => {
      currentMockUser.val = mockUser;
      return { user: currentMockUser.val };
    }),
    signInWithPhoneNumber: jest.fn(async () => ({
      confirm: jest.fn(async () => {
        currentMockUser.val = { ...mockUser, providerData: [{ providerId: 'phone' }] };
        return { user: currentMockUser.val };
      }),
    })),
    PhoneAuthProvider: {
      credential: jest.fn((id, code) => ({ providerId: 'phone', id, code })),
    },
    signInAnonymously: jest.fn(async () => {
      currentMockUser.val = mockAnonymousUser;
      return { user: currentMockUser.val };
    }),
    linkWithCredential: jest.fn(async (user, credential) => {
      const providerId = credential.providerId || 'password';
      const email = credential.email || (providerId === 'password' ? 'test@example.com' : null);
      currentMockUser.val = {
        ...user,
        isAnonymous: false,
        email: email || user.email,
        providerData: [{ providerId }],
      };
      return { user: currentMockUser.val };
    }),
    signOut: jest.fn(async () => {
      currentMockUser.val = null;
    }),
    onIdTokenChanged: jest.fn((_auth, callback) => {
      // Return unloader
      return () => {};
    }),
  };
});

// ─── WATERMELONDB MOCKS ────────────────────────────────────────────────────────

const mockUserRecord = {
  id: 'local-user-id-789',
  firebaseUid: null as string | null,
  displayName: 'Athlete',
  update: jest.fn(async (callback) => {
    const record = { firebaseUid: null as string | null, displayName: 'Athlete' };
    callback(record);
    mockUserRecord.firebaseUid = record.firebaseUid;
    mockUserRecord.displayName = record.displayName;
  }),
};

const mockFetchQuery = jest.fn().mockResolvedValue([mockUserRecord]);

jest.mock('../../../database', () => ({
  database: {
    write: jest.fn(async (callback) => {
      return await callback();
    }),
  },
  usersCollection: {
    query: jest.fn(() => ({
      fetch: mockFetchQuery,
    })),
    create: jest.fn(async (callback) => {
      const record = { firebaseUid: '', displayName: '', goal: '', trainingLevel: '', _equipment: '', _injuryFlags: '', createdAt: new Date(), syncedAt: null };
      callback(record);
      return { id: 'created-user-id' };
    }),
  },
}));

// ─── JEST TEST SUITE ──────────────────────────────────────────────────────────

describe('AuthService Integration Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AuthService.auth as any).currentUser = null;
    mockUserRecord.firebaseUid = null;
    mockUserRecord.displayName = 'Athlete';
    mockFetchQuery.mockResolvedValue([mockUserRecord]);
  });

  describe('Email & Password authentication flows', () => {
    it('registers user and updates currentUser profile state', async () => {
      const cred = await AuthService.signUpWithEmail('signup@example.com', 'securepass123');
      expect(cred.user.email).toBe('signup@example.com');
      expect(AuthService.auth.currentUser).not.toBeNull();
    });

    it('authenticates existing user credentials', async () => {
      const cred = await AuthService.loginWithEmail('login@example.com', 'securepass123');
      expect(cred.user.email).toBe('login@example.com');
      expect(AuthService.auth.currentUser).not.toBeNull();
    });

    it('sends password reset emails', async () => {
      await expect(AuthService.sendPasswordReset('forgot@example.com')).resolves.not.toThrow();
    });
  });

  describe('Google OAuth login flows', () => {
    it('authenticates user session with raw OAuth tokens', async () => {
      const cred = await AuthService.loginWithGoogle('mock-id-token');
      expect(cred.user.providerData[0].providerId).toBe('google.com');
      expect(AuthService.auth.currentUser).not.toBeNull();
    });
  });

  describe('Email Magic Link (OTP) flows', () => {
    it('sends Magic Links to specified email addresses', async () => {
      await expect(AuthService.sendMagicLink('otp@example.com')).resolves.not.toThrow();
    });

    it('verifies Magic Links and sets active user sessions', async () => {
      const cred = await AuthService.verifyMagicLink('otp@example.com', 'https://mock.link/auth');
      expect(cred.user.uid).toBe('firebase-test-uid-123');
    });
  });

  describe('Phone OTP (SMS) flows', () => {
    it('sends SMS and confirms 6-digit codes', async () => {
      const confirmationResult = await AuthService.sendPhoneCode('+15555550199', {} as any);
      expect(confirmationResult.confirm).toBeDefined();

      const cred = await confirmationResult.confirm('123456');
      expect(cred.user.providerData[0].providerId).toBe('phone');
    });
  });

  describe('Anonymous Guest flow', () => {
    it('registers an anonymous guest user', async () => {
      const cred = await AuthService.loginAsGuest();
      expect(cred.user.isAnonymous).toBe(true);
      expect(AuthService.auth.currentUser?.isAnonymous).toBe(true);
    });
  });

  describe('Guest Account Upgrade flows', () => {
    it('upgrades guest session with Email Credentials and updates WatermelonDB profile keys', async () => {
      // 1. Sign in anonymously
      await AuthService.loginAsGuest();
      expect(AuthService.auth.currentUser?.isAnonymous).toBe(true);

      // 2. Link Email
      const upgradeCred = await AuthService.linkGuestWithEmail('upgraded@example.com', 'securepass123');
      expect(upgradeCred.user.isAnonymous).toBe(false);
      expect(upgradeCred.user.email).toBe('upgraded@example.com');

      // 3. Verify Local SQLite was updated via rewrite transaction
      expect(mockUserRecord.firebaseUid).toBe('firebase-anon-uid-456');
      expect(mockUserRecord.displayName).toBe('upgraded');
    });

    it('upgrades guest session with Google ID tokens', async () => {
      await AuthService.loginAsGuest();
      await AuthService.linkGuestWithGoogle('mock-google-id-token');
      expect(AuthService.auth.currentUser?.isAnonymous).toBe(false);
      expect(mockUserRecord.firebaseUid).toBe('firebase-anon-uid-456');
    });

    it('upgrades guest session with Phone SMS codes', async () => {
      await AuthService.loginAsGuest();
      await AuthService.linkGuestWithPhone('mock-verification-id', '123456');
      expect(AuthService.auth.currentUser?.isAnonymous).toBe(false);
      expect(mockUserRecord.firebaseUid).toBe('firebase-anon-uid-456');
    });
  });

  describe('Session recovery and cache logic', () => {
    it('updates SecureStore cache on token refresh operations', async () => {
      // Sign in user
      await AuthService.loginWithEmail('cache@example.com', 'pass123');
      
      const refreshedToken = await AuthService.forceTokenRefresh();
      expect(refreshedToken).toBe('firebase-test-id-token-abc');

      const cachedToken = await storageAdapter.getItem('firebase_id_token');
      expect(cachedToken).toBe('firebase-test-id-token-abc');
    });

    it('clears credentials cache on logout session terminations', async () => {
      await AuthService.loginWithEmail('cache@example.com', 'pass123');
      
      // Force cache save manually in test
      await storageAdapter.setItem('firebase_id_token', 'cached-jwt');
      
      await AuthService.terminateSession();
      
      const cachedToken = await storageAdapter.getItem('firebase_id_token');
      expect(cachedToken).toBeNull();
    });
  });
});
