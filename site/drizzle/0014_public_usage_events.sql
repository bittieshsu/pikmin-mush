CREATE TABLE `public_usage_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `at` integer NOT NULL,
  `bucket_minute` integer NOT NULL,
  `event_type` text NOT NULL,
  `dimension` text DEFAULT '' NOT NULL,
  `mushroom_id` text DEFAULT '' NOT NULL,
  `source_hash` text NOT NULL,
  `country` text DEFAULT '' NOT NULL,
  `asn` integer DEFAULT 0 NOT NULL,
  `device_class` text DEFAULT '' NOT NULL,
  `event_count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `public_usage_events_at_idx` ON `public_usage_events` (`at`,`id`);
--> statement-breakpoint
CREATE INDEX `public_usage_events_type_at_idx` ON `public_usage_events` (`event_type`,`at`);
--> statement-breakpoint
CREATE INDEX `public_usage_events_source_at_idx` ON `public_usage_events` (`source_hash`,`at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `public_usage_events_bucket_uidx` ON `public_usage_events` (`bucket_minute`,`event_type`,`dimension`,`mushroom_id`,`source_hash`);
