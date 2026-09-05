CREATE TABLE `copy_audit_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `at` integer NOT NULL,
  `bucket_minute` integer NOT NULL,
  `event_type` text NOT NULL,
  `mushroom_id` text NOT NULL,
  `mushroom_lat` real NOT NULL,
  `mushroom_lng` real NOT NULL,
  `mushroom_level` integer NOT NULL,
  `mushroom_type` integer NOT NULL,
  `source_hash` text NOT NULL,
  `country` text DEFAULT '' NOT NULL,
  `asn` integer DEFAULT 0 NOT NULL,
  `device_class` text DEFAULT '' NOT NULL,
  `event_count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `copy_audit_events_at_idx` ON `copy_audit_events` (`at`,`id`);
--> statement-breakpoint
CREATE INDEX `copy_audit_events_mushroom_at_idx` ON `copy_audit_events` (`mushroom_id`,`at`);
--> statement-breakpoint
CREATE INDEX `copy_audit_events_source_at_idx` ON `copy_audit_events` (`source_hash`,`at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `copy_audit_events_bucket_uidx` ON `copy_audit_events` (`bucket_minute`,`event_type`,`mushroom_id`,`source_hash`);
