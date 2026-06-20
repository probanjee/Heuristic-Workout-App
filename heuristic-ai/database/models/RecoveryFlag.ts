/**
 * HeuristicAI — WatermelonDB Model: RecoveryFlag
 */

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import type { RecoveryFlag as RecoveryFlagType } from '../../heuristic-engine/types';

export default class RecoveryFlag extends Model {
  static table = 'recovery_flags';

  @field('user_id') userId!: string;
  @field('exercise_id') exerciseId!: string | null; // null = full-body
  @field('flag_type') flagType!: RecoveryFlagType['flagType'];
  @field('active_until') activeUntil!: number; // Unix ms
  @field('reason') reason!: string;
  @date('created_at') createdAt!: Date;

  get isActive(): boolean {
    return this.activeUntil > Date.now();
  }

  get hoursRemaining(): number {
    if (!this.isActive) return 0;
    return Math.round((this.activeUntil - Date.now()) / (60 * 60 * 1000));
  }

  toRecoveryFlag(): RecoveryFlagType {
    return {
      exerciseSlug: this.exerciseId,
      flagType: this.flagType,
      activeUntil: this.activeUntil,
      reason: this.reason,
    };
  }
}
