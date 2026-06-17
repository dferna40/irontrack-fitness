import { getDatabase } from "../database/client";
import {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
} from "../types/models";

interface UserProfileRow {
  id: number;
  name: string;
  goal: string;
  level: UserProfile["level"];
  weight_unit: UserProfile["weightUnit"];
  distance_unit: UserProfile["distanceUnit"];
  preferred_theme: UserProfile["preferredTheme"];
  accent_color: string;
  pin_enabled: number;
  pin_hash: string | null;
  biometric_enabled: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    level: row.level,
    weightUnit: row.weight_unit,
    distanceUnit: row.distance_unit,
    preferredTheme: row.preferred_theme,
    accentColor: row.accent_color,
    pinEnabled: Boolean(row.pin_enabled),
    pinHash: row.pin_hash,
    biometricEnabled: Boolean(row.biometric_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveProfile() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserProfileRow>(
    "SELECT * FROM user_profiles ORDER BY created_at ASC LIMIT 1;",
  );

  return row ? mapRow(row) : null;
}

export async function createProfile(input: CreateUserProfileInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO user_profiles (
        name,
        goal,
        level,
        weight_unit,
        distance_unit,
        preferred_theme,
        accent_color,
        pin_enabled,
        pin_hash,
        biometric_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.name.trim(),
      input.goal.trim(),
      input.level,
      input.weightUnit,
      input.distanceUnit,
      input.preferredTheme,
      input.accentColor,
      input.pinEnabled ? 1 : 0,
      input.pinHash ?? null,
      input.biometricEnabled ? 1 : 0,
    ],
  );

  const row = await db.getFirstAsync<UserProfileRow>(
    "SELECT * FROM user_profiles WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el perfil creado.");
  }

  return mapRow(row);
}

export async function updateProfile(input: UpdateUserProfileInput) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE user_profiles
      SET
        name = ?,
        goal = ?,
        level = ?,
        weight_unit = ?,
        distance_unit = ?,
        preferred_theme = ?,
        accent_color = ?,
        pin_enabled = ?,
        pin_hash = ?,
        biometric_enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [
      input.name?.trim() ?? "",
      input.goal?.trim() ?? "",
      input.level ?? "beginner",
      input.weightUnit ?? "kg",
      input.distanceUnit ?? "km",
      input.preferredTheme ?? "dark",
      input.accentColor ?? "#ff6b2c",
      input.pinEnabled ? 1 : 0,
      input.pinHash ?? null,
      input.biometricEnabled ? 1 : 0,
      input.id,
    ],
  );

  const row = await db.getFirstAsync<UserProfileRow>(
    "SELECT * FROM user_profiles WHERE id = ? LIMIT 1;",
    [input.id],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el perfil actualizado.");
  }

  return mapRow(row);
}

