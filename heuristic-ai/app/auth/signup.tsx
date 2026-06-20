/**
 * HeuristicAI — Create Account Screen Route
 * Location: app/auth/signup.tsx
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import AuthService from '../../services/auth/auth-service';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (!email || !password || !confirmPassword) {
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
    if (password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }

    setLoading(true);
    try {
      await AuthService.signUpWithEmail(email.trim(), password);
      // SignUp state change will trigger onAuthStateChanged redirect
      router.replace('/(onboarding)/welcome');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        {/* Go back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO LOGIN</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.text.primary }}>
            CREATE ATHLETE PROFILE
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.accent.primary, marginTop: 4 }}>
            REGISTER A NEW ACCOUNT UNDER EMAIL IDENTITY
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>[ERROR] {error}</Text>
          </View>
        )}

        <View style={{ gap: spacing[4] }}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <View>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="RE-ENTER PASSWORD"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>REGISTER & ONBOARD</Text>
            )}
          </TouchableOpacity>
        </View>

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
