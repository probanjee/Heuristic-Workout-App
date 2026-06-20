/**
 * File: lib/storage.ts
 * Purpose: Storage helper methods for Supabase storage buckets
 * Dependencies: lib/supabase
 */

import { supabase } from './supabase';

/**
 * Gets the public URL for an exercise demo video from the 'exercise-videos' bucket.
 * @param slug The exercise slug (e.g., 'barbell-squat')
 * @returns The public URL string, or null if slug is invalid
 */
export function getExerciseVideoUrl(slug: string): string | null {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return null;
  }
  
  const { data } = supabase.storage
    .from('exercise-videos')
    .getPublicUrl(`${slug.trim()}.mp4`);
    
  return data.publicUrl;
}
