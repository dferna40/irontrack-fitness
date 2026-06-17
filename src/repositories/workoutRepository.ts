import { getDatabase } from "../database/client";
import {
  CreateWorkoutInput,
  CreateWorkoutSetInput,
  ExerciseProgressDetail,
  ExerciseProgressHistoryItem,
  ExerciseProgressSummaryItem,
  WorkoutDetail,
  WorkoutDetailExercise,
  WorkoutDetailExerciseSet,
  WorkoutProgressSummary,
  Workout,
  WorkoutHistoryItem,
  WorkoutSet,
} from "../types/models";

interface WorkoutRow {
  id: number;
  profile_id: number;
  routine_id: number | null;
  workout_type: Workout["workoutType"];
  date: string;
  started_at: string;
  finished_at: string | null;
  duration_minutes: number | null;
  difficulty: Workout["difficulty"];
  discomfort_level: Workout["discomfortLevel"];
  notes: string | null;
}

interface WorkoutSetRow {
  id: number;
  workout_id: number;
  exercise_id: number;
  set_number: number;
  weight: number;
  reps: number;
  completed: number;
  rest_seconds_used: number | null;
  notes: string | null;
}

function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    profileId: row.profile_id,
    routineId: row.routine_id,
    workoutType: row.workout_type,
    date: row.date,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    discomfortLevel: row.discomfort_level,
    notes: row.notes,
  };
}

function mapWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    completed: Boolean(row.completed),
    restSecondsUsed: row.rest_seconds_used,
    notes: row.notes,
  };
}

interface WorkoutHistoryRow {
  id: number;
  date: string;
  routine_name: string | null;
  workout_type: Workout["workoutType"];
  duration_minutes: number | null;
  difficulty: Workout["difficulty"];
  discomfort_level: Workout["discomfortLevel"];
  exercise_count: number;
  set_count: number;
}

interface WorkoutDetailRow {
  workout_id: number;
  date: string;
  routine_name: string | null;
  workout_type: Workout["workoutType"];
  duration_minutes: number | null;
  difficulty: Workout["difficulty"];
  discomfort_level: Workout["discomfortLevel"];
  workout_notes: string | null;
  exercise_id: number;
  exercise_name: string;
  set_id: number;
  set_number: number;
  weight: number;
  reps: number;
  completed: number;
  rest_seconds_used: number | null;
  set_notes: string | null;
}

interface WorkoutProgressRow {
  workouts_this_week: number;
  workouts_this_month: number;
  last_workout_date: string | null;
  last_workout_name: string | null;
  total_sets: number;
  total_volume: number | null;
}

interface ExerciseProgressSummaryRow {
  exercise_id: number;
  exercise_name: string;
  last_weight_used: number | null;
  best_weight_used: number | null;
  last_trained_date: string | null;
}

interface ExerciseProgressDetailRow {
  exercise_id: number;
  exercise_name: string;
  workout_id: number;
  date: string;
  set_number: number;
  weight: number;
  reps: number;
}

export interface WorkoutCsvExportRow {
  date: string;
  workoutType: Workout["workoutType"];
  routineName: string | null;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: Workout["difficulty"];
  discomfortLevel: Workout["discomfortLevel"];
  notes: string | null;
}

interface WorkoutCsvExportRowDb {
  date: string;
  workout_type: Workout["workoutType"];
  routine_name: string | null;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  difficulty: Workout["difficulty"];
  discomfort_level: Workout["discomfortLevel"];
  workout_notes: string | null;
  set_notes: string | null;
}

function mapWorkoutHistory(row: WorkoutHistoryRow): WorkoutHistoryItem {
  return {
    id: row.id,
    date: row.date,
    routineName: row.routine_name,
    workoutType: row.workout_type,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    discomfortLevel: row.discomfort_level,
    exerciseCount: row.exercise_count,
    setCount: row.set_count,
  };
}

function mapExerciseProgressSummary(
  row: ExerciseProgressSummaryRow,
): ExerciseProgressSummaryItem {
  return {
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    lastWeightUsed: row.last_weight_used,
    bestWeightUsed: row.best_weight_used,
    lastTrainedDate: row.last_trained_date,
  };
}

export async function createWorkout(input: CreateWorkoutInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO workouts (
        profile_id, routine_id, workout_type, date, started_at, finished_at,
        duration_minutes, difficulty, discomfort_level, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.routineId ?? null,
      input.workoutType,
      input.date,
      input.startedAt,
      input.finishedAt ?? null,
      input.durationMinutes ?? null,
      input.difficulty ?? null,
      input.discomfortLevel ?? null,
      input.notes ?? null,
    ],
  );

  const row = await db.getFirstAsync<WorkoutRow>("SELECT * FROM workouts WHERE id = ?;", [
    result.lastInsertRowId,
  ]);
  if (!row) {
    throw new Error("No se pudo recuperar el entrenamiento creado.");
  }
  return mapWorkout(row);
}

export async function createWorkoutSet(input: CreateWorkoutSetInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO workout_sets (
        workout_id, exercise_id, set_number, weight, reps, completed, rest_seconds_used, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.workoutId,
      input.exerciseId,
      input.setNumber,
      input.weight,
      input.reps,
      input.completed ? 1 : 0,
      input.restSecondsUsed ?? null,
      input.notes ?? null,
    ],
  );
  const row = await db.getFirstAsync<WorkoutSetRow>("SELECT * FROM workout_sets WHERE id = ?;", [
    result.lastInsertRowId,
  ]);
  if (!row) {
    throw new Error("No se pudo recuperar la serie guardada.");
  }
  return mapWorkoutSet(row);
}

export async function createWorkoutWithSets(
  workoutInput: CreateWorkoutInput,
  sets: CreateWorkoutSetInput[],
): Promise<Workout> {
  const db = await getDatabase();
  let workout: Workout | null = null;

  await db.withExclusiveTransactionAsync(async (tx) => {
    const workoutResult = await tx.runAsync(
      `
        INSERT INTO workouts (
          profile_id, routine_id, workout_type, date, started_at, finished_at,
          duration_minutes, difficulty, discomfort_level, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        workoutInput.profileId,
        workoutInput.routineId ?? null,
        workoutInput.workoutType,
        workoutInput.date,
        workoutInput.startedAt,
        workoutInput.finishedAt ?? null,
        workoutInput.durationMinutes ?? null,
        workoutInput.difficulty ?? null,
        workoutInput.discomfortLevel ?? null,
        workoutInput.notes ?? null,
      ],
    );

    for (const set of sets) {
      await tx.runAsync(
        `
          INSERT INTO workout_sets (
            workout_id, exercise_id, set_number, weight, reps, completed, rest_seconds_used, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          workoutResult.lastInsertRowId,
          set.exerciseId,
          set.setNumber,
          set.weight,
          set.reps,
          set.completed ? 1 : 0,
          set.restSecondsUsed ?? null,
          set.notes ?? null,
        ],
      );
    }

    const row = await tx.getFirstAsync<WorkoutRow>("SELECT * FROM workouts WHERE id = ?;", [
      workoutResult.lastInsertRowId,
    ]);
    if (!row) {
      throw new Error("No se pudo recuperar el entrenamiento guardado.");
    }
    workout = mapWorkout(row);
  });

  if (!workout) {
    throw new Error("No se pudo guardar el entrenamiento.");
  }

  return workout as Workout;
}

export async function listWorkoutHistory(profileId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutHistoryRow>(
    `
      SELECT
        w.id,
        w.date,
        r.name AS routine_name,
        w.workout_type,
        w.duration_minutes,
        w.difficulty,
        w.discomfort_level,
        COUNT(DISTINCT ws.exercise_id) AS exercise_count,
        COUNT(ws.id) AS set_count
      FROM workouts w
      LEFT JOIN routines r ON r.id = w.routine_id
      LEFT JOIN workout_sets ws ON ws.workout_id = w.id
      WHERE w.profile_id = ?
      GROUP BY
        w.id,
        w.date,
        r.name,
        w.workout_type,
        w.duration_minutes,
        w.difficulty,
        w.discomfort_level
      ORDER BY w.started_at DESC, w.id DESC;
    `,
    [profileId],
  );

  return rows.map(mapWorkoutHistory);
}

export async function getWorkoutDetail(workoutId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutDetailRow>(
    `
      SELECT
        w.id AS workout_id,
        w.date,
        r.name AS routine_name,
        w.workout_type,
        w.duration_minutes,
        w.difficulty,
        w.discomfort_level,
        w.notes AS workout_notes,
        e.id AS exercise_id,
        e.name AS exercise_name,
        ws.id AS set_id,
        ws.set_number,
        ws.weight,
        ws.reps,
        ws.completed,
        ws.rest_seconds_used,
        ws.notes AS set_notes
      FROM workouts w
      LEFT JOIN routines r ON r.id = w.routine_id
      INNER JOIN workout_sets ws ON ws.workout_id = w.id
      INNER JOIN exercises e ON e.id = ws.exercise_id
      WHERE w.id = ?
      ORDER BY e.name COLLATE NOCASE ASC, ws.set_number ASC, ws.id ASC;
    `,
    [workoutId],
  );

  if (!rows.length) {
    return null;
  }

  const exerciseMap = new Map<number, WorkoutDetailExercise>();

  for (const row of rows) {
    const set: WorkoutDetailExerciseSet = {
      id: row.set_id,
      setNumber: row.set_number,
      weight: row.weight,
      reps: row.reps,
      completed: Boolean(row.completed),
      restSecondsUsed: row.rest_seconds_used,
      notes: row.set_notes,
    };

    const existing = exerciseMap.get(row.exercise_id);
    if (existing) {
      existing.sets.push(set);
    } else {
      exerciseMap.set(row.exercise_id, {
        exerciseId: row.exercise_id,
        exerciseName: row.exercise_name,
        sets: [set],
      });
    }
  }

  const first = rows[0];
  const detail: WorkoutDetail = {
    id: first.workout_id,
    date: first.date,
    routineName: first.routine_name,
    workoutType: first.workout_type,
    durationMinutes: first.duration_minutes,
    difficulty: first.difficulty,
    discomfortLevel: first.discomfort_level,
    notes: first.workout_notes,
    exercises: Array.from(exerciseMap.values()),
  };

  return detail;
}

export async function getWorkoutProgressSummary(profileId: number) {
  const db = await getDatabase();
  const today = new Date();

  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const rows = await db.getAllAsync<WorkoutProgressRow>(
    `
      SELECT
        (
          SELECT COUNT(*)
          FROM workouts
          WHERE profile_id = ? AND date >= ?
        ) AS workouts_this_week,
        (
          SELECT COUNT(*)
          FROM workouts
          WHERE profile_id = ? AND date >= ?
        ) AS workouts_this_month,
        (
          SELECT date
          FROM workouts
          WHERE profile_id = ?
          ORDER BY started_at DESC, id DESC
          LIMIT 1
        ) AS last_workout_date,
        (
          SELECT COALESCE(r.name, w.workout_type)
          FROM workouts w
          LEFT JOIN routines r ON r.id = w.routine_id
          WHERE w.profile_id = ?
          ORDER BY w.started_at DESC, w.id DESC
          LIMIT 1
        ) AS last_workout_name,
        (
          SELECT COUNT(ws.id)
          FROM workout_sets ws
          INNER JOIN workouts w ON w.id = ws.workout_id
          WHERE w.profile_id = ?
        ) AS total_sets,
        (
          SELECT SUM(ws.weight * ws.reps)
          FROM workout_sets ws
          INNER JOIN workouts w ON w.id = ws.workout_id
          WHERE w.profile_id = ?
        ) AS total_volume
    `,
    [
      profileId,
      formatDateOnly(weekStart),
      profileId,
      formatDateOnly(monthStart),
      profileId,
      profileId,
      profileId,
      profileId,
    ],
  );

  const row = rows[0];

  return {
    workoutsThisWeek: row?.workouts_this_week ?? 0,
    workoutsThisMonth: row?.workouts_this_month ?? 0,
    lastWorkoutDate: row?.last_workout_date ?? null,
    lastWorkoutName: row?.last_workout_name ?? null,
    totalSets: row?.total_sets ?? 0,
    totalVolume: row?.total_volume ?? 0,
  } satisfies WorkoutProgressSummary;
}

export async function listExerciseProgressSummary(profileId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseProgressSummaryRow>(
    `
      SELECT
        e.id AS exercise_id,
        e.name AS exercise_name,
        (
          SELECT ws2.weight
          FROM workout_sets ws2
          INNER JOIN workouts w2 ON w2.id = ws2.workout_id
          WHERE w2.profile_id = ? AND ws2.exercise_id = e.id
          ORDER BY w2.started_at DESC, ws2.set_number DESC, ws2.id DESC
          LIMIT 1
        ) AS last_weight_used,
        (
          SELECT MAX(ws3.weight)
          FROM workout_sets ws3
          INNER JOIN workouts w3 ON w3.id = ws3.workout_id
          WHERE w3.profile_id = ? AND ws3.exercise_id = e.id
        ) AS best_weight_used,
        (
          SELECT w4.date
          FROM workout_sets ws4
          INNER JOIN workouts w4 ON w4.id = ws4.workout_id
          WHERE w4.profile_id = ? AND ws4.exercise_id = e.id
          ORDER BY w4.started_at DESC, ws4.set_number DESC, ws4.id DESC
          LIMIT 1
        ) AS last_trained_date
      FROM exercises e
      WHERE e.profile_id = ?
        AND EXISTS (
          SELECT 1
          FROM workout_sets ws
          INNER JOIN workouts w ON w.id = ws.workout_id
          WHERE w.profile_id = ? AND ws.exercise_id = e.id
        )
      ORDER BY last_trained_date DESC, e.name COLLATE NOCASE ASC;
    `,
    [profileId, profileId, profileId, profileId, profileId],
  );

  return rows.map(mapExerciseProgressSummary);
}

export async function getExerciseProgressDetail(profileId: number, exerciseId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseProgressDetailRow>(
    `
      SELECT
        e.id AS exercise_id,
        e.name AS exercise_name,
        w.id AS workout_id,
        w.date,
        ws.set_number,
        ws.weight,
        ws.reps
      FROM workout_sets ws
      INNER JOIN workouts w ON w.id = ws.workout_id
      INNER JOIN exercises e ON e.id = ws.exercise_id
      WHERE w.profile_id = ? AND e.id = ?
      ORDER BY w.started_at DESC, ws.set_number DESC, ws.id DESC;
    `,
    [profileId, exerciseId],
  );

  if (!rows.length) {
    return null;
  }

  const recentHistory: ExerciseProgressHistoryItem[] = rows.slice(0, 12).map((row) => ({
    workoutId: row.workout_id,
    date: row.date,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    volume: row.weight * row.reps,
  }));

  const bestSet = rows.reduce<ExerciseProgressHistoryItem | null>((best, row) => {
    const current = {
      workoutId: row.workout_id,
      date: row.date,
      setNumber: row.set_number,
      weight: row.weight,
      reps: row.reps,
      volume: row.weight * row.reps,
    };

    if (!best) {
      return current;
    }

    if (current.weight > best.weight) {
      return current;
    }

    if (current.weight === best.weight && current.reps > best.reps) {
      return current;
    }

    return best;
  }, null);

  const detail: ExerciseProgressDetail = {
    exerciseId: rows[0].exercise_id,
    exerciseName: rows[0].exercise_name,
    lastWeightUsed: rows[0].weight,
    bestWeightUsed: rows.reduce((max, row) => Math.max(max, row.weight), 0),
    bestSet,
    lastTrainedDate: rows[0].date,
    recentHistory,
  };

  return detail;
}

export async function listWorkoutsForCsvExport(profileId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutCsvExportRowDb>(
    `
      SELECT
        w.date,
        w.workout_type,
        r.name AS routine_name,
        e.name AS exercise_name,
        ws.set_number,
        ws.weight,
        ws.reps,
        w.difficulty,
        w.discomfort_level,
        w.notes AS workout_notes,
        ws.notes AS set_notes
      FROM workouts w
      INNER JOIN workout_sets ws ON ws.workout_id = w.id
      INNER JOIN exercises e ON e.id = ws.exercise_id
      LEFT JOIN routines r ON r.id = w.routine_id
      WHERE w.profile_id = ?
      ORDER BY w.started_at DESC, w.id DESC, e.name COLLATE NOCASE ASC, ws.set_number ASC;
    `,
    [profileId],
  );

  return rows.map((row) => ({
    date: row.date,
    workoutType: row.workout_type,
    routineName: row.routine_name,
    exerciseName: row.exercise_name,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    difficulty: row.difficulty,
    discomfortLevel: row.discomfort_level,
    notes: [row.workout_notes, row.set_notes].filter(Boolean).join(" | ") || null,
  })) satisfies WorkoutCsvExportRow[];
}
