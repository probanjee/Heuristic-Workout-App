/**
 * HeuristicAI — TimeRangeSelector Component
 * Flat brutalist filter tabs for switching dashboard time scopes.
 * Source of truth: TASK.md (M6 Task 14), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import type { TimeRangeKey } from '@/hooks/useTimeRange';

interface TimeRangeSelectorProps {
  selectedRange: TimeRangeKey;
  onRangeChange: (range: TimeRangeKey) => void;
}

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  const ranges: { key: TimeRangeKey; label: string }[] = [
    { key: '7d', label: '7 DAYS' },
    { key: '30d', label: '30 DAYS' },
    { key: '90d', label: '90 DAYS' },
    { key: 'all', label: 'ALL TIME' },
  ];

  return (
    <View style={styles.container}>
      {ranges.map((r) => {
        const isActive = selectedRange === r.key;
        return (
          <TouchableOpacity
            key={r.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onRangeChange(r.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${r.label}`}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    padding: spacing[1],
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: colors.text.inverse,
  },
});
