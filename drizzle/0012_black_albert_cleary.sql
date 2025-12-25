ALTER TABLE `short_goals` ADD `is_reminder` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `short_goals` ADD `notification_id` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `short_goals` ADD `reminder_datetime` text DEFAULT '';