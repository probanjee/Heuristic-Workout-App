/**
 * HeuristicAI — useGoogleAuth Custom Hook
 * Handles loading, errors, and logins for Google Sign-In and credential linking.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import AuthService from '../services/auth/auth-service';

export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.loginWithGoogle(idToken);
      router.replace('/(tabs)/workout');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google authentication failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const linkGoogleAccount = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.linkGuestWithGoogle(idToken);
      router.replace('/(tabs)/profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to link Google account';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    linkGoogleAccount,
    loading,
    error,
  };
}

export default useGoogleAuth;
