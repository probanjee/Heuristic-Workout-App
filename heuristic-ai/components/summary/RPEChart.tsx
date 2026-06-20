/**
 * HeuristicAI — RPEChart Component
 * Renders set-by-set RPE ratings in a brutalist-themed line chart.
 * Source of truth: TASK.md (M6 Task 9), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, spacing } from '@/constants/theme';
import type { SetData } from '@/heuristic-engine/types';

interface RPEChartProps {
  sets: SetData[];
}

export function RPEChart({ sets }: RPEChartProps) {
  // Filter sets that have an RPE logged
  const loggedSets = sets.filter((s) => s.rpe !== null);

  if (loggedSets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>RPE PROFILE PER SET</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No RPE data logged for this session.</Text>
        </View>
      </View>
    );
  }

  // Map sets to GiftedCharts format
  const chartData = loggedSets.map((s) => {
    const val = s.rpe ?? 6;
    let pointColor: string = colors.accent.primary; // Green < 6

    if (val >= 8) {
      pointColor = colors.danger; // Red >= 8
    } else if (val >= 6) {
      pointColor = colors.warning; // Amber 6-8
    }

    return {
      value: val,
      label: `S${s.setNumber}`,
      dataPointColor: pointColor,
    };
  });

  // accessibility text summary
  const summaryText = loggedSets
    .map((s) => `Set ${s.setNumber}: RPE ${s.rpe}${s.rpeEstimated ? ' (estimated)' : ''}`)
    .join(', ');

  return (
    <View style={styles.container} accessibilityLabel={`RPE profile per set chart. ${summaryText}`}>
      <Text style={styles.title}>RPE PROFILE PER SET</Text>
      
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={280}
          height={150}
          noOfSections={5}
          maxValue={10}
          stepValue={2}
          yAxisLabelTexts={['0', '2', '4', '6', '8', '10']}
          rulesColor={colors.border.subtle}
          rulesThickness={1}
          thickness={3}
          color={colors.border.default}
          dataPointsRadius={6}
          textColor={colors.text.secondary}
          textFontSize={10}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          hideDataPoints={false}
          yAxisColor={colors.border.subtle}
          xAxisColor={colors.border.subtle}
          backgroundColor={colors.bg.secondary}
        />
      </View>
    </View>
  );
}

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
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing[2],
  },
  axisText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: colors.text.muted,
  },
  emptyState: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
});
