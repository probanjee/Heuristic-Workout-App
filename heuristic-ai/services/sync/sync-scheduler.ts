/**
 * File: services/sync/sync-scheduler.ts
 * Purpose: Automatically schedules and triggers sync operations on app events.
 */

import { AppState, AppStateStatus } from 'react-native';
import { syncEngine } from './sync-engine';
import { startNetworkMonitoring, stopNetworkMonitoring } from './network-monitor';

let appStateSubscription: { remove: () => void } | null = null;

/**
 * Starts the automatic sync scheduler, listening to app state changes and network status.
 */
export function startSyncScheduler(): void {
  // Start network listener
  startNetworkMonitoring();

  // Trigger sync on app launch
  syncEngine.processQueue();

  // Subscribe to foreground/background AppState transitions
  if (appStateSubscription) return;
  
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
}

/**
 * Stops the automatic sync scheduler and cleans up listeners.
 */
export function stopSyncScheduler(): void {
  stopNetworkMonitoring();
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

function handleAppStateChange(nextAppState: AppStateStatus): void {
  if (nextAppState === 'active') {
    // App came to the foreground -> trigger sync
    syncEngine.processQueue();
  }
}

/**
 * Explicit trigger for sync when a workout session completes.
 */
export function triggerWorkoutCompletionSync(): void {
  syncEngine.processQueue();
}

/**
 * Explicit trigger for sync when a user profile updates.
 */
export function triggerProfileUpdateSync(): void {
  syncEngine.processQueue();
}
