/**
 * File: components/sync/LastSyncIndicator.tsx
 * Purpose: A text label showing the timestamp of the last successful sync.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useSyncStore } from '../../store/sync.store';
import { colors } from '../../constants/theme';

export default function LastSyncIndicator() {
  const { lastSyncedAt } = useSyncStore();

  if (!lastSyncedAt) {
    return <Text style={styles.text}>NEVER SYNCED</Text>;
  }

  const date = new Date(lastSyncedAt);
  const formatted = 
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
    ' ' + 
    date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return <Text style={styles.text} accessibilityLabel={`Last synced at: ${formatted}`}>LAST SYNC: {formatted.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.text.muted,
  },
});
