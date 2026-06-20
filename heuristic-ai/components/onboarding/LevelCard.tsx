/**
 * HeuristicAI — Onboarding Level Card
 * Dark Brutalist selection card for training levels
 * Source of truth: TASK.md Task 5, UI_UX_BRIEF.md
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface LevelCardProps {
  label: string;
  description: string;
  detail: string;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  label,
  description,
  detail,
  isSelected,
  onPress,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
      <Text style={styles.description}>{description}</Text>
      {isSelected && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>{detail}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    marginBottom: spacing[3],
  },
  cardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.dim,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  labelSelected: {
    color: colors.text.primary,
  },
  description: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.muted,
  },
  detailContainer: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.accent,
  },
  detailText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.accent.primary,
  },
});

export default LevelCard;
