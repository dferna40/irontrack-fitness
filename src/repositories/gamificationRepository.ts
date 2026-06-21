import { getDatabase } from "../database/client";
import {
  AchievementDefinition,
  AchievementWithStatus,
  GamificationProfile,
  LevelDefinition,
  ProfileAchievement,
  XpEvent,
  XpSourceType,
} from "../types/models";

interface GamificationProfileRow {
  id: number;
  profile_id: number;
  total_xp: number;
  current_level: number;
  current_level_xp: number;
  next_level_xp: number | null;
  created_at: string;
  updated_at: string;
}

interface XpEventRow {
  id: number;
  profile_id: number;
  workout_id: number | null;
  source_type: XpSourceType;
  source_id: number | null;
  xp_amount: number;
  reason: string;
  metadata: string | null;
  created_at: string;
}

interface LevelDefinitionRow {
  id: number;
  level: number;
  xp_required: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AchievementDefinitionRow {
  id: number;
  code: string;
  name: string;
  description: string;
  category: AchievementDefinition["category"];
  icon: string | null;
  xp_reward: number;
  is_active: number;
  criteria_type: AchievementDefinition["criteriaType"];
  criteria_value: number;
  created_at: string;
  updated_at: string;
}

interface ProfileAchievementRow {
  id: number;
  profile_id: number;
  achievement_id: number;
  progress_value: number;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AchievementWithStatusRow extends AchievementDefinitionRow {
  progress_value: number | null;
  unlocked_at: string | null;
}

const defaultLevels = [
  { level: 1, xpRequired: 0, title: "Novato" },
  { level: 2, xpRequired: 100, title: "Constante" },
  { level: 3, xpRequired: 250, title: "En progreso" },
  { level: 4, xpRequired: 450, title: "Disciplinado" },
  { level: 5, xpRequired: 700, title: "Imparable" },
];

const defaultAchievements = [
  {
    code: "first_workout",
    name: "Primer entrenamiento",
    description: "Completa tu primer entrenamiento registrado.",
    category: "workout_count" as const,
    icon: "trophy-outline",
    xpReward: 10,
    criteriaType: "total_workouts" as const,
    criteriaValue: 1,
  },
  {
    code: "three_workouts",
    name: "Tres entrenamientos",
    description: "Completa tres entrenamientos registrados.",
    category: "workout_count" as const,
    icon: "medal-outline",
    xpReward: 20,
    criteriaType: "total_workouts" as const,
    criteriaValue: 3,
  },
  {
    code: "ten_workouts",
    name: "Diez entrenamientos",
    description: "Completa diez entrenamientos registrados.",
    category: "workout_count" as const,
    icon: "star-circle-outline",
    xpReward: 50,
    criteriaType: "total_workouts" as const,
    criteriaValue: 10,
  },
  {
    code: "first_strength_workout",
    name: "Primera sesion de fuerza",
    description: "Completa tu primer entrenamiento de fuerza.",
    category: "workout_type" as const,
    icon: "dumbbell",
    xpReward: 15,
    criteriaType: "total_strength_workouts" as const,
    criteriaValue: 1,
  },
  {
    code: "first_cardio_workout",
    name: "Primera sesion de cardio",
    description: "Registra tu primera sesion de cardio.",
    category: "workout_type" as const,
    icon: "heart-pulse",
    xpReward: 15,
    criteriaType: "total_cardio_workouts" as const,
    criteriaValue: 1,
  },
];

function mapGamificationProfile(row: GamificationProfileRow): GamificationProfile {
  return {
    id: row.id,
    profileId: row.profile_id,
    totalXp: row.total_xp,
    currentLevel: row.current_level,
    currentLevelXp: row.current_level_xp,
    nextLevelXp: row.next_level_xp,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapXpEvent(row: XpEventRow): XpEvent {
  return {
    id: row.id,
    profileId: row.profile_id,
    workoutId: row.workout_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    xpAmount: row.xp_amount,
    reason: row.reason,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

function mapLevelDefinition(row: LevelDefinitionRow): LevelDefinition {
  return {
    id: row.id,
    level: row.level,
    xpRequired: row.xp_required,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAchievementDefinition(row: AchievementDefinitionRow): AchievementDefinition {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    icon: row.icon,
    xpReward: row.xp_reward,
    isActive: Boolean(row.is_active),
    criteriaType: row.criteria_type,
    criteriaValue: row.criteria_value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfileAchievement(row: ProfileAchievementRow): ProfileAchievement {
  return {
    id: row.id,
    profileId: row.profile_id,
    achievementId: row.achievement_id,
    progressValue: row.progress_value,
    unlockedAt: row.unlocked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureDefaultGamificationCatalog() {
  const db = await getDatabase();

  for (const level of defaultLevels) {
    await db.runAsync(
      `
        INSERT OR IGNORE INTO level_definitions (level, xp_required, title)
        VALUES (?, ?, ?);
      `,
      [level.level, level.xpRequired, level.title],
    );
  }

  for (const achievement of defaultAchievements) {
    await db.runAsync(
      `
        INSERT OR IGNORE INTO achievement_definitions (
          code, name, description, category, icon, xp_reward, is_active, criteria_type, criteria_value
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);
      `,
      [
        achievement.code,
        achievement.name,
        achievement.description,
        achievement.category,
        achievement.icon,
        achievement.xpReward,
        achievement.criteriaType,
        achievement.criteriaValue,
      ],
    );
  }
}

export async function ensureGamificationProfile(profileId: number) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT OR IGNORE INTO gamification_profiles (profile_id)
      VALUES (?);
    `,
    [profileId],
  );

  const row = await db.getFirstAsync<GamificationProfileRow>(
    "SELECT * FROM gamification_profiles WHERE profile_id = ? LIMIT 1;",
    [profileId],
  );

  if (!row) {
    throw new Error("No se pudo preparar el perfil de gamificacion.");
  }

  return mapGamificationProfile(row);
}

export async function updateGamificationProfile(
  profileId: number,
  input: {
    totalXp: number;
    currentLevel: number;
    currentLevelXp: number;
    nextLevelXp: number | null;
  },
) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE gamification_profiles
      SET
        total_xp = ?,
        current_level = ?,
        current_level_xp = ?,
        next_level_xp = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE profile_id = ?;
    `,
    [
      input.totalXp,
      input.currentLevel,
      input.currentLevelXp,
      input.nextLevelXp,
      profileId,
    ],
  );

  return ensureGamificationProfile(profileId);
}

export async function listLevelDefinitions() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LevelDefinitionRow>(
    "SELECT * FROM level_definitions ORDER BY xp_required ASC, level ASC;",
  );
  return rows.map(mapLevelDefinition);
}

export async function listActiveAchievementDefinitions() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AchievementDefinitionRow>(
    "SELECT * FROM achievement_definitions WHERE is_active = 1 ORDER BY id ASC;",
  );
  return rows.map(mapAchievementDefinition);
}

export async function getXpEventBySource(
  profileId: number,
  sourceType: XpSourceType,
  sourceId: number,
) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<XpEventRow>(
    `
      SELECT *
      FROM xp_events
      WHERE profile_id = ? AND source_type = ? AND source_id = ?
      LIMIT 1;
    `,
    [profileId, sourceType, sourceId],
  );
  return row ? mapXpEvent(row) : null;
}

export async function createXpEvent(input: {
  profileId: number;
  workoutId?: number | null;
  sourceType: XpSourceType;
  sourceId?: number | null;
  xpAmount: number;
  reason: string;
  metadata?: string | null;
}) {
  const db = await getDatabase();
  const existing =
    input.sourceId !== null && input.sourceId !== undefined
      ? await getXpEventBySource(input.profileId, input.sourceType, input.sourceId)
      : null;

  if (existing) {
    return existing;
  }

  const result = await db.runAsync(
    `
      INSERT INTO xp_events (
        profile_id, workout_id, source_type, source_id, xp_amount, reason, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.workoutId ?? null,
      input.sourceType,
      input.sourceId ?? null,
      input.xpAmount,
      input.reason,
      input.metadata ?? null,
    ],
  );

  const row = await db.getFirstAsync<XpEventRow>("SELECT * FROM xp_events WHERE id = ?;", [
    result.lastInsertRowId,
  ]);
  if (!row) {
    throw new Error("No se pudo guardar el evento de XP.");
  }
  return mapXpEvent(row);
}

export async function listRecentXpEvents(profileId: number, limit = 10) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<XpEventRow>(
    `
      SELECT *
      FROM xp_events
      WHERE profile_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?;
    `,
    [profileId, limit],
  );
  return rows.map(mapXpEvent);
}

export async function getGamificationStats(profileId: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    total_workouts: number;
    total_strength_workouts: number;
    total_cardio_workouts: number;
  }>(
    `
      SELECT
        (SELECT COUNT(*) FROM workouts WHERE profile_id = ?) AS total_workouts,
        (SELECT COUNT(*) FROM workouts WHERE profile_id = ?) AS total_strength_workouts,
        (
          (SELECT COUNT(*) FROM cardio_sessions WHERE profile_id = ?)
          + (SELECT COUNT(*) FROM boxing_rounds WHERE profile_id = ?)
        ) AS total_cardio_workouts;
    `,
    [profileId, profileId, profileId, profileId],
  );

  return {
    totalWorkouts: row?.total_workouts ?? 0,
    totalStrengthWorkouts: row?.total_strength_workouts ?? 0,
    totalCardioWorkouts: row?.total_cardio_workouts ?? 0,
  };
}

export async function getProfileAchievement(profileId: number, achievementId: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProfileAchievementRow>(
    `
      SELECT *
      FROM profile_achievements
      WHERE profile_id = ? AND achievement_id = ?
      LIMIT 1;
    `,
    [profileId, achievementId],
  );
  return row ? mapProfileAchievement(row) : null;
}

export async function upsertProfileAchievementProgress(
  profileId: number,
  achievementId: number,
  progressValue: number,
) {
  const db = await getDatabase();
  const existing = await getProfileAchievement(profileId, achievementId);

  if (existing) {
    await db.runAsync(
      `
        UPDATE profile_achievements
        SET progress_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
      `,
      [Math.max(existing.progressValue, progressValue), existing.id],
    );

    return getProfileAchievement(profileId, achievementId);
  }

  const result = await db.runAsync(
    `
      INSERT INTO profile_achievements (profile_id, achievement_id, progress_value)
      VALUES (?, ?, ?);
    `,
    [profileId, achievementId, progressValue],
  );

  const row = await db.getFirstAsync<ProfileAchievementRow>(
    "SELECT * FROM profile_achievements WHERE id = ?;",
    [result.lastInsertRowId],
  );
  return row ? mapProfileAchievement(row) : null;
}

export async function unlockProfileAchievement(
  profileId: number,
  achievementId: number,
  progressValue: number,
) {
  const db = await getDatabase();
  const existing = await getProfileAchievement(profileId, achievementId);

  if (existing?.unlockedAt) {
    return existing;
  }

  if (existing) {
    await db.runAsync(
      `
        UPDATE profile_achievements
        SET progress_value = ?, unlocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
      `,
      [Math.max(existing.progressValue, progressValue), existing.id],
    );
  } else {
    await db.runAsync(
      `
        INSERT INTO profile_achievements (
          profile_id, achievement_id, progress_value, unlocked_at
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP);
      `,
      [profileId, achievementId, progressValue],
    );
  }

  const updated = await getProfileAchievement(profileId, achievementId);
  if (!updated) {
    throw new Error("No se pudo desbloquear el logro.");
  }
  return updated;
}

export async function listAchievementsWithStatus(profileId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AchievementWithStatusRow>(
    `
      SELECT
        ad.*,
        pa.progress_value,
        pa.unlocked_at
      FROM achievement_definitions ad
      LEFT JOIN profile_achievements pa
        ON pa.achievement_id = ad.id
       AND pa.profile_id = ?
      WHERE ad.is_active = 1
      ORDER BY ad.id ASC;
    `,
    [profileId],
  );

  return rows.map((row): AchievementWithStatus => ({
    ...mapAchievementDefinition(row),
    progressValue: row.progress_value ?? 0,
    unlockedAt: row.unlocked_at,
    isUnlocked: Boolean(row.unlocked_at),
  }));
}
