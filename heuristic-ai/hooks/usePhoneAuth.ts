/**
 * HeuristicAI — usePhoneAuth Custom Hook
 * Manages phone SMS verification flows, OTP input, resend timers, and guest upgrades.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ApplicationVerifier, ConfirmationResult } from 'firebase/auth';
import AuthService from '../services/auth/auth-service';

export function usePhoneAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendSMSCode = async (phoneNumber: string, verifier: ApplicationVerifier) => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await AuthService.sendPhoneCode(phoneNumber, verifier);
      setConfirmationResult(result);
      setCooldown(60); // 60 seconds cooldown for SMS
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send SMS verification code';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const verifySMSCode = async (code: string) => {
    if (!confirmationResult) {
      setError('No pending verification confirmation found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.verifyPhoneCode(confirmationResult, code);
      router.replace('/(tabs)/workout');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Verification code is invalid or expired';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const upgradeGuestPhone = async (code: string) => {
    if (!confirmationResult) {
      setError('No pending verification confirmation found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.linkGuestWithPhone(confirmationResult.verificationId, code);
      router.replace('/(tabs)/profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upgrade linkage failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendSMSCode,
    verifySMSCode,
    upgradeGuestPhone,
    loading,
    error,
    cooldown,
    canResend: cooldown === 0,
    codeSent: !!confirmationResult,
    confirmationResult,
  };
}

export default usePhoneAuth;
