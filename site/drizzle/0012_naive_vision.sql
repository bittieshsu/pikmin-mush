ALTER TABLE `mushrooms` ADD `mushroom_status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `mushrooms` ADD `invalidated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `mushrooms_status_level_first_seen_idx` ON `mushrooms` (`mushroom_status`,`level`,`first_seen`);