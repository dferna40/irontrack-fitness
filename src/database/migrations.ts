import { getDatabase } from "./client";

interface TableInfoRow {
  name: string;
}

async function ensureColumn(
  db: Awaited<ReturnType<typeof getDatabase>>,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = await db.getAllAsync<TableInfoRow>(`PRAGMA table_info(${tableName});`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

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

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        muscle_group TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        technical_notes TEXT,
        execution_tips TEXT,
        default_rest_seconds INTEGER,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_profile_name
      ON exercises (profile_id, name);

      CREATE TABLE IF NOT EXISTS exercise_equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        equipment_id INTEGER NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
        FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_equipment_unique
      ON exercise_equipment (exercise_id, equipment_id);

      CREATE TABLE IF NOT EXISTS exercise_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL UNIQUE,
        media_type TEXT NOT NULL,
        mime_type TEXT,
        original_file_name TEXT,
        local_path TEXT NOT NULL,
        original_width INTEGER,
        original_height INTEGER,
        processed_width INTEGER,
        processed_height INTEGER,
        file_size INTEGER,
        duration_seconds REAL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        goal TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_routines_profile_name
      ON routines (profile_id, name);

      CREATE TABLE IF NOT EXISTS routine_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        exercise_order INTEGER NOT NULL,
        target_sets INTEGER,
        target_reps_min INTEGER,
        target_reps_max INTEGER,
        target_weight REAL,
        rest_seconds INTEGER,
        notes TEXT,
        FOREIGN KEY (routine_id) REFERENCES routines (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );

      CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_order
      ON routine_exercises (routine_id, exercise_order);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_routine_exercises_unique_order
      ON routine_exercises (routine_id, exercise_order);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_routine_exercises_unique_pair
      ON routine_exercises (routine_id, exercise_id, exercise_order);

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        routine_id INTEGER,
        workout_type TEXT NOT NULL,
        date TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        duration_minutes INTEGER,
        difficulty TEXT,
        discomfort_level TEXT,
        notes TEXT,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id),
        FOREIGN KEY (routine_id) REFERENCES routines (id)
      );

      CREATE TABLE IF NOT EXISTS workout_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 1,
        rest_seconds_used INTEGER,
        notes TEXT,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );

      CREATE INDEX IF NOT EXISTS idx_workout_sets_workout
      ON workout_sets (workout_id, exercise_id, set_number);

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        default_rest_seconds INTEGER NOT NULL DEFAULT 60,
        auto_start_rest INTEGER NOT NULL DEFAULT 1,
        progression_recommendations_enabled INTEGER NOT NULL DEFAULT 1,
        sound_enabled INTEGER NOT NULL DEFAULT 1,
        vibration_enabled INTEGER NOT NULL DEFAULT 1,
        local_notification_enabled INTEGER NOT NULL DEFAULT 0,
        keep_screen_awake INTEGER NOT NULL DEFAULT 1,
        quick_add_15_enabled INTEGER NOT NULL DEFAULT 1,
        quick_add_30_enabled INTEGER NOT NULL DEFAULT 1,
        quick_add_60_enabled INTEGER NOT NULL DEFAULT 1,
        weights_playlist_url TEXT,
        cardio_playlist_url TEXT,
        boxing_playlist_url TEXT,
        stretching_playlist_url TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cardio_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        cardio_type TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        intensity TEXT NOT NULL,
        distance REAL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id)
      );

      CREATE TABLE IF NOT EXISTS boxing_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        total_rounds INTEGER NOT NULL,
        round_duration_seconds INTEGER NOT NULL,
        rest_seconds INTEGER NOT NULL,
        completed_rounds INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id)
      );
      
      PRAGMA foreign_keys = ON;
    `);

    await ensureColumn(db, "app_settings", "weights_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "cardio_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "boxing_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "stretching_playlist_url", "TEXT");
  } catch (error) {
    console.error("initDatabase failed", error);
    throw new Error("No se pudo preparar la base de datos local.");
  }
}
