/**
 * File: services/sync/session-sync.ts
 * Purpose: Handles synchronization of workout sessions with Supabase using firebase_uid.
 */

import { supabase } from '@/lib/supabase';
import { auth } from '../auth/firebase';
import { SyncResult, deterministicUuid } from './types';
import { withRetryAndTimeout } from './network-utils';

/**
 * Uploads a completed or active session to public.sessions table in Supabase.
 * @param sessionPayload The session data to upload
 * @returns SyncResult indicating success or failure
 */
export async function uploadSession(sessionPayload: any): Promise<SyncResult> {
  try {
    const firebaseUid = sessionPayload.firebase_uid || sessionPayload.firebaseUid || auth.currentUser?.uid;
    if (!firebaseUid) {
      throw new Error('firebase_uid is required for session sync');
    }

    const startedAt = sessionPayload.started_at || sessionPayload.startedAt;
    const endedAt = sessionPayload.ended_at || sessionPayload.endedAt;

    // Calculate duration in seconds if not provided
    let durationSeconds = sessionPayload.duration_seconds || sessionPayload.durationSeconds;
    if (durationSeconds === undefined && startedAt && endedAt) {
      const startMs = new Date(startedAt).getTime();
      const endMs = new Date(endedAt).getTime();
      durationSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));
    }

    const avgRpe = sessionPayload.avg_rpe || sessionPayload.avgRpe;
    const volume = sessionPayload.volume || sessionPayload.total_volume_kg || sessionPayload.totalVolumeKg;

    await withRetryAndTimeout(async () => {
      const { error } = await supabase.from('sessions').upsert({
        id: deterministicUuid(sessionPayload.id),
        firebase_uid: firebaseUid,
        started_at: new Date(startedAt).toISOString(),
        completed_at: endedAt ? new Date(endedAt).toISOString() : null,
        duration_seconds: durationSeconds || 0,
        avg_rpe: avgRpe !== undefined && avgRpe !== null ? Number(avgRpe) : null,
        volume: volume !== undefined && volume !== null ? Number(volume) : null,
        synced_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) throw error;
    });

    return { success: true, syncedCount: 1, failedCount: 0 };
  } catch (error: any) {
    return { success: false, syncedCount: 0, failedCount: 1, error: error.message };
  }
}

/**
 * Downloads sessions from public.sessions table in Supabase by firebase_uid.
 * @param firebaseUid The Firebase UID of the user
 * @returns Array of downloaded sessions
 */
export async function downloadSessions(firebaseUid: string): Promise<any[]> {
  try {
    const data = await withRetryAndTimeout(async () => {
      const { data: resData, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      if (error) throw error;
      return resData || [];
    });

    return data;
  } catch (error) {
    console.error('Failed to download sessions:', error);
    return [];
  }
}
