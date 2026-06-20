/**
 * HeuristicAI — Onboarding: Account Screen (Step 7 of 7)
 * Save progress via Supabase Auth or continue in local Guest Mode
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 9, UI_UX_BRIEF.md
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { signUp } from '@/lib/auth';
import { colors, spacing } from '@/constants/theme';

export default function AccountScreen() {
  const router = useRouter();
  const { complete, totalSteps } = useOnboarding();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field validation
  const validateForm = () => {
    if (!email) {
      setErrorMessage('Email is required.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setErrorMessage(error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (data && data.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Complete onboarding with Supabase ID
        await complete(false, data.user.id, email);
      } else {
        // Fallback if no error but user is null
        setErrorMessage('Verification email sent or account created.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await complete(false, 'temp-user-id', email);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during signup.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    // Mock Google Sign-in flow for simulator/MVP
    setTimeout(async () => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await complete(false, 'google-oauth-mock-id', 'google.user@gmail.com');
    }, 1200);
  };

  const handleGuestMode = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await complete(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          {/* Top Back Nav */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back to previous screen"
            accessibilityRole="button"
          >
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>

          {/* Onboarding Header */}
          <OnboardingHeader
            currentStep={getCurrentStepIndex()}
            totalSteps={totalSteps}
            title="Save your progress"
            subtitle="Create an account to backup your workouts, sync metrics across devices, and unlock full cloud coaching features."
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View entering={FadeInRight.delay(50).duration(400)}>
              {/* Form Card */}
              <View style={styles.formCard}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="athlete@example.com"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    accessibilityLabel="Email input field"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Password input field"
                  />
                </View>

                {/* Submit Email Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={loading}
                  accessibilityLabel="Create HeuristicAI account"
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Dividers */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Button */}
              <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={loading}
                accessibilityLabel="Sign up with Google"
                accessibilityRole="button"
              >
                <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
              </TouchableOpacity>

              {/* Guest CTA */}
              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestMode}
                disabled={loading}
                accessibilityLabel="Continue as guest without saving account"
                accessibilityRole="button"
              >
                <Text style={styles.guestButtonText}>SKIP — I'LL TRAIN AS A GUEST</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getCurrentStepIndex() {
  return 6;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  backButton: {
    marginBottom: spacing[4],
  },
  backText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  formCard: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  errorText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 12,
    color: colors.danger,
    marginBottom: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  textInput: {
    height: 48,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    color: colors.text.primary,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 15,
    paddingHorizontal: spacing[3],
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  primaryButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.text.muted,
    paddingHorizontal: spacing[3],
  },
  googleButton: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  googleButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.primary,
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },
  guestButtonText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.text.muted,
    textDecorationLine: 'underline',
  },
});
