/**
 * File: components/ui/Typography.tsx
 * Purpose: Reusable typography component with variant-driven API, strict typing, and brutalist theme tokens
 * Dependencies: react, react-native, @/constants/theme
 */

import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyL'
  | 'bodyM'
  | 'bodyS'
  | 'caption'
  | 'label'
  | 'tag'
  | 'numXL'
  | 'numL'
  | 'numM'
  | 'numS';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold' | 'extraBold';
  children?: React.ReactNode;
}

const getFontFamily = (
  variant: TypographyVariant,
  weight?: 'regular' | 'medium' | 'bold' | 'extraBold'
): string => {
  const isHeading = variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'tag';
  const isMono = variant.startsWith('num') || variant === 'label';

  if (isHeading) {
    if (weight === 'extraBold' || variant === 'h1') return 'Syne_800ExtraBold';
    return 'Syne_700Bold';
  }

  if (isMono) {
    if (weight === 'medium' || weight === 'bold' || variant === 'numXL' || variant === 'numL') {
      return 'DMMono_500Medium';
    }
    return 'DMMono_400Regular';
  }

  // Body/caption text
  if (weight === 'medium' || weight === 'bold') {
    return 'IBMPlexSans_500Medium';
  }
  return 'IBMPlexSans_400Regular';
};

const getDefaultColor = (variant: TypographyVariant): string => {
  if (variant === 'caption') return colors.text.muted;
  if (variant === 'bodyL' || variant === 'bodyM' || variant === 'bodyS') return colors.text.secondary;
  return colors.text.primary;
};

export function Typography({
  variant = 'bodyM',
  color,
  weight,
  style,
  children,
  accessibilityRole,
  ...props
}: TypographyProps) {
  const defaultAccessibilityRole = ['h1', 'h2', 'h3'].includes(variant) ? 'header' : undefined;

  return (
    <RNText
      style={[
        styles[variant],
        {
          fontFamily: getFontFamily(variant, weight),
          color: color || getDefaultColor(variant),
        },
        style,
      ]}
      accessibilityRole={accessibilityRole || defaultAccessibilityRole}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience Wrappers
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const BodyLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyL" {...props} />
);

export const BodyMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyM" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyS" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const NumXL = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="numXL" {...props} />
);

export const NumL = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="numL" {...props} />
);

export const NumM = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="numM" {...props} />
);

export const NumS = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="numS" {...props} />
);

// Map scale tokens from constants/theme
const styles = StyleSheet.create({
  h1: typography.scale.h1,
  h2: typography.scale.h2,
  h3: typography.scale.h3,
  bodyL: typography.scale.bodyL,
  bodyM: typography.scale.bodyM,
  bodyS: typography.scale.bodyS,
  caption: typography.scale.caption,
  label: typography.scale.label,
  tag: typography.scale.tag,
  numXL: typography.scale.numXL,
  numL: typography.scale.numL,
  numM: typography.scale.numM,
  numS: typography.scale.numS,
});
