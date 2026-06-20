/**
 * File: services/sync/workout-set-sync.ts
 * Purpose: Handles synchronization of workout sets with Supabase using firebase_uid.
 */

import { supabase } from '@/lib/supabase';
import { auth } from '../auth/firebase';
import { SyncResult, deterministicUuid } from './types';
import { withRetryAndTimeout } from './network-utils';

/**
 * Uploads an array of workout sets to public.workout_sets table in Supabase.
 * @param setsPayload Array of set data to upload
 * @returns SyncResult indicating success or failure
 */
export async function uploadSets(setsPayload: any[]): Promise<SyncResult> {
  if (!setsPayload || setsPayload.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0 };
  }

  try {
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) {
      throw new Error('firebase_uid is required for sets sync');
    }

    const mappedSets = setsPayload.map(set => {
      const localId = set.id;
      const sessionId = set.session_id || set.sessionId;
      const exerciseId = set.exercise_id || set.exerciseId || set.exerciseSlug;
      
      const reps = set.completed_reps !== undefined ? set.completed_reps : (set.reps !== undefined ? set.reps : 0);
      const weight = set.actual_weight_kg !== undefined ? set.actual_weight_kg : (set.weight !== undefined ? set.weight : 0);
      const rpe = set.rpe !== undefined ? set.rpe : null;
      const createdAt = set.completed_at || set.completedAt || set.created_at || new Date();

      return {
        id: deterministicUuid(localId),
        session_id: deterministicUuid(sessionId),
        firebase_uid: firebaseUid,
        exercise_id: exerciseId,
        reps: Number(reps),
        weight: Number(weight),
        rpe: rpe !== null && rpe !== undefined ? Number(rpe) : null,
        created_at: new Date(createdAt).toISOString(),
      };
    });

    await withRetryAndTimeout(async () => {
      const { error } = await supabase.from('workout_sets').upsert(mappedSets, { onConflict: 'id' });
      if (error) throw error;
    });

    return { success: true, syncedCount: mappedSets.length, failedCount: 0 };
  } catch (error: any) {
    return { success: false, syncedCount: 0, failedCount: setsPayload.length, error: error.message };
  }
}

/**
 * Downloads workout sets from public.workout_sets table in Supabase by firebase_uid.
 * @param firebaseUid The Firebase UID of the user
 * @returns Array of downloaded sets
 */
export async function downloadSets(firebaseUid: string): Promise<any[]> {
  try {
    const data = await withRetryAndTimeout(async () => {
      const { data: resData, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      if (error) throw error;
      return resData || [];
    });

    return data;
  } catch (error) {
    console.error('Failed to download sets:', error);
    return [];
  }
}
export default uploadSets;
