import { getDatabase } from "../database/client";
import {
  AppearanceSettings,
  UpdateAppearanceSettingsInput,
} from "../types/models";

interface AppearanceSettingsRow {
  id: number;
  theme_mode: AppearanceSettings["themeMode"];
  accent_color: string;
  card_style: AppearanceSettings["cardStyle"];
  text_size: AppearanceSettings["textSize"];
  timer_style: AppearanceSettings["timerStyle"];
  background_mode: AppearanceSettings["backgroundMode"];
  background_solid_color: string;
  background_gradient_start: string;
  background_gradient_end: string;
  background_image_path: string | null;
  background_image_opacity: number;
  background_dark_overlay: number;
  background_blur_radius: number;
  show_suggested_routine: number;
  show_last_workout: number;
  show_weekly_summary: number;
  show_quick_music: number;
  show_recent_progress: number;
  show_motivational_quote: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: AppearanceSettingsRow): AppearanceSettings {
  return {
    id: row.id,
    themeMode: row.theme_mode,
    accentColor: row.accent_color,
    cardStyle: row.card_style,
    textSize: row.text_size,
    timerStyle: row.timer_style,
    backgroundMode: row.background_mode,
    backgroundSolidColor: row.background_solid_color,
    backgroundGradientStart: row.background_gradient_start,
    backgroundGradientEnd: row.background_gradient_end,
    backgroundImagePath: row.background_image_path,
    backgroundImageOpacity: row.background_image_opacity,
    backgroundDarkOverlay: row.background_dark_overlay,
    backgroundBlurRadius: row.background_blur_radius,
    showSuggestedRoutine: Boolean(row.show_suggested_routine),
    showLastWorkout: Boolean(row.show_last_workout),
    showWeeklySummary: Boolean(row.show_weekly_summary),
    showQuickMusic: Boolean(row.show_quick_music),
    showRecentProgress: Boolean(row.show_recent_progress),
    showMotivationalQuote: Boolean(row.show_motivational_quote),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureAppearanceSettings() {
  const db = await getDatabase();
  await db.runAsync("INSERT OR IGNORE INTO appearance_settings (id) VALUES (1);");
}

export async function getAppearanceSettings() {
  const db = await getDatabase();
  await ensureAppearanceSettings();
  const row = await db.getFirstAsync<AppearanceSettingsRow>(
    "SELECT * FROM appearance_settings WHERE id = 1 LIMIT 1;",
  );

  if (!row) {
    throw new Error("No se pudo cargar la configuración de apariencia.");
  }

  return mapRow(row);
}

export async function updateAppearanceSettings(input: UpdateAppearanceSettingsInput) {
  const current = await getAppearanceSettings();
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE appearance_settings
      SET
        theme_mode = ?,
        accent_color = ?,
        card_style = ?,
        text_size = ?,
        timer_style = ?,
        background_mode = ?,
        background_solid_color = ?,
        background_gradient_start = ?,
        background_gradient_end = ?,
        background_image_path = ?,
        background_image_opacity = ?,
        background_dark_overlay = ?,
        background_blur_radius = ?,
        show_suggested_routine = ?,
        show_last_workout = ?,
        show_weekly_summary = ?,
        show_quick_music = ?,
        show_recent_progress = ?,
        show_motivational_quote = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1;
    `,
    [
      input.themeMode ?? current.themeMode,
      input.accentColor ?? current.accentColor,
      input.cardStyle ?? current.cardStyle,
      input.textSize ?? current.textSize,
      input.timerStyle ?? current.timerStyle,
      input.backgroundMode ?? current.backgroundMode,
      input.backgroundSolidColor ?? current.backgroundSolidColor,
      input.backgroundGradientStart ?? current.backgroundGradientStart,
      input.backgroundGradientEnd ?? current.backgroundGradientEnd,
      input.backgroundImagePath !== undefined
        ? input.backgroundImagePath
        : current.backgroundImagePath,
      input.backgroundImageOpacity ?? current.backgroundImageOpacity,
      input.backgroundDarkOverlay ?? current.backgroundDarkOverlay,
      input.backgroundBlurRadius ?? current.backgroundBlurRadius,
      (input.showSuggestedRoutine ?? current.showSuggestedRoutine) ? 1 : 0,
      (input.showLastWorkout ?? current.showLastWorkout) ? 1 : 0,
      (input.showWeeklySummary ?? current.showWeeklySummary) ? 1 : 0,
      (input.showQuickMusic ?? current.showQuickMusic) ? 1 : 0,
      (input.showRecentProgress ?? current.showRecentProgress) ? 1 : 0,
      (input.showMotivationalQuote ?? current.showMotivationalQuote) ? 1 : 0,
    ],
  );

  return getAppearanceSettings();
}
