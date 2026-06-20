/**
 * File: components/sync/SyncStatusBadge.tsx
 * Purpose: A status badge displaying the real-time sync engine state.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '../../store/sync.store';
import { colors, spacing } from '../../constants/theme';

export default function SyncStatusBadge() {
  const { status } = useSyncStore();

  let text = 'ONLINE';
  let badgeColor: string = colors.success; 
  let dimColor: string = colors.accent.dim; 

  if (status === 'Offline') {
    text = 'OFFLINE';
    badgeColor = colors.text.muted; 
    dimColor = '#222222';
  } else if (status === 'Syncing') {
    text = 'SYNCING';
    badgeColor = colors.warning; 
    dimColor = '#FFB83022';
  } else if (status === 'Reconnecting') {
    text = 'CONNECTING';
    badgeColor = colors.info; 
    dimColor = '#3B8AFF22';
  } else if (status === 'Failed') {
    text = 'SYNC FAILED';
    badgeColor = colors.danger; 
    dimColor = '#FF3B3B22';
  }

  return (
    <View style={[styles.badge, { backgroundColor: dimColor, borderColor: badgeColor }]} accessibilityLabel={`Sync status: ${text}`}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: colors.text.primary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: 'DMMono_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
