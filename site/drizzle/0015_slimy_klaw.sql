-- Audit tables already exist in applied migrations 0013/0014; their snapshots
-- were missing. This new migration creates only the additive history tables.
CREATE TABLE `mushroom_challenges` (
	`key` text PRIMARY KEY NOT NULL,
	`location_id` text NOT NULL,
	`start_ms` integer NOT NULL,
	`identity_confidence` text NOT NULL,
	`first_recorded_at` integer NOT NULL,
	`last_observed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mushroom_challenges_location_idx` ON `mushroom_challenges` (`location_id`,`last_observed_at`);--> statement-breakpoint
CREATE TABLE `mushroom_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`first_recorded_at` integer NOT NULL,
	`last_recorded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mushroom_observations` (
	`key` text PRIMARY KEY NOT NULL,
	`challenge_key` text NOT NULL,
	`agent_id` text NOT NULL,
	`received_at` integer NOT NULL,
	`level` integer NOT NULL,
	`type` integer NOT NULL,
	`challenger_count` integer NOT NULL,
	`challenger_capacity` integer NOT NULL,
	`total_power` real NOT NULL,
	`finish_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mushroom_observations_received_idx` ON `mushroom_observations` (`received_at`);--> statement-breakpoint
CREATE INDEX `mushroom_observations_challenge_idx` ON `mushroom_observations` (`challenge_key`,`received_at`);--> statement-breakpoint
