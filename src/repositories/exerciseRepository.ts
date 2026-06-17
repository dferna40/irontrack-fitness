import { getDatabase } from "../database/client";
import {
  CreateExerciseInput,
  Exercise,
  ExerciseFilters,
  ExerciseType,
  UpdateExerciseInput,
} from "../types/models";

interface ExerciseRow {
  id: number;
  profile_id: number;
  name: string;
  muscle_group: string;
  type: ExerciseType;
  description: string | null;
  technical_notes: string | null;
  execution_tips: string | null;
  default_rest_seconds: number | null;
  is_favorite: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    muscleGroup: row.muscle_group,
    type: row.type,
    description: row.description,
    technicalNotes: row.technical_notes,
    executionTips: row.execution_tips,
    defaultRestSeconds: row.default_rest_seconds,
    isFavorite: Boolean(row.is_favorite),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listExercises(profileId: number, filters: ExerciseFilters = {}) {
  const db = await getDatabase();
  const conditions = ["e.profile_id = ?"];
  const params: Array<string | number> = [profileId];

  if (filters.onlyActive !== false) {
    conditions.push("e.is_active = 1");
  }

  if (filters.search?.trim()) {
    conditions.push("e.name LIKE ?");
    params.push(`%${filters.search.trim()}%`);
  }

  if (filters.muscleGroup) {
    conditions.push("e.muscle_group = ?");
    params.push(filters.muscleGroup);
  }

  if (filters.type) {
    conditions.push("e.type = ?");
    params.push(filters.type);
  }

  if (filters.equipmentId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM exercise_equipment ee WHERE ee.exercise_id = e.id AND ee.equipment_id = ?)",
    );
    params.push(filters.equipmentId);
  }

  const rows = await db.getAllAsync<ExerciseRow>(
    `
      SELECT e.*
      FROM exercises e
      WHERE ${conditions.join(" AND ")}
      ORDER BY e.is_favorite DESC, e.name COLLATE NOCASE ASC;
    `,
    params,
  );

  return rows.map(mapRow);
}

export async function getExerciseById(id: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExerciseRow>(
    "SELECT * FROM exercises WHERE id = ? LIMIT 1;",
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function createExercise(input: CreateExerciseInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO exercises (
        profile_id,
        name,
        muscle_group,
        type,
        description,
        technical_notes,
        execution_tips,
        default_rest_seconds,
        is_favorite,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.name.trim(),
      input.muscleGroup.trim(),
      input.type,
      input.description?.trim() ?? "",
      input.technicalNotes?.trim() ?? "",
      input.executionTips?.trim() ?? "",
      input.defaultRestSeconds ?? null,
      input.isFavorite ? 1 : 0,
      input.isActive === false ? 0 : 1,
    ],
  );

  const row = await db.getFirstAsync<ExerciseRow>(
    "SELECT * FROM exercises WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el ejercicio creado.");
  }

  return mapRow(row);
}

export async function updateExercise(input: UpdateExerciseInput) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE exercises
      SET
        profile_id = ?,
        name = ?,
        muscle_group = ?,
        type = ?,
        description = ?,
        technical_notes = ?,
        execution_tips = ?,
        default_rest_seconds = ?,
        is_favorite = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [
      input.profileId,
      input.name.trim(),
      input.muscleGroup.trim(),
      input.type,
      input.description?.trim() ?? "",
      input.technicalNotes?.trim() ?? "",
      input.executionTips?.trim() ?? "",
      input.defaultRestSeconds ?? null,
      input.isFavorite ? 1 : 0,
      input.isActive ? 1 : 0,
      input.id,
    ],
  );

  const row = await db.getFirstAsync<ExerciseRow>(
    "SELECT * FROM exercises WHERE id = ? LIMIT 1;",
    [input.id],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el ejercicio actualizado.");
  }

  return mapRow(row);
}

export async function deactivateExercise(id: number) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE exercises
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [id],
  );
}

export async function toggleFavoriteExercise(id: number, isFavorite: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE exercises
      SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [isFavorite ? 1 : 0, id],
  );
}
