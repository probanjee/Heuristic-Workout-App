/**
 * HeuristicAI — useOTPAuth Custom Hook
 * Handles sending and verifying Email OTP/Magic Links with cooldown timers.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AuthService from '../services/auth/auth-service';

export function useOTPAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendLink = async (email: string) => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      await AuthService.sendMagicLink(email);
      setCooldown(60); // 60 seconds resend cooldown
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send verification link';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const verifyLink = async (email: string, link: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.verifyMagicLink(email, link);
      router.replace('/(tabs)/workout');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to verify OTP link';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendLink,
    verifyLink,
    loading,
    error,
    cooldown,
    canResend: cooldown === 0,
  };
}

export default useOTPAuth;
