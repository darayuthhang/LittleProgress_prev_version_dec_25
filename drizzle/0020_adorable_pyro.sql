CREATE TABLE `streak_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`streak_count` integer NOT NULL,
	`completed` integer DEFAULT true,
	`created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal` text NOT NULL,
	`description` text,
	`start_date` integer,
	`target_days` integer,
	`icon_category` text,
	`completed` integer DEFAULT false,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
INSERT INTO `__new_goals`("id", "goal", "description", "start_date", "target_days", "icon_category", "completed", "created_at", "updated_at") SELECT "id", "goal", "description", "start_date", "target_days", "icon_category", "completed", "created_at", "updated_at" FROM `goals`;--> statement-breakpoint
DROP TABLE `goals`;--> statement-breakpoint
ALTER TABLE `__new_goals` RENAME TO `goals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_short_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal` text NOT NULL,
	`description` text,
	`icon_category` text,
	`date` text NOT NULL,
	`completed` integer DEFAULT false,
	`is_reminder` integer DEFAULT false,
	`notification_id` text,
	`reminder_datetime` text,
	`is_priority` integer DEFAULT false,
	`end_date` text,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp),
	`timer_duration_seconds` integer DEFAULT 0,
	`timer_sound_enabled` integer DEFAULT 0
);
--> statement-breakpoint
INSERT INTO `__new_short_goals`("id", "goal", "description", "icon_category", "date", "completed", "is_reminder", "notification_id", "reminder_datetime", "is_priority", "end_date", "created_at", "updated_at", "timer_duration_seconds", "timer_sound_enabled") SELECT "id", "goal", "description", "icon_category", "date", "completed", "is_reminder", "notification_id", "reminder_datetime", "is_priority", "end_date", "created_at", "updated_at", "timer_duration_seconds", "timer_sound_enabled" FROM `short_goals`;--> statement-breakpoint
DROP TABLE `short_goals`;--> statement-breakpoint
ALTER TABLE `__new_short_goals` RENAME TO `short_goals`;--> statement-breakpoint
CREATE TABLE `__new_user_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_points` integer DEFAULT 0,
	`unlocked_turtles` text,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_user_stats`("id", "total_points", "unlocked_turtles", "created_at", "updated_at") SELECT "id", "total_points", "unlocked_turtles", "created_at", "updated_at" FROM `user_stats`;--> statement-breakpoint
DROP TABLE `user_stats`;--> statement-breakpoint
ALTER TABLE `__new_user_stats` RENAME TO `user_stats`;