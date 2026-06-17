import * as SQLite from "expo-sqlite";

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync("irontrack-fitness.db");
  }

  return databaseInstance;
}

