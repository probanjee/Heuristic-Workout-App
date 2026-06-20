/**
 * HeuristicAI — PhoneLoginForm Component
 * Renders country prefixes, phone validation, OTP digit entries, and OTP SMS trigger buttons.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import OTPInput from './OTPInput';

interface PhoneLoginFormProps {
  onSendCode: (fullPhoneNumber: string) => Promise<void>;
  onVerifyCode: (code: string) => Promise<void>;
  loading?: boolean;
  codeSent?: boolean;
  cooldown?: number;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({
  onSendCode,
  onVerifyCode,
  loading = false,
  codeSent = false,
  cooldown = 0,
}) => {
  const [dialCode, setDialCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setValidationError(null);
    if (!phoneNumber) {
      setValidationError('PHONE NUMBER IS REQUIRED');
      return;
    }
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      setValidationError('INVALID PHONE NUMBER LENGTH');
      return;
    }

    try {
      const fullPhone = `${dialCode.trim()}${cleanPhone}`;
      await onSendCode(fullPhone);
    } catch {
      // Errors handled by hook
    }
  };

  const handleVerifyCode = async () => {
    setValidationError(null);
    if (verificationCode.length < 6) {
      setValidationError('VERIFICATION CODE MUST BE 6 DIGITS');
      return;
    }
    try {
      await onVerifyCode(verificationCode);
    } catch {
      // Errors handled by hook
    }
  };

  return (
    <View style={{ gap: spacing[4] }}>
      {!codeSent ? (
        // Mode 1: Enter Phone Number
        <View style={{ gap: spacing[4] }}>
          <View>
            <Text
              style={{
                fontFamily: 'Syne_700Bold',
                fontSize: 12,
                color: colors.text.secondary,
                marginBottom: spacing[1],
                letterSpacing: 0.5,
              }}
            >
              PHONE NUMBER
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              {/* Country dial code input */}
              <TextInput
                value={dialCode}
                onChangeText={setDialCode}
                placeholder="+1"
                placeholderTextColor={colors.text.muted}
                keyboardType="phone-pad"
                style={{
                  width: 60,
                  backgroundColor: colors.bg.secondary,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  borderRadius: 4,
                  padding: spacing[3],
                  color: colors.text.primary,
                  fontFamily: 'IBMPlexSans_400Regular',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              />
              {/* Local number input */}
              <TextInput
                value={phoneNumber}
                onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ''))}
                placeholder="ENTER PHONE NUMBER"
                placeholderTextColor={colors.text.muted}
                keyboardType="phone-pad"
                style={{
                  flex: 1,
                  backgroundColor: colors.bg.secondary,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  borderRadius: 4,
                  padding: spacing[3],
                  color: colors.text.primary,
                  fontFamily: 'IBMPlexSans_400Regular',
                  fontSize: 14,
                }}
              />
            </View>
          </View>

          {validationError && (
            <View
              style={{
                backgroundColor: 'rgba(255, 59, 59, 0.1)',
                borderColor: colors.danger,
                borderWidth: 1,
                borderRadius: 4,
                padding: spacing[3],
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 12,
                  color: colors.danger,
                  fontWeight: 'bold',
                }}
              >
                {validationError}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSendCode}
            disabled={loading || cooldown > 0}
            style={{
              backgroundColor: cooldown > 0 ? colors.bg.secondary : colors.accent.primary,
              paddingVertical: spacing[3],
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text
                style={{
                  fontFamily: 'Syne_800ExtraBold',
                  fontSize: 14,
                  color: cooldown > 0 ? colors.text.muted : colors.bg.primary,
                  letterSpacing: 1,
                }}
              >
                {cooldown > 0 ? `RESEND IN ${cooldown}S` : 'SEND VERIFICATION SMS'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // Mode 2: Enter SMS OTP Code
        <View style={{ gap: spacing[4], alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Syne_700Bold',
              fontSize: 14,
              color: colors.text.primary,
              textAlign: 'center',
            }}
          >
            ENTER 6-DIGIT VERIFICATION CODE
          </Text>
          <Text
            style={{
              fontFamily: 'IBMPlexSans_400Regular',
              fontSize: 12,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Code sent to phone ending in: {phoneNumber.slice(-4)}
          </Text>

          <OTPInput code={verificationCode} onChangeCode={setVerificationCode} length={6} />

          {validationError && (
            <View
              style={{
                backgroundColor: 'rgba(255, 59, 59, 0.1)',
                borderColor: colors.danger,
                borderWidth: 1,
                borderRadius: 4,
                padding: spacing[3],
                width: '100%',
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 12,
                  color: colors.danger,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {validationError}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleVerifyCode}
            disabled={loading}
            style={{
              backgroundColor: colors.accent.primary,
              paddingVertical: spacing[3],
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text
                style={{
                  fontFamily: 'Syne_800ExtraBold',
                  fontSize: 14,
                  color: colors.bg.primary,
                  letterSpacing: 1,
                }}
              >
                VERIFY CODE
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendCode} disabled={cooldown > 0 || loading}>
            <Text
              style={{
                fontFamily: 'IBMPlexSans_400Regular',
                fontSize: 12,
                color: cooldown > 0 ? colors.text.muted : colors.text.secondary,
                textDecorationLine: cooldown > 0 ? 'none' : 'underline',
              }}
            >
              {cooldown > 0 ? `Resend SMS in ${cooldown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PhoneLoginForm;
