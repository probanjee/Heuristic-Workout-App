/**
 * HeuristicAI — Sync Developer Debug Screen
 * Location: app/dev/sync-debug.tsx
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import { auth } from '../../services/auth/firebase';
import { useSyncStore } from '../../store/sync.store';
import { syncEngine, syncDevFlags } from '../../services/sync/sync-engine';
import { queueManager } from '../../services/sync/queue-manager';
import { getFailedSyncCount, getLastSyncTime, resetFailedSyncCount } from '../../services/sync/sync-state';
import { supabase } from '../../lib/supabase';

export default function SyncDebugScreen() {
  const router = useRouter();
  const syncStore = useSyncStore();
  
  const [firebaseUid, setFirebaseUid] = useState<string>('NULL');
  const [failedSyncCount, setFailedSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTimeState] = useState<string>('NEVER');
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mockOffline, setMockOfflineState] = useState(syncDevFlags.mockOffline);
  const [mockFailure, setMockFailureState] = useState(syncDevFlags.mockFailure);

  const loadDebugData = async () => {
    // Firebase UID
    setFirebaseUid(auth.currentUser?.uid || 'NULL');

    // Failed Sync Count
    const count = await getFailedSyncCount();
    setFailedSyncCount(count);

    // Last Sync Time
    const time = await getLastSyncTime();
    if (time) {
      setLastSyncTimeState(new Date(time).toLocaleString());
    } else {
      setLastSyncTimeState('NEVER');
    }

    // Sync logs from Supabase
    try {
      const { data, error } = await supabase
        .from('sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        setSyncLogs(data);
      }
    } catch (e) {
      console.warn('Could not load sync logs:', e);
    }
  };

  useEffect(() => {
    loadDebugData();
  }, [syncStore.status, syncStore.pendingCount]);

  const handleForceSync = async () => {
    setLoading(true);
    try {
      await syncEngine.processQueue();
      await loadDebugData();
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearQueue = async () => {
    await queueManager.clearQueue();
    syncStore.setPendingCount(0);
    await loadDebugData();
    alert('Queue cleared');
  };

  const handleResetFailureCount = async () => {
    await resetFailedSyncCount();
    await loadDebugData();
    alert('Failure count reset');
  };

  const handleToggleMockOffline = () => {
    const nextVal = !mockOffline;
    syncDevFlags.mockOffline = nextVal;
    setMockOfflineState(nextVal);
    syncStore.setOnline(!nextVal);
    if (nextVal) {
      syncStore.setStatus('Offline');
    } else {
      syncStore.setStatus('Online');
    }
  };

  const handleToggleMockFailure = () => {
    const nextVal = !mockFailure;
    syncDevFlags.mockFailure = nextVal;
    setMockFailureState(nextVal);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        {/* Go back */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO PROFILE</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.accent.primary }}>
            SYNC DEBUG CONSOLE
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.text.secondary, marginTop: 4 }}>
            INSPECT REAL-TIME SYNC LOGIC & OFFLINE STATES
          </Text>
        </View>

        {/* Section: Engine Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[STATE: SYNC ENGINE]</Text>
          <View style={styles.row}>
            <Text style={styles.label}>NETWORK STATUS:</Text>
            <Text style={[styles.val, { color: syncStore.isOnline && !mockOffline ? colors.accent.primary : colors.danger }]}>
              {syncStore.isOnline && !mockOffline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ENGINE STATUS:</Text>
            <Text style={styles.val}>{syncStore.status.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FIREBASE UID:</Text>
            <Text style={[styles.val, { fontFamily: 'DMMono_400Regular' }]}>{firebaseUid}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PENDING QUEUE COUNT:</Text>
            <Text style={styles.val}>{syncStore.pendingCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FAILED SYNC RUNS:</Text>
            <Text style={styles.val}>{failedSyncCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>LAST SYNC TIME:</Text>
            <Text style={styles.val}>{lastSyncTime}</Text>
          </View>
        </View>

        {/* Section: Overrides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[MOCK OVERRIDES]</Text>
          <View style={styles.row}>
            <Text style={styles.label}>MOCK OFFLINE MODE:</Text>
            <TouchableOpacity onPress={handleToggleMockOffline}>
              <Text style={[styles.val, { color: mockOffline ? colors.warning : colors.text.muted, fontWeight: 'bold' }]}>
                {mockOffline ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>MOCK FORCE FAILURES:</Text>
            <TouchableOpacity onPress={handleToggleMockFailure}>
              <Text style={[styles.val, { color: mockFailure ? colors.danger : colors.text.muted, fontWeight: 'bold' }]}>
                {mockFailure ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Console Actions */}
        <View style={{ gap: spacing[3], marginTop: spacing[4], marginBottom: spacing[6] }}>
          <Text style={styles.sectionTitle}>[CONSOLE ACTIONS]</Text>

          <TouchableOpacity style={styles.btn} onPress={handleForceSync} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.accent.primary} size="small" />
            ) : (
              <Text style={styles.btnText}>FORCE QUEUE SYNC NOW</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleClearQueue}>
            <Text style={styles.btnText}>CLEAR LOCAL SYNC QUEUE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { borderColor: colors.warning }]} onPress={handleResetFailureCount}>
            <Text style={[styles.btnText, { color: colors.warning }]}>RESET FAILURE COUNT</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Cloud Sync Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[CLOUD ERROR LOGS (sync_log)]</Text>
          {syncLogs.length === 0 ? (
            <Text style={[styles.val, { fontStyle: 'italic', marginTop: spacing[2] }]}>NO ERRORS REPORTED</Text>
          ) : (
            syncLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logHeader}>
                  {new Date(log.created_at).toLocaleTimeString()} - {log.entity_type.toUpperCase()} ({log.entity_id.slice(0, 8)})
                </Text>
                <Text style={styles.logError}>{log.error_message}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  val: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.primary,
  },
  btn: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  logItem: {
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  logHeader: {
    fontFamily: 'DMMono_700Bold',
    fontSize: 10,
    color: colors.text.secondary,
  },
  logError: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.danger,
    marginTop: 2,
  },
});
