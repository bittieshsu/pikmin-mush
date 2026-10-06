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
--> statement-breakpoint
CREATE TRIGGER `upload_receipt_no_overlap`
BEFORE INSERT ON `agent_upload_receipts` BEGIN
  SELECT RAISE(ABORT,'upload receipt overlap')
  WHERE NEW.start_offset < COALESCE((
    SELECT end_offset FROM agent_upload_receipts
    WHERE agent_id=NEW.agent_id AND stream_id=NEW.stream_id
    ORDER BY start_offset DESC LIMIT 1
  ),0);
END;
