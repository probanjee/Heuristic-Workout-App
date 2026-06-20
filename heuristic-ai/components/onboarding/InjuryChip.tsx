/**
 * HeuristicAI — Onboarding Injury Chip
 * Dark Brutalist select chip for injury history
 * Source of truth: TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface InjuryChipProps {
  label: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}

export const InjuryChip: React.FC<InjuryChipProps> = ({
  label,
  description,
  isSelected,
  onPress,
  accessibilityLabel,
  icon: CustomIcon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      {CustomIcon && (
        <View style={styles.iconContainer}>
          <CustomIcon size={20} color={isSelected ? colors.accent.primary : colors.text.muted} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        {isSelected ? (
          <CheckSquare size={20} color={colors.accent.primary} strokeWidth={2.5} />
        ) : (
          <Square size={20} color={colors.text.muted} strokeWidth={1.5} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    marginBottom: spacing[3],
  },
  chipSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.dim,
  },
  iconContainer: {
    marginRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
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
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[3],
  },
});

export default InjuryChip;
