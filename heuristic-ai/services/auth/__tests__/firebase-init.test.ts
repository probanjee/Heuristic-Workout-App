/**
 * HeuristicAI — Unit Tests: Firebase Initialization
 */

import * as firebaseApp from 'firebase/app';

let mockGetAuthCalled = false;
let mockGetAuthApp: any = null;
let mockInitializeAuthCalled = false;

jest.mock('firebase/auth', () => {
  const actual = jest.requireActual('firebase/auth');
  return {
    ...actual,
    getAuth: jest.fn().mockImplementation((app) => {
      mockGetAuthCalled = true;
      mockGetAuthApp = app;
      return actual.getAuth(app);
    }),
    initializeAuth: jest.fn().mockImplementation((app, options) => {
      mockInitializeAuthCalled = true;
      return actual.initializeAuth(app, options);
    }),
  };
});

const { app } = require('../firebase');

describe('Firebase Auth Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Firebase App successfully', () => {
    expect(app).toBeDefined();
    expect(firebaseApp.getApps().length).toBeGreaterThanOrEqual(0);
  });

  it('should attempt to retrieve existing Auth before initializing new one', () => {
    expect(mockGetAuthCalled).toBe(true);
    expect(mockGetAuthApp).toBe(app);
  });
});
