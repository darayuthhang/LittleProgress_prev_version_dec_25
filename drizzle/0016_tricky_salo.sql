PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_short_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal` text NOT NULL,
	`description` text DEFAULT '',
	`icon_category` text DEFAULT 'default',
	`date` text NOT NULL,
	`timer_duration_seconds` integer DEFAULT 0,
	`timer_sound_enabled` integer DEFAULT 0,
	`completed` integer DEFAULT 0,
	`is_reminder` integer DEFAULT 0,
	`notification_id` text DEFAULT '',
	`reminder_datetime` text DEFAULT '',
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_short_goals`("id", "goal", "description", "icon_category", "date", "timer_duration_seconds", "timer_sound_enabled", "completed", "is_reminder", "notification_id", "reminder_datetime", "created_at", "updated_at") SELECT "id", "goal", "description", "icon_category", "date", "timer_duration_seconds", "timer_sound_enabled", "completed", "is_reminder", "notification_id", "reminder_datetime", "created_at", "updated_at" FROM `short_goals`;--> statement-breakpoint
DROP TABLE `short_goals`;--> statement-breakpoint
ALTER TABLE `__new_short_goals` RENAME TO `short_goals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;