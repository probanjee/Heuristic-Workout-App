/**
 * File: services/sync/network-monitor.ts
 * Purpose: Monitors network connectivity using NetInfo and updates the sync store.
 */

import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '../../store/sync.store';
import { syncEngine } from './sync-engine';

let unsubscribeNetInfo: (() => void) | null = null;

export function startNetworkMonitoring(): void {
  if (unsubscribeNetInfo) return; // already monitoring

  unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    const isOnline = !!state.isConnected && !!state.isInternetReachable;
    const syncStore = useSyncStore.getState();
    const oldOnline = syncStore.isOnline;

    syncStore.setOnline(isOnline);

    if (isOnline) {
      if (!oldOnline) {
        // We just transitioned from offline to online
        syncStore.setStatus('Reconnecting');
        // Trigger background sync processing
        syncEngine.processQueue();
      } else {
        // Ensure status is correctly set
        if (syncStore.status === 'Offline') {
          syncStore.setStatus('Online');
        }
      }
    } else {
      syncStore.setStatus('Offline');
    }
  });
}

export function stopNetworkMonitoring(): void {
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
}
