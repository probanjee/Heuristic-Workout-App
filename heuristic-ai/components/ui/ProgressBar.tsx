/**
 * File: components/ui/ProgressBar.tsx
 * Purpose: Reusable ProgressBar component with Reanimated width animations, label, and percentage indicators
 * Dependencies: react, react-native, react-native-reanimated, @/constants/theme
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, radius } from '@/constants/theme';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color,
  style,
}: ProgressBarProps) {
  // Ensure progress value is bounded between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Animated progress representation
  const progressShared = useSharedValue(normalizedValue / 100);

  useEffect(() => {
    progressShared.value = withTiming(normalizedValue / 100, {
      duration: 300,
    });
  }, [normalizedValue]);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progressShared.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text
              style={styles.label}
              numberOfLines={1}
            >
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showPercentage && (
            <Text style={styles.percentage}>
              {Math.round(normalizedValue)}%
            </Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color || colors.accent.primary },
            animatedFillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  label: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
  percentage: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.accent.primary,
  },
  track: {
    height: 8,
    width: '100%',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.sm, // sharp 4px brutalist corners
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
