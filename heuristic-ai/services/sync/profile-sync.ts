/**
 * File: services/sync/profile-sync.ts
 * Purpose: Handles synchronization of user profiles with Supabase using firebase_uid.
 */

import { supabase } from '@/lib/supabase';
import { SyncResult, deterministicUuid } from './types';
import { withRetryAndTimeout } from './network-utils';
import { auth } from '../auth/firebase';
import { useUserStore } from '@/store/user.store';

/**
 * Uploads a user profile to the public.profiles table in Supabase.
 * @param profilePayload The profile data to upload
 * @returns SyncResult indicating success or failure
 */
export async function uploadProfile(profilePayload: any): Promise<SyncResult> {
  try {
    const firebaseUid = profilePayload.firebaseUid || profilePayload.firebase_uid || auth.currentUser?.uid;
    if (!firebaseUid) {
      throw new Error('firebase_uid is required for profile sync');
    }

    const localId = profilePayload.id || 'default_profile_id';
    const createdAt = profilePayload.createdAt || profilePayload.created_at || new Date();
    const updatedAt = profilePayload.updatedAt || profilePayload.updated_at || new Date();

    const userPrefs = useUserStore.getState().preferences;

    // Parse equipment and injuryFlags arrays if they are stringified or getters
    const equipment = Array.isArray(profilePayload.equipment)
      ? profilePayload.equipment
      : (typeof profilePayload.equipment === 'string'
        ? JSON.parse(profilePayload.equipment)
        : (profilePayload._equipment ? JSON.parse(profilePayload._equipment) : []));

    const injuries = Array.isArray(profilePayload.injuryFlags)
      ? profilePayload.injuryFlags
      : (Array.isArray(profilePayload.injuries)
        ? profilePayload.injuries
        : (typeof profilePayload.injuryFlags === 'string'
          ? JSON.parse(profilePayload.injuryFlags)
          : (profilePayload._injuryFlags ? JSON.parse(profilePayload._injuryFlags) : [])));

    await withRetryAndTimeout(async () => {
      const { error } = await supabase.from('profiles').upsert({
        id: deterministicUuid(localId),
        firebase_uid: firebaseUid,
        created_at: new Date(createdAt).toISOString(),
        updated_at: new Date(updatedAt).toISOString(),
        display_name: profilePayload.displayName || profilePayload.display_name || '',
        training_level: profilePayload.trainingLevel || profilePayload.training_level || 'beginner',
        goal: profilePayload.goal || 'hypertrophy',
        equipment,
        injuries,
        injury_flags: injuries,
        units: userPrefs?.unitSystem || 'kg',
        preferences: userPrefs || {},
        synced_at: new Date().toISOString(),
      }, { onConflict: 'firebase_uid' });
      if (error) throw error;
    });

    return { success: true, syncedCount: 1, failedCount: 0 };
  } catch (error: any) {
    return { success: false, syncedCount: 0, failedCount: 1, error: error.message };
  }
}

/**
 * Downloads user profiles from public.profiles table in Supabase by firebase_uid.
 * @param firebaseUid The Firebase UID of the user
 * @returns Array of downloaded profiles
 */
export async function downloadProfile(firebaseUid: string): Promise<any[]> {
  try {
    const data = await withRetryAndTimeout(async () => {
      const { data: resData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      if (error) throw error;
      return resData || [];
    });

    return data;
  } catch (error) {
    console.error('Failed to download profiles:', error);
    return [];
  }
}
