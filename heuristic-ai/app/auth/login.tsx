/**
 * HeuristicAI — Sign In Screen Route
 * Location: app/auth/login.tsx
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import { EmailLoginForm } from '../../components/auth/EmailLoginForm';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { AuthMethodCard } from '../../components/auth/AuthMethodCard';
import { GuestModeCard } from '../../components/auth/GuestModeCard';
import AuthService from '../../services/auth/auth-service';
import useAuth from '../../hooks/useAuth';
import useGoogleAuth from '../../hooks/useGoogleAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const [activeTab, setActiveTab] = useState<'email' | 'other'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.loginWithEmail(email, password);
      router.replace('/(tabs)/workout');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login credentials invalid';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // In a mock environment we provide a dummy token
      await signInWithGoogle('google-mock-id-token');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      setError(msg.toUpperCase());
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const cred = await AuthService.loginAsGuest();
      // Onboarding complete updates are handles inside useAuth hook automatically
      router.replace('/(tabs)/workout');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Guest login initialization failed';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[8] }}>
        
        {/* Header Title */}
        <View style={{ marginVertical: spacing[6] }}>
          <Text style={{ ...typography.scale.h1, color: colors.text.primary, letterSpacing: -0.5 }}>
            HEURISTICAI
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.accent.primary, marginTop: 4 }}>
            VERIFY USER SESSION IDENTITY
          </Text>
        </View>

        {/* Global Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>[ERROR] {error}</Text>
          </View>
        )}

        {/* Tab Selectors */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'email' && styles.tabButtonActive]}
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
              EMAIL/PASS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'other' && styles.tabButtonActive]}
            onPress={() => setActiveTab('other')}
          >
            <Text style={[styles.tabText, activeTab === 'other' && styles.tabTextActive]}>
              OTP & GUEST
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'email' ? (
          <View style={{ gap: spacing[4] }}>
            <EmailLoginForm
              onSubmit={handleEmailLogin}
              loading={loading}
              onForgotPasswordPress={() => router.push('/auth/forgot-password')}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleButton onPress={handleGoogleLogin} loading={googleLoading} />

            <View style={{ alignItems: 'center', marginTop: spacing[2] }}>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={{ color: colors.text.secondary, textDecorationLine: 'underline', fontSize: 13 }}>
                  NEW ATHLETE? CREATE ACCOUNT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <AuthMethodCard
              title="SMS Code Login"
              description="Sign in using your mobile number and SMS OTP code"
              onPress={() => router.push('/auth/phone-otp')}
              accentColor={colors.warning}
            />

            <AuthMethodCard
              title="Magic Email Link"
              description="Passwordless sign-in link dispatched to your inbox"
              onPress={() => router.push('/auth/email-otp')}
              accentColor={colors.info}
            />

            <GuestModeCard onPressGuest={handleGuestLogin} loading={loading} />
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.border.default,
    marginBottom: spacing[6],
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent.primary,
  },
  tabText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.text.muted,
  },
  tabTextActive: {
    color: colors.accent.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    marginHorizontal: spacing[3],
    color: colors.text.muted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
});
