/**
 * HeuristicAI — Override Sheet Component
 * Allows manual overrides of target weight and reps for the next set
 * Source of truth: TASK.md § 9, UI_UX_BRIEF.md
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';

interface OverrideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeightKg: number;
  currentReps: number;
}

export function OverrideSheet({
  isOpen,
  onClose,
  currentWeightKg,
  currentReps,
}: OverrideSheetProps) {
  const { overrideDecision } = useWorkoutStore();
  const [weightText, setWeightText] = useState(currentWeightKg.toFixed(1));
  const [repsText, setRepsText] = useState(currentReps.toString());
  const [restText, setRestText] = useState('90');
  const [reason, setReason] = useState('');

  // Sync state with props when open
  useEffect(() => {
    if (isOpen) {
      setWeightText(currentWeightKg.toFixed(1));
      setRepsText(currentReps.toString());
    }
  }, [isOpen, currentWeightKg, currentReps]);

  const handleWeightChange = (text: string) => {
    // Only allow numbers and decimal
    const sanitized = text.replace(/[^0-9.]/g, '');
    setWeightText(sanitized);
  };

  const handleRepsChange = (text: string) => {
    // Only allow integers
    const sanitized = text.replace(/[^0-9]/g, '');
    setRepsText(sanitized);
  };

  const adjustWeight = (delta: number) => {
    Haptics.selectionAsync();
    const val = parseFloat(weightText) || 0;
    const nextVal = Math.max(0, val + delta);
    // Round to nearest 0.5kg
    const rounded = Math.round(nextVal * 2) / 2;
    setWeightText(rounded.toFixed(1));
  };

  const adjustReps = (delta: number) => {
    Haptics.selectionAsync();
    const val = parseInt(repsText, 10) || 0;
    const nextVal = Math.max(1, val + delta);
    setRepsText(nextVal.toString());
  };

  const handleApply = async () => {
    const finalWeight = parseFloat(weightText);
    const finalReps = parseInt(repsText, 10);

    if (isNaN(finalWeight) || finalWeight < 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (isNaN(finalReps) || finalReps <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Round weight strictly to nearest 0.5kg
    const roundedWeight = Math.round(finalWeight * 2) / 2;
    
    await overrideDecision(roundedWeight, finalReps);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>OVERRIDE TARGETS</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Cancel override adjustment"
              accessibilityRole="button"
            >
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Stepper Weight Row */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>TARGET WEIGHT (KG)</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustWeight(-2.5)}
                accessibilityLabel="Decrease weight by 2.5 kilograms"
              >
                <Text style={styles.stepperBtnText}>-2.5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustWeight(-0.5)}
                accessibilityLabel="Decrease weight by 0.5 kilograms"
              >
                <Text style={styles.stepperBtnText}>-0.5</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={weightText}
                onChangeText={handleWeightChange}
                accessibilityLabel="Target weight in kilograms input field"
              />

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustWeight(0.5)}
                accessibilityLabel="Increase weight by 0.5 kilograms"
              >
                <Text style={styles.stepperBtnText}>+0.5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustWeight(2.5)}
                accessibilityLabel="Increase weight by 2.5 kilograms"
              >
                <Text style={styles.stepperBtnText}>+2.5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stepper Reps Row */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>TARGET REPS</Text>
            <View style={styles.stepperContainer}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustReps(-1)}
                accessibilityLabel="Decrease reps by 1"
              >
                <Text style={styles.stepperBtnText}>-1</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.textInput, { minWidth: 80 }]}
                keyboardType="number-pad"
                value={repsText}
                onChangeText={handleRepsChange}
                accessibilityLabel="Target rep count input field"
              />

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustReps(1)}
                accessibilityLabel="Increase reps by 1"
              >
                <Text style={styles.stepperBtnText}>+1</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
            </View>
          </View>

          {/* Rest Duration Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>REST DURATION (SECONDS)</Text>
            <TextInput
              style={[styles.textInput, styles.singleInput]}
              keyboardType="number-pad"
              value={restText}
              onChangeText={(text) => setRestText(text.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 90"
              placeholderTextColor={colors.text.muted}
              accessibilityLabel="Target rest duration in seconds input field"
            />
          </View>

          {/* Reason Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>REASON FOR OVERRIDE (OPTIONAL)</Text>
            <TextInput
              style={[styles.textInput, styles.singleInput, { height: 44 }]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. equipment taken, feeling strong"
              placeholderTextColor={colors.text.muted}
              accessibilityLabel="Reason for manual override input field"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              accessibilityLabel="Apply manual targets override"
              accessibilityRole="button"
            >
              <Check size={16} color={colors.text.inverse} strokeWidth={2.5} />
              <Text style={styles.applyBtnText}>APPLY OVERRIDE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityLabel="Cancel targets override"
              accessibilityRole="button"
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
  },
  inputSection: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  stepperBtn: {
    width: 48,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.text.secondary,
  },
  textInput: {
    flex: 2,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    backgroundColor: colors.bg.secondary,
    color: colors.text.primary,
    fontFamily: 'DMMono_500Medium',
    fontSize: 18,
    textAlign: 'center',
  },
  singleInput: {
    textAlign: 'left',
    paddingHorizontal: spacing[3],
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  applyBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.muted,
  },
});
