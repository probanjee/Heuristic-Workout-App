/**
 * File: components/ui/Card.tsx
 * Purpose: Reusable Card component with entrance animations, custom layouts, and brutalist edges
 * Dependencies: react, react-native, react-native-reanimated, @/constants/theme
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, radius } from '@/constants/theme';

export type CardVariant = 'default' | 'elevated' | 'glass';

export interface CardProps {
  variant?: CardVariant;
  bordered?: boolean;
  padding?: keyof typeof spacing | number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({
  variant = 'default',
  bordered = true,
  padding = 4, // Default spacing is 16px (spacing[4])
  children,
  style,
}: CardProps) {
  // Determine actual padding value
  const paddingVal = typeof padding === 'number' && padding in spacing
    ? spacing[padding as keyof typeof spacing]
    : typeof padding === 'number'
      ? padding
      : spacing[4];

  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.bg.elevated,
          borderColor: colors.border.default,
        };
      case 'glass':
        return {
          // Semi-translucent dark background acting as the elevated HUD-style overlay
          backgroundColor: colors.bg.overlay,
          borderColor: colors.border.accent,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.bg.secondary,
          borderColor: colors.border.default,
        };
    }
  };

  const cardStyles = [
    styles.base,
    getVariantStyles(),
    bordered && styles.bordered,
    { padding: paddingVal },
    style,
  ];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={cardStyles}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md, // Max 8px brutalist border radius
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
  },
});
