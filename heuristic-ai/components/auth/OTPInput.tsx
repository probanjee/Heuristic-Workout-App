/**
 * HeuristicAI — OTPInput Component
 * Renders a Brutalist monospace grid of 6 code boxes for entering SMS / verification codes.
 */

import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface OTPInputProps {
  code: string;
  onChangeCode: (code: string) => void;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({ code, onChangeCode, length = 6 }) => {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const codeDigits = code.split('');
  const cells = Array(length).fill(0);

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center', marginVertical: spacing[4] }}>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {cells.map((_, index) => {
          const digit = codeDigits[index] || '';
          const isFocused = index === code.length;

          return (
            <View
              key={index}
              style={{
                width: 44,
                height: 54,
                backgroundColor: colors.bg.secondary,
                borderWidth: isFocused ? 2 : 1,
                borderColor: isFocused ? colors.accent.primary : colors.border.default,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular', // fallback to theme mono
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: isFocused ? colors.accent.primary : colors.text.primary,
                }}
              >
                {digit}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Hidden Text Input that captures keystrokes */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(val) => {
          // Allow only numbers and limit length
          const cleanVal = val.replace(/[^0-9]/g, '');
          if (cleanVal.length <= length) {
            onChangeCode(cleanVal);
          }
        }}
        keyboardType="number-pad"
        maxLength={length}
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
        }}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
      />
    </Pressable>
  );
};

export default OTPInput;
