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

      CREATE TABLE IF NOT EXISTS gamification_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL UNIQUE,
        total_xp INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 1,
        current_level_xp INTEGER NOT NULL DEFAULT 0,
        next_level_xp INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS xp_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        workout_id INTEGER,
        source_type TEXT NOT NULL,
        source_id INTEGER,
        xp_amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_xp_events_profile_created
      ON xp_events (profile_id, created_at DESC);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_events_source_unique
      ON xp_events (profile_id, source_type, source_id);

      CREATE TABLE IF NOT EXISTS level_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER NOT NULL UNIQUE,
        xp_required INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS achievement_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        xp_reward INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        criteria_type TEXT NOT NULL,
        criteria_value INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category_active
      ON achievement_definitions (category, is_active);

      CREATE TABLE IF NOT EXISTS profile_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        progress_value INTEGER NOT NULL DEFAULT 0,
        unlocked_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievement_definitions (id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_achievements_unique
      ON profile_achievements (profile_id, achievement_id);

      CREATE INDEX IF NOT EXISTS idx_profile_achievements_profile_unlocked
      ON profile_achievements (profile_id, unlocked_at DESC);

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
        remember_focus_mode INTEGER NOT NULL DEFAULT 0,
        large_session_thumbnails INTEGER NOT NULL DEFAULT 0,
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

      CREATE TABLE IF NOT EXISTS appearance_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_mode TEXT NOT NULL DEFAULT 'dark',
        accent_color TEXT NOT NULL DEFAULT '#ff6b2c',
        card_style TEXT NOT NULL DEFAULT 'normal',
        text_size TEXT NOT NULL DEFAULT 'normal',
        timer_style TEXT NOT NULL DEFAULT 'digital',
        background_mode TEXT NOT NULL DEFAULT 'default',
        background_solid_color TEXT NOT NULL DEFAULT '#0b0f14',
        background_gradient_start TEXT NOT NULL DEFAULT '#0b0f14',
        background_gradient_end TEXT NOT NULL DEFAULT '#1b2430',
        background_image_path TEXT,
        background_image_opacity REAL NOT NULL DEFAULT 0.35,
        background_dark_overlay REAL NOT NULL DEFAULT 0.45,
        background_blur_radius REAL NOT NULL DEFAULT 0,
        show_suggested_routine INTEGER NOT NULL DEFAULT 1,
        show_last_workout INTEGER NOT NULL DEFAULT 1,
        show_weekly_summary INTEGER NOT NULL DEFAULT 1,
        show_quick_music INTEGER NOT NULL DEFAULT 1,
        show_recent_progress INTEGER NOT NULL DEFAULT 1,
        show_motivational_quote INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS motivational_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      PRAGMA foreign_keys = ON;
    `);

    await ensureColumn(db, "app_settings", "weights_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "cardio_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "boxing_playlist_url", "TEXT");
    await ensureColumn(db, "app_settings", "stretching_playlist_url", "TEXT");
    await ensureColumn(
      db,
      "app_settings",
      "remember_focus_mode",
      "INTEGER NOT NULL DEFAULT 0",
    );
    await ensureColumn(
      db,
      "app_settings",
      "large_session_thumbnails",
      "INTEGER NOT NULL DEFAULT 0",
    );
    await ensureColumn(db, "appearance_settings", "background_mode", "TEXT NOT NULL DEFAULT 'default'");
    await ensureColumn(
      db,
      "appearance_settings",
      "background_solid_color",
      "TEXT NOT NULL DEFAULT '#0b0f14'",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "background_gradient_start",
      "TEXT NOT NULL DEFAULT '#0b0f14'",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "background_gradient_end",
      "TEXT NOT NULL DEFAULT '#1b2430'",
    );
    await ensureColumn(db, "appearance_settings", "background_image_path", "TEXT");
    await ensureColumn(
      db,
      "appearance_settings",
      "background_image_opacity",
      "REAL NOT NULL DEFAULT 0.35",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "background_dark_overlay",
      "REAL NOT NULL DEFAULT 0.45",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "background_blur_radius",
      "REAL NOT NULL DEFAULT 0",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_suggested_routine",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_last_workout",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_weekly_summary",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_quick_music",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_recent_progress",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await ensureColumn(
      db,
      "appearance_settings",
      "show_motivational_quote",
      "INTEGER NOT NULL DEFAULT 1",
    );
  } catch (error) {
    console.error("initDatabase failed", error);
    throw new Error("No se pudo preparar la base de datos local.");
  }
}
