import { getDatabase } from "../database/client";
import {
  CreateRoutineInput,
  Routine,
  RoutineFilters,
  UpdateRoutineInput,
} from "../types/models";

interface RoutineRow {
  id: number;
  profile_id: number;
  name: string;
  description: string | null;
  goal: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: RoutineRow): Routine {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listRoutines(profileId: number, filters: RoutineFilters = {}) {
  const db = await getDatabase();
  const conditions = ["profile_id = ?"];
  const params: Array<number> = [profileId];

  if (filters.onlyActive !== false) {
    conditions.push("is_active = 1");
  }

  const rows = await db.getAllAsync<RoutineRow>(
    `
      SELECT *
      FROM routines
      WHERE ${conditions.join(" AND ")}
      ORDER BY name COLLATE NOCASE ASC;
    `,
    params,
  );

  return rows.map(mapRow);
}

export async function getRoutineById(id: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RoutineRow>(
    "SELECT * FROM routines WHERE id = ? LIMIT 1;",
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function createRoutine(input: CreateRoutineInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO routines (
        profile_id,
        name,
        description,
        goal,
        is_active
      ) VALUES (?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.name.trim(),
      input.description?.trim() ?? "",
      input.goal?.trim() ?? "",
      input.isActive === false ? 0 : 1,
    ],
  );

  const row = await db.getFirstAsync<RoutineRow>(
    "SELECT * FROM routines WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la rutina creada.");
  }

  return mapRow(row);
}

export async function updateRoutine(input: UpdateRoutineInput) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE routines
      SET
        profile_id = ?,
        name = ?,
        description = ?,
        goal = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [
      input.profileId,
      input.name.trim(),
      input.description?.trim() ?? "",
      input.goal?.trim() ?? "",
      input.isActive === false ? 0 : 1,
      input.id,
    ],
  );

  const row = await db.getFirstAsync<RoutineRow>(
    "SELECT * FROM routines WHERE id = ? LIMIT 1;",
    [input.id],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la rutina actualizada.");
  }

  return mapRow(row);
}

export async function duplicateRoutine(id: number): Promise<Routine> {
  const db = await getDatabase();
  let duplicatedRoutine: Routine | null = null;

  await db.withExclusiveTransactionAsync(async (tx) => {
    const routine = await tx.getFirstAsync<RoutineRow>(
      "SELECT * FROM routines WHERE id = ? LIMIT 1;",
      [id],
    );

    if (!routine) {
      throw new Error("No se encontró la rutina a duplicar.");
    }

    const duplicateName = `${routine.name} copia`;
    const insertResult = await tx.runAsync(
      `
        INSERT INTO routines (
          profile_id, name, description, goal, is_active
        ) VALUES (?, ?, ?, ?, ?);
      `,
      [
        routine.profile_id,
        duplicateName,
        routine.description ?? "",
        routine.goal ?? "",
        routine.is_active,
      ],
    );

    const routineExercises = await tx.getAllAsync<{
      exercise_id: number;
      exercise_order: number;
      target_sets: number | null;
      target_reps_min: number | null;
      target_reps_max: number | null;
      target_weight: number | null;
      rest_seconds: number | null;
      notes: string | null;
    }>(
      `
        SELECT exercise_id, exercise_order, target_sets, target_reps_min,
               target_reps_max, target_weight, rest_seconds, notes
        FROM routine_exercises
        WHERE routine_id = ?
        ORDER BY exercise_order ASC, id ASC;
      `,
      [id],
    );

    for (const item of routineExercises) {
      await tx.runAsync(
        `
          INSERT INTO routine_exercises (
            routine_id, exercise_id, exercise_order, target_sets, target_reps_min,
            target_reps_max, target_weight, rest_seconds, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          insertResult.lastInsertRowId,
          item.exercise_id,
          item.exercise_order,
          item.target_sets,
          item.target_reps_min,
          item.target_reps_max,
          item.target_weight,
          item.rest_seconds,
          item.notes,
        ],
      );
    }

    const duplicated = await tx.getFirstAsync<RoutineRow>(
      "SELECT * FROM routines WHERE id = ? LIMIT 1;",
      [insertResult.lastInsertRowId],
    );

    if (!duplicated) {
      throw new Error("No se pudo recuperar la rutina duplicada.");
    }

    duplicatedRoutine = mapRow(duplicated);
  });

  if (!duplicatedRoutine) {
    throw new Error("No se pudo duplicar la rutina.");
  }

  return duplicatedRoutine as Routine;
}
