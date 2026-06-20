/**
 * File: services/sync/sync-state.ts
 * Purpose: Manages persistent sync state metadata (e.g. last sync time, failure counts) in SecureStore.
 */

import { storageAdapter } from '../storage/storage-adapter';

const LAST_SYNC_TIME_KEY = 'last_sync_time';
const FAILED_SYNC_COUNT_KEY = 'failed_sync_count';

/**
 * Retrieves the last successful sync timestamp (ms).
 */
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const raw = await storageAdapter.getItem(LAST_SYNC_TIME_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Sets the last successful sync timestamp.
 */
export async function setLastSyncTime(timestamp: number): Promise<void> {
  try {
    await storageAdapter.setItem(LAST_SYNC_TIME_KEY, timestamp.toString());
  } catch (e) {
    console.error('Failed to save last sync time:', e);
  }
}

/**
 * Retrieves the count of consecutive failed sync attempts.
 */
export async function getFailedSyncCount(): Promise<number> {
  try {
    const raw = await storageAdapter.getItem(FAILED_SYNC_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increments the failed sync count.
 */
export async function incrementFailedSyncCount(): Promise<number> {
  try {
    const current = await getFailedSyncCount();
    const next = current + 1;
    await storageAdapter.setItem(FAILED_SYNC_COUNT_KEY, next.toString());
    return next;
  } catch {
    return 0;
  }
}

/**
 * Resets the failed sync count to zero.
 */
export async function resetFailedSyncCount(): Promise<void> {
  try {
    await storageAdapter.setItem(FAILED_SYNC_COUNT_KEY, '0');
  } catch (e) {
    console.error('Failed to reset failed sync count:', e);
  }
}
