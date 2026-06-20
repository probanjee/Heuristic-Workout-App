/**
 * File: components/ui/Badge.tsx
 * Purpose: Reusable Badge component using semantic colors, technical monospace type, and brutalist edges
 * Dependencies: react, react-native, @/constants/theme
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  variant = 'info',
  label,
  icon,
  style,
  textStyle,
}: BadgeProps) {
  // Map variant to theme colors
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(0, 255, 135, 0.15)', // 15% electric green
          text: colors.success,
          border: colors.border.accent,
        };
      case 'warning':
        return {
          bg: 'rgba(255, 184, 48, 0.15)', // 15% amber
          text: colors.warning,
          border: colors.border.warning,
        };
      case 'danger':
        return {
          bg: 'rgba(255, 59, 59, 0.15)', // 15% red
          text: colors.danger,
          border: colors.border.danger,
        };
      case 'info':
      default:
        return {
          bg: 'rgba(59, 138, 255, 0.15)', // 15% blue
          text: colors.info,
          border: 'rgba(59, 138, 255, 0.3)',
        };
    }
  };

  const badgeTheme = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeTheme.bg,
          borderColor: badgeTheme.border,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status badge: ${label}`}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { color: badgeTheme.text },
          textStyle,
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1] - 1, // slightly tighter vertical padding (3px)
    borderRadius: radius.sm, // sharp 4px brutalist corners
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing[1],
  },
  text: {
    fontFamily: 'DMMono_500Medium', // DM Mono medium weight for key stats/labels
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
