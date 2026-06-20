/**
 * File: services/sync/conflict-resolver.ts
 * Purpose: Centralizes Last-Write-Wins (LWW) conflict resolution logic.
 */

export type ConflictResolution = 'local_wins' | 'cloud_wins' | 'skip';

/**
 * Resolves a conflict between a local record and a cloud record.
 * Rules:
 * - Cloud newer -> cloud_wins (overwrite local)
 * - Local newer -> local_wins (upload local)
 * - Equal -> skip
 */
export function resolveConflict(localRecord: any, cloudRecord: any): ConflictResolution {
  const getTimestamp = (record: any): number => {
    if (!record) return 0;
    
    // Check all possible timestamp fields in order of preference
    const t = 
      record.updated_at || 
      record.updatedAt || 
      record.completed_at || 
      record.completedAt || 
      record.created_at || 
      record.createdAt || 
      record.synced_at || 
      record.syncedAt || 
      0;

    if (t instanceof Date) return t.getTime();
    if (typeof t === 'string') return new Date(t).getTime();
    if (typeof t === 'number') {
      // If unix timestamp in seconds, convert to milliseconds
      if (t < 9999999999) return t * 1000;
      return t;
    }
    return 0;
  };

  const localTime = getTimestamp(localRecord);
  const cloudTime = getTimestamp(cloudRecord);

  if (cloudTime > localTime) {
    return 'cloud_wins';
  } else if (localTime > cloudTime) {
    return 'local_wins';
  } else {
    return 'skip';
  }
}
