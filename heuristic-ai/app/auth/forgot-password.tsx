/**
 * HeuristicAI — Forgot Password Screen Route
 * Location: app/auth/forgot-password.tsx
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import AuthService from '../../services/auth/auth-service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);
    if (!email || !email.includes('@')) {
      setError('INVALID EMAIL ADDRESS');
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendPasswordReset(email.trim());
      setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send password reset email';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO LOGIN</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.text.primary }}>
            RESET ACCOUNT PASSWORD
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.accent.primary, marginTop: 4 }}>
            DISPATCH RECOVERY LINK TO YOUR EMAIL ADDRESS
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>[ERROR] {error}</Text>
          </View>
        )}

        {!sent ? (
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

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg.primary} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SEND RECOVERY EMAIL</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: spacing[4] }}>
            <Text
              style={{
                fontFamily: 'IBMPlexSans_400Regular',
                fontSize: 14,
                color: colors.text.secondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              A password reset link has been dispatched to: <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>{email}</Text>. Please check your inbox (and spam folder) and follow the instructions to set a new password.
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>RETURN TO LOGIN</Text>
            </TouchableOpacity>
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
    marginTop: spacing[2],
  },
  submitBtnText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 14,
    color: colors.bg.primary,
    letterSpacing: 1,
  },
});
