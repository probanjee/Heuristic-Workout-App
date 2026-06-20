/**
 * File: heuristic-engine/__tests__/fatigue.test.ts
 * Purpose: Unit tests for session fatigue index and level mapping
 * Dependencies: ../fatigue, ../types
 */

import { calculateSessionFatigueIndex, getFatigueLevel } from '../fatigue';

describe('Fatigue Index & Level Helpers', () => {
  describe('calculateSessionFatigueIndex', () => {
    it('returns 0 for empty array', () => {
      expect(calculateSessionFatigueIndex([])).toBe(0);
    });

    it('returns 0 if all values are null', () => {
      expect(calculateSessionFatigueIndex([null, null, null])).toBe(0);
    });

    it('calculates average correctly for numbers', () => {
      expect(calculateSessionFatigueIndex([6, 7, 8])).toBeCloseTo(7.0, 1);
      expect(calculateSessionFatigueIndex([5, 9])).toBeCloseTo(7.0, 1);
    });

    it('ignores null RPE values', () => {
      expect(calculateSessionFatigueIndex([6, null, 8])).toBeCloseTo(7.0, 1);
      expect(calculateSessionFatigueIndex([null, 9, null])).toBeCloseTo(9.0, 1);
    });
  });

  describe('getFatigueLevel', () => {
    it('returns high fatigue level for index >= 8.5', () => {
      expect(getFatigueLevel(8.5)).toBe('high');
      expect(getFatigueLevel(9.0)).toBe('high');
    });

    it('returns moderate fatigue level for index between 7.0 and 8.5', () => {
      expect(getFatigueLevel(7.0)).toBe('moderate');
      expect(getFatigueLevel(8.0)).toBe('moderate');
      expect(getFatigueLevel(8.49)).toBe('moderate');
    });

    it('returns low fatigue level for index < 7.0', () => {
      expect(getFatigueLevel(6.9)).toBe('low');
      expect(getFatigueLevel(5.0)).toBe('low');
      expect(getFatigueLevel(0)).toBe('low');
    });
  });
});
