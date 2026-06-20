/**
 * File: database/index.web.ts
 * Purpose: WatermelonDB Database Initialization for Web (using LokiJS)
 * Dependencies: @nozbe/watermelondb, @nozbe/watermelondb/adapters/lokijs, @/database/schema, @/database/models
 */

import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';

// Models
import User from './models/User';
import Exercise from './models/Exercise';
import WorkoutSession from './models/Session';
import WorkoutSet from './models/Set';
import HeuristicProfile from './models/HeuristicProfile';
import RecoveryFlag from './models/RecoveryFlag';

const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
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
