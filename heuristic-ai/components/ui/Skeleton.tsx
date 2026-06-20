/**
 * File: components/ui/Skeleton.tsx
 * Purpose: Reusable Skeleton loader component with Moti loop shimmer opacity animation
 * Dependencies: react, moti, @/constants/theme
 */

import React from 'react';
import { StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { MotiView } from 'moti';
import { colors, radius } from '@/constants/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: boolean | number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  rounded = false,
  style,
}: SkeletonProps) {
  // Determine border radius
  const borderRadius = typeof rounded === 'number'
    ? rounded
    : rounded === true
      ? 9999 // fully rounded circle/pill
      : radius.sm; // 4px sharp default brutalist corner

  return (
    <MotiView
      from={{ opacity: 0.25 }}
      animate={{ opacity: 0.6 }}
      transition={{
        type: 'timing',
        duration: 900,
        loop: true,
      }}
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading content placeholder"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
