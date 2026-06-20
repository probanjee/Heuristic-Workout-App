/**
 * HeuristicAI — Zustand Sync Store
 * Manages offline/online sync state (APP_FLOW.md § 8)
 */

import { create } from 'zustand';
import type { SyncStatus } from '../services/sync/types';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  pendingCount: number;
  errorMessage: string | null;
  isOnline: boolean;

  // Actions
  setStatus: (status: SyncStatus) => void;
  setOnline: (online: boolean) => void;
  setSyncing: () => void;
  setSynced: (timestamp: number) => void;
  setSyncError: (message: string) => void;
  setPendingCount: (count: number) => void;
  resetSyncError: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'Online',
  lastSyncedAt: null,
  pendingCount: 0,
  errorMessage: null,
  isOnline: true,

  setStatus: (status) => set({ status }),

  setOnline: (online) =>
    set((s) => ({
      isOnline: online,
      status: online ? (s.status === 'Offline' ? 'Online' : s.status) : 'Offline',
    })),

  setSyncing: () => set({ status: 'Syncing', errorMessage: null }),

  setSynced: (timestamp) =>
    set({ status: 'Online', lastSyncedAt: timestamp, pendingCount: 0, errorMessage: null }),

  setSyncError: (message) =>
    set({ status: 'Failed', errorMessage: message }),

  setPendingCount: (count) => set({ pendingCount: count }),

  resetSyncError: () => set({ status: 'Online', errorMessage: null }),
}));
