CREATE TABLE `agent_upload_receipts` (
	`agent_id` text NOT NULL,
	`stream_id` text NOT NULL,
	`start_offset` integer NOT NULL,
	`end_offset` integer NOT NULL,
	`body_hash` text NOT NULL,
	`accepted_rows` integer NOT NULL,
	`received_at` integer NOT NULL,
	PRIMARY KEY(`agent_id`, `stream_id`, `start_offset`, `end_offset`)
);
