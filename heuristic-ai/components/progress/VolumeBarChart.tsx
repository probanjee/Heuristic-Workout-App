/**
 * HeuristicAI — VolumeBarChart Component
 * Stacked bar chart showing weekly training volume broken down by muscle group.
 * Source of truth: TASK.md (M6 Task 15), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, spacing } from '@/constants/theme';

interface WeeklyVolumeItem {
  week: string; // YYYY-MM-DD
  muscle: string;
  volume: number;
}

interface VolumeBarChartProps {
  weeklyVolume: WeeklyVolumeItem[];
}

// Muscle color mapping (fully compliant with "no purple" constraint)
const MUSCLE_COLORS: Record<string, string> = {
  legs: '#FFB830',      // Amber
  chest: '#00FF87',     // Electric Green
  back: '#FF3B3B',      // Danger Red
  shoulders: '#00E0FF', // Electric Cyan
  arms: '#FF8A00',      // Electric Orange
  core: '#E0E0E0',      // Light Gray
  other: '#666666',     // Medium Gray
};

export const VolumeBarChart = React.memo(function VolumeBarChart({ weeklyVolume }: VolumeBarChartProps) {
  if (!weeklyVolume || weeklyVolume.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WEEKLY VOLUME BY MUSCLE</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No volume data recorded in this range.</Text>
        </View>
      </View>
    );
  }

  // Identify unique weeks and unique muscles
  const uniqueWeeks = Array.from(new Set(weeklyVolume.map((item) => item.week))).sort();
  
  // Format data into stack format for react-native-gifted-charts
  const stackData = uniqueWeeks.map((week) => {
    const weekItems = weeklyVolume.filter((item) => item.week === week);
    const stacks = weekItems.map((item) => {
      const muscleKey = item.muscle.toLowerCase();
      const color = MUSCLE_COLORS[muscleKey] || MUSCLE_COLORS.other;
      return {
        value: item.volume,
        color: color,
      };
    });

    // Format label as MM/DD from YYYY-MM-DD
    const parts = week.split('-');
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : week;

    return {
      stacks,
      label,
    };
  });

  // accessibility summary
  const summaryText = uniqueWeeks
    .map((week) => {
      const items = weeklyVolume.filter((item) => item.week === week);
      const parts = items.map((i) => `${i.muscle}: ${Math.round(i.volume)}kg`);
      return `Week of ${week}: ${parts.join(', ')}`;
    })
    .join('. ');

  return (
    <View style={styles.container} accessibilityLabel={`Weekly volume stacked bar chart. ${summaryText}`}>
      <Text style={styles.title}>WEEKLY VOLUME BY MUSCLE</Text>

      <View style={styles.chartWrapper}>
        <BarChart
          stackData={stackData}
          width={280}
          height={160}
          barWidth={18}
          spacing={16}
          noOfSections={4}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          yAxisColor={colors.border.subtle}
          xAxisColor={colors.border.subtle}
          rulesColor={colors.border.subtle}
          backgroundColor={colors.bg.secondary}
        />
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {Object.entries(MUSCLE_COLORS).map(([muscle, color]) => {
          // Check if this muscle exists in the active range data
          const exists = weeklyVolume.some((item) => item.muscle.toLowerCase() === muscle);
          if (!exists) return null;
          return (
            <View key={muscle} style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{muscle.toUpperCase()}</Text>
            </View>
          );
        })}
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
  },
  axisText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 8,
    color: colors.text.muted,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
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
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
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
