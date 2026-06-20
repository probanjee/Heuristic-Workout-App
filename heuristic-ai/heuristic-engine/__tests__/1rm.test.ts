/**
 * File: heuristic-engine/__tests__/1rm.test.ts
 * Purpose: Unit tests for 1RM calculation formulas and input validations
 * Dependencies: ../1rm
 */

import {
  calculateEpley1RM,
  calculateBrzycki1RM,
  calculateEstimated1RM,
  calculateEpley,
  calculateBrzycki,
  calculateOneRM,
  trainingWeightFromOneRM,
  getBestSetForOneRM,
  InvalidArgumentError,
} from '../1rm';

describe('calculateEpley1RM', () => {
  it('returns the weight itself for 1 rep', () => {
    expect(calculateEpley1RM(100, 1)).toBe(100);
  });

  it('calculates correctly for 5 reps at 80kg', () => {
    // Epley: 80 * (1 + 5/30) = 80 * 1.1667 = 93.33
    expect(calculateEpley1RM(80, 5)).toBeCloseTo(93.33, 1);
  });

  it('throws InvalidArgumentError for zero/negative weight', () => {
    expect(() => calculateEpley1RM(0, 5)).toThrow(InvalidArgumentError);
    expect(() => calculateEpley1RM(-80, 5)).toThrow(InvalidArgumentError);
  });

  it('throws InvalidArgumentError for zero/negative reps', () => {
    expect(() => calculateEpley1RM(80, 0)).toThrow(InvalidArgumentError);
    expect(() => calculateEpley1RM(80, -2)).toThrow(InvalidArgumentError);
  });
});

describe('calculateBrzycki1RM', () => {
  it('returns the weight itself for 1 rep', () => {
    expect(calculateBrzycki1RM(100, 1)).toBe(100);
  });

  it('calculates correctly for 5 reps at 80kg', () => {
    // Brzycki: 80 * 36 / (37 - 5) = 80 * 36/32 = 90.0
    expect(calculateBrzycki1RM(80, 5)).toBeCloseTo(90.0, 1);
  });

  it('clamps reps at 20 to prevent invalid results', () => {
    const result25 = calculateBrzycki1RM(80, 25);
    const result20 = calculateBrzycki1RM(80, 20);
    expect(result25).toBe(result20); // clamped
  });

  it('throws InvalidArgumentError for zero/negative inputs', () => {
    expect(() => calculateBrzycki1RM(0, 5)).toThrow(InvalidArgumentError);
    expect(() => calculateBrzycki1RM(80, 0)).toThrow(InvalidArgumentError);
  });
});

describe('calculateEstimated1RM', () => {
  it('averages Epley and Brzycki and rounds to 2.5kg', () => {
    const epley = calculateEpley1RM(80, 5);
    const brzycki = calculateBrzycki1RM(80, 5);
    const expected = (epley + brzycki) / 2;
    const expectedRounded = Math.round(expected / 2.5) * 2.5;
    expect(calculateEstimated1RM(80, 5)).toBeCloseTo(expectedRounded, 0);
  });

  it('returns the weight for 1 rep', () => {
    expect(calculateEstimated1RM(100, 1)).toBe(100);
  });

  it('rounds to nearest 2.5kg', () => {
    const result = calculateEstimated1RM(80, 5);
    expect(result % 2.5).toBeCloseTo(0, 1);
  });

  it('throws InvalidArgumentError for invalid inputs', () => {
    expect(() => calculateEstimated1RM(0, 5)).toThrow(InvalidArgumentError);
    expect(() => calculateEstimated1RM(80, 0)).toThrow(InvalidArgumentError);
  });

  it('1RM is always >= the actual weight lifted', () => {
    expect(calculateEstimated1RM(80, 5)).toBeGreaterThanOrEqual(80);
    expect(calculateEstimated1RM(100, 3)).toBeGreaterThanOrEqual(100);
  });
});

describe('Backward compatibility aliases', () => {
  it('calculateEpley returns 0 instead of throwing for compatibility', () => {
    expect(calculateEpley(0, 5)).toBe(0);
    expect(calculateEpley(80, 0)).toBe(0);
  });

  it('calculateBrzycki returns 0 instead of throwing for compatibility', () => {
    expect(calculateBrzycki(0, 5)).toBe(0);
    expect(calculateBrzycki(80, 0)).toBe(0);
  });

  it('calculateOneRM returns 0 instead of throwing for compatibility', () => {
    expect(calculateOneRM(0, 5)).toBe(0);
    expect(calculateOneRM(80, 0)).toBe(0);
  });
});

describe('trainingWeightFromOneRM', () => {
  it('returns ~85% of 1RM for 6 reps', () => {
    const weight = trainingWeightFromOneRM(100, 6);
    // Should be ~85kg, rounded to nearest 2.5kg
    expect(weight).toBeCloseTo(85, 5);
  });

  it('rounds to nearest 2.5kg', () => {
    const weight = trainingWeightFromOneRM(100, 6);
    expect(weight % 2.5).toBeCloseTo(0, 1);
  });
});

describe('getBestSetForOneRM', () => {
  it('returns null for empty array', () => {
    expect(getBestSetForOneRM([])).toBeNull();
  });

  it('returns the set with highest estimated 1RM', () => {
    const sets = [
      { weightKg: 60, reps: 10, formScore: 80 },
      { weightKg: 80, reps: 5, formScore: 75 },
    ];
    const best = getBestSetForOneRM(sets);
    expect(best?.weightKg).toBe(80);
  });

  it('prefers better form score as tiebreaker', () => {
    const sets = [
      { weightKg: 80, reps: 5, formScore: 90 },
      { weightKg: 80, reps: 5, formScore: 60 },
    ];
    const best = getBestSetForOneRM(sets);
    expect(best?.formScore).toBe(90);
  });
});
