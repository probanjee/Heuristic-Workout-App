/**
 * HeuristicAI — Email OTP / Magic Link Authentication
 * Manages passwordless verification links
 */

import { sendSignInLinkToEmail, signInWithEmailLink, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

const actionCodeSettings = {
  url: 'https://heuristic-ai.web.app/auth/login', // Fallback web URL
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.heuristic.ai',
  },
  android: {
    packageName: 'com.heuristic.ai',
    installApp: true,
    minimumVersion: '12',
  },
  dynamicLinkDomain: 'heuristicai.page.link',
};

export async function sendMagicLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export async function verifyMagicLink(email: string, link: string): Promise<UserCredential> {
  if (!signInWithEmailLink(auth, link)) {
    throw new Error('Invalid or expired Magic Link');
  }
  return await signInWithEmailLink(auth, email, link);
}
