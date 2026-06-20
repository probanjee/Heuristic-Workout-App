/**
 * File: app/dev/heuristic-engine-test.tsx
 * Purpose: Dev QA utility screen for testing Heuristic Rule Engine evaluations in real-time
 * Dependencies: react, react-native, expo-router, lucide-react-native, @/constants/theme, @/heuristic-engine
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Brain, ShieldAlert, Award } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { evaluateSet } from '@/heuristic-engine';
import type { HeuristicDecision, SetInput, RecoveryFlag } from '@/heuristic-engine/types';

export default function HeuristicEngineTestScreen() {
  const router = useRouter();

  // Input States
  const [targetReps, setTargetReps] = useState('6');
  const [completedReps, setCompletedReps] = useState('6');
  const [targetWeight, setTargetWeight] = useState('80');
  const [rpe, setRpe] = useState('7');
  const [formScore, setFormScore] = useState(''); // blank = null (camera off)
  const [sessionFatigue, setSessionFatigue] = useState('7.0');
  const [hasRecoveryFlag, setHasRecoveryFlag] = useState(false);
  const [consecutiveHighRpe, setConsecutiveHighRpe] = useState('0');

  // Output State
  const [decision, setDecision] = useState<HeuristicDecision | null>(null);

  const handleEvaluate = () => {
    // Construct mock active recovery flags list
    const recoveryFlags: RecoveryFlag[] = [];
    if (hasRecoveryFlag) {
      recoveryFlags.push({
        exerciseSlug: 'barbell-squat',
        flagType: 'volume_reduction',
        activeUntil: Date.now() + 24 * 60 * 60 * 1000,
        reason: 'Simulated muscle soreness flag',
      });
    }

    // Parse input fields
    const input: SetInput = {
      exerciseSlug: 'barbell-squat',
      setNumber: 2,
      targetReps: parseInt(targetReps) || 6,
      completedReps: parseInt(completedReps) || 6,
      targetWeightKg: parseFloat(targetWeight) || 0,
      rpe: rpe ? parseFloat(rpe) : null,
      rpeEstimated: false,
      formScore: formScore ? parseInt(formScore) : null,
      sessionFatigueIndex: parseFloat(sessionFatigue) || 0,
      recoveryFlags,
      heuristicProfile: {
        exerciseSlug: 'barbell-squat',
        estimatedOneRmKg: 100,
        avgRpeLast5: 7,
        bestVolumeSession: 5000,
        consecutiveHighRpe: parseInt(consecutiveHighRpe) || 0,
        lastSessionId: null,
        updatedAt: Date.now(),
      },
      currentTimestamp: Date.now(),
    };

    const res = evaluateSet(input);
    setDecision(res);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.accent.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HEURISTIC TESTER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>HEURISTIC ENGINE SIMULATOR</Text>
        <Text style={styles.sub}>Adjust set details to trigger rules and inspect recommendations.</Text>

        {/* Inputs Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SET INPUT PARAMETERS</Text>

          {/* Target Weight & Target Reps */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                placeholder="e.g. 80"
                placeholderTextColor={colors.text.muted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Reps</Text>
              <TextInput
                style={styles.input}
                value={targetReps}
                onChangeText={setTargetReps}
                keyboardType="numeric"
                placeholder="e.g. 6"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          </View>

          {/* Completed Reps & RPE */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Completed Reps</Text>
              <TextInput
                style={styles.input}
                value={completedReps}
                onChangeText={setCompletedReps}
                keyboardType="numeric"
                placeholder="e.g. 6"
                placeholderTextColor={colors.text.muted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Logged RPE (1-10)</Text>
              <TextInput
                style={styles.input}
                value={rpe}
                onChangeText={setRpe}
                keyboardType="numeric"
                placeholder="e.g. 7"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          </View>

          {/* Form Score & Fatigue Index */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Form Score (0-100 or null)</Text>
              <TextInput
                style={styles.input}
                value={formScore}
                onChangeText={setFormScore}
                keyboardType="numeric"
                placeholder="Camera off (null)"
                placeholderTextColor={colors.text.muted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fatigue Index (RPE Avg)</Text>
              <TextInput
                style={styles.input}
                value={sessionFatigue}
                onChangeText={setSessionFatigue}
                keyboardType="numeric"
                placeholder="e.g. 7.0"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          </View>

          {/* Consecutive Tough Sessions & Recovery Flag Toggle */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Consecutive Tough Sessions</Text>
              <TextInput
                style={styles.input}
                value={consecutiveHighRpe}
                onChangeText={setConsecutiveHighRpe}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.muted}
              />
            </View>
            <View style={[styles.inputGroup, styles.switchGroup]}>
              <Text style={styles.label}>Recovery Flag Active</Text>
              <Switch
                value={hasRecoveryFlag}
                onValueChange={setHasRecoveryFlag}
                trackColor={{ false: '#2A2A2A', true: colors.accent.primary }}
                thumbColor={colors.text.primary}
              />
            </View>
          </View>

          {/* Evaluate Button */}
          <TouchableOpacity style={styles.evalButton} onPress={handleEvaluate}>
            <Brain size={18} color={colors.text.inverse} style={{ marginRight: spacing[2] }} />
            <Text style={styles.evalButtonText}>RUN EVALUATION</Text>
          </TouchableOpacity>
        </View>

        {/* Output Decision Card */}
        {decision && (
          <View style={[styles.card, styles.decisionCard]}>
            <View style={styles.decisionHeader}>
              <Text style={styles.cardHeader}>DECISION MATRIX OUTPUT</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  CONFIDENCE: {Math.round(decision.confidenceScore * 100)}%
                </Text>
              </View>
            </View>

            {/* Coach Note (Human explanation) */}
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{decision.coachNote}</Text>
            </View>

            {/* Matched Rule & Action Type */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Matched Rule:</Text>
              <Text style={[styles.detailVal, styles.monoText]}>
                {decision.ruleMatched || 'fallback (none)'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Action Type:</Text>
              <Text style={[styles.detailVal, styles.monoText, { color: colors.accent.primary }]}>
                {decision.actionType}
              </Text>
            </View>

            {/* Recommendations */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>RECOMMENDATIONS FOR NEXT SET</Text>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridValue}>{decision.nextSetWeightKg.toFixed(1)} kg</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Target Reps</Text>
                <Text style={styles.gridValue}>{decision.nextSetTargetReps}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Add Rest</Text>
                <Text style={styles.gridValue}>+{decision.additionalRestSeconds} s</Text>
              </View>
            </View>

            {/* Flags */}
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Add Drop Set:</Text>
              <Text style={[styles.detailVal, { color: decision.addDropSet ? colors.success : colors.text.muted }]}>
                {decision.addDropSet ? 'YES' : 'NO'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Substitute Exercise:</Text>
              <Text style={[styles.detailVal, { color: decision.substituteExercise ? colors.warning : colors.text.muted }]}>
                {decision.substituteExercise || 'NONE'}
              </Text>
            </View>

            {/* Warnings */}
            {decision.terminateSessionWarning && (
              <View style={[styles.alertBox, styles.dangerAlert]}>
                <ShieldAlert size={16} color={colors.danger} style={{ marginRight: spacing[2] }} />
                <Text style={styles.alertText}>
                  WARNING: Terminate workout session recommended due to high cumulative fatigue.
                </Text>
              </View>
            )}

            {decision.recoveryFlagToCreate && (
              <View style={[styles.alertBox, styles.warningAlert]}>
                <Award size={16} color={colors.warning} style={{ marginRight: spacing[2] }} />
                <Text style={styles.alertText}>
                  RECOVERY FLAG INITIATED: {decision.recoveryFlagToCreate.flagType} for {decision.recoveryFlagToCreate.activeUntilHours}h.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  scroll: {
    padding: spacing[6],
    gap: spacing[4],
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: typography.fonts.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    gap: spacing[4],
  },
  cardHeader: {
    fontFamily: typography.fonts.heading,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  inputGroup: {
    flex: 1,
    gap: spacing[1],
  },
  switchGroup: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.primary,
    color: colors.text.primary,
    fontFamily: typography.fonts.mono,
    fontSize: 14,
    paddingHorizontal: spacing[3],
    borderRadius: 4,
  },
  evalButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  evalButtonText: {
    fontFamily: typography.fonts.heading,
    fontSize: 13,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  decisionCard: {
    borderColor: colors.border.accent,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.accent.dim,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  badgeText: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 10,
    color: colors.accent.primary,
  },
  noteBox: {
    backgroundColor: colors.bg.elevated,
    padding: spacing[3],
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  },
  noteText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.fonts.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  detailVal: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  monoText: {
    fontFamily: typography.fonts.mono,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing[2],
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.bg.elevated,
    padding: spacing[3],
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  gridLabel: {
    fontFamily: typography.fonts.body,
    fontSize: 11,
    color: colors.text.secondary,
  },
  gridValue: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 18,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 4,
    borderWidth: 1,
    marginTop: spacing[2],
  },
  dangerAlert: {
    backgroundColor: 'rgba(255,59,59,0.08)',
    borderColor: colors.border.danger,
  },
  warningAlert: {
    backgroundColor: 'rgba(255,184,48,0.08)',
    borderColor: colors.border.warning,
  },
  alertText: {
    fontFamily: typography.fonts.body,
    fontSize: 12,
    color: colors.text.primary,
    flex: 1,
  },
});
