/**
 * File: components/ui/Button.tsx
 * Purpose: Reusable Button component with Reanimated press animation, haptic feedback, and brutalist design
 * Dependencies: react, react-native, react-native-reanimated, expo-haptics, @/constants/theme
 */

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useSharedValue(1);

  // Reanimated press animations
  const onPressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const onPressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    // Trigger medium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onPress) {
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Theme-driven colors
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.accent.primary,
          text: colors.text.inverse,
          border: 'transparent',
          loader: colors.text.inverse,
        };
      case 'danger':
        return {
          bg: colors.danger,
          text: colors.text.primary,
          border: 'transparent',
          loader: colors.text.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.accent.primary,
          border: 'transparent',
          loader: colors.accent.primary,
        };
      case 'secondary':
      default:
        return {
          bg: colors.bg.secondary,
          text: colors.text.primary,
          border: colors.border.default,
          loader: colors.text.primary,
        };
    }
  };

  const buttonColors = getColors();

  const buttonStyles = [
    styles.base,
    styles[variant],
    fullWidth && styles.fullWidth,
    {
      backgroundColor: buttonColors.bg,
      borderColor: buttonColors.border,
      borderWidth: variant === 'secondary' ? 1 : 0,
    },
    disabled && styles.disabled,
    style,
  ];

  const derivedLabel =
    accessibilityLabel ||
    (typeof children === 'string' ? children : undefined);

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[buttonStyles, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={derivedLabel}
    >
      {loading ? (
        <ActivityIndicator color={buttonColors.loader} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: buttonColors.text },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md, // Max 8px brutalist radius
    paddingHorizontal: spacing[4],
  },
  primary: {},
  secondary: {},
  danger: {},
  ghost: {
    paddingHorizontal: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Syne_700Bold', // Heading font for CTAs per UI/UX brief
    fontSize: 14,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});
