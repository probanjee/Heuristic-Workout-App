/**
 * HeuristicAI — Unit Tests: Weight Rounding Utility
 */

import { roundWeight } from '../weight';

describe('Weight Rounding Utility', () => {
  it('should round to nearest 2.5kg by default', () => {
    expect(roundWeight(20)).toBe(20);
    expect(roundWeight(21.2)).toBe(20);
    expect(roundWeight(21.3)).toBe(22.5);
    expect(roundWeight(22.4)).toBe(22.5);
    expect(roundWeight(22.5)).toBe(22.5);
    expect(roundWeight(23.7)).toBe(22.5);
    expect(roundWeight(23.8)).toBe(25);
    expect(roundWeight(24)).toBe(25);
  });

  it('should round to custom increments when specified', () => {
    expect(roundWeight(20.3, 0.5)).toBe(20.5);
    expect(roundWeight(20.2, 0.5)).toBe(20.0);
    expect(roundWeight(20.74, 0.5)).toBe(20.5);
    expect(roundWeight(20.75, 0.5)).toBe(21.0);
  });

  it('should handle negative and zero increments gracefully', () => {
    expect(roundWeight(20.123, 0)).toBe(20.123);
    expect(roundWeight(20.123, -1)).toBe(20.123);
  });
});
