/**
 * HeuristicAI — EmailLoginForm Component
 * Renders brutalist styled inputs for email & password authentication.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface EmailLoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  submitButtonText?: string;
  onForgotPasswordPress?: () => void;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  onSubmit,
  loading = false,
  submitButtonText = 'SIGN IN',
  onForgotPasswordPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePress = async () => {
    setValidationError(null);
    if (!email || !password) {
      setValidationError('ALL FIELDS ARE REQUIRED');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('INVALID EMAIL FORMAT');
      return;
    }
    if (password.length < 6) {
      setValidationError('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    try {
      await onSubmit(email.trim(), password);
    } catch (e) {
      // Errors are handled by hooks or parents
    }
  };

  return (
    <View style={{ gap: spacing[4] }}>
      {/* Email Input */}
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
          EMAIL ADDRESS
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="ENTER YOUR EMAIL"
          placeholderTextColor={colors.text.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
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

      {/* Password Input */}
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Syne_700Bold',
              fontSize: 12,
              color: colors.text.secondary,
              marginBottom: spacing[1],
              letterSpacing: 0.5,
            }}
          >
            PASSWORD
          </Text>
          {onForgotPasswordPress && (
            <TouchableOpacity onPress={onForgotPasswordPress}>
              <Text
                style={{
                  fontFamily: 'IBMPlexSans_400Regular',
                  fontSize: 12,
                  color: colors.text.secondary,
                  textDecorationLine: 'underline',
                  marginBottom: spacing[1],
                }}
              >
                Forgot?
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="ENTER YOUR PASSWORD"
          placeholderTextColor={colors.text.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={{
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

      {/* Validation error display */}
      {validationError && (
        <View
          style={{
            backgroundColor: 'rgba(255, 59, 59, 0.1)',
            borderColor: colors.danger,
            borderWidth: 1,
            borderRadius: 4,
            padding: spacing[3],
            marginVertical: spacing[1],
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

      {/* Submit button */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        style={{
          backgroundColor: colors.accent.primary,
          paddingVertical: spacing[3],
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing[2],
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
            {submitButtonText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EmailLoginForm;
