import { getDatabase } from "../database/client";
import { AppSettings, UpdateAppSettingsInput } from "../types/models";

interface AppSettingsRow {
  id: number;
  default_rest_seconds: number;
  auto_start_rest: number;
  progression_recommendations_enabled: number;
  sound_enabled: number;
  vibration_enabled: number;
  local_notification_enabled: number;
  keep_screen_awake: number;
  quick_add_15_enabled: number;
  quick_add_30_enabled: number;
  quick_add_60_enabled: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: AppSettingsRow): AppSettings {
  return {
    id: row.id,
    defaultRestSeconds: row.default_rest_seconds,
    autoStartRest: Boolean(row.auto_start_rest),
    progressionRecommendationsEnabled: Boolean(row.progression_recommendations_enabled),
    soundEnabled: Boolean(row.sound_enabled),
    vibrationEnabled: Boolean(row.vibration_enabled),
    localNotificationEnabled: Boolean(row.local_notification_enabled),
    keepScreenAwake: Boolean(row.keep_screen_awake),
    quickAdd15Enabled: Boolean(row.quick_add_15_enabled),
    quickAdd30Enabled: Boolean(row.quick_add_30_enabled),
    quickAdd60Enabled: Boolean(row.quick_add_60_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureAppSettings() {
  const db = await getDatabase();
  await db.runAsync("INSERT OR IGNORE INTO app_settings (id) VALUES (1);");
}

export async function getAppSettings() {
  const db = await getDatabase();
  await ensureAppSettings();
  const row = await db.getFirstAsync<AppSettingsRow>(
    "SELECT * FROM app_settings WHERE id = 1 LIMIT 1;",
  );

  if (!row) {
    throw new Error("No se pudo cargar la configuración.");
  }

  return mapRow(row);
}

export async function updateAppSettings(input: UpdateAppSettingsInput) {
  const current = await getAppSettings();
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE app_settings
      SET
        default_rest_seconds = ?,
        auto_start_rest = ?,
        progression_recommendations_enabled = ?,
        sound_enabled = ?,
        vibration_enabled = ?,
        local_notification_enabled = ?,
        keep_screen_awake = ?,
        quick_add_15_enabled = ?,
        quick_add_30_enabled = ?,
        quick_add_60_enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1;
    `,
    [
      input.defaultRestSeconds ?? current.defaultRestSeconds,
      (input.autoStartRest ?? current.autoStartRest) ? 1 : 0,
      (input.progressionRecommendationsEnabled ?? current.progressionRecommendationsEnabled)
        ? 1
        : 0,
      (input.soundEnabled ?? current.soundEnabled) ? 1 : 0,
      (input.vibrationEnabled ?? current.vibrationEnabled) ? 1 : 0,
      (input.localNotificationEnabled ?? current.localNotificationEnabled) ? 1 : 0,
      (input.keepScreenAwake ?? current.keepScreenAwake) ? 1 : 0,
      (input.quickAdd15Enabled ?? current.quickAdd15Enabled) ? 1 : 0,
      (input.quickAdd30Enabled ?? current.quickAdd30Enabled) ? 1 : 0,
      (input.quickAdd60Enabled ?? current.quickAdd60Enabled) ? 1 : 0,
    ],
  );

  return getAppSettings();
}
