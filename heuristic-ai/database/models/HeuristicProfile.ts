/**
 * HeuristicAI — WatermelonDB Model: HeuristicProfile
 */

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class HeuristicProfile extends Model {
  static table = 'heuristic_profiles';

  @field('user_id') userId!: string;
  @field('exercise_id') exerciseId!: string; // exercise slug
  @field('estimated_1rm_kg') estimatedOneRmKg!: number | null;
  @field('avg_rpe_last_5') avgRpeLast5!: number | null;
  @field('best_volume_session') bestVolumeSession!: number | null;
  @field('consecutive_high_rpe') consecutiveHighRpe!: number;
  @field('last_session_id') lastSessionId!: string | null;
  @date('updated_at') updatedAt!: Date;

  // A "high RPE" session is defined as avg RPE ≥ 8
  get isDeloadCandidate(): boolean {
    return this.consecutiveHighRpe >= 3;
  }
}
