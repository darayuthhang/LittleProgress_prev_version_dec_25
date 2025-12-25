import { and, desc, eq, sql } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { shortGoalTable } from "./schema";

// ✅ Insert Short Goal
export async function insertShortGoal(
  db: ExpoSQLiteDatabase,

  goal: string,
  description: string = "",
  icon_category: string,
  date: string, // e.g. "2025-10-23"
  completed: boolean = false,
  is_reminder: boolean = false,
  notification_id: string = "",
  reminder_datetime: string = "",
  is_priority: boolean = false,
  end_date: string = ""
) {
  
  const result = await db.insert(shortGoalTable).values({

    goal,
    description,
    icon_category,
    date,
    completed,
    is_reminder,
    notification_id,
    reminder_datetime,
    is_priority,
    end_date,
  });

  return result;
}

export async function updateShortGoalCompletion(
  db: ExpoSQLiteDatabase,
  id: number,
  completed: boolean
) {
  const result = await db
    .update(shortGoalTable)
    .set({
      completed: completed,
      updated_at: sql`(current_timestamp)` // optional but recommended
    })
    .where(eq(shortGoalTable.id, id))
    .run()
  // 2️⃣ Fetch only the 'completed' column
  const updated = await db
    .select({ completed: shortGoalTable.completed })
    .from(shortGoalTable)
    .where(eq(shortGoalTable.id, id))
    .get();

  return updated?.completed;
  // return result;
}

export async function updateShortGoalReminder(
  db: ExpoSQLiteDatabase,
  id: number,
  isReminder: boolean,
  notificationId: string,
  reminderDatetime: string
) {
  
  const result = await db
    .update(shortGoalTable)
    .set({
      is_reminder: isReminder,
      notification_id: notificationId,
      reminder_datetime: reminderDatetime,
      updated_at: sql`(current_timestamp)` // optional but recommended
    })
    .where(eq(shortGoalTable.id, id))
    .run();

  return result;
}

export async function updateShortGoalPriority(
  db: ExpoSQLiteDatabase,
  id: number,
  isPriority: boolean
) {
  const result = await db
    .update(shortGoalTable)
    .set({
      is_priority: isPriority,
      updated_at: sql`(current_timestamp)`
    })
    .where(eq(shortGoalTable.id, id))
    .run();

  return result;
}

//for each device it use the id of its own device 
// so its ok to full with date because it will appear only 
// from local device 
export async function getShortGoalsByGoalId(db: ExpoSQLiteDatabase, date: string) {
  
  try {
    const results = await db
      .select({
        id: shortGoalTable.id,
        goal: shortGoalTable.goal,
        description: shortGoalTable.description,
        icon_category: shortGoalTable.icon_category,
        date: shortGoalTable.date,
        completed: shortGoalTable.completed,
        is_reminder: shortGoalTable.is_reminder,
        notification_id: shortGoalTable.notification_id,
        reminder_datetime: shortGoalTable.reminder_datetime,
        is_priority: shortGoalTable.is_priority,
      })
      .from(shortGoalTable)
     .where(
        and(
          eq(shortGoalTable.date, date)
        )
      ).orderBy(desc(shortGoalTable.is_priority), desc(shortGoalTable.created_at)) // 🧠 Sort priority first, then newest
          .all();
      
    return results;
  } catch (error) {
    console.error("❌ Error fetching short goals by goal_id:", error);
    return [];
  }
}
export async function getShortGoalsByDate(db: ExpoSQLiteDatabase, date: string) {
  
  try {
    const results = await db
      .select({
   
        date: shortGoalTable.date,
       
      })
      .from(shortGoalTable)
     .where(
        and(
          eq(shortGoalTable.date, date)
        )
      ).orderBy(desc(shortGoalTable.created_at)) // 🧠 Sort newest first
          .all();;  
      
    return results;
  } catch (error) {
    console.error("❌ Error fetching short goals by goal_id:", error);
    return [];
  }
}

export async function updateShortGoalById(
  db: ExpoSQLiteDatabase,
  id: number,
  goal: string,
  description: string,
  icon_category: string,
  date: string,
  is_reminder: boolean = false,
  notification_id: string = "",
  reminder_datetime: string = "",
  is_priority: boolean = false
) {
  const result = await db
    .update(shortGoalTable)
    .set({
      goal,
      description,
      date,
      icon_category,
      is_reminder,
      notification_id,
      reminder_datetime,
      is_priority,
      updated_at: sql`(current_timestamp)` // optional but recommended

    })
    .where( eq(shortGoalTable.id, id));

  return result;
}

export async function getAnalyticsData(db: ExpoSQLiteDatabase) {
  try {
    const allGoals = await db
      .select({
        date: shortGoalTable.date,
        completed: shortGoalTable.completed,
        icon_category: shortGoalTable.icon_category,
      })
      .from(shortGoalTable)
      .all();

    return allGoals;
  } catch (error) {
    console.error("❌ Error fetching analytics data:", error);
    return [];
  }
}

export async function deleteShortGoal(db: ExpoSQLiteDatabase, id: number) {
  const result = await db
    .delete(shortGoalTable)
    .where(eq(shortGoalTable.id, id))
    .run();
  return result;
}