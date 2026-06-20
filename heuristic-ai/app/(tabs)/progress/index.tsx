/**
 * HeuristicAI — Progress Dashboard Screen
 * Renders weekly volume stacked bars, RPE trends, 1RM lines, frequency heatmaps, and paginated session history.
 * Source of truth: TASK.md (M6 Task 13, 14), UI_UX_BRIEF.md § 8
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, Flame, Calendar, Award } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useTimeRange } from '@/hooks/useTimeRange';
import SyncStatusBadge from '@/components/sync/SyncStatusBadge';
import LastSyncIndicator from '@/components/sync/LastSyncIndicator';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { TimeRangeSelector } from '@/components/progress/TimeRangeSelector';
import { VolumeBarChart } from '@/components/progress/VolumeBarChart';
import { RPETrendChart } from '@/components/progress/RPETrendChart';
import { OneRMProgressChart } from '@/components/progress/OneRMProgressChart';
import { SessionFrequencyHeatmap } from '@/components/progress/SessionFrequencyHeatmap';
import { SessionHistoryList } from '@/components/progress/SessionHistoryList';
import { SessionDetailSheet } from '@/components/progress/SessionDetailSheet';
import { ProgressEmptyState } from '@/components/progress/ProgressEmptyState';
import { SummaryStatCard } from '@/components/summary/SummaryStatCard';

export default function ProgressDashboard() {
  const router = useRouter();
  const { range, setRange, days } = useTimeRange('30d');
  const {
    loading,
    error,
    totalVolume,
    avgRpe,
    weeklyVolume,
    rpeTrend,
    streak,
    frequency,
    sessionsPerWeek,
    squatOneRmProgress,
    benchOneRmProgress,
    deadliftOneRmProgress,
  } = useProgressAnalytics(days);

  const { sessions, loading: historyLoading } = useSessionHistory(30);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleStartWorkout = () => {
    router.push('/workout');
  };

  const hasSessions = sessions && sessions.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.title} accessibilityRole="header">
              PROGRESS
            </Text>
            <Text style={styles.subtitle}>Historical trends and training metrics</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <SyncStatusBadge />
            <LastSyncIndicator />
          </View>
        </View>
      </View>

      {loading && !hasSessions ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>CALCULATING PROGRESS METRICS...</Text>
        </View>
      ) : !hasSessions ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProgressEmptyState onStartWorkout={handleStartWorkout} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Range Selector */}
          <TimeRangeSelector selectedRange={range} onRangeChange={setRange} />

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <SummaryStatCard
                label="TOTAL VOLUME"
                value={`${totalVolume.toLocaleString()} kg`}
                icon={<TrendingUp size={20} color={colors.accent.primary} />}
                subtitle="Aggregated workload"
              />
            </View>
            <View style={styles.statsRow}>
              <View style={{ flex: 1 }}>
                <SummaryStatCard
                  label="ACTIVE STREAK"
                  value={`${streak.currentStreak} DAYS`}
                  icon={<Flame size={20} color={colors.warning} />}
                  subtitle={`Longest: ${streak.longestStreak} days`}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SummaryStatCard
                  label="FREQUENCY"
                  value={`${sessionsPerWeek} / WK`}
                  icon={<Calendar size={20} color={colors.text.muted} />}
                  subtitle="Completed average"
                />
              </View>
            </View>
          </View>

          {/* Frequency Heatmap */}
          <SessionFrequencyHeatmap frequency={frequency} />

          {/* Volume Stacked Bar Chart */}
          <VolumeBarChart weeklyVolume={weeklyVolume} />

          {/* RPE Trend Chart */}
          <RPETrendChart rpeTrend={rpeTrend} />

          {/* Strength Progression Chart */}
          <OneRMProgressChart
            squatProgression={squatOneRmProgress}
            benchProgression={benchOneRmProgress}
            deadliftProgression={deadliftOneRmProgress}
          />

          {/* Session History List */}
          <SessionHistoryList
            sessions={sessions}
            onSessionSelect={setSelectedSessionId}
          />
        </ScrollView>
      )}

      {/* Slide-Up Detail Modal */}
      <SessionDetailSheet
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[5],
    paddingBottom: spacing[8],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  statsGrid: {
    gap: spacing[2],
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
