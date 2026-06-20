/**
 * HeuristicAI — Firebase Initializer
 * Initializes Firebase App and Authentication with a custom SecureStore persistence layer.
 * Source of truth: TRD.md § 8.1, PRD.md § 5.9
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  Persistence, 
  Auth,
  getAuth, 
  browserLocalPersistence, 
  browserSessionPersistence
} from 'firebase/auth';
import { env } from '../../lib/env';
import { storageAdapter } from '../storage/storage-adapter';

const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const isWeb = typeof window !== 'undefined' || (!isTest && typeof require !== 'undefined' && require('react-native').Platform.OS === 'web');

// Firebase configuration: Web/Test uses environment variables, Native uses google-services.json
let firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

if (isWeb || isTest) {
  firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
  };
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleServices = require('../../google-services.json');
    const client = googleServices.client?.[0];
    firebaseConfig = {
      apiKey: client?.api_key?.[0]?.current_key || env.FIREBASE_API_KEY,
      authDomain: googleServices.project_info?.project_id
        ? `${googleServices.project_info.project_id}.firebaseapp.com`
        : env.FIREBASE_AUTH_DOMAIN,
      projectId: googleServices.project_info?.project_id || env.FIREBASE_PROJECT_ID,
      storageBucket: googleServices.project_info?.storage_bucket || env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: googleServices.project_info?.project_number || env.FIREBASE_MESSAGING_SENDER_ID,
      appId: client?.client_info?.mobilesdk_app_id || env.FIREBASE_APP_ID,
    };
  } catch (error) {
    firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    };
  }
}

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch {
  if (isWeb || isTest) {
    authInstance = initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence],
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('firebase/auth');
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(storageAdapter),
    });
  }
}

export const auth = authInstance;
