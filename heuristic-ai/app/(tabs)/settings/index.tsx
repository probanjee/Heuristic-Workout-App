/**
 * HeuristicAI — Settings Tab Screen
 * Brutalist-Tech Dark UI to manage units, haptics, alerts, data exports, and auth logout.
 * Source of truth: TASK.md § 9, UI_UX_BRIEF.md
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { useUserStore } from '@/store/user.store';
import { useSyncStore } from '@/store/sync.store';
import { syncEngine } from '@/services/sync/sync-engine';
import { exportService } from '@/services/export/export-service';
import { notificationService } from '@/services/notifications/notification-service';
import useAuth from '@/hooks/useAuth';
import SyncStatusBadge from '@/components/sync/SyncStatusBadge';
import LastSyncIndicator from '@/components/sync/LastSyncIndicator';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  
  const preferences = useUserStore((s) => s.preferences);
  const updatePreferences = useUserStore((s) => s.updatePreferences);
  const resetOnboarding = useUserStore((s) => s.resetOnboarding);
  const syncStatus = useSyncStore((s) => s.status);
  
  const workoutReminders = preferences.workoutRemindersEnabled ?? true;
  const recoveryReminders = preferences.recoveryAlertsEnabled ?? true;
  const [exportLoading, setExportLoading] = useState(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'selection' | 'success') => {
    if (!preferences.hapticsEnabled) return;
    if (Platform.OS === 'web') return;
    
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (type === 'selection') Haptics.selectionAsync();
    else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUnitToggle = (unit: 'kg' | 'lbs') => {
    triggerHaptic('selection');
    updatePreferences({ unitSystem: unit });
  };

  const handleRestChange = (delta: number) => {
    triggerHaptic('light');
    const newRest = Math.max(30, Math.min(300, preferences.defaultRestSeconds + delta));
    updatePreferences({ defaultRestSeconds: newRest });
  };

  const toggleHaptics = (val: boolean) => {
    updatePreferences({ hapticsEnabled: val });
    if (val && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const toggleAudio = (val: boolean) => {
    triggerHaptic('selection');
    updatePreferences({ audioCuesEnabled: val });
  };

  const toggleCamera = (val: boolean) => {
    triggerHaptic('selection');
    updatePreferences({ cameraDefaultOn: val });
  };

  const handleWorkoutRemindersChange = async (val: boolean) => {
    triggerHaptic('selection');
    updatePreferences({ workoutRemindersEnabled: val });
    if (val) {
      const id = await notificationService.scheduleWorkoutReminder();
      if (id) triggerHaptic('success');
    } else {
      await notificationService.cancelNotificationsByCategory('workout-reminders');
      await notificationService.cancelNotificationsByCategory('streak-reminders');
      await notificationService.cancelNotificationsByCategory('weekly-summary');
    }
  };

  const handleRecoveryRemindersChange = async (val: boolean) => {
    triggerHaptic('selection');
    updatePreferences({ recoveryAlertsEnabled: val });
    if (!val) {
      await notificationService.cancelNotificationsByCategory('recovery-alerts');
    }
  };

  const handleForceSync = async () => {
    triggerHaptic('medium');
    await syncEngine.processQueue();
    triggerHaptic('success');
  };

  const handleExportJSON = async () => {
    triggerHaptic('selection');
    setExportLoading(true);
    const result = await exportService.exportAsJSON();
    setExportLoading(false);
    if (result.success) {
      triggerHaptic('success');
    } else {
      Alert.alert('Export Failed', result.error || 'An error occurred during export.');
    }
  };

  const handleExportCSV = async () => {
    triggerHaptic('selection');
    setExportLoading(true);
    const result = await exportService.exportAsCSV();
    setExportLoading(false);
    if (result.success) {
      triggerHaptic('success');
    } else {
      Alert.alert('Export Failed', result.error || 'An error occurred during export.');
    }
  };

  const handleWipeData = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'WIPE APPLICATION DATA',
      'This will reset your local profile, preferences, and onboarding progress. This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset App', 
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/(onboarding)/level');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    triggerHaptic('medium');
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>SETTINGS</Text>

        {/* Section: General Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          
          {/* Unit System */}
          <View style={styles.row}>
            <Text style={styles.label}>UNIT SYSTEM</Text>
            <View style={styles.segmentContainer}>
              <TouchableOpacity 
                style={[styles.segmentBtn, preferences.unitSystem === 'kg' ? styles.segmentBtnActive : {}]}
                onPress={() => handleUnitToggle('kg')}
                accessibilityLabel="Metric unit system"
                accessibilityHint="Sets units to kilograms"
                accessibilityRole="button"
                accessibilityState={{ selected: preferences.unitSystem === 'kg' }}
              >
                <Text style={[styles.segmentText, preferences.unitSystem === 'kg' ? styles.segmentTextActive : {}]}>KG</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, preferences.unitSystem === 'lbs' ? styles.segmentBtnActive : {}]}
                onPress={() => handleUnitToggle('lbs')}
                accessibilityLabel="Imperial unit system"
                accessibilityHint="Sets units to pounds"
                accessibilityRole="button"
                accessibilityState={{ selected: preferences.unitSystem === 'lbs' }}
              >
                <Text style={[styles.segmentText, preferences.unitSystem === 'lbs' ? styles.segmentTextActive : {}]}>LBS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Default Rest Seconds */}
          <View style={styles.row}>
            <Text style={styles.label}>DEFAULT REST TIMER</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleRestChange(-10)}
                accessibilityLabel="Decrease rest time"
                accessibilityHint="Subtracts 10 seconds from default rest timer"
                accessibilityRole="button"
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{preferences.defaultRestSeconds}s</Text>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleRestChange(10)}
                accessibilityLabel="Increase rest time"
                accessibilityHint="Adds 10 seconds to default rest timer"
                accessibilityRole="button"
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle Options */}
          <View style={styles.row}>
            <Text style={styles.label}>HAPTIC FEEDBACK</Text>
            <Switch 
              value={preferences.hapticsEnabled} 
              onValueChange={toggleHaptics}
              trackColor={{ false: '#2A2A2A', true: colors.accent.dim }}
              thumbColor={preferences.hapticsEnabled ? colors.accent.primary : '#9A9A9A'}
              accessibilityLabel="Haptic feedback toggle"
              accessibilityHint="Enables or disables physical vibration responses"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>AUDIO GUIDANCE</Text>
            <Switch 
              value={preferences.audioCuesEnabled} 
              onValueChange={toggleAudio}
              trackColor={{ false: '#2A2A2A', true: colors.accent.dim }}
              thumbColor={preferences.audioCuesEnabled ? colors.accent.primary : '#9A9A9A'}
              accessibilityLabel="Audio guidance toggle"
              accessibilityHint="Enables or disables sound cues during workouts"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>CAMERA PRE-ACTIVATION</Text>
            <Switch 
              value={preferences.cameraDefaultOn} 
              onValueChange={toggleCamera}
              trackColor={{ false: '#2A2A2A', true: colors.accent.dim }}
              thumbColor={preferences.cameraDefaultOn ? colors.accent.primary : '#9A9A9A'}
              accessibilityLabel="Camera pre-activation toggle"
              accessibilityHint="Enables or disables camera processing by default during active sets"
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* Section: Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>WORKOUT REMINDERS</Text>
            <Switch 
              value={workoutReminders} 
              onValueChange={handleWorkoutRemindersChange}
              trackColor={{ false: '#2A2A2A', true: colors.accent.dim }}
              thumbColor={workoutReminders ? colors.accent.primary : '#9A9A9A'}
              accessibilityLabel="Workout reminders toggle"
              accessibilityHint="Enables or disables local notifications for workout schedules"
              accessibilityRole="switch"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RECOVERY ALERTS</Text>
            <Switch 
              value={recoveryReminders} 
              onValueChange={handleRecoveryRemindersChange}
              trackColor={{ false: '#2A2A2A', true: colors.accent.dim }}
              thumbColor={recoveryReminders ? colors.accent.primary : '#9A9A9A'}
              accessibilityLabel="Recovery alerts toggle"
              accessibilityHint="Enables or disables local notifications for recovery progress"
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* Section: Cloud Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CLOUD SYNCHRONIZATION</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncRow}>
              <SyncStatusBadge />
              <LastSyncIndicator />
            </View>
            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleForceSync}
              accessibilityLabel="Force manual sync"
              accessibilityHint="Triggers an immediate synchronization of offline data to cloud database"
              accessibilityRole="button"
            >
              <Text style={styles.btnTextPrimary}>FORCE MANUAL SYNC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Data Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATA MANAGEMENT</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={handleExportJSON} 
              disabled={exportLoading}
              accessibilityLabel="Export all data as JSON"
              accessibilityHint="Compiles all workouts and metrics into a JSON file and opens the sharing interface"
              accessibilityRole="button"
            >
              <Text style={styles.btnTextSecondary}>EXPORT ALL DATA (JSON)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={handleExportCSV} 
              disabled={exportLoading}
              accessibilityLabel="Export workouts as CSV"
              accessibilityHint="Compiles workout sets into a CSV sheet and opens the sharing interface"
              accessibilityRole="button"
            >
              <Text style={styles.btnTextSecondary}>EXPORT WORKOUTS (CSV)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.btnDanger} 
              onPress={handleWipeData}
              accessibilityLabel="Clear local cache"
              accessibilityHint="Resets all local profile data and choices"
              accessibilityRole="button"
            >
              <Text style={styles.btnTextDanger}>CLEAR LOCAL CACHE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
          <View style={styles.authCard}>
            <Text style={styles.authLabel}>FIREBASE USER ID:</Text>
            <Text style={styles.authUid} numberOfLines={1}>{user?.uid || 'GUEST_MODE'}</Text>
            <TouchableOpacity 
              style={styles.btnDangerOutline} 
              onPress={handleLogout}
              accessibilityLabel="Logout session"
              accessibilityHint="Logs out of your current profile session"
              accessibilityRole="button"
            >
              <Text style={styles.btnTextDanger}>LOGOUT SESSION</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Developer Options */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DEVELOPER DIAGNOSTICS</Text>
          <View style={styles.actions}>
            <Link href="/dev/system-health" asChild>
              <TouchableOpacity 
                style={styles.btnSecondary}
                accessibilityLabel="System health dashboard link"
                accessibilityHint="Navigates to developer system health statistics page"
                accessibilityRole="button"
              >
                <Text style={styles.btnTextSecondary}>SYSTEM HEALTH DASHBOARD</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/dev/sync-debug" asChild>
              <TouchableOpacity 
                style={styles.btnSecondary}
                accessibilityLabel="Database sync sandbox link"
                accessibilityHint="Navigates to developer synchronization interface"
                accessibilityRole="button"
              >
                <Text style={styles.btnTextSecondary}>DATABASE SYNC SANDBOX</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  container: {
    padding: spacing[4],
    gap: spacing[6],
  },
  title: {
    ...typography.scale.h1,
    color: colors.text.primary,
  },
  section: {
    gap: spacing[2],
  },
  sectionHeader: {
    ...typography.scale.tag,
    color: colors.text.muted,
    marginBottom: spacing[1],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  label: {
    ...typography.scale.bodyM,
    color: colors.text.primary,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  segmentBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.accent.primary,
  },
  segmentText: {
    ...typography.scale.caption,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  counterBtn: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    ...typography.scale.bodyL,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  counterValue: {
    ...typography.scale.bodyM,
    fontFamily: typography.fonts.mono,
    color: colors.text.primary,
  },
  syncCard: {
    backgroundColor: colors.bg.secondary,
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[3],
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  btnTextPrimary: {
    ...typography.scale.tag,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextSecondary: {
    ...typography.scale.tag,
    color: colors.text.secondary,
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.danger,
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnTextDanger: {
    ...typography.scale.tag,
    color: colors.danger,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  authCard: {
    backgroundColor: colors.bg.secondary,
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[2],
  },
  authLabel: {
    ...typography.scale.caption,
    color: colors.text.muted,
  },
  authUid: {
    ...typography.scale.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.primary,
    backgroundColor: colors.bg.elevated,
    padding: spacing[2],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  btnDangerOutline: {
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: spacing[2],
  },
});
