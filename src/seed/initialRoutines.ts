import { getDatabase } from "../database/client";

const legacyRoutineNames = ["Empuje", "Tirón", "Pierna", "Cardio y boxeo", "Full body"];

const initialRoutines = [
  {
    name: "Pectoral",
    description: "Sesion de pecho con foco en fuerza e hipertrofia y cierre con cardio corto.",
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
    description: "Sesion de espalda con tres basicos y cardio final breve.",
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
    description: "Sesion base de cuadriceps, femoral, sentadilla y gemelos con cardio suave final.",
    goal: "Piernas + cardio corto en 60 min",
    exercises: [
      { name: "Extensión de cuádriceps", order: 1, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Curl femoral en polea baja", order: 2, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Sentadilla con mancuernas", order: 3, targetSets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
      { name: "Elevacion de gemelos", order: 4, targetSets: 4, repsMin: 12, repsMax: 20, restSeconds: 45 },
      { name: "Bicicleta estática", order: 5, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final suave de 8-10 min." },
    ],
  },
  {
    name: "Hombros y brazos",
    description: "Sesion compacta para hombros, biceps y triceps pensada para entrar en una hora.",
    goal: "Hombros + biceps + triceps + cardio corto",
    exercises: [
      { name: "Press Arnold con mancuernas", order: 1, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Pajaro con mancuernas", order: 2, targetSets: 4, repsMin: 12, repsMax: 15, restSeconds: 45 },
      { name: "Curl barra Z", order: 3, targetSets: 4, repsMin: 8, repsMax: 12, restSeconds: 60 },
      { name: "Extension de triceps en polea alta", order: 4, targetSets: 4, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: "Curl concentrado con mancuernas", order: 5, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 45 },
      { name: "Extension de triceps con cuerda", order: 6, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 45 },
      { name: "Cinta de correr", order: 7, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "Cardio final de 8-10 min." },
    ],
  },
  {
    name: "Viernes cardio y abdominales",
    description: "Sesion de descarga de fuerza con cardio principal y trabajo de core.",
    goal: "Cardio prioritario + abdominales",
    exercises: [
      { name: "Cinta de correr", order: 1, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "15-25 min segun energia del dia." },
      { name: "Bicicleta estática", order: 2, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "10-20 min a ritmo estable o por intervalos." },
      { name: "Crunch", order: 3, targetSets: 4, repsMin: 15, repsMax: 20, restSeconds: 30 },
      { name: "Plancha", order: 4, targetSets: 4, repsMin: null, repsMax: null, restSeconds: 30, notes: "Mantener entre 30 y 45 segundos." },
      { name: "Elevaciones de piernas", order: 5, targetSets: 4, repsMin: 10, repsMax: 15, restSeconds: 30 },
    ],
  },
  {
    name: "Cardio VR",
    description: "Sesion cardiovascular con Meta Quest 3 y FitXR o apps similares.",
    goal: "Cardio interactivo",
    exercises: [
      { name: "FitXR", order: 1, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "20-30 min de cardio VR." },
      { name: "Plancha", order: 2, targetSets: 3, repsMin: null, repsMax: null, restSeconds: 30, notes: "Extra de core opcional." },
    ],
  },
];

export async function seedInitialRoutines(profileId: number) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const legacyName of legacyRoutineNames) {
      await tx.runAsync(
        `
          UPDATE routines
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP
          WHERE profile_id = ? AND name = ?;
        `,
        [profileId, legacyName],
      );
    }

    for (const routine of initialRoutines) {
      await tx.runAsync(
        `
          INSERT OR IGNORE INTO routines (
            profile_id,
            name,
            description,
            goal,
            is_active
          ) VALUES (?, ?, ?, ?, 1);
        `,
        [profileId, routine.name, routine.description, routine.goal],
      );

      const routineRow = await tx.getFirstAsync<{ id: number }>(
        "SELECT id FROM routines WHERE profile_id = ? AND name = ? LIMIT 1;",
        [profileId, routine.name],
      );

      if (!routineRow) {
        continue;
      }

      await tx.runAsync(
        `
          UPDATE routines
          SET description = ?, goal = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?;
        `,
        [routine.description, routine.goal, routineRow.id],
      );

      await tx.runAsync("DELETE FROM routine_exercises WHERE routine_id = ?;", [routineRow.id]);

      for (const exercise of routine.exercises) {
        const exerciseRow = await tx.getFirstAsync<{ id: number }>(
          "SELECT id FROM exercises WHERE profile_id = ? AND name = ? LIMIT 1;",
          [profileId, exercise.name],
        );

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
            routineRow.id,
            exerciseRow.id,
            exercise.order,
            exercise.targetSets ?? null,
            exercise.repsMin ?? null,
            exercise.repsMax ?? null,
            null,
            exercise.restSeconds ?? null,
            exercise.notes ?? null,
          ],
        );
      }
    }
  });
}
