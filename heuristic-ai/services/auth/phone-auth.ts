/**
 * HeuristicAI — Phone OTP Authentication
 * Handles phone SMS code requests and verification
 */

import { signInWithPhoneNumber, ApplicationVerifier, ConfirmationResult, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

export async function sendPhoneCode(
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> {
  return await confirmationResult.confirm(code);
}
