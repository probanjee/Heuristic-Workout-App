/**
 * HeuristicAI — Onboarding Goal Card
 * Dark Brutalist selection card for training goals
 * Source of truth: TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface GoalCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  label,
  description,
  icon: Icon,
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
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        <Icon
          size={24}
          color={isSelected ? colors.text.inverse : colors.text.secondary}
          strokeWidth={2}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  iconContainerSelected: {
    backgroundColor: colors.accent.primary,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSelected: {
    color: colors.text.primary,
  },
  description: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
});

export default GoalCard;
