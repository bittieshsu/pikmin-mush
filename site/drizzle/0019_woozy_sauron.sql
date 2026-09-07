CREATE TABLE `report_audit_events` (
	`key` text PRIMARY KEY NOT NULL,
	`batch` text NOT NULL,
	`phase` text NOT NULL,
	`kind` text NOT NULL,
	`at` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `report_audit_at_idx` ON `report_audit_events` (`at`);--> statement-breakpoint
CREATE INDEX `report_audit_batch_idx` ON `report_audit_events` (`batch`,`at`);