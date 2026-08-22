CREATE TABLE `event_spots` (
	`id` text PRIMARY KEY NOT NULL,
	`country` text NOT NULL,
	`city` text NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`spot_kind` text NOT NULL,
	`reward_kind` text NOT NULL,
	`reward_summary` text NOT NULL,
	`start_at` integer DEFAULT 0 NOT NULL,
	`end_at` integer DEFAULT 0 NOT NULL,
	`cooldown_note` text DEFAULT '' NOT NULL,
	`eligibility_note` text DEFAULT '' NOT NULL,
	`coordinate_note` text DEFAULT '' NOT NULL,
	`verification_status` text NOT NULL,
	`source_title` text NOT NULL,
	`source_url` text NOT NULL,
	`last_verified_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_spots_active_idx` ON `event_spots` (`end_at`,`country`);