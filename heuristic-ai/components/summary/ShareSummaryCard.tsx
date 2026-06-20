/**
 * HeuristicAI — ShareSummaryCard Component
 * Beautifully composed static card containing the session stats designed for OS image export.
 * Source of truth: TASK.md (M6 Task 12), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Award, Activity } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import type { HeuristicSummary } from '@/heuristic-engine/types';

interface ShareSummaryCardProps {
  summary: HeuristicSummary;
  durationSeconds: number;
  dateStr: string;
}

export function ShareSummaryCard({ summary, durationSeconds, dateStr }: ShareSummaryCardProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationText = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.brandTitle}>HEURISTIC.AI</Text>
          <Text style={styles.brandSubtitle}>ADAPTIVE WORKOUT COACH</Text>
        </View>
        <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
      </View>

      <Text style={styles.headline}>SESSION COMPLETE ✓</Text>

      {/* Stats Table */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.label}>VOLUME LOGGED</Text>
          <Text style={styles.value}>
            {summary.totalVolume.toFixed(0)}
            <Text style={styles.unit}>KG</Text>
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.label}>AVERAGE RPE</Text>
          <Text style={styles.value}>{summary.avgRpe.toFixed(1)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.label}>DURATION</Text>
          <Text style={styles.value}>{durationText}</Text>
        </View>
      </View>

      {/* 1RM & Recovery Row */}
      <View style={styles.row}>
        {summary.estimatedOneRmKg !== null && (
          <View style={styles.itemBox}>
            <View style={styles.labelRow}>
              <Award size={12} color={colors.accent.primary} />
              <Text style={styles.boxLabel}>EST. 1RM</Text>
            </View>
            <Text style={styles.boxValue}>{summary.estimatedOneRmKg.toFixed(1)} KG</Text>
          </View>
        )}
        <View style={styles.itemBox}>
          <View style={styles.labelRow}>
            <Shield size={12} color={colors.warning} />
            <Text style={styles.boxLabel}>RECOVERY</Text>
          </View>
          <Text style={styles.boxValue}>{summary.recoveryRecommendationHours} HRS</Text>
        </View>
      </View>

      {/* Coach Logs */}
      {summary.topDecisions.length > 0 && (
        <View style={styles.notesBox}>
          <View style={styles.notesHeader}>
            <Activity size={10} color={colors.accent.primary} />
            <Text style={styles.notesLabel}>CALIBRATIONS TRIGGERED</Text>
          </View>
          <Text style={styles.notesText}>
            "{summary.topDecisions[0].coachNote}"
          </Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>ON-DEVICE DETERMINISTIC HEURISTIC EVALUATION</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#050505',
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderRadius: 8,
    padding: spacing[5],
    width: '100%',
    gap: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    paddingBottom: spacing[3],
  },
  brandTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 20,
    color: colors.accent.primary,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 10,
    color: colors.text.secondary,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  headline: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    padding: spacing[3],
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 20,
    color: colors.text.primary,
  },
  unit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  itemBox: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    padding: spacing[3],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  boxLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  boxValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.text.primary,
  },
  notesBox: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    padding: spacing[3],
    gap: 4,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notesLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  notesText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  footerRow: {
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    paddingTop: spacing[3],
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
});
