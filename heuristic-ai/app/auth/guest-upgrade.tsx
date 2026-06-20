/**
 * HeuristicAI — Guest Upgrade Screen Route
 * Location: app/auth/guest-upgrade.tsx
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import AuthService from '../../services/auth/auth-service';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import usePhoneAuth from '../../hooks/usePhoneAuth';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { PhoneLoginForm } from '../../components/auth/PhoneLoginForm';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: colors.danger, fontFamily: 'Syne_700Bold', fontSize: 18, marginBottom: 10 }}>[SYSTEM ERROR]</Text>
      <Text style={{ color: colors.text.secondary, fontFamily: 'IBMPlexSans_400Regular', textAlign: 'center', marginBottom: 20 }}>{error.message}</Text>
      <TouchableOpacity onPress={retry} style={{ backgroundColor: colors.accent.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 4 }}>
        <Text style={{ color: colors.bg.primary, fontFamily: 'Syne_700Bold' }}>RETRY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function GuestUpgradeScreen() {
  const router = useRouter();
  const { linkGoogleAccount, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { sendSMSCode, upgradeGuestPhone, loading: phoneLoading, error: phoneError, codeSent, cooldown } = usePhoneAuth();

  const [activeMethod, setActiveMethod] = useState<'email' | 'google' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailUpgrade = async () => {
    setError(null);
    if (!email || !password) {
      setError('ALL FIELDS ARE REQUIRED');
      return;
    }
    if (!email.includes('@')) {
      setError('INVALID EMAIL FORMAT');
      return;
    }
    if (password.length < 6) {
      setError('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    setLoading(true);
    try {
      await AuthService.linkGuestWithEmail(email.trim(), password);
      // Link updates local database automatically
      router.replace('/(tabs)/profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to link email account';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUpgrade = async () => {
    setError(null);
    try {
      await linkGoogleAccount('google-mock-id-token');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to link Google account';
      setError(msg.toUpperCase());
    }
  };

  const handleSendPhoneCode = async (fullPhoneNumber: string) => {
    setError(null);
    try {
      const recaptchaVerifier = {
        type: 'recaptcha',
        verify: async () => 'mock-recaptcha-token',
      } as any;
      await sendSMSCode(fullPhoneNumber, recaptchaVerifier);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send SMS verification code';
      setError(msg.toUpperCase());
    }
  };

  const handleVerifyPhoneCode = async (code: string) => {
    setError(null);
    try {
      await upgradeGuestPhone(code);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to verify OTP code';
      setError(msg.toUpperCase());
    }
  };

  const combinedError = error || googleError || phoneError;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO PROFILE</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.text.primary }}>
            UPGRADE PROFILE
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.warning, marginTop: 4 }}>
            LINK A PERMANENT CREDENTIAL TO SECURE TRAINING HISTORY
          </Text>
        </View>

        {combinedError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>[ERROR] {combinedError}</Text>
          </View>
        )}

        {/* Method Selectors */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeMethod === 'email' && styles.tabBtnActive]}
            onPress={() => setActiveMethod('email')}
          >
            <Text style={[styles.tabBtnText, activeMethod === 'email' && styles.tabBtnTextActive]}>EMAIL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeMethod === 'google' && styles.tabBtnActive]}
            onPress={() => setActiveMethod('google')}
          >
            <Text style={[styles.tabBtnText, activeMethod === 'google' && styles.tabBtnTextActive]}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeMethod === 'phone' && styles.tabBtnActive]}
            onPress={() => setActiveMethod('phone')}
          >
            <Text style={[styles.tabBtnText, activeMethod === 'phone' && styles.tabBtnTextActive]}>PHONE</Text>
          </TouchableOpacity>
        </View>

        {activeMethod === 'email' && (
          <View style={{ gap: spacing[4] }}>
            <View>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ENTER EMAIL"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
            <View>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="CREATE PASSWORD"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              onPress={handleEmailUpgrade}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg.primary} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>LINK EMAIL ACCOUNT</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeMethod === 'google' && (
          <View style={{ marginTop: spacing[4] }}>
            <GoogleButton
              onPress={handleGoogleUpgrade}
              loading={googleLoading}
              text="LINK GOOGLE ACCOUNT"
            />
          </View>
        )}

        {activeMethod === 'phone' && (
          <View style={{ marginTop: spacing[2] }}>
            <PhoneLoginForm
              onSendCode={handleSendPhoneCode}
              onVerifyCode={handleVerifyPhoneCode}
              loading={phoneLoading}
              codeSent={codeSent}
              cooldown={cooldown}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 59, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 4,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.danger,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    padding: 4,
    marginBottom: spacing[6],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 2,
  },
  tabBtnActive: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tabBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
  },
  tabBtnTextActive: {
    color: colors.accent.primary,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    padding: spacing[3],
    color: colors.text.primary,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[3],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  submitBtnText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 14,
    color: colors.bg.primary,
    letterSpacing: 1,
  },
});
