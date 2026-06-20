/**
 * File: services/sync/types.ts
 * Purpose: Type definitions for the background synchronization engine
 */

export type SyncStatus = 'Online' | 'Offline' | 'Reconnecting' | 'Syncing' | 'Failed';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  error?: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  createdAt: string;
  retryCount: number;
}

/**
 * Generates a deterministic UUID from any input string.
 * This is used to map local alphanumeric string IDs to valid database UUIDs.
 */
export function deterministicUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str.toLowerCase();
  }
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  let seed = Math.abs(hash);
  const rand = () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  
  const hexChars = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += hexChars[Math.floor(rand() * 16)];
  }
  
  const parts = [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16),
    hexChars[(parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8] + hex.substring(17, 20),
    hex.substring(20, 32)
  ];
  return parts.join('-');
}
