/**
 * HeuristicAI — WatermelonDB Model: WorkoutSession
 */

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import type { WorkoutStatus, HeuristicSummary } from '../../heuristic-engine/types';

export default class WorkoutSession extends Model {
  static table = 'sessions';

  @field('user_id') userId!: string;
  @date('started_at') startedAt!: Date;
  @date('ended_at') endedAt!: Date | null;
  @field('status') status!: WorkoutStatus;
  @field('total_volume_kg') totalVolumeKg!: number | null;
  @field('avg_rpe') avgRpe!: number | null;
  @field('heuristic_summary') private _heuristicSummary!: string | null; // JSON
  @field('synced') synced!: boolean;

  get heuristicSummary(): HeuristicSummary | null {
    if (!this._heuristicSummary) return null;
    try {
      return JSON.parse(this._heuristicSummary) as HeuristicSummary;
    } catch {
      return null;
    }
  }

  get durationMinutes(): number {
    if (!this.endedAt) return 0;
    return Math.round((this.endedAt.getTime() - this.startedAt.getTime()) / 60000);
  }
}
