/**
 * HeuristicAI — useWorkoutSummary Hook
 * Retrieves the compiled analytics summary and exercise breakdown for a workout session.
 * Source of truth: TASK.md (M6 Task 23)
 */

import { useState, useEffect } from 'react';
import { generateWorkoutSummary, type ExerciseBreakdown } from '@/services/analytics/summary';
import type { HeuristicSummary, SessionData } from '@/heuristic-engine/types';
import { sessionsCollection } from '@/database';
import { Q } from '@nozbe/watermelondb';

/**
 * Custom hook to load the summary and exercise breakdown for a workout session.
 * If no sessionId is provided, it defaults to the most recently completed session.
 */
export function useWorkoutSummary(sessionId?: string) {
  const [summary, setSummary] = useState<HeuristicSummary | null>(null);
  const [breakdown, setBreakdown] = useState<ExerciseBreakdown[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        let id = sessionId;

        if (!id) {
          // Fetch the most recently completed session
          const completed = await sessionsCollection
            .query(
              Q.where('status', 'completed'),
              Q.sortBy('ended_at', Q.desc),
              Q.take(1)
            )
            .fetch();

          if (completed.length > 0) {
            id = completed[0].id;
          }
        }

        if (!id) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        // Fetch session record
        const sessionRecord = await sessionsCollection.find(id);
        const mappedSession: SessionData = {
          id: sessionRecord.id,
          userId: sessionRecord.userId,
          startedAt: sessionRecord.startedAt.getTime(),
          endedAt: sessionRecord.endedAt ? sessionRecord.endedAt.getTime() : null,
          status: sessionRecord.status as any,
          totalVolumeKg: sessionRecord.totalVolumeKg,
          avgRpe: sessionRecord.avgRpe,
          heuristicSummary: sessionRecord.heuristicSummary,
          synced: sessionRecord.synced,
        };

        const data = await generateWorkoutSummary(id);
        if (active) {
          if (data) {
            setSummary(data.summary);
            setBreakdown(data.breakdown);
            setSession(mappedSession);
            setError(null);
          } else {
            setError('Failed to generate workout summary.');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Error occurred while loading summary.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [sessionId]);

  return {
    summary,
    breakdown,
    session,
    loading,
    error,
  };
}
