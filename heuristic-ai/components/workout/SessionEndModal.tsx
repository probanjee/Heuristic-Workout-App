/**
 * HeuristicAI — Session End Confirmation Modal Component
 * Prompts user to confirm ending the session and provides a quick summary metrics preview
 * Source of truth: TASK.md § 13, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, Play, Square } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { calculateTotalVolume, calculateAverageRPE } from '@/services/workout-summary';

interface SessionEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SessionEndModal({ isOpen, onClose, onConfirm }: SessionEndModalProps) {
  const { sets } = useWorkoutStore();

  if (!isOpen) return null;

  const totalVolume = calculateTotalVolume(sets);
  const avgRpe = calculateAverageRPE(sets);
  const completedSets = sets.length;

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Warn Icon & Title */}
          <View style={styles.warnHeader}>
            <AlertCircle size={32} color={colors.danger} />
            <Text style={styles.title}>END WORKOUT?</Text>
            <Text style={styles.subtitle}>
              Are you sure you want to finish today's training session?
            </Text>
          </View>

          {/* Quick Stats Preview */}
          <View style={styles.statsPreview}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VOLUME</Text>
              <Text style={styles.statValue}>
                {totalVolume.toFixed(0)}
                <Text style={styles.statUnit}>kg</Text>
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SETS DONE</Text>
              <Text style={styles.statValue}>{completedSets}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AVG RPE</Text>
              <Text style={styles.statValue}>{avgRpe.toFixed(1)}</Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.endBtn}
              onPress={handleConfirm}
              accessibilityLabel="Confirm end workout session"
              accessibilityRole="button"
            >
              <Square size={14} color={colors.text.inverse} fill={colors.text.inverse} />
              <Text style={styles.endBtnText}>END SESSION</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleCancel}
              accessibilityLabel="Continue workout session"
              accessibilityRole="button"
            >
              <Play size={14} color={colors.text.secondary} />
              <Text style={styles.continueBtnText}>KEEP TRAINING</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  container: {
    width: '100%',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[5],
    alignItems: 'center',
  },
  warnHeader: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing[4],
  },
  statsPreview: {
    flexDirection: 'row',
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: spacing[3],
    gap: spacing[2],
    marginBottom: spacing[6],
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.text.primary,
  },
  statUnit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.secondary,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  endBtn: {
    width: '100%',
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  endBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  continueBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  continueBtnText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },
});
