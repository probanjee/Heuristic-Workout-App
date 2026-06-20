/**
 * HeuristicAI — Onboarding: Baseline Test (Step 6 of 7)
 * Collect starting rep and weight records to seed progression rules
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 8, UI_UX_BRIEF.md
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { SkipButton } from '@/components/onboarding/SkipButton';
import { colors, spacing } from '@/constants/theme';

export default function BaselineScreen() {
  const router = useRouter();
  const { baselineResults, setBaseline, totalSteps } = useOnboarding();

  // Local state for inputs to allow smooth editing, seeded from store
  const [pushups, setPushups] = useState(
    baselineResults.pushups !== null ? baselineResults.pushups.toString() : ''
  );
  const [squats, setSquats] = useState(
    baselineResults.squats !== null ? baselineResults.squats.toString() : ''
  );
  const [bench, setBench] = useState(
    baselineResults.bench !== null ? baselineResults.bench.toString() : ''
  );
  const [squatLift, setSquatLift] = useState(
    baselineResults.squat !== null ? baselineResults.squat.toString() : ''
  );
  const [deadlift, setDeadlift] = useState(
    baselineResults.deadlift !== null ? baselineResults.deadlift.toString() : ''
  );

  const handleSaveAndNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Parse values to number or null
    const pushupsNum = parseInt(pushups, 10);
    const squatsNum = parseInt(squats, 10);
    const benchNum = parseInt(bench, 10);
    const squatLiftNum = parseInt(squatLift, 10);
    const deadliftNum = parseInt(deadlift, 10);

    setBaseline({
      pushups: isNaN(pushupsNum) ? null : pushupsNum,
      squats: isNaN(squatsNum) ? null : squatsNum,
      bench: isNaN(benchNum) ? null : benchNum,
      squat: isNaN(squatLiftNum) ? null : squatLiftNum,
      deadlift: isNaN(deadliftNum) ? null : deadliftNum,
    });

    router.push('/(onboarding)/account');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Move forward without updating store baseline fields
    router.push('/(onboarding)/account');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          {/* Top Actions Row: Back & Skip */}
          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Go back to previous screen"
              accessibilityRole="button"
            >
              <Text style={styles.backText}>← BACK</Text>
            </TouchableOpacity>
            <SkipButton onPress={handleSkip} />
          </View>

          {/* Onboarding Header */}
          <OnboardingHeader
            currentStep={getCurrentStepIndex()}
            totalSteps={totalSteps}
            title="Calibrate your starting weights"
            subtitle="Optional: Input your estimated rep maxes and weights to help the coach build your starting workouts."
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Rep Max Section */}
            <Animated.View entering={FadeInRight.delay(50).duration(400)} style={styles.section}>
              <Text style={styles.sectionHeader}>BODYWEIGHT REPS TO FAILURE</Text>

              {/* Pushups Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Pushups</Text>
                  <Text style={styles.inputSub}>Max consecutive reps</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={pushups}
                  onChangeText={setPushups}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={3}
                  accessibilityLabel="Consecutive pushups reps"
                />
              </View>

              {/* Squats Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Air Squats</Text>
                  <Text style={styles.inputSub}>Reps completed in 60s</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={squats}
                  onChangeText={setSquats}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={3}
                  accessibilityLabel="Consecutive squats reps"
                />
              </View>
            </Animated.View>

            {/* Compound Lifts Section */}
            <Animated.View entering={FadeInRight.delay(120).duration(400)} style={styles.section}>
              <Text style={styles.sectionHeader}>ESTIMATED 1RM STRENGTH (KG)</Text>

              {/* Bench Press */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Bench Press</Text>
                  <Text style={styles.inputSub}>Estimated 1-Rep Max</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={bench}
                  onChangeText={setBench}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  accessibilityLabel="Bench press 1 rep max in kilograms"
                />
              </View>

              {/* Barbell Squat */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Barbell Squat</Text>
                  <Text style={styles.inputSub}>Estimated 1-Rep Max</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={squatLift}
                  onChangeText={setSquatLift}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  accessibilityLabel="Barbell squat 1 rep max in kilograms"
                />
              </View>

              {/* Deadlift */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Deadlift</Text>
                  <Text style={styles.inputSub}>Estimated 1-Rep Max</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={deadlift}
                  onChangeText={setDeadlift}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  accessibilityLabel="Deadlift 1 rep max in kilograms"
                />
              </View>
            </Animated.View>
          </ScrollView>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleSaveAndNext}
            accessibilityLabel="Save inputs and continue"
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getCurrentStepIndex() {
  return 5;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  backText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  section: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  sectionHeader: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing[4],
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  labelContainer: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 14,
    color: colors.text.primary,
  },
  inputSub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  textInput: {
    width: 80,
    height: 40,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    color: colors.text.primary,
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    textAlign: 'center',
    padding: 0,
  },
  nextButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary,
    marginTop: spacing[2],
  },
  nextButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
});
