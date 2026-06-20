/**
 * File: database/migrations.ts
 * Purpose: WatermelonDB database migrations definition
 * Dependencies: @nozbe/watermelondb/Schema/migrations
 */

import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [],
    },
  ],
});
