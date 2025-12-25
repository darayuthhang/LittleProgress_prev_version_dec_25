CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_points` integer DEFAULT 0,
	`unlocked_turtles` text DEFAULT 'default_turtle',
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
