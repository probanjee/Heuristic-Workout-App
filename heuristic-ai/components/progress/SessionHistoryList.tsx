/**
 * HeuristicAI — SessionHistoryList Component
 * Displays a list of past training sessions with date, duration, volume, and average RPE.
 * Source of truth: TASK.md (M6 Task 19), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Clock, Weight, Activity, ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import type { SessionData } from '@/heuristic-engine/types';

interface SessionHistoryListProps {
  sessions: SessionData[];
  onSessionSelect: (sessionId: string) => void;
}

function formatDateString(timestamp: number): string {
  const d = new Date(timestamp);
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const weekday = weekdays[d.getDay()];
  const month = months[d.getMonth()];
  const day = d.getDate();

  return `${weekday}, ${month} ${day}`;
}

export function SessionHistoryList({ sessions, onSessionSelect }: SessionHistoryListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workout history available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT HISTORY</Text>

      <View style={styles.list}>
        {sessions.map((session) => {
          const durationMin = session.endedAt
            ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000))
            : 0;

          return (
            <TouchableOpacity
              key={session.id}
              style={styles.card}
              onPress={() => onSessionSelect(session.id || '')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Workout on ${formatDateString(session.startedAt)}. Volume: ${session.totalVolumeKg?.toFixed(0) || 0} kg, RPE: ${session.avgRpe?.toFixed(1) || 'N/A'}. Tap to view details.`}
            >
              <View style={styles.mainInfo}>
                <View style={styles.dateRow}>
                  <Calendar size={12} color={colors.accent.primary} />
                  <Text style={styles.dateText}>
                    {formatDateString(session.startedAt)}
                  </Text>
                </View>
                
                <View style={styles.statsRow}>
                  {/* Volume */}
                  <View style={styles.stat}>
                    <Weight size={10} color={colors.text.muted} />
                    <Text style={styles.statText}>
                      {(session.totalVolumeKg || 0).toFixed(0)} kg
                    </Text>
                  </View>
                  
                  {/* Duration */}
                  <View style={styles.stat}>
                    <Clock size={10} color={colors.text.muted} />
                    <Text style={styles.statText}>{durationMin} MIN</Text>
                  </View>

                  {/* Avg RPE */}
                  <View style={styles.stat}>
                    <Activity size={10} color={colors.text.muted} />
                    <Text style={styles.statText}>
                      RPE {session.avgRpe ? session.avgRpe.toFixed(1) : '6.0'}
                    </Text>
                  </View>
                </View>
              </View>

              <ChevronRight size={16} color={colors.text.muted} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing[2],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
  },
  mainInfo: {
    flex: 1,
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: 8,
    width: '100%',
  },
  emptyText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
});
