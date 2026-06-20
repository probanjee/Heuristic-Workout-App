/**
 * File: components/sync/SyncProgressBar.tsx
 * Purpose: Displays a progress bar during active sync cycles.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '../../store/sync.store';
import { colors, spacing } from '../../constants/theme';

export default function SyncProgressBar() {
  const { status, pendingCount } = useSyncStore();
  const [initialPending, setInitialPending] = useState(0);

  useEffect(() => {
    if (status === 'Syncing' && pendingCount > 0) {
      if (pendingCount > initialPending) {
        setInitialPending(pendingCount);
      }
    } else if (status !== 'Syncing' || pendingCount === 0) {
      setInitialPending(0);
    }
  }, [status, pendingCount]);

  if (status !== 'Syncing' || pendingCount === 0) {
    return null;
  }

  const total = Math.max(initialPending, pendingCount);
  const completed = total - pendingCount;
  const progress = total > 0 ? (completed / total) : 0;
  const progressPct = Math.round(progress * 100);

  return (
    <View style={styles.container} accessibilityLabel="Sync progress bar">
      <View style={styles.header}>
        <Text style={styles.label}>SYNCING DATABASE ({pendingCount} PENDING)</Text>
        <Text style={styles.percent}>{progressPct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.secondary,
  },
  percent: {
    fontFamily: 'DMMono_700Bold',
    fontSize: 10,
    color: colors.accent.primary,
  },
  track: {
    height: 4,
    backgroundColor: colors.bg.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
  },
});
