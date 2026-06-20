/**
 * HeuristicAI â€” RPE Wheel Component
 * Brutalist-styled RPE input (1â€“10 scale + "Skip" option)
 * Source of truth: UI_UX_BRIEF.md RPE Wheel
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';

interface RPEWheelProps {
  onSubmit: (rpe: number, estimated: boolean) => void;
  defaultValue?: number;
}

const RPE_LABELS: Record<number, string> = {
  1: 'No effort',
  2: 'Very easy',
  3: 'Easy',
  4: 'Light',
  5: 'Moderate',
  6: 'Somewhat hard',
  7: 'Hard',
  8: 'Very hard',
  9: 'Max effort',
  10: 'Absolute max',
};

const RPE_COLORS: Record<number, string> = {
  1: '#3B8AFF',
  2: '#3B8AFF',
  3: '#00FF87',
  4: '#00FF87',
  5: '#00FF87',
  6: '#FFB830',
  7: '#FFB830',
  8: '#FF8800',
  9: '#FF3B3B',
  10: '#FF3B3B',
};

export function RPEWheel({ onSubmit, defaultValue }: RPEWheelProps) {
  const [selected, setSelected] = useState<number | null>(defaultValue ?? null);

  const handleSelect = (rpe: number) => {
    Haptics.selectionAsync();
    setSelected(rpe);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(selected, false);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSubmit(6, true); // default RPE = 6 when estimated
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HOW HARD WAS THAT?</Text>
      <Text style={styles.subtitle}>Rate of Perceived Exertion</Text>

      {/* RPE Grid */}
      <View style={styles.grid}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => {
          const isSelected = selected === rpe;
          const accentColor = RPE_COLORS[rpe];
          return (
            <TouchableOpacity
              key={rpe}
              style={[
                styles.rpeButton,
                isSelected && { borderColor: accentColor, backgroundColor: `${accentColor}22` },
              ]}
              onPress={() => handleSelect(rpe)}
              accessibilityLabel={`RPE ${rpe} â€” ${RPE_LABELS[rpe]}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.rpeNumber, isSelected && { color: accentColor }]}>
                {rpe}
              </Text>
              {isSelected && (
                <Text style={[styles.rpeLabel, { color: accentColor }]} numberOfLines={1}>
                  {RPE_LABELS[rpe]}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.submitButton, !selected && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selected}
          accessibilityLabel="Submit RPE rating"
        >
          <Text style={styles.submitButtonText}>
            {selected ? `LOG RPE ${selected}` : 'SELECT RPE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityLabel="Skip RPE input"
        >
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing[4] },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    letterSpacing: 0.5,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.scale.bodyS,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[6],
    justifyContent: 'center',
  },
  rpeButton: {
    width: 64,
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[2],
  },
  rpeNumber: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 24,
    color: colors.text.primary,
  },
  rpeLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  actions: { gap: spacing[3] },
  submitButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    letterSpacing: 1,
    color: colors.text.inverse,
  },
  skipButton: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    letterSpacing: 1,
    color: colors.text.muted,
  },
});

