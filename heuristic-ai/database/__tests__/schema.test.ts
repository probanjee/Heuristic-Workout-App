/**
 * File: database/__tests__/schema.test.ts
 * Purpose: Unit tests to verify WatermelonDB database schema definitions
 * Dependencies: jest, @/database/schema
 */

import { schema } from '../schema';

describe('Database Schema Definitions', () => {
  it('should have database version 2', () => {
    expect(schema.version).toBe(2);
  });

  it('should contain exactly 6 tables', () => {
    const tableNames = Object.keys(schema.tables);
    expect(tableNames.length).toBe(6);
  });

  it('should define all required tables', () => {
    const tableNames = Object.keys(schema.tables);
    const requiredTables = [
      'users',
      'exercises',
      'sessions',
      'sets',
      'heuristic_profiles',
      'recovery_flags',
    ];

    requiredTables.forEach((table) => {
      expect(tableNames).toContain(table);
    });
  });

  it('should define correct columns for users table', () => {
    const usersTable = schema.tables.users;
    expect(usersTable).toBeDefined();
    
    const columns = Object.keys(usersTable.columns);
    expect(columns).toContain('firebase_uid');
    expect(columns).toContain('display_name');
    expect(columns).toContain('goal');
    expect(columns).toContain('training_level');
    expect(columns).toContain('equipment');
    expect(columns).toContain('injury_flags');
    expect(columns).toContain('created_at');
    expect(columns).toContain('synced_at');
  });

  it('should define correct columns for exercises table', () => {
    const exercisesTable = schema.tables.exercises;
    expect(exercisesTable).toBeDefined();

    const columns = Object.keys(exercisesTable.columns);
    expect(columns).toContain('slug');
    expect(columns).toContain('name');
    expect(columns).toContain('muscle_primary');
    expect(columns).toContain('muscle_secondary');
    expect(columns).toContain('equipment');
    expect(columns).toContain('difficulty');
    expect(columns).toContain('video_url');
    expect(columns).toContain('video_cached');
    expect(columns).toContain('form_checklist');
    expect(columns).toContain('audio_cues');
    expect(columns).toContain('pose_model');
  });
});
