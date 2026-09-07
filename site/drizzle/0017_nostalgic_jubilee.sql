CREATE TABLE `scan_target_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`job_id` integer NOT NULL,
	`cycle` integer NOT NULL,
	`country` text NOT NULL,
	`verification_kind` text NOT NULL,
	`archived_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scan_target_history_archived_idx` ON `scan_target_history` (`archived_at`);