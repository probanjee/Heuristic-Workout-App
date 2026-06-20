/**
 * HeuristicAI — Email OTP / Magic Link Verification Screen Route
 * Location: app/auth/email-otp.tsx
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import useOTPAuth from '../../hooks/useOTPAuth';

export default function EmailOTPScreen() {
  const router = useRouter();
  const { sendLink, verifyLink, loading, error, cooldown, canResend } = useOTPAuth();
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendLink = async () => {
    setValidationError(null);
    if (!email || !email.includes('@')) {
      setValidationError('INVALID EMAIL ADDRESS');
      return;
    }
    try {
      await sendLink(email.trim());
      setLinkSent(true);
    } catch {
      // Error is stored in hook
    }
  };

  const handleVerifyLink = async () => {
    setValidationError(null);
    if (!magicLink) {
      setValidationError('VERIFICATION URL IS REQUIRED');
      return;
    }
    try {
      await verifyLink(email.trim(), magicLink.trim());
    } catch {
      // Error stored in hook
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
            MAGIC EMAIL LINK
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.accent.primary, marginTop: 4 }}>
            PASSWORDLESS ACCESS TO YOUR PERFORMANCE METRICS
          </Text>
        </View>

        {(error || validationError) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              [ERROR] {validationError || error}
            </Text>
          </View>
        )}

        {!linkSent ? (
          // Mode 1: Send Magic Link
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
              onPress={handleSendLink}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg.primary} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SEND MAGIC LINK</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Mode 2: Verify Link (if deep linking fails, user can paste link manually)
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
              We've dispatched a Magic Link to your email: <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>{email}</Text>. Check your inbox and tap the link to sign in.
            </Text>

            <View style={{ marginVertical: spacing[2] }}>
              <Text style={styles.label}>PASTE LINK MANUALLY (IF REDIRECT FAILS)</Text>
              <TextInput
                value={magicLink}
                onChangeText={setMagicLink}
                placeholder="https://..."
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerifyLink}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg.primary} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SIGN IN WITH LINK</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendLink}
              disabled={!canResend || loading}
              style={{ alignItems: 'center', marginTop: spacing[2] }}
            >
              <Text
                style={{
                  color: canResend ? colors.text.primary : colors.text.muted,
                  textDecorationLine: canResend ? 'underline' : 'none',
                  fontSize: 12,
                }}
              >
                {canResend ? 'Resend Magic Link' : `Resend in ${cooldown} seconds`}
              </Text>
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
