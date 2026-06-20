/**
 * HeuristicAI — WatermelonDB Model: User
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';
import type { GoalType, TrainingLevel, EquipmentType, InjuryFlag } from '../../heuristic-engine/types';

export default class User extends Model {
  static table = 'users';

  @field('firebase_uid') firebaseUid!: string | null;
  @field('display_name') displayName!: string;
  @field('goal') goal!: GoalType;
  @field('training_level') trainingLevel!: TrainingLevel;
  @field('equipment') private _equipment!: string; // JSON
  @field('injury_flags') private _injuryFlags!: string; // JSON
  @readonly @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt!: Date | null;

  get equipment(): EquipmentType[] {
    try {
      return JSON.parse(this._equipment) as EquipmentType[];
    } catch {
      return [];
    }
  }

  get injuryFlags(): InjuryFlag[] {
    try {
      return JSON.parse(this._injuryFlags) as InjuryFlag[];
    } catch {
      return [];
    }
  }
}
