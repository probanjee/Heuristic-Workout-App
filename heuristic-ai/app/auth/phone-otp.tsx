/**
 * HeuristicAI — Phone OTP SMS Screen Route
 * Location: app/auth/phone-otp.tsx
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import PhoneLoginForm from '../../components/auth/PhoneLoginForm';
import usePhoneAuth from '../../hooks/usePhoneAuth';

export default function PhoneOTPScreen() {
  const router = useRouter();
  const { sendSMSCode, verifySMSCode, loading, error, cooldown, codeSent } = usePhoneAuth();

  const handleSendCode = async (fullPhoneNumber: string) => {
    // reCAPTCHA dummy verification for react-native environment
    const recaptchaVerifier = {
      type: 'recaptcha',
      verify: async () => 'mock-recaptcha-token',
    } as any;

    await sendSMSCode(fullPhoneNumber, recaptchaVerifier);
  };

  const handleVerifyCode = async (code: string) => {
    await verifySMSCode(code);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO LOGIN</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.text.primary }}>
            SMS PHONE LOGIN
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.accent.primary, marginTop: 4 }}>
            VERIFY USER SESSION VIA CELLULAR SMS NETWORK
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>[ERROR] {error}</Text>
          </View>
        )}

        <View style={{ marginTop: spacing[2] }}>
          <PhoneLoginForm
            onSendCode={handleSendCode}
            onVerifyCode={handleVerifyCode}
            loading={loading}
            codeSent={codeSent}
            cooldown={cooldown}
          />
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
});
