/**
 * HeuristicAI — Session Detail Screen
 * Renders complete logs, volumes, RPE profiles, and coach recommendations for a historical session.
 * Source of truth: TASK.md (M6 Task 20), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Weight, Clock, Activity, Award, ShieldAlert } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useWorkoutSummary } from '@/hooks/useWorkoutSummary';
import { CoachNotes } from '@/components/summary/CoachNotes';
import { SessionExerciseBreakdown } from '@/components/summary/SessionExerciseBreakdown';
import { generateRecoveryRecommendation } from '@/services/analytics/recovery';

function formatDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SessionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { summary, breakdown, session, loading, error } = useWorkoutSummary(id as string);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>HYDRATING WORKOUT LOGS...</Text>
      </SafeAreaView>
    );
  }

  if (error || !summary || !session) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ShieldAlert size={48} color={colors.danger} />
        <Text style={styles.errorText}>FAILED TO RETRIEVE LOGS</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
          <ArrowLeft size={14} color={colors.text.secondary} />
          <Text style={styles.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const durationMin = session.endedAt
    ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000))
    : 0;

  const minFormScore = summary.formSummary && summary.formSummary.length > 0
    ? Math.min(...summary.formSummary.map((f) => f.avgScore))
    : null;

  const rec = generateRecoveryRecommendation(summary.avgRpe, minFormScore, 5.0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleGoBack}
          accessibilityLabel="Go back to progress dashboard"
          accessibilityRole="button"
        >
          <ArrowLeft size={16} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title} accessibilityRole="header">
            WORKOUT DETAILS
          </Text>
          <Text style={styles.subtitle}>{formatDateString(session.startedAt)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Volume */}
          <View style={styles.statBox}>
            <Weight size={14} color={colors.text.muted} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>{summary.totalVolume.toFixed(0)}kg</Text>
          </View>
          
          {/* Duration */}
          <View style={styles.statBox}>
            <Clock size={14} color={colors.text.muted} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{durationMin} MIN</Text>
          </View>

          {/* Avg RPE */}
          <View style={styles.statBox}>
            <Activity size={14} color={colors.text.muted} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>AVG RPE</Text>
            <Text style={styles.statValue}>{summary.avgRpe.toFixed(1)}</Text>
          </View>

          {/* Est. 1RM */}
          {summary.estimatedOneRmKg !== null && (
            <View style={styles.statBox}>
              <Award size={14} color={colors.accent.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>BEST 1RM</Text>
              <Text style={[styles.statValue, { color: colors.accent.primary }]}>
                {summary.estimatedOneRmKg.toFixed(1)}kg
              </Text>
            </View>
          )}
        </View>

        {/* Recovery Advice */}
        <View style={[styles.recoveryCard, { borderColor: rec.severity === 'high' ? colors.danger : rec.severity === 'moderate' ? colors.warning : colors.border.accent }]}>
          <ShieldAlert size={16} color={rec.severity === 'high' ? colors.danger : rec.severity === 'moderate' ? colors.warning : colors.accent.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.recoveryTitle}>RECOVERY STATUS</Text>
            <Text style={styles.recoveryText}>{rec.message}</Text>
          </View>
        </View>

        {/* Coach notes */}
        <CoachNotes topDecisions={summary.topDecisions} />

        {/* Exercise breakdown */}
        <SessionExerciseBreakdown breakdown={breakdown} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[3],
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.secondary,
    flexDirection: 'row',
    gap: 4,
  },
  backBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[8],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  errorText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: colors.danger,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[3],
    alignItems: 'center',
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
    fontSize: 12,
    color: colors.text.primary,
  },
  recoveryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing[4],
  },
  recoveryTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  recoveryText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
