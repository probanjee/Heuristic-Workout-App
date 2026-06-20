/**
 * HeuristicAI — OneRMProgressChart Component
 * Displays estimated 1RM progression curves for Squat, Bench Press, and Deadlift.
 * Source of truth: TASK.md (M6 Task 17), UI_UX_BRIEF.md § 8
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, spacing } from '@/constants/theme';

interface ProgressionItem {
  date: string; // YYYY-MM-DD
  oneRm: number;
}

interface OneRMProgressChartProps {
  squatProgression: ProgressionItem[];
  benchProgression: ProgressionItem[];
  deadliftProgression: ProgressionItem[];
}

type LiftKey = 'squat' | 'bench' | 'deadlift';

export const OneRMProgressChart = React.memo(function OneRMProgressChart({
  squatProgression,
  benchProgression,
  deadliftProgression,
}: OneRMProgressChartProps) {
  const [activeLift, setActiveLift] = useState<LiftKey>('squat');

  const getProgressionData = (): ProgressionItem[] => {
    switch (activeLift) {
      case 'squat':
        return squatProgression;
      case 'bench':
        return benchProgression;
      case 'deadlift':
        return deadliftProgression;
    }
  };

  const activeData = getProgressionData();
  const hasData = activeData && activeData.length > 0;

  // Calculate peak 1RM in range
  const peakOneRm = hasData ? Math.max(...activeData.map((d) => d.oneRm)) : 0;

  // Map to GiftedCharts format
  const chartData = activeData.map((item) => {
    const parts = item.date.split('-');
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.date;
    return {
      value: item.oneRm,
      label,
      dataPointColor: colors.accent.primary,
      dataPointRadius: 4,
    };
  });

  const lifts: { key: LiftKey; label: string }[] = [
    { key: 'squat', label: 'SQUAT' },
    { key: 'bench', label: 'BENCH PRESS' },
    { key: 'deadlift', label: 'DEADLIFT' },
  ];

  const accessibilityText = hasData
    ? activeData.map((item) => `${item.date}: ${item.oneRm.toFixed(1)}kg`).join(', ')
    : 'No data logged for this lift';

  return (
    <View style={styles.container} accessibilityLabel={`Estimated 1RM progress chart for ${activeLift}. ${accessibilityText}`}>
      <Text style={styles.title}>ESTIMATED 1RM STRENGTH</Text>

      {/* Segment selector */}
      <View style={styles.segmentRow}>
        {lifts.map((l) => {
          const isActive = activeLift === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              style={[styles.segmentBtn, isActive && styles.activeSegmentBtn]}
              onPress={() => setActiveLift(l.key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Select ${l.label} 1RM progression`}
            >
              <Text style={[styles.segmentText, isActive && styles.activeSegmentText]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Peak Stat Display */}
      {hasData && (
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>PEAK ESTIMATED 1RM</Text>
          <Text style={styles.statValue}>
            {peakOneRm.toFixed(1)}
            <Text style={styles.statUnit}>KG</Text>
          </Text>
        </View>
      )}

      {/* Chart */}
      {hasData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={280}
            height={130}
            noOfSections={4}
            rulesColor={colors.border.subtle}
            rulesThickness={1}
            thickness={3}
            color={colors.border.default}
            textColor={colors.text.secondary}
            textFontSize={8}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            hideDataPoints={false}
            yAxisColor={colors.border.subtle}
            xAxisColor={colors.border.subtle}
            backgroundColor={colors.bg.secondary}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No completed sets logged for {activeLift} in this range.
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    width: '100%',
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
  },
  segmentRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
  },
  activeSegmentBtn: {
    backgroundColor: colors.border.default,
  },
  segmentText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  activeSegmentText: {
    color: colors.accent.primary,
  },
  statContainer: {
    marginBottom: spacing[3],
  },
  statLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 22,
    color: colors.accent.primary,
  },
  statUnit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing[2],
  },
  axisText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 8,
    color: colors.text.muted,
  },
  emptyState: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});
