/**
 * File: database/index.ts
 * Purpose: WatermelonDB Database Initialization
 * Dependencies: @nozbe/watermelondb, @nozbe/watermelondb/adapters/sqlite, @/database/schema, @/database/migrations, @/database/models
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';

// Models
import User from './models/User';
import Exercise from './models/Exercise';
import WorkoutSession from './models/Session';
import WorkoutSet from './models/Set';
import HeuristicProfile from './models/HeuristicProfile';
import RecoveryFlag from './models/RecoveryFlag';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: typeof globalThis !== 'undefined' && (globalThis as any).HermesInternal !== undefined,
  onSetUpError: (error) => {
    console.error('[HeuristicAI] Database setup failed:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Exercise,
    WorkoutSession,
    WorkoutSet,
    HeuristicProfile,
    RecoveryFlag,
  ],
});

export const usersCollection = database.get<User>('users');
export const exercisesCollection = database.get<Exercise>('exercises');
export const sessionsCollection = database.get<WorkoutSession>('sessions');
export const setsCollection = database.get<WorkoutSet>('sets');
export const heuristicProfilesCollection = database.get<HeuristicProfile>('heuristic_profiles');
export const recoveryFlagsCollection = database.get<RecoveryFlag>('recovery_flags');

export default database;
