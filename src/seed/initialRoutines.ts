import { getDatabase } from "../database/client";
import { normalizeTextKey, repairTextEncoding } from "../utils/text";

const legacyRoutineNames = ["Empuje", "Tirón", "Pierna", "Cardio y boxeo", "Full body"];

const initialRoutines = [
  {
    name: "Pectoral",
    description: "Sesión de pecho con foco en fuerza e hipertrofia y cierre con cardio corto.",
    goal: "Pecho + cardio corto en 60 min",
    exercises: [
      { name: "Press banca", order: 1, targetSets: 4, repsMin: 6, repsMax: 8, restSeconds: 90 },
      { name: "Press banca inclinado", order: 2, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Aperturas con mancuernas", order: 3, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Cinta de correr", order: 4, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final de 10-15 min a ritmo moderado." },
    ],
  },
  {
    name: "Dorsal",
    description: "Sesión de espalda con tres básicos y cardio final breve.",
    goal: "Espalda + cardio corto en 60 min",
    exercises: [
      { name: "Jalón al pecho", order: 1, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Remo bajo en polea", order: 2, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Remo con mancuerna", order: 3, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Bicicleta estática", order: 4, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final de 10-15 min a ritmo estable." },
    ],
  },
  {
    name: "Piernas",
    description: "Sesión base de cuádriceps, femoral, sentadilla y gemelos con cardio suave final.",
    goal: "Piernas + cardio corto en 60 min",
    exercises: [
      { name: "Extensión de cuádriceps", order: 1, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Curl femoral en polea baja", order: 2, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Sentadilla con mancuernas", order: 3, targetSets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
      { name: "Elevación de gemelos", order: 4, targetSets: 4, repsMin: 12, repsMax: 20, restSeconds: 45 },
      { name: "Bicicleta estática", order: 5, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final suave de 8-10 min." },
    ],
  },
  {
    name: "Hombros y brazos",
    description: "Sesión compacta para hombros, bíceps y tríceps pensada para entrar en una hora.",
    goal: "Hombros + bíceps + tríceps + cardio corto",
    exercises: [
      { name: "Press Arnold con mancuernas", order: 1, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Pájaro con mancuernas", order: 2, targetSets: 4, repsMin: 12, repsMax: 15, restSeconds: 45 },
      { name: "Curl barra Z", order: 3, targetSets: 4, repsMin: 8, repsMax: 12, restSeconds: 60 },
      { name: "Extensión de tríceps en polea alta", order: 4, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Curl concentrado con mancuernas", order: 5, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 45 },
      { name: "Extensión de tríceps con cuerda", order: 6, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 45 },
      { name: "Cinta de correr", order: 7, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final de 8-10 min." },
    ],
  },
  {
    name: "Viernes cardio y abdominales",
    description: "Sesión de descarga de fuerza con cardio principal y trabajo de core.",
    goal: "Cardio prioritario + abdominales",
    exercises: [
      { name: "Cinta de correr", order: 1, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "15-25 min según energía del día." },
      { name: "Bicicleta estática", order: 2, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "10-20 min a ritmo estable o por intervalos." },
      { name: "Crunch", order: 3, targetSets: 4, repsMin: 15, repsMax: 20, restSeconds: 30 },
      { name: "Plancha", order: 4, targetSets: 4, repsMin: null, repsMax: null, restSeconds: 30, notes: "Mantener entre 30 y 45 segundos." },
      { name: "Elevaciones de piernas", order: 5, targetSets: 4, repsMin: 10, repsMax: 15, restSeconds: 30 },
    ],
  },
  {
    name: "Cardio VR",
    description: "Sesión cardiovascular con Meta Quest 3 y FitXR o apps similares.",
    goal: "Cardio interactivo",
    exercises: [
      { name: "FitXR", order: 1, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "20-30 min de cardio VR." },
      { name: "Plancha", order: 2, targetSets: 3, repsMin: null, repsMax: null, restSeconds: 30, notes: "Extra de core opcional." },
    ],
  },
];

export async function seedInitialRoutines(profileId: number) {
  const db = await getDatabase();
  const [existingRoutines, existingExercises] = await Promise.all([
    db.getAllAsync<{ id: number; name: string }>("SELECT id, name FROM routines WHERE profile_id = ?;", [
      profileId,
    ]),
    db.getAllAsync<{ id: number; name: string }>("SELECT id, name FROM exercises WHERE profile_id = ?;", [
      profileId,
    ]),
  ]);

  const routineMap = new Map(existingRoutines.map((row) => [normalizeTextKey(row.name), row] as const));
  const exerciseMap = new Map(existingExercises.map((row) => [normalizeTextKey(row.name), row] as const));

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const legacyName of legacyRoutineNames) {
      const legacyRoutine = routineMap.get(normalizeTextKey(legacyName));

      if (legacyRoutine) {
        await tx.runAsync(
          `
            UPDATE routines
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
          `,
          [legacyRoutine.id],
        );
      }
    }

    for (const routine of initialRoutines) {
      const safeName = repairTextEncoding(routine.name) ?? routine.name;
      const safeDescription = repairTextEncoding(routine.description) ?? routine.description;
      const safeGoal = repairTextEncoding(routine.goal) ?? routine.goal;
      const existingRoutine = routineMap.get(normalizeTextKey(safeName));
      let routineId = existingRoutine?.id ?? null;

      if (existingRoutine) {
        await tx.runAsync(
          `
            UPDATE routines
            SET name = ?, description = ?, goal = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
          `,
          [safeName, safeDescription, safeGoal, existingRoutine.id],
        );
      } else {
        const result = await tx.runAsync(
          `
            INSERT OR IGNORE INTO routines (
              profile_id,
              name,
              description,
              goal,
              is_active
            ) VALUES (?, ?, ?, ?, 1);
          `,
          [profileId, safeName, safeDescription, safeGoal],
        );

        routineId = Number(result.lastInsertRowId);
        routineMap.set(normalizeTextKey(safeName), { id: routineId, name: safeName });
      }

      if (!routineId) {
        continue;
      }

      await tx.runAsync("DELETE FROM routine_exercises WHERE routine_id = ?;", [routineId]);

      for (const exercise of routine.exercises) {
        const safeExerciseName = repairTextEncoding(exercise.name) ?? exercise.name;
        const exerciseRow = exerciseMap.get(normalizeTextKey(safeExerciseName));

        if (!exerciseRow) {
          continue;
        }

        await tx.runAsync(
          `
            INSERT INTO routine_exercises (
              routine_id,
              exercise_id,
              exercise_order,
              target_sets,
              target_reps_min,
              target_reps_max,
              target_weight,
              rest_seconds,
              notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          [
            routineId,
            exerciseRow.id,
            exercise.order,
            exercise.targetSets ?? null,
            exercise.repsMin ?? null,
            exercise.repsMax ?? null,
            null,
            exercise.restSeconds ?? null,
            repairTextEncoding(exercise.notes ?? null) ?? null,
          ],
        );
      }
    }
  });
}
