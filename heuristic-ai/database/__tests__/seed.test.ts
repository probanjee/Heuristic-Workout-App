/**
 * File: database/__tests__/seed.test.ts
 * Purpose: Unit tests to verify exercise seed data integrity and required items
 * Dependencies: jest, @/database/seed/exercises.seed
 */

import { SEED_EXERCISES } from '../seed/exercises.seed';

describe('Exercise Seed Data', () => {
  it('should contain exactly 25 exercises', () => {
    expect(SEED_EXERCISES.length).toBe(25);
  });

  it('should have unique slugs for all exercises', () => {
    const slugs = SEED_EXERCISES.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(25);
  });

  it('should contain all required exercises from the specification', () => {
    const slugs = SEED_EXERCISES.map((e) => e.slug);
    const requiredSlugs = [
      'squat',
      'pushup',
      'deadlift',
      'lunge',
      'plank',
      'bench-press',
      'row',
      'shoulder-press',
      'pullup',
      'romanian-deadlift',
      'goblet-squat',
      'dumbbell-curl',
      'triceps-pushdown',
      'lat-pulldown',
      'leg-press',
      'calf-raise',
      'hip-thrust',
      'face-pull',
      'lateral-raise',
      'chest-fly',
      'cable-row',
      'mountain-climber',
      'burpee',
      'glute-bridge',
      'hollow-hold',
    ];

    requiredSlugs.forEach((slug) => {
      expect(slugs).toContain(slug);
    });
  });

  it('should have valid properties for all seeded records', () => {
    SEED_EXERCISES.forEach((ex) => {
      expect(ex.slug).toBeDefined();
      expect(ex.name).toBeDefined();
      expect(ex.musclePrimary).toBeDefined();
      expect(Array.isArray(ex.muscleSecondary)).toBe(true);
      expect(ex.equipment).toBeDefined();
      expect(ex.difficulty).toBeDefined();
      
      // Video URL should format dynamically using supabase URL environment variable
      expect(ex.videoUrl).toContain('/storage/v1/object/public/exercise-videos/');
      expect(ex.videoUrl.endsWith('.mp4')).toBe(true);
      
      expect(Array.isArray(ex.formChecklist)).toBe(true);
      expect(ex.formChecklist.length).toBeGreaterThan(0);
      expect(Array.isArray(ex.audioCues)).toBe(true);
      expect(ex.audioCues.length).toBeGreaterThan(0);
    });
  });
});
