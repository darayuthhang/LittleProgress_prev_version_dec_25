import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "./schema";

export function useDb() {
  const db = useSQLiteContext(); // from expo-sqlite
  return drizzle(db, { schema });
}
