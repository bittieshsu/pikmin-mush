CREATE TABLE `agent_power_pauses` (
	`key` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`paused_at` integer NOT NULL,
	`resumed_at` integer,
	`reason` text NOT NULL,
	`received_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `power_pause_agent_time_idx` ON `agent_power_pauses` (`agent_id`,`paused_at`);