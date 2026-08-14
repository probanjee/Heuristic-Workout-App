-- Non-destructive reminder preference migration.
-- Drizzle generation is currently blocked by legacy snapshot collisions;
-- this checked-in SQL remains safe to reapply because the column is conditional.
ALTER TABLE `user_profiles`
  ADD COLUMN IF NOT EXISTS `reminderEnabled` int NOT NULL DEFAULT 0 AFTER `preferredWorkoutTime`;
