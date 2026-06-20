/**
 * HeuristicAI â€” Heuristic Decision Banner
 * Shows heuristic engine decision after RPE submission
 * Source of truth: UI_UX_BRIEF.md Â§ Workout Flow Screen 4
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, animation } from '@/constants/theme';
import type { HeuristicDecision } from '@/heuristic-engine/types';

interface HeuristicBannerProps {
  decision: HeuristicDecision;
  previousWeightKg: number;
  onAccept: () => void;
  onOverride: () => void;
}

function getBannerStyle(decision: HeuristicDecision) {
  if (decision.terminateSessionWarning) {
    return { color: colors.warning, bg: `rgba(255,184,48,0.08)`, border: colors.border.warning, Icon: AlertTriangle };
  }
  if (decision.nextSetWeightKg < 0 || decision.recoveryFlagToCreate) {
    return { color: colors.danger, bg: `rgba(255,59,59,0.08)`, border: colors.border.danger, Icon: TrendingDown };
  }
  if (decision.addDropSet) {
    return { color: colors.accent.primary, bg: colors.accent.dim, border: colors.border.accent, Icon: Zap };
  }
  return { color: colors.accent.primary, bg: colors.accent.dim, border: colors.border.accent, Icon: TrendingUp };
}

export function HeuristicBanner({ decision, previousWeightKg, onAccept, onOverride }: HeuristicBannerProps) {
  const { color, bg, border, Icon } = getBannerStyle(decision);

  // Fire haptic on mount
  useEffect(() => {
    if (decision.terminateSessionWarning) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const weightChange = decision.nextSetWeightKg - previousWeightKg;
  const weightLabel =
    weightChange > 0
      ? `+${weightChange.toFixed(1)} kg â†’ ${decision.nextSetWeightKg.toFixed(1)} kg`
      : weightChange < 0
        ? `${weightChange.toFixed(1)} kg â†’ ${decision.nextSetWeightKg.toFixed(1)} kg`
        : `${decision.nextSetWeightKg.toFixed(1)} kg (no change)`;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={[styles.container, { backgroundColor: bg, borderColor: border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: `${color}22` }]}>
          <Icon size={18} color={color} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.engineLabel, { color }]}>HEURISTIC ENGINE</Text>
          <Text style={styles.decisionTitle}>
            {decision.terminateSessionWarning
              ? 'End Session Recommended'
              : decision.addDropSet
                ? 'Drop Set Suggested'
                : weightChange < 0
                  ? 'Weight Reduction'
                  : weightChange > 0
                    ? 'Weight Increase'
                    : 'Next Set Ready'}
          </Text>
        </View>
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={[styles.confidence, { color: colors.text.muted }]}>
            {Math.round(decision.confidenceScore * 100)}%
          </Text>
        </Animated.View>
      </View>

      {/* Coach note */}
      <Text style={styles.coachNote}>{decision.coachNote}</Text>

      {/* Decision details */}
      <View style={styles.detailsRow}>
        {!decision.terminateSessionWarning && (
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { color: colors.text.muted }]}>WEIGHT</Text>
            <Text style={[styles.detailValue, { color }]}>{weightLabel}</Text>
          </View>
        )}
        {decision.additionalRestSeconds > 0 && (
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { color: colors.text.muted }]}>REST</Text>
            <Text style={[styles.detailValue, { color: colors.warning }]}>
              +{decision.additionalRestSeconds}s
            </Text>
          </View>
        )}
        {decision.addDropSet && (
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { color: colors.text.muted }]}>DROP SET</Text>
            <Text style={[styles.detailValue, { color: colors.accent.primary }]}>YES</Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: color }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAccept();
          }}
          accessibilityLabel="Accept heuristic recommendation"
        >
          <Check size={16} color={colors.text.inverse} strokeWidth={2.5} />
          <Text style={styles.acceptButtonText}>ACCEPT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.overrideButton}
          onPress={onOverride}
          accessibilityLabel="Override heuristic recommendation"
        >
          <Text style={styles.overrideButtonText}>OVERRIDE</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing[4],
    margin: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  engineLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  decisionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    color: colors.text.primary,
  },
  confidence: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
  },
  coachNote: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  detailLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: 8,
    paddingVertical: spacing[3],
  },
  acceptButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: colors.text.inverse,
  },
  overrideButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  overrideButtonText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.muted,
  },
});

