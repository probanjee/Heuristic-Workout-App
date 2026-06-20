/**
 * HeuristicAI — WatermelonDB Model: Exercise
 */

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import type { MuscleGroup, EquipmentType, ExerciseDifficulty } from '../../heuristic-engine/types';

export default class Exercise extends Model {
  static table = 'exercises';

  @field('slug') slug!: string;
  @field('name') name!: string;
  @field('muscle_primary') musclePrimary!: MuscleGroup;
  @field('muscle_secondary') private _muscleSecondary!: string; // JSON
  @field('equipment') equipment!: EquipmentType;
  @field('difficulty') difficulty!: ExerciseDifficulty;
  @field('video_url') videoUrl!: string;
  @field('video_cached') videoCached!: boolean;
  @field('form_checklist') private _formChecklist!: string; // JSON
  @field('audio_cues') private _audioCues!: string; // JSON
  @field('pose_model') poseModel!: string | null;

  get muscleSecondary(): MuscleGroup[] {
    try {
      return JSON.parse(this._muscleSecondary) as MuscleGroup[];
    } catch {
      return [];
    }
  }

  get formChecklist(): string[] {
    try {
      return JSON.parse(this._formChecklist) as string[];
    } catch {
      return [];
    }
  }

  get audioCues(): string[] {
    try {
      return JSON.parse(this._audioCues) as string[];
    } catch {
      return [];
    }
  }
}
