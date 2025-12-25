import { desc, eq } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { streakHistoryTable } from "./schema";

// Insert or update a streak record for a specific date
export const insertStreakRecord = async (
  db: ExpoSQLiteDatabase,
  date: string,
  streakCount: number
) => {
  try {
    // Check if a record for this date already exists
    const existing = await db
      .select()
      .from(streakHistoryTable)
      .where(eq(streakHistoryTable.date, date))
      .get();

    if (!existing) {
      await db.insert(streakHistoryTable).values({
        date,
        streak_count: streakCount,
        completed: true,
      });
    } else {
      // Update streak count if it changed for the same date (e.g. re-sync)
      await db
        .update(streakHistoryTable)
        .set({
          streak_count: streakCount,
          completed: true,
        })
        .where(eq(streakHistoryTable.date, date));
    }
  } catch (error) {
    console.error("Error inserting streak record:", error);
  }
};

// Get the full streak history ordered by date
export const getStreakHistory = async (db: ExpoSQLiteDatabase) => {
  try {
    const history = await db
      .select()
      .from(streakHistoryTable)
      .orderBy(desc(streakHistoryTable.date))
      .all();
    return history;
  } catch (error) {
    console.error("Error fetching streak history:", error);
    return [];
  }
};

// Get the best streak from history
export const getBestStreakFromDb = async (db: ExpoSQLiteDatabase) => {
  try {
    const history = await db
      .select()
      .from(streakHistoryTable)
      .orderBy(desc(streakHistoryTable.streak_count))
      .limit(1)
      .get();
    return history?.streak_count || 0;
  } catch (error) {
    console.error("Error fetching best streak:", error);
    return 0;
  }
};
// Get the most recent streak count
export const getCurrentStreakFromDb = async (db: ExpoSQLiteDatabase) => {
  try {
    const entry = await db
      .select()
      .from(streakHistoryTable)
      .orderBy(desc(streakHistoryTable.date))
      .limit(1)
      .get();
    return entry?.streak_count || 0;
  } catch (error) {
    console.error("Error fetching current streak:", error);
    return 0;
  }
};
