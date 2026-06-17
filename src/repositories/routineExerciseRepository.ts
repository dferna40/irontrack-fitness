import { getDatabase } from "../database/client";
import {
  Exercise,
  RoutineExerciseWithExercise,
} from "../types/models";

interface RoutineExerciseRow {
  id: number;
  routine_id: number;
  exercise_id: number;
  exercise_order: number;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  target_weight: number | null;
  rest_seconds: number | null;
  notes: string | null;
  exercise_name: string;
  exercise_profile_id: number;
  exercise_muscle_group: string;
  exercise_type: Exercise["type"];
  exercise_description: string | null;
  exercise_technical_notes: string | null;
  exercise_execution_tips: string | null;
  exercise_default_rest_seconds: number | null;
  exercise_is_favorite: number;
  exercise_is_active: number;
  exercise_created_at: string;
  exercise_updated_at: string;
}

function mapRow(row: RoutineExerciseRow): RoutineExerciseWithExercise {
  return {
    id: row.id,
    routineId: row.routine_id,
    exerciseId: row.exercise_id,
    exerciseOrder: row.exercise_order,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    targetWeight: row.target_weight,
    restSeconds: row.rest_seconds,
    notes: row.notes,
    exercise: {
      id: row.exercise_id,
      profileId: row.exercise_profile_id,
      name: row.exercise_name,
      muscleGroup: row.exercise_muscle_group,
      type: row.exercise_type,
      description: row.exercise_description,
      technicalNotes: row.exercise_technical_notes,
      executionTips: row.exercise_execution_tips,
      defaultRestSeconds: row.exercise_default_rest_seconds,
      isFavorite: Boolean(row.exercise_is_favorite),
      isActive: Boolean(row.exercise_is_active),
      createdAt: row.exercise_created_at,
      updatedAt: row.exercise_updated_at,
    },
  };
}

export async function getExercisesForRoutine(routineId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RoutineExerciseRow>(
    `
      SELECT
        re.id,
        re.routine_id,
        re.exercise_id,
        re.exercise_order,
        re.target_sets,
        re.target_reps_min,
        re.target_reps_max,
        re.target_weight,
        re.rest_seconds,
        re.notes,
        e.name AS exercise_name,
        e.profile_id AS exercise_profile_id,
        e.muscle_group AS exercise_muscle_group,
        e.type AS exercise_type,
        e.description AS exercise_description,
        e.technical_notes AS exercise_technical_notes,
        e.execution_tips AS exercise_execution_tips,
        e.default_rest_seconds AS exercise_default_rest_seconds,
        e.is_favorite AS exercise_is_favorite,
        e.is_active AS exercise_is_active,
        e.created_at AS exercise_created_at,
        e.updated_at AS exercise_updated_at
      FROM routine_exercises re
      INNER JOIN exercises e ON e.id = re.exercise_id
      WHERE re.routine_id = ?
      ORDER BY re.exercise_order ASC, re.id ASC;
    `,
    [routineId],
  );

  return rows.map(mapRow);
}

interface UpsertRoutineExerciseInput {
  id?: number;
  routineId: number;
  exerciseId: number;
  exerciseOrder: number;
  targetSets?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  targetWeight?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
}

export async function replaceRoutineExercises(
  routineId: number,
  items: UpsertRoutineExerciseInput[],
) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM routine_exercises WHERE routine_id = ?;", [routineId]);

    for (const item of items) {
      await tx.runAsync(
        `
          INSERT INTO routine_exercises (
            routine_id, exercise_id, exercise_order, target_sets, target_reps_min,
            target_reps_max, target_weight, rest_seconds, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          routineId,
          item.exerciseId,
          item.exerciseOrder,
          item.targetSets ?? null,
          item.targetRepsMin ?? null,
          item.targetRepsMax ?? null,
          item.targetWeight ?? null,
          item.restSeconds ?? null,
          item.notes ?? null,
        ],
      );
    }
  });
}

export async function moveRoutineExercise(routineId: number, itemId: number, direction: "up" | "down") {
  const items = await getExercisesForRoutine(routineId);
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return;
  }

  const reordered = [...items];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);

  await replaceRoutineExercises(
    routineId,
    reordered.map((item, orderIndex) => ({
      routineId,
      exerciseId: item.exerciseId,
      exerciseOrder: orderIndex + 1,
      targetSets: item.targetSets,
      targetRepsMin: item.targetRepsMin,
      targetRepsMax: item.targetRepsMax,
      targetWeight: item.targetWeight,
      restSeconds: item.restSeconds,
      notes: item.notes,
    })),
  );
}
