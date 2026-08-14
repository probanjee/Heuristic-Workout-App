CREATE TABLE `auth_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`identifier` varchar(320) NOT NULL,
	`channel` enum('phone','email') NOT NULL,
	`purpose` enum('phone_login','email_verification','password_reset') NOT NULL,
	`challengeHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 0,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`consumedAt` timestamp,
	CONSTRAINT `auth_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(24);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phoneNumber_unique` UNIQUE(`phoneNumber`);