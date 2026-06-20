/**
 * HeuristicAI — SummaryStatCard Component
 * Reusable card wrapper displaying a statistic value, label, optional subtitle, and icon.
 * Source of truth: UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface SummaryStatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  subtitle?: string;
  accessibilityLabel?: string;
}

export function SummaryStatCard({
  label,
  value,
  icon,
  subtitle,
  accessibilityLabel,
}: SummaryStatCardProps) {
  return (
    <View
      style={styles.card}
      accessibilityLabel={accessibilityLabel || `${label}: ${value}`}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    width: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 18,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
