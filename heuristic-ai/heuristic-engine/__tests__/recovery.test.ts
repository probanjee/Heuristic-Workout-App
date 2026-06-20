/**
 * File: heuristic-engine/__tests__/recovery.test.ts
 * Purpose: Unit tests for recovery flag helper functions
 * Dependencies: ../recovery, ../types
 */

import {
  createRecoveryFlag,
  isRecoveryFlagActive,
  expireRecoveryFlags,
  getActiveRecoveryFlags,
  getRecoveryRecommendationHours,
} from '../recovery';
import type { RecoveryFlag } from '../types';

describe('Recovery Flag Helpers', () => {
  const baseTime = 1600000000000;

  describe('createRecoveryFlag', () => {
    it('sets volume_reduction flag for 24h duration', () => {
      const flag = createRecoveryFlag('squat', 'volume_reduction', 'Fatigue', baseTime);
      expect(flag.exerciseSlug).toBe('squat');
      expect(flag.flagType).toBe('volume_reduction');
      expect(flag.activeUntilHours).toBe(24);
      expect(flag.activeUntil).toBe(baseTime + 24 * 60 * 60 * 1000);
      expect(flag.reason).toBe('Fatigue');
    });

    it('sets rest_day flag for 48h duration', () => {
      const flag = createRecoveryFlag('squat', 'rest_day', 'Injury prevention', baseTime);
      expect(flag.flagType).toBe('rest_day');
      expect(flag.activeUntilHours).toBe(48);
      expect(flag.activeUntil).toBe(baseTime + 48 * 60 * 60 * 1000);
    });

    it('sets deload flag for 72h duration', () => {
      const flag = createRecoveryFlag(null, 'deload', 'Joint soreness', baseTime);
      expect(flag.exerciseSlug).toBeNull();
      expect(flag.flagType).toBe('deload');
      expect(flag.activeUntilHours).toBe(72);
      expect(flag.activeUntil).toBe(baseTime + 72 * 60 * 60 * 1000);
    });
  });

  describe('isRecoveryFlagActive', () => {
    const flag: RecoveryFlag = {
      exerciseSlug: 'squat',
      flagType: 'volume_reduction',
      activeUntil: baseTime + 24 * 60 * 60 * 1000,
      reason: 'test',
    };

    it('returns true if current timestamp is before activeUntil', () => {
      expect(isRecoveryFlagActive(flag, baseTime + 10 * 60 * 60 * 1000)).toBe(true);
    });

    it('returns false if current timestamp equals activeUntil', () => {
      expect(isRecoveryFlagActive(flag, baseTime + 24 * 60 * 60 * 1000)).toBe(false);
    });

    it('returns false if current timestamp is past activeUntil', () => {
      expect(isRecoveryFlagActive(flag, baseTime + 30 * 60 * 60 * 1000)).toBe(false);
    });
  });

  describe('expireRecoveryFlags and getActiveRecoveryFlags', () => {
    const activeFlag: RecoveryFlag = {
      exerciseSlug: 'squat',
      flagType: 'volume_reduction',
      activeUntil: baseTime + 24 * 60 * 60 * 1000,
      reason: 'test',
    };

    const expiredFlag: RecoveryFlag = {
      exerciseSlug: 'bench',
      flagType: 'rest_day',
      activeUntil: baseTime - 1000,
      reason: 'expired',
    };

    const flags = [activeFlag, expiredFlag];

    it('filters out expired flags correctly', () => {
      const result = expireRecoveryFlags(flags, baseTime);
      expect(result).toHaveLength(1);
      expect(result[0].exerciseSlug).toBe('squat');
    });

    it('getActiveRecoveryFlags performs identically to expireRecoveryFlags', () => {
      const result = getActiveRecoveryFlags(flags, baseTime);
      expect(result).toHaveLength(1);
      expect(result[0].exerciseSlug).toBe('squat');
    });
  });

  describe('getRecoveryRecommendationHours', () => {
    it('returns 72h for avg RPE >= 8', () => {
      expect(getRecoveryRecommendationHours(8.0)).toBe(72);
      expect(getRecoveryRecommendationHours(9.5)).toBe(72);
    });

    it('returns 48h for avg RPE between 6 and 8', () => {
      expect(getRecoveryRecommendationHours(6.0)).toBe(48);
      expect(getRecoveryRecommendationHours(7.5)).toBe(48);
    });

    it('returns 24h for avg RPE < 6', () => {
      expect(getRecoveryRecommendationHours(5.5)).toBe(24);
      expect(getRecoveryRecommendationHours(4.0)).toBe(24);
    });
  });
});
