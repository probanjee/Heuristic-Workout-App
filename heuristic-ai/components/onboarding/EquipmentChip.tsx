/**
 * HeuristicAI — Onboarding Equipment Chip
 * Dark Brutalist select chip for available equipment
 * Source of truth: TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface EquipmentChipProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const EquipmentChip: React.FC<EquipmentChipProps> = ({
  label,
  emoji,
  isSelected,
  onPress,
  accessibilityLabel,
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
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
      <View style={styles.iconContainer}>
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
  emoji: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  label: {
    flex: 1,
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.text.primary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EquipmentChip;
