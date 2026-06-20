/**
 * HeuristicAI — GoogleButton Component
 * A prominent Brutalist Electric-Green button for Google OAuth authentication.
 */

import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  text?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  loading = false,
  text = 'CONTINUE WITH GOOGLE',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: colors.accent.primary,
        borderWidth: 1,
        borderColor: colors.accent.primary,
        borderRadius: 4,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        marginBottom: spacing[4],
      }}
      accessibilityLabel="Authenticate with Google"
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={colors.bg.primary} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Custom ASCII/Simple SVG style Google Icon */}
          <Text
            style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.bg.primary,
            }}
          >
            [G]
          </Text>
          <Text
            style={{
              fontFamily: 'Syne_800ExtraBold',
              fontSize: 14,
              color: colors.bg.primary,
              letterSpacing: 1,
            }}
          >
            {text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GoogleButton;
