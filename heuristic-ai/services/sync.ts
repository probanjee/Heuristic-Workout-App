/**
 * HeuristicAI — Sync Service (Legacy)
 * This file contains the legacy sync functions (pushSync / pullSync).
 * The active sync layer is services/sync/sync-engine.ts.
 * Source of truth: TRD § 5.2, APP_FLOW.md § 8, IMPLEMENTATION_PLAN § Week 8
 */

import NetInfo from '@react-native-community/netinfo';
import { storageAdapter } from './storage/storage-adapter';
import { Q } from '@nozbe/watermelondb';
import { database, sessionsCollection, setsCollection } from '../database';
import { supabase } from './supabase';
import { useSyncStore } from '../store/sync.store';

const SYNC_BATCH_SIZE = 50;
const LAST_SYNC_KEY = 'last_sync_at';

// ─── PUSH SYNC ────────────────────────────────────────────────────────────────
// Upload all unsynced local records to Supabase

export async function pushSync(): Promise<void> {
  const syncStore = useSyncStore.getState();
  syncStore.setSyncing();

  try {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) {
      throw new Error('No internet connection');
    }

    // 1. Sync Sessions
    const unsyncedSessions = await sessionsCollection
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedSessions.length > 0) {
      // Chunk sessions
      for (let i = 0; i < unsyncedSessions.length; i += SYNC_BATCH_SIZE) {
        const batch = unsyncedSessions.slice(i, i + SYNC_BATCH_SIZE);
        const payloads = batch.map((session: any) => {
          const raw = session._raw as any;
          return {
            id: session.id,
            user_id: raw.user_id,
            duration: raw.duration,
            intensity: raw.intensity,
            recovery_score: raw.recovery_score,
            notes: raw.notes || null,
            created_at: new Date(raw.created_at).toISOString(),
            updated_at: new Date(raw.updated_at).toISOString(),
          };
        });

        const { error } = await supabase.from('workout_sessions').upsert(payloads);
        if (error) throw error;

        // Mark as synced locally
        await database.write(async () => {
          for (const session of batch) {
            await session.update((s: typeof session) => {
              (s as unknown as { synced: boolean }).synced = true;
            });
          }
        });
      }
    }

    // 2. Sync Sets
    const unsyncedSets = await setsCollection
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedSets.length > 0) {
      const setPayloads = unsyncedSets.map((set: any) => {
        const raw = set._raw as any;
        return {
          id: set.id,
          session_id: raw.session_id,
          exercise_id: raw.exercise_id,
          set_number: raw.set_number,
          completed_reps: raw.completed_reps,
          actual_weight_kg: raw.actual_weight_kg,
          rpe: raw.rpe,
          completed_at: new Date(raw.completed_at).toISOString(),
        };
      });

      for (let i = 0; i < setPayloads.length; i += SYNC_BATCH_SIZE) {
        const batch = setPayloads.slice(i, i + SYNC_BATCH_SIZE);
        const { error } = await supabase.from('workout_sets').upsert(batch);
        if (error) throw error;
      }

      await database.write(async () => {
        for (const set of unsyncedSets) {
          await set.update((s: typeof set) => {
            (s as unknown as { synced: boolean }).synced = true;
          });
        }
      });
    }

    await storageAdapter.setItem(LAST_SYNC_KEY, Date.now().toString());
    syncStore.setSynced(Date.now());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    syncStore.setSyncError(message);
    throw error;
  }
}

// ─── PULL SYNC ────────────────────────────────────────────────────────────────
// Download server records newer than last sync

export async function pullSync(): Promise<void> {
  try {
    const lastSyncRaw = await storageAdapter.getItem(LAST_SYNC_KEY);
    const lastSync = lastSyncRaw ? new Date(parseInt(lastSyncRaw)).toISOString() : '2020-01-01T00:00:00Z';

    // Pull sessions newer than last sync
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .gt('created_at', lastSync);

    if (error) throw error;
    if (!sessions || sessions.length === 0) return;

    // Note: Full hydration is handled by syncEngine.pullData() in sync/sync-engine.ts
    console.log(`[HeuristicAI Sync] Pull: ${sessions.length} sessions from server`);
  } catch (error) {
    console.error('[HeuristicAI Sync] Pull sync failed:', error);
    throw error;
  }
}

// ─── NETINFO LISTENER ─────────────────────────────────────────────────────────

let unsubscribeNetInfo: (() => void) | null = null;

export function startSyncListener(): void {
  if (unsubscribeNetInfo) return; // already listening

  unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
    const syncStore = useSyncStore.getState();
    const isOnline = state.isConnected === true && state.isInternetReachable !== false;

    syncStore.setOnline(isOnline);

    if (isOnline && syncStore.pendingCount > 0) {
      // Reconnected with pending data — trigger sync
      try {
        await pushSync();
      } catch {
        // Retry scheduled by exponential backoff
        scheduleRetrySync();
      }
    }
  });
}

export function stopSyncListener(): void {
  unsubscribeNetInfo?.();
  unsubscribeNetInfo = null;
}

// ─── RETRY WITH EXPONENTIAL BACKOFF ───────────────────────────────────────────

const RETRY_DELAYS = [30_000, 120_000, 600_000]; // 30s → 2min → 10min
let retryAttempt = 0;
let retryTimeout: any = null;

function scheduleRetrySync(): void {
  if (retryTimeout) clearTimeout(retryTimeout);
  const delay = RETRY_DELAYS[Math.min(retryAttempt, RETRY_DELAYS.length - 1)];
  retryAttempt++;

  retryTimeout = setTimeout(async () => {
    try {
      await pushSync();
      retryAttempt = 0; // reset on success
    } catch {
      scheduleRetrySync(); // keep retrying
    }
  }, delay);

  if (retryTimeout && typeof retryTimeout.unref === 'function') {
    retryTimeout.unref();
  }
}
