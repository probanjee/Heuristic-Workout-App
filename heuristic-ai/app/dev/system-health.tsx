/**
 * HeuristicAI — Developer System Health Dashboard
 * Real-time monitoring stats for auth, sync latency, and application crashes.
 * Source of truth: TASK.md § 9, UI_UX_BRIEF.md
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Trash2, Heart, AlertTriangle } from 'lucide-react-native';
import { monitoringService, CrashLog, HealthStats, SyncMetric } from '@/services/monitoring/monitoring-service';
import { useSyncStore } from '@/store/sync.store';
import { useUserStore } from '@/store/user.store';
import { colors, spacing, typography, radius } from '@/constants/theme';

export default function SystemHealthScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [crashes, setCrashes] = useState<CrashLog[]>([]);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetric[]>([]);
  const [shouldCrash, setShouldCrash] = useState(false);
  
  const syncStatus = useSyncStore((s) => s.status);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const userProfile = useUserStore((s) => s.profile || s.user);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    const healthStats = await monitoringService.getHealthStats();
    const crashLogs = await monitoringService.getCrashLogs();
    const syncData = await monitoringService.getSyncMetrics();
    setStats(healthStats);
    setCrashes(crashLogs);
    setSyncMetrics(syncData);
  };

  const handleHeartbeat = async () => {
    await monitoringService.recordHeartbeat();
    await loadMonitoringData();
  };

  const handleClear = async () => {
    await monitoringService.clearAllMetrics();
    await loadMonitoringData();
  };

  const triggerCrash = () => {
    setShouldCrash(true);
  };

  // Simulating the render crash
  if (shouldCrash) {
    throw new Error('[MOCK_CRASH] Dev triggered manual runtime exception.');
  }

  const syncRate = stats && stats.syncAttempts > 0 
    ? Math.round((stats.syncSuccesses / stats.syncAttempts) * 100)
    : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>SYSTEM MONITORING</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Core Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HEALTH STATUS</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>APP LAUNCH</Text>
              <Text style={styles.cardValueMono}>
                {stats ? new Date(stats.appLaunchTime).toLocaleTimeString() : '--:--:--'}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>LAST HEARTBEAT</Text>
              <Text style={styles.cardValueMono}>
                {stats ? new Date(stats.lastHeartbeat).toLocaleTimeString() : '--:--:--'}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>CRASH COUNT</Text>
              <Text style={[styles.cardValueMono, stats && stats.totalErrors > 0 ? { color: colors.danger } : {}]}>
                {stats ? stats.totalErrors : 0}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SYNC STATE</Text>
              <Text style={[styles.cardValue, { color: syncStatus === 'Online' ? colors.accent.primary : colors.warning }]}>
                {syncStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Sync Operations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SYNC METRICS</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ATTEMPTS</Text>
              <Text style={styles.cardValueMono}>{stats ? stats.syncAttempts : 0}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SUCCESS RATE</Text>
              <Text style={styles.cardValueMono}>{syncRate}%</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>PENDING QUEUE</Text>
              <Text style={styles.cardValueMono}>{pendingCount}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>LAST LATENCY</Text>
              <Text style={styles.cardValueMono}>
                {syncMetrics.length > 0 ? `${syncMetrics[0].durationMs}ms` : '0ms'}
              </Text>
            </View>
          </View>
        </View>

        {/* Authentication Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>IDENTITY METRICS</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileLabel}>FIREBASE UID:</Text>
            <Text style={styles.profileValue}>{userProfile?.firebaseUid || 'N/A'}</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabelSmall}>AUTH ATTEMPTS: <Text style={styles.profileValueSmall}>{stats?.authAttempts || 0}</Text></Text>
              <Text style={styles.profileLabelSmall}>SUCCESSES: <Text style={styles.profileValueSmall}>{stats?.authSuccesses || 0}</Text></Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleHeartbeat}>
            <Heart size={18} color={colors.text.inverse} />
            <Text style={styles.actionBtnTextPrimary}>HEARTBEAT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnDanger} onPress={triggerCrash}>
            <AlertTriangle size={18} color={colors.text.primary} />
            <Text style={styles.actionBtnText}>MOCK CRASH</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleClear}>
            <Trash2 size={18} color={colors.text.secondary} />
            <Text style={styles.actionBtnTextSecondary}>CLEAR LOGS</Text>
          </TouchableOpacity>
        </View>

        {/* Crash Log List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CRASH LOG HISTORY ({crashes.length})</Text>
          {crashes.length === 0 ? (
            <Text style={styles.emptyText}>NO RECENT EXCEPTIONS</Text>
          ) : (
            crashes.map((c, i) => (
              <View key={i} style={styles.logCard}>
                <Text style={styles.logTime}>{new Date(c.timestamp).toLocaleString()}</Text>
                <Text style={styles.logMessage}>{c.message}</Text>
                {c.stack && <Text style={styles.logStack} numberOfLines={4}>{c.stack.trim()}</Text>}
              </View>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    marginRight: spacing[4],
  },
  title: {
    ...typography.scale.h3,
    color: colors.text.primary,
    fontFamily: typography.fonts.heading,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    gap: spacing[6],
  },
  section: {
    gap: spacing[2],
  },
  sectionHeader: {
    ...typography.scale.tag,
    color: colors.text.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bg.secondary,
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardLabel: {
    ...typography.scale.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  cardValue: {
    ...typography.scale.bodyL,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  cardValueMono: {
    ...typography.scale.numS,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  profileCard: {
    backgroundColor: colors.bg.secondary,
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[1],
  },
  profileLabel: {
    ...typography.scale.caption,
    color: colors.text.muted,
  },
  profileValue: {
    ...typography.scale.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.primary,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing[2],
  },
  profileLabelSmall: {
    ...typography.scale.caption,
    color: colors.text.secondary,
  },
  profileValueSmall: {
    fontFamily: typography.fonts.mono,
    color: colors.accent.primary,
  },
  actions: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    gap: spacing[2],
  },
  actionBtnTextPrimary: {
    ...typography.scale.tag,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[2],
  },
  actionBtnTextSecondary: {
    ...typography.scale.tag,
    color: colors.text.secondary,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.secondary,
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.danger,
    gap: spacing[2],
  },
  actionBtnText: {
    ...typography.scale.tag,
    color: colors.danger,
  },
  emptyText: {
    ...typography.scale.bodyM,
    color: colors.text.muted,
    fontFamily: typography.fonts.mono,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  logCard: {
    backgroundColor: colors.bg.secondary,
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.danger,
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  logTime: {
    ...typography.scale.caption,
    color: colors.text.secondary,
  },
  logMessage: {
    ...typography.scale.bodyM,
    color: colors.danger,
    fontFamily: typography.fonts.mono,
  },
  logStack: {
    ...typography.scale.caption,
    color: colors.text.muted,
    fontFamily: typography.fonts.mono,
    fontSize: 9,
  },
});
