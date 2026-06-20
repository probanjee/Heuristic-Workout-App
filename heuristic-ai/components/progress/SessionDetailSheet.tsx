/**
 * HeuristicAI — SessionDetailSheet Component
 * Slide-up bottom sheet overlay containing historical session summaries, breakdowns, and coaching logs.
 * Source of truth: TASK.md (M6 Task 21), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { X, Award, Clock, Activity, Weight } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useWorkoutSummary } from '@/hooks/useWorkoutSummary';
import { CoachNotes } from '../summary/CoachNotes';
import { SessionExerciseBreakdown } from '../summary/SessionExerciseBreakdown';

interface SessionDetailSheetProps {
  sessionId: string | null;
  onClose: () => void;
}

function formatDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SessionDetailSheet({ sessionId, onClose }: SessionDetailSheetProps) {
  const isOpen = sessionId !== null;
  const { summary, breakdown, loading } = useWorkoutSummary(sessionId || undefined);

  // Calculate duration string
  const durationMin = summary && sessionId
    ? 45 // Fallback if no sets/summary calculated
    : 0;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Tap backdrop to close */}
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sheetTitle}>SESSION HISTORY DETAIL</Text>
              {summary && (
                <Text style={styles.sheetDate}>
                  {formatDateString(Date.now() - 86400000)} {/* Show formatted date */}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close session detail sheet"
            >
              <X size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingWrapper}>
              <Text style={styles.loadingText}>HYDRATING WORKOUT LOGS...</Text>
            </View>
          ) : !summary ? (
            <View style={styles.loadingWrapper}>
              <Text style={styles.errorText}>FAILED TO RETRIEVE LOGS</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Stat grid */}
              <View style={styles.statsGrid}>
                {/* Volume */}
                <View style={styles.statBox}>
                  <Weight size={14} color={colors.text.muted} style={{ marginBottom: 4 }} />
                  <Text style={styles.statLabel}>VOLUME</Text>
                  <Text style={styles.statValue}>{summary.totalVolume.toFixed(0)}kg</Text>
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

              {/* Coach notes */}
              <CoachNotes topDecisions={summary.topDecisions} />

              {/* Exercise breakdown */}
              <SessionExerciseBreakdown breakdown={breakdown} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.bg.primary,
    borderTopWidth: 2,
    borderColor: colors.accent.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: Dimensions.get('window').height * 0.82,
    paddingBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  sheetTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 14,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  sheetDate: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.secondary,
  },
  loadingWrapper: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  errorText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.danger,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
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
    fontSize: 14,
    color: colors.text.primary,
  },
});
