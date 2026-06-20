/**
 * HeuristicAI — useSessionHistory Hook
 * Retrieves the paginated session history from local WatermelonDB.
 * Source of truth: TASK.md (M6 Task 23)
 */

import { useState, useEffect } from 'react';
import { sessionsCollection } from '@/database';
import { Q } from '@nozbe/watermelondb';
import type { SessionData } from '@/heuristic-engine/types';

/**
 * Custom hook to load the history of completed sessions.
 * Exposes loading state and a refetch function.
 *
 * @param limit - Maximum sessions to retrieve (default 30)
 */
export function useSessionHistory(limit: number = 30) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const records = await sessionsCollection
        .query(
          Q.where('status', 'completed'),
          Q.sortBy('ended_at', Q.desc),
          Q.take(limit)
        )
        .fetch();

      const mapped: SessionData[] = records.map((record: any) => ({
        id: record.id,
        userId: record.userId,
        startedAt: record.startedAt.getTime(),
        endedAt: record.endedAt ? record.endedAt.getTime() : null,
        status: record.status as any,
        totalVolumeKg: record.totalVolumeKg,
        avgRpe: record.avgRpe,
        heuristicSummary: record.heuristicSummary,
        synced: record.synced,
      }));

      setSessions(mapped);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load session history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [limit]);

  return {
    sessions,
    loading,
    error,
    refetch: load,
  };
}
