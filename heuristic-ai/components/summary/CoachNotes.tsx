/**
 * HeuristicAI — CoachNotes Component
 * Displays the list of matched heuristic rules and AI coaching recommendations.
 * Source of truth: TASK.md (M6 Task 10), UI_UX_BRIEF.md § 8
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface DecisionItem {
  coachNote: string;
  count: number;
}

interface CoachNotesProps {
  topDecisions: DecisionItem[];
}

export function CoachNotes({ topDecisions }: CoachNotesProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const hasDecisions = topDecisions && topDecisions.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Coaching logs and matched rules section"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.title}>COACHING LOGS & RULES</Text>
        {expanded ? (
          <ChevronUp size={16} color={colors.text.secondary} />
        ) : (
          <ChevronDown size={16} color={colors.text.secondary} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {!hasDecisions ? (
            <View style={styles.emptyCard}>
              <Info size={16} color={colors.accent.primary} style={styles.cardIcon} />
              <Text style={styles.emptyText}>
                No major heuristic adjustments were triggered. Form and output stayed within nominal ranges. Keep it up!
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {topDecisions.map((decision, idx) => (
                <View key={idx} style={styles.item}>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <AlertCircle size={10} color={colors.accent.primary} />
                      <Text style={styles.badgeText}>RULE TRIGGERED</Text>
                    </View>
                    <Text style={styles.countText}>
                      Matched {decision.count} {decision.count === 1 ? 'set' : 'sets'}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>"{decision.coachNote}"</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  content: {
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing[4],
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 6,
    padding: spacing[3],
  },
  cardIcon: {
    marginTop: 2,
    marginRight: spacing[2],
  },
  emptyText: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  list: {
    gap: spacing[3],
  },
  item: {
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    padding: spacing[3],
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.border.accent,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  countText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    color: colors.text.muted,
  },
  noteText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
});
