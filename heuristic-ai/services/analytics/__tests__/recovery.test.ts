/**
 * HeuristicAI — Unit Tests: Recovery Recommendation Service
 * Source of truth: TASK.md (M6 Task 2, 25)
 */

import { generateRecoveryRecommendation } from '../recovery';

describe('Recovery Recommendation Service', () => {
  test('RPE < 6 maps to 24h recovery and low severity', () => {
    const result = generateRecoveryRecommendation(5.5, null, 5.0);
    expect(result.hours).toBe(24);
    expect(result.severity).toBe('low');
    expect(result.message).toContain('Low-intensity output logged');
  });

  test('RPE >= 6 and < 8 maps to 48h recovery and moderate severity', () => {
    const result = generateRecoveryRecommendation(6.0, null, 5.0);
    expect(result.hours).toBe(48);
    expect(result.severity).toBe('moderate');
    expect(result.message).toContain('Moderate workload logged');

    const result2 = generateRecoveryRecommendation(7.9, null, 5.0);
    expect(result2.hours).toBe(48);
    expect(result2.severity).toBe('moderate');
  });

  test('RPE >= 8 maps to 72h recovery and high severity', () => {
    const result = generateRecoveryRecommendation(8.0, null, 5.0);
    expect(result.hours).toBe(72);
    expect(result.severity).toBe('high');
    expect(result.message).toContain('High-intensity output logged');

    const result2 = generateRecoveryRecommendation(9.5, null, 5.0);
    expect(result2.hours).toBe(72);
    expect(result2.severity).toBe('high');
  });

  test('Form score < 60 adds technique breakdown warning', () => {
    const result = generateRecoveryRecommendation(7.0, 58, 5.0);
    expect(result.hours).toBe(48);
    expect(result.message).toContain('Technique breakdown detected');
  });

  test('Form score >= 60 does not add technique breakdown warning', () => {
    const result = generateRecoveryRecommendation(7.0, 60, 5.0);
    expect(result.message).not.toContain('Technique breakdown detected');
  });

  test('Fatigue index > 7.5 adds deload recommendation', () => {
    const result = generateRecoveryRecommendation(7.0, null, 7.6);
    expect(result.message).toContain('Consider a deload session next');
  });

  test('Fatigue index <= 7.5 does not add deload recommendation', () => {
    const result = generateRecoveryRecommendation(7.0, null, 7.5);
    expect(result.message).not.toContain('Consider a deload session next');
  });

  test('Combined edge cases: high intensity, form failure, and fatigue', () => {
    const result = generateRecoveryRecommendation(8.5, 45, 8.0);
    expect(result.hours).toBe(72);
    expect(result.severity).toBe('high');
    expect(result.message).toContain('High-intensity output logged');
    expect(result.message).toContain('Technique breakdown detected');
    expect(result.message).toContain('Consider a deload session next');
  });

  test('Combined edge cases: low intensity, form failure, and fatigue', () => {
    const result = generateRecoveryRecommendation(4.0, 50, 7.8);
    expect(result.hours).toBe(24);
    expect(result.severity).toBe('low');
    expect(result.message).toContain('Low-intensity output logged');
    expect(result.message).toContain('Technique breakdown detected');
    expect(result.message).toContain('Consider a deload session next');
  });
});
