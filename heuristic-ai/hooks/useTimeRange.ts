/**
 * HeuristicAI — useTimeRange Hook
 * Manages the active range selection for progress history.
 * Source of truth: TASK.md (M6 Task 23)
 */

import { useState } from 'react';

export type TimeRangeKey = '7d' | '30d' | '90d' | 'all';

/**
 * Custom hook to maintain range state and expose days mapped to each key.
 */
export function useTimeRange(initialRange: TimeRangeKey = '30d') {
  const [range, setRange] = useState<TimeRangeKey>(initialRange);

  const getDays = (): number => {
    switch (range) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'all':
        return 0;
      default:
        return 30;
    }
  };

  return {
    range,
    setRange,
    days: getDays(),
  };
}
