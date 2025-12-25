import dayjs from "dayjs";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { streakHistoryTable } from "./schema";

export async function seedStreakData(db: ExpoSQLiteDatabase) {
  try {
    // 1. Clear existing history
    await db.delete(streakHistoryTable);

    // 2. Generate exactly 10 days of streak
    const history = [];
    const targetStreak = 10;

    for (let i = 0; i < targetStreak; i++) {
        // i=0 is today, i=1 is yesterday, etc.
        const dateStr = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        
        // Count counts down: Today is 10, Yesterday is 9...
        const count = targetStreak - i;
        
        history.push({
            date: dateStr,
            streak_count: count,
            completed: true
        });
    }

    await db.insert(streakHistoryTable).values(history);
    console.log("✅ Seeded 10-day streak data!");
    return { current: 10, best: 10 };
  } catch (e) {
    console.error("Error seeding data:", e);
    return null;
  }
}
