/**
 * HeuristicAI — SessionFrequencyHeatmap Component
 * Calendar-style training frequency grid where cell opacity maps to workout count.
 * Source of truth: TASK.md (M6 Task 18), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface SessionFrequencyHeatmapProps {
  frequency: Record<string, number>; // YYYY-MM-DD -> session count
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function SessionFrequencyHeatmap({ frequency }: SessionFrequencyHeatmapProps) {
  // Generate last 6 weeks of days (42 days)
  // To align weeks, start from the Sunday 5 weeks ago
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOffset = today.getDay(); // Sunday=0, Monday=1
  const totalDays = 42; // 6 weeks
  const startDate = new Date(today.getTime());
  // Go back 5 full weeks plus the days elapsed in the current week to start on a Sunday
  startDate.setDate(today.getDate() - 35 - startOffset);

  const grid: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + i);
    currentWeek.push(d);

    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }

  const todayStr = formatDate(today);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Count total workouts in the heatmap range
  let totalWorkouts = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + i);
    const dateStr = formatDate(d);
    totalWorkouts += frequency[dateStr] ?? 0;
  }

  return (
    <View style={styles.container} accessibilityLabel={`Training frequency heatmap. ${totalWorkouts} sessions completed in the last 6 weeks.`}>
      <Text style={styles.title}>CONSISTENCY HEATMAP</Text>

      {/* Week days header */}
      <View style={styles.daysHeader}>
        {weekDays.map((day, idx) => (
          <Text key={idx} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Heatmap Grid */}
      <View style={styles.grid}>
        {grid.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.weekRow}>
            {week.map((day, dayIdx) => {
              const dateStr = formatDate(day);
              const count = frequency[dateStr] ?? 0;
              const isToday = dateStr === todayStr;

              // Calculate cell styling
              let cellBg = 'transparent';
              let cellOpacity = 1;
              let borderStyle: any = 'solid';

              if (count > 0) {
                cellBg = colors.accent.primary;
                if (count === 1) {
                  cellOpacity = 0.35;
                } else if (count === 2) {
                  cellOpacity = 0.70;
                } else {
                  cellOpacity = 1.0;
                }
              }

              return (
                <View
                  key={dayIdx}
                  style={[
                    styles.cell,
                    count > 0 && { backgroundColor: cellBg, opacity: cellOpacity },
                    isToday && styles.todayCell,
                  ]}
                  accessibilityLabel={`${day.toLocaleDateString()}: ${count} ${count === 1 ? 'session' : 'sessions'} completed.`}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Grid Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>LESS</Text>
        <View style={[styles.cell, styles.cellBorder]} />
        <View style={[styles.cell, { backgroundColor: colors.accent.primary, opacity: 0.35 }]} />
        <View style={[styles.cell, { backgroundColor: colors.accent.primary, opacity: 0.70 }]} />
        <View style={[styles.cell, { backgroundColor: colors.accent.primary, opacity: 1.0 }]} />
        <Text style={styles.legendLabel}>MORE</Text>
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
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
    marginBottom: 6,
  },
  dayLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    width: 28,
    textAlign: 'center',
  },
  grid: {
    gap: 6,
    paddingHorizontal: spacing[1],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 4,
  },
  cellBorder: {
    borderColor: colors.border.subtle,
  },
  todayCell: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing[4],
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    paddingTop: spacing[3],
  },
  legendLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginHorizontal: 4,
  },
});
