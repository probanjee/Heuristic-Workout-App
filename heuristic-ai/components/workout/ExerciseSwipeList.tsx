/**
 * HeuristicAI — Exercise Swipe List Component
 * Horizontal navigation showing exercises in the current session and their completion states
 * Source of truth: TASK.md § 10, UI_UX_BRIEF.md
 */

import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';
import type { ExerciseData, SetData } from '@/heuristic-engine/types';

interface ExerciseSwipeListProps {
  exercises: ExerciseData[];
  currentExerciseIndex: number;
  onSelectExercise: (index: number) => void;
  sets: SetData[];
  disabled: boolean;
}

export function ExerciseSwipeList({
  exercises,
  currentExerciseIndex,
  onSelectExercise,
  sets,
  disabled,
}: ExerciseSwipeListProps) {
  const handleSelect = (index: number) => {
    if (disabled || index === currentExerciseIndex) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectExercise(index);
  };

  return (
    <View
      style={[styles.container, disabled && styles.disabledContainer]}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityRole="tablist"
      >
        {exercises.map((exercise, index) => {
          const isActive = index === currentExerciseIndex;
          
          // Filter sets logged for this specific exercise
          const exerciseSets = sets.filter((s) => s.exerciseSlug === exercise.slug);
          const completedCount = exerciseSets.length;
          
          // We assume a standard target of 4 sets for display indicators (or count of logged sets + remaining target sets)
          // Let's draw indicators up to 4 sets, or completedCount, whichever is greater
          const totalSetsDisplay = Math.max(4, completedCount);
          
          return (
            <TouchableOpacity
              key={exercise.slug}
              style={[
                styles.itemCard,
                isActive && styles.activeItemCard,
              ]}
              onPress={() => handleSelect(index)}
              accessibilityLabel={`Exercise ${index + 1}: ${exercise.name}. ${completedCount} sets completed. Tap to view.`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              {/* Exercise Name */}
              <Text style={[styles.nameText, isActive && styles.activeNameText]}>
                {exercise.name.toUpperCase()}
              </Text>

              {/* Set Completion Indicators (Row of tiny dots/blocks) */}
              <View style={styles.indicatorRow}>
                {Array.from({ length: totalSetsDisplay }).map((_, setIdx) => {
                  const isSetCompleted = setIdx < completedCount;
                  return (
                    <View
                      key={setIdx}
                      style={[
                        styles.indicatorBlock,
                        isSetCompleted
                          ? styles.completedBlock
                          : styles.pendingBlock,
                      ]}
                    />
                  );
                })}
              </View>

              {/* Text summary label */}
              <Text style={styles.summaryLabel}>
                {completedCount} sets logged
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    backgroundColor: colors.bg.primary,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  itemCard: {
    width: 140,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[3],
    justifyContent: 'space-between',
  },
  activeItemCard: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(0, 255, 135, 0.04)',
  },
  nameText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 15,
    marginBottom: spacing[2],
  },
  activeNameText: {
    color: colors.accent.primary,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing[2],
  },
  indicatorBlock: {
    flex: 1,
    height: 4,
    borderRadius: 1,
  },
  completedBlock: {
    backgroundColor: colors.accent.primary,
  },
  pendingBlock: {
    backgroundColor: colors.border.default,
  },
  summaryLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 10,
    color: colors.text.muted,
  },
});
