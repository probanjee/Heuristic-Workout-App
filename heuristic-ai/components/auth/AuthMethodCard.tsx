/**
 * HeuristicAI — AuthMethodCard Component
 * Brutalist-Tech Dark Card for choosing authentication options.
 */

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface AuthMethodCardProps {
  title: string;
  description: string;
  onPress: () => void;
  accentColor?: string;
  disabled?: boolean;
}

export const AuthMethodCard: React.FC<AuthMethodCardProps> = ({
  title,
  description,
  onPress,
  accentColor = colors.accent.primary,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: colors.bg.secondary,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderLeftWidth: 4,
        borderLeftColor: disabled ? colors.text.muted : accentColor,
        borderRadius: 4,
        padding: spacing[4],
        marginBottom: spacing[3],
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityLabel={`Select authentication method: ${title}`}
      accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: spacing[2] }}>
          <Text
            style={{
              fontFamily: 'Syne_700Bold',
              fontSize: 16,
              color: colors.text.primary,
              marginBottom: 4,
            }}
          >
            {title.toUpperCase()}
          </Text>
          <Text
            style={{
              fontFamily: 'IBMPlexSans_400Regular',
              fontSize: 12,
              color: colors.text.secondary,
            }}
          >
            {description}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular', // fallback to theme mono
            fontSize: 20,
            color: colors.text.muted,
          }}
        >
          →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AuthMethodCard;
