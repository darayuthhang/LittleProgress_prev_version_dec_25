import { goalTable } from "./schema";
import { eq, sql, desc } from "drizzle-orm";

import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
//If you don’t care about customizing DB errors, you can safely omit it. try catch here
// only add if i have customer error
export async function insertGoal(
  db: ExpoSQLiteDatabase,
  goal: string,
  start_date: number,
  target_days: number,
  description: string = "",
  icon_category: string
) {
  const result = await db.insert(goalTable).values({
    goal,
    description,
    start_date,
    target_days,
    icon_category,
  });

  return result;
}
export async function updateGoalById(
  db: ExpoSQLiteDatabase,
  id: number,
  goal: string,
  description: string,
  target_days: number,
  icon_category: string
) {
  const result = await db
    .update(goalTable)
    .set({
      goal,
      description,
      target_days,
      icon_category,
      updated_at: sql`(current_timestamp)` // optional but recommended

    })
    .where(eq(goalTable.id, id));

  return result;
}

export async function getAllGoals(db: ExpoSQLiteDatabase) {
  const result = await db
    .select({
      id: goalTable.id,
      goal: goalTable.goal,
      description: goalTable.description,
      created_at: goalTable.created_at,
      start_date: goalTable.start_date,
      target_days: goalTable.target_days,
      completed: goalTable.completed,
      icon_category: goalTable.icon_category,
    })
    .from(goalTable)
    .orderBy(desc(goalTable.created_at)) // 🧠 Sort newest first
    .all();

  return result;
}


export async function updateGoalCompletion(
  db: ExpoSQLiteDatabase,
  id: number,
  completed: boolean
) {
  const result = await db
    .update(goalTable)
    .set({
      completed: completed ? 1 : 0,
      updated_at: sql`(current_timestamp)` // optional but recommended
    })
    .where(eq(goalTable.id, id))
    .run();

  return result;
}