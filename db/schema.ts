import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Short Goals (Daily Habits)
export const shortGoalTable = sqliteTable("short_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  goal: text("goal").notNull(),
  description: text("description"),
  icon_category: text("icon_category"),
  date: text("date").notNull(), // YYYY-MM-DD
  completed: integer("completed", { mode: "boolean" }).default(false),
  is_reminder: integer("is_reminder", { mode: "boolean" }).default(false),
  notification_id: text("notification_id"),
  reminder_datetime: text("reminder_datetime"),
  is_priority: integer("is_priority", { mode: "boolean" }).default(false),
  end_date: text("end_date"),
  created_at: text("created_at").default(sql`(current_timestamp)`),
  updated_at: text("updated_at").default(sql`(current_timestamp)`),
  timer_duration_seconds: integer("timer_duration_seconds").default(0),
  timer_sound_enabled: integer("timer_sound_enabled").default(0),
});

// Long Goals
export const goalTable = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  goal: text("goal").notNull(),
  description: text("description"),
  start_date: integer("start_date"),
  target_days: integer("target_days"),
  icon_category: text("icon_category"),
  completed: integer("completed", { mode: "boolean" }).default(false),
  created_at: text("created_at").default(sql`(current_timestamp)`),
  updated_at: text("updated_at").default(sql`(current_timestamp)`),
});


// User Stats (Points & Unlocks)
export const userStatsTable = sqliteTable("user_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  total_points: integer("total_points").default(0),
  unlocked_turtles: text("unlocked_turtles"), // Stored as JSON string
  created_at: text("created_at").default(sql`(current_timestamp)`),
  updated_at: text("updated_at"),
});

// Streak History (For Analytics Graph)
export const streakHistoryTable = sqliteTable("streak_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  streak_count: integer("streak_count").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(true),
  created_at: text("created_at").default(sql`(current_timestamp)`),
});
