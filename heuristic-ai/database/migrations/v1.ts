/**
 * HeuristicAI — WatermelonDB Migrations v1
 * Initial database schema migration
 */

import { createTable, addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 1,
      steps: [
        createTable({
          name: 'users',
          columns: [
            { name: 'supabase_id', type: 'string', isOptional: true },
            { name: 'display_name', type: 'string' },
            { name: 'goal', type: 'string' },
            { name: 'training_level', type: 'string' },
            { name: 'equipment', type: 'string' },
            { name: 'injury_flags', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'synced_at', type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'exercises',
          columns: [
            { name: 'slug', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'muscle_primary', type: 'string' },
            { name: 'muscle_secondary', type: 'string' },
            { name: 'equipment', type: 'string' },
            { name: 'difficulty', type: 'string' },
            { name: 'video_url', type: 'string' },
            { name: 'video_cached', type: 'boolean' },
            { name: 'form_checklist', type: 'string' },
            { name: 'audio_cues', type: 'string' },
            { name: 'pose_model', type: 'string', isOptional: true },
          ],
        }),
        createTable({
          name: 'sessions',
          columns: [
            { name: 'user_id', type: 'string' },
            { name: 'started_at', type: 'number' },
            { name: 'ended_at', type: 'number', isOptional: true },
            { name: 'status', type: 'string' },
            { name: 'total_volume_kg', type: 'number', isOptional: true },
            { name: 'avg_rpe', type: 'number', isOptional: true },
            { name: 'heuristic_summary', type: 'string', isOptional: true },
            { name: 'synced', type: 'boolean' },
          ],
        }),
        createTable({
          name: 'sets',
          columns: [
            { name: 'session_id', type: 'string' },
            { name: 'exercise_id', type: 'string' },
            { name: 'set_number', type: 'number' },
            { name: 'target_reps', type: 'number' },
            { name: 'completed_reps', type: 'number' },
            { name: 'target_weight_kg', type: 'number' },
            { name: 'actual_weight_kg', type: 'number' },
            { name: 'rpe', type: 'number', isOptional: true },
            { name: 'rpe_estimated', type: 'boolean' },
            { name: 'form_score', type: 'number', isOptional: true },
            { name: 'rest_seconds', type: 'number', isOptional: true },
            { name: 'heuristic_action', type: 'string', isOptional: true },
            { name: 'completed_at', type: 'number' },
            { name: 'synced', type: 'boolean' },
          ],
        }),
        createTable({
          name: 'heuristic_profiles',
          columns: [
            { name: 'user_id', type: 'string' },
            { name: 'exercise_id', type: 'string' },
            { name: 'estimated_1rm_kg', type: 'number', isOptional: true },
            { name: 'avg_rpe_last_5', type: 'number', isOptional: true },
            { name: 'best_volume_session', type: 'number', isOptional: true },
            { name: 'consecutive_high_rpe', type: 'number' },
            { name: 'last_session_id', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'recovery_flags',
          columns: [
            { name: 'user_id', type: 'string' },
            { name: 'exercise_id', type: 'string', isOptional: true },
            { name: 'flag_type', type: 'string' },
            { name: 'active_until', type: 'number' },
            { name: 'reason', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
