import { getDatabase } from "./client";

export async function initDatabase() {
  try {
    const db = await getDatabase();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        goal TEXT NOT NULL,
        level TEXT NOT NULL,
        weight_unit TEXT NOT NULL,
        distance_unit TEXT NOT NULL,
        preferred_theme TEXT NOT NULL DEFAULT 'dark',
        accent_color TEXT NOT NULL,
        pin_enabled INTEGER NOT NULL DEFAULT 0,
        pin_hash TEXT,
        biometric_enabled INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_profile_name
      ON equipment (profile_id, name);
    `);
  } catch (error) {
    console.error("initDatabase failed", error);
    throw new Error("No se pudo preparar la base de datos local.");
  }
}

