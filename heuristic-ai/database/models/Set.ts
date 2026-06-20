/**
 * HeuristicAI — WatermelonDB Model: WorkoutSet
 */

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import type { HeuristicDecision } from '../../heuristic-engine/types';

export default class WorkoutSet extends Model {
  static table = 'sets';

  @field('session_id') sessionId!: string;
  @field('exercise_id') exerciseId!: string;
  @field('set_number') setNumber!: number;
  @field('target_reps') targetReps!: number;
  @field('completed_reps') completedReps!: number;
  @field('target_weight_kg') targetWeightKg!: number;
  @field('actual_weight_kg') actualWeightKg!: number;
  @field('rpe') rpe!: number | null;
  @field('rpe_estimated') rpeEstimated!: boolean;
  @field('form_score') formScore!: number | null;
  @field('rest_seconds') restSeconds!: number | null;
  @field('heuristic_action') private _heuristicAction!: string | null; // JSON
  @date('completed_at') completedAt!: Date;
  @field('synced') synced!: boolean;

  get heuristicAction(): HeuristicDecision | null {
    if (!this._heuristicAction) return null;
    try {
      return JSON.parse(this._heuristicAction) as HeuristicDecision;
    } catch {
      return null;
    }
  }

  get volume(): number {
    return this.actualWeightKg * this.completedReps;
  }
}
