/**
 * HeuristicAI — Unified Authentication Service
 * Serves as the primary entry point for all authentication methods.
 */

import { auth } from './firebase';
import { signUpWithEmail, loginWithEmail, sendPasswordReset } from './email-auth';
import { loginWithGoogle } from './google-auth';
import { sendMagicLink, verifyMagicLink } from './otp-auth';
import { sendPhoneCode, verifyPhoneCode } from './phone-auth';
import { loginAsGuest } from './guest-auth';
import { linkGuestWithEmail, linkGuestWithGoogle, linkGuestWithPhone, updateLocalDatabaseUid } from './account-linking';
import {
  startSessionListener,
  getCachedIdToken,
  getCachedUserInfo,
  terminateSession,
  forceTokenRefresh,
} from './session-manager';

export const AuthService = {
  auth,
  
  // Email Auth
  signUpWithEmail,
  loginWithEmail,
  sendPasswordReset,

  // Google Auth
  loginWithGoogle,

  // Email Magic Link OTP Auth
  sendMagicLink,
  verifyMagicLink,

  // Phone OTP Auth
  sendPhoneCode,
  verifyPhoneCode,

  // Guest Auth
  loginAsGuest,

  // Account Linking
  linkGuestWithEmail,
  linkGuestWithGoogle,
  linkGuestWithPhone,
  updateLocalDatabaseUid,

  // Session Manager
  startSessionListener,
  getCachedIdToken,
  getCachedUserInfo,
  terminateSession,
  forceTokenRefresh,
};

export default AuthService;
