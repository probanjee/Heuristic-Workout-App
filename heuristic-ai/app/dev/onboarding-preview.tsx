/**
 * HeuristicAI — Dev Onboarding Preview Screen
 * Allows jumping to any onboarding screen for QA testing and inspecting state
 * Source of truth: TASK.md Task 13
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/store/user.store';
import { colors, spacing } from '@/constants/theme';

const ROUTES = [
  { name: 'Step 1: Welcome', path: '/(onboarding)/welcome' },
  { name: 'Step 2: Goals', path: '/(onboarding)/goals' },
  { name: 'Step 3: Level', path: '/(onboarding)/level' },
  { name: 'Step 4: Equipment', path: '/(onboarding)/equipment' },
  { name: 'Step 5: Injuries', path: '/(onboarding)/injuries' },
  { name: 'Step 6: Baseline', path: '/(onboarding)/baseline' },
  { name: 'Step 7: Account', path: '/(onboarding)/account' },
];

export default function OnboardingPreviewScreen() {
  const router = useRouter();
  const store = useUserStore();

  const handleReset = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.resetOnboarding();
    await SecureStore.deleteItemAsync('onboarding_complete');
    alert('Onboarding state and SecureStore flag reset successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>ONBOARDING QA PREVIEW</Text>
        <Text style={styles.sub}>Jump directly to any step to verify layouts, validation, and styling.</Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>ROUTES</Text>
          {ROUTES.map((route) => (
            <TouchableOpacity
              key={route.path}
              style={styles.link}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(route.path as any);
              }}
            >
              <Text style={styles.linkText}>{route.name}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>ZUSTAND STATE INSPECTOR</Text>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Onboarding Complete:</Text>
            <Text style={styles.stateVal}>
              {store.onboardingComplete ? 'TRUE' : 'FALSE'}
            </Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Goal:</Text>
            <Text style={styles.stateVal}>{store.goal || 'NULL'}</Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Training Level:</Text>
            <Text style={styles.stateVal}>{store.trainingLevel || 'NULL'}</Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Equipment Selected ({store.equipment.length}):</Text>
            <Text style={styles.stateVal}>
              {store.equipment.join(', ') || 'NONE'}
            </Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Injury Flags ({store.injuryFlags.length}):</Text>
            <Text style={styles.stateVal}>
              {store.injuryFlags.join(', ') || 'NONE (NONE SELECTED)'}
            </Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Baseline Results:</Text>
            <Text style={styles.stateVal}>
              {JSON.stringify(store.baselineResults)}
            </Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Guest Mode:</Text>
            <Text style={styles.stateVal}>{store.guestMode ? 'TRUE' : 'FALSE'}</Text>
          </View>

          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>User Profile in Store:</Text>
            <Text style={styles.stateVal}>
              {store.user ? JSON.stringify(store.user) : 'NULL'}
            </Text>
          </View>
        </View>

        {/* Global Reset Action */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>RESET ONBOARDING STATE</Text>
        </TouchableOpacity>

        {/* Go back home */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/workout')}
        >
          <Text style={styles.backButtonText}>GO TO WORKOUT TAB</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    padding: spacing[6],
    gap: spacing[4],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: 'IBMPlexSans_400Regular',
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
  },
  cardHeader: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing[2],
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  linkText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 14,
    color: colors.text.primary,
  },
  linkArrow: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.accent.primary,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  stateLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  stateVal: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.accent.primary,
    flex: 1.5,
    textAlign: 'right',
  },
  resetButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  resetButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.primary,
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.secondary,
  },
});
