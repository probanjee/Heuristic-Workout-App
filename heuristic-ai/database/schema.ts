/**
 * File: database/schema.ts
 * Purpose: WatermelonDB database schema definitions
 * Dependencies: @nozbe/watermelondb
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [

    // ── USER PROFILE ─────────────────────────────────────────────────────────
    tableSchema({
      name: 'users',
      columns: [
        { name: 'firebase_uid', type: 'string', isOptional: true },
        { name: 'display_name', type: 'string' },
        { name: 'goal', type: 'string' }, // strength | hypertrophy | endurance | fat_loss
        { name: 'training_level', type: 'string' }, // beginner | intermediate | advanced
        { name: 'equipment', type: 'string' }, // JSON array: ['barbell', 'dumbbell', ...]
        { name: 'injury_flags', type: 'string' }, // JSON array: ['knees', 'lower_back', ...]
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),

    // ── EXERCISE LIBRARY (seeded locally) ────────────────────────────────────
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'slug', type: 'string' }, // e.g., 'barbell-squat'
        { name: 'name', type: 'string' },
        { name: 'muscle_primary', type: 'string' },
        { name: 'muscle_secondary', type: 'string' }, // JSON array
        { name: 'equipment', type: 'string' },
        { name: 'difficulty', type: 'string' }, // beginner | intermediate | advanced
        { name: 'video_url', type: 'string' },
        { name: 'video_cached', type: 'boolean' },
        { name: 'form_checklist', type: 'string' }, // JSON array of strings
        { name: 'audio_cues', type: 'string' }, // JSON array of strings
        { name: 'pose_model', type: 'string', isOptional: true }, // squat | pushup | deadlift | lunge | plank
      ],
    }),

    // ── WORKOUT SESSIONS ─────────────────────────────────────────────────────
    tableSchema({
      name: 'sessions',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'started_at', type: 'number' },
        { name: 'ended_at', type: 'number', isOptional: true },
        { name: 'status', type: 'string' }, // active | completed | abandoned
        { name: 'total_volume_kg', type: 'number', isOptional: true },
        { name: 'avg_rpe', type: 'number', isOptional: true },
        { name: 'heuristic_summary', type: 'string', isOptional: true }, // JSON
        { name: 'synced', type: 'boolean' },
      ],
    }),

    // ── SETS (individual set log) ─────────────────────────────────────────────
    tableSchema({
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
        { name: 'form_score', type: 'number', isOptional: true }, // 0–100
        { name: 'rest_seconds', type: 'number', isOptional: true },
        { name: 'heuristic_action', type: 'string', isOptional: true }, // JSON: HeuristicDecision
        { name: 'completed_at', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),

    // ── HEURISTIC PROFILES (per-exercise learned limits) ─────────────────────
    tableSchema({
      name: 'heuristic_profiles',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'exercise_id', type: 'string' }, // exercise slug
        { name: 'estimated_1rm_kg', type: 'number', isOptional: true },
        { name: 'avg_rpe_last_5', type: 'number', isOptional: true },
        { name: 'best_volume_session', type: 'number', isOptional: true },
        { name: 'consecutive_high_rpe', type: 'number' }, // deload trigger counter
        { name: 'last_session_id', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // ── RECOVERY FLAGS ────────────────────────────────────────────────────────
    tableSchema({
      name: 'recovery_flags',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'exercise_id', type: 'string', isOptional: true }, // null = full-body flag
        { name: 'flag_type', type: 'string' }, // volume_reduction | rest_day | deload
        { name: 'active_until', type: 'number' }, // Unix ms timestamp
        { name: 'reason', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),

  ],
});
