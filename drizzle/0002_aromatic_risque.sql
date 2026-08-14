CREATE TABLE `daily_workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutDate` varchar(10) NOT NULL,
	`title` varchar(160) NOT NULL,
	`goal` varchar(64) NOT NULL,
	`durationMinutes` int NOT NULL,
	`reasonCodes` text NOT NULL,
	`status` enum('planned','in_progress','completed','skipped') NOT NULL DEFAULT 'planned',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_workouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(160) NOT NULL,
	`primaryMuscle` varchar(64) NOT NULL,
	`secondaryMuscles` text,
	`equipment` varchar(64) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`movementPattern` varchar(64) NOT NULL,
	`instructions` text NOT NULL,
	`defaultSets` int NOT NULL,
	`defaultReps` varchar(32) NOT NULL,
	`restSeconds` int NOT NULL,
	`alternativeSlugs` text,
	`isSystemVerified` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`),
	CONSTRAINT `exercises_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workoutId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`position` int NOT NULL,
	`sets` int NOT NULL,
	`reps` varchar(32) NOT NULL,
	`restSeconds` int NOT NULL,
	`completedAt` timestamp,
	CONSTRAINT `workout_exercises_id` PRIMARY KEY(`id`)
);
