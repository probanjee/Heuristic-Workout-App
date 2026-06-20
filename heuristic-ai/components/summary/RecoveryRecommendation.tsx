/**
 * HeuristicAI — RecoveryRecommendation Component
 * Renders required recovery hours and intensity-based coaching advice.
 * Source of truth: TASK.md (M6 Task 11), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Activity, RefreshCw } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface RecoveryRecommendationProps {
  hours: number;
  severity: 'low' | 'moderate' | 'high';
  message: string;
}

export function RecoveryRecommendation({
  hours,
  severity,
  message,
}: RecoveryRecommendationProps) {
  let badgeColor: string = colors.accent.primary; // Green
  let badgeBg: string = 'rgba(0, 255, 135, 0.04)';
  let borderColor: string = colors.border.accent;
  let severityLabel = 'LOW INTENSITY';

  if (severity === 'high') {
    badgeColor = colors.danger;
    badgeBg = 'rgba(255, 59, 59, 0.04)';
    borderColor = colors.border.danger;
    severityLabel = 'HIGH INTENSITY';
  } else if (severity === 'moderate') {
    badgeColor = colors.warning;
    badgeBg = 'rgba(255, 184, 48, 0.04)';
    borderColor = colors.border.warning;
    severityLabel = 'MODERATE INTENSITY';
  }

  return (
    <View style={[styles.card, { backgroundColor: badgeBg, borderColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Shield size={16} color={badgeColor} />
          <Text style={[styles.title, { color: badgeColor }]}>RECOVERY ADVICE</Text>
        </View>
        <View style={[styles.badge, { borderColor, backgroundColor: colors.bg.primary }]}>
          <Activity size={8} color={badgeColor} />
          <Text style={[styles.badgeText, { color: badgeColor }]}>{severityLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.hoursValue} accessibilityLabel={`${hours} hours of rest required`}>
          REST FOR {hours} HOURS
        </Text>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      <View style={styles.footer}>
        <RefreshCw size={12} color={colors.text.muted} />
        <Text style={styles.suggestionText}>
          {hours >= 48
            ? 'Prioritize hydration, mobility work, and light walking.'
            : 'Nominal muscle recovery. Ready for your next routine tomorrow.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing[4],
    width: '100%',
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  body: {
    gap: 4,
  },
  hoursValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 20,
    color: colors.text.primary,
  },
  messageText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.subtle,
    paddingTop: spacing[3],
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 10,
    color: colors.text.muted,
  },
});
