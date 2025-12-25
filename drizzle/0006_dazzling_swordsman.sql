ALTER TABLE `goals` ADD `start_date` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `target_days` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `date`;