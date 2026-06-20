/**
 * HeuristicAI — RPETrendChart Component
 * Line chart displaying RPE trends, estimated vs logged markers, and high-intensity alerts.
 * Source of truth: TASK.md (M6 Task 16), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, spacing } from '@/constants/theme';

interface RPETrendItem {
  date: string; // YYYY-MM-DD
  avgRpe: number;
  isEstimated: boolean;
}

interface RPETrendChartProps {
  rpeTrend: RPETrendItem[];
}

export const RPETrendChart = React.memo(function RPETrendChart({ rpeTrend }: RPETrendChartProps) {
  if (!rpeTrend || rpeTrend.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>RPE INTENSITY TRENDS</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No RPE intensity data logged in this range.</Text>
        </View>
      </View>
    );
  }

  // Map to GiftedCharts format
  const chartData = rpeTrend.map((item) => {
    let pointColor: string = colors.accent.primary; // default: green
    let radius = 4;

    if (item.avgRpe >= 8.0) {
      pointColor = colors.danger; // High RPE = Red
      radius = 6;
    } else if (item.isEstimated) {
      pointColor = colors.warning; // Estimated RPE = Amber
      radius = 5;
    }

    const parts = item.date.split('-');
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.date;

    return {
      value: item.avgRpe,
      label,
      dataPointColor: pointColor,
      dataPointRadius: radius,
    };
  });

  // accessibility text summary
  const summaryText = rpeTrend
    .map((item) => `${item.date}: Avg RPE ${item.avgRpe}${item.isEstimated ? ' (estimated)' : ''}`)
    .join(', ');

  return (
    <View style={styles.container} accessibilityLabel={`RPE intensity trend chart. ${summaryText}`}>
      <Text style={styles.title}>RPE INTENSITY TRENDS</Text>

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

      {/* Markers Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.accent.primary }]} />
          <Text style={styles.legendLabel}>NOMINAL (&lt;8)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendLabel}>ESTIMATED (AUTO)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendLabel}>HIGH (&ge;8)</Text>
        </View>
      </View>
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
  legendRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
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
