/**
 * File: services/sync/metrics-sync.ts
 * Purpose: Handles synchronization of heuristic metrics with Supabase using firebase_uid.
 */

import { supabase } from '@/lib/supabase';
import { auth } from '../auth/firebase';
import { SyncResult } from './types';
import { withRetryAndTimeout } from './network-utils';

/**
 * Derives and uploads heuristic metrics (fatigue, recovery, readiness) to public.heuristic_metrics in Supabase.
 * @param sessionPayload The session details from which to derive the metrics
 * @returns SyncResult indicating success or failure
 */
export async function uploadMetrics(sessionPayload: any): Promise<SyncResult> {
  try {
    const firebaseUid = sessionPayload.firebase_uid || sessionPayload.firebaseUid || auth.currentUser?.uid;
    if (!firebaseUid) {
      throw new Error('firebase_uid is required for metrics sync');
    }

    const avgRpe = sessionPayload.avg_rpe || sessionPayload.avgRpe || 6;
    
    // Derive scores from average RPE (scale of 1-10)
    const fatigueScore = Number(avgRpe);
    const recoveryScore = Number(Math.max(1, Math.min(10, 10 - (avgRpe - 4))));
    const readinessScore = Number(Math.max(1, Math.min(10, 10 - avgRpe)));
    
    const createdAt = sessionPayload.ended_at || sessionPayload.endedAt || new Date();

    await withRetryAndTimeout(async () => {
      const { error } = await supabase.from('heuristic_metrics').insert({
        firebase_uid: firebaseUid,
        fatigue_score: fatigueScore,
        recovery_score: recoveryScore,
        readiness_score: readinessScore,
        created_at: new Date(createdAt).toISOString(),
      });
      if (error) throw error;
    });

    return { success: true, syncedCount: 1, failedCount: 0 };
  } catch (error: any) {
    return { success: false, syncedCount: 0, failedCount: 1, error: error.message };
  }
}

/**
 * Downloads heuristic metrics from public.heuristic_metrics table in Supabase.
 * @param firebaseUid The Firebase UID of the user
 * @returns Array of downloaded metrics
 */
export async function downloadMetrics(firebaseUid: string): Promise<any[]> {
  try {
    const data = await withRetryAndTimeout(async () => {
      const { data: resData, error } = await supabase
        .from('heuristic_metrics')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      if (error) throw error;
      return resData || [];
    });

    return data;
  } catch (error) {
    console.error('Failed to download metrics:', error);
    return [];
  }
}
