import { getDatabase } from "../database/client";

const initialRoutines = [
  {
    name: "Empuje",
    description: "Rutina base para pecho, hombros y tríceps.",
    goal: "Hipertrofia tren superior",
    exercises: [
      { name: "Press banca", order: 1, targetSets: 4, repsMin: 6, repsMax: 8, restSeconds: 90 },
      { name: "Press banca inclinado", order: 2, targetSets: 3, repsMin: 8, repsMax: 10, restSeconds: 90 },
      { name: "Cruces en polea", order: 3, targetSets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { name: "Press militar con mancuernas", order: 4, targetSets: 3, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Elevaciones laterales", order: 5, targetSets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
      { name: "Jalón con cuerda", order: 6, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
    ],
  },
  {
    name: "Tirón",
    description: "Rutina para espalda, bíceps y deltoide posterior.",
    goal: "Espalda y tracción",
    exercises: [
      { name: "Dominadas", order: 1, targetSets: 4, repsMin: 6, repsMax: 10, restSeconds: 90 },
      { name: "Jalón al pecho", order: 2, targetSets: 3, repsMin: 8, repsMax: 12, restSeconds: 75 },
      { name: "Remo bajo en polea", order: 3, targetSets: 3, repsMin: 8, repsMax: 12, restSeconds: 75 },
      { name: "Face pull", order: 4, targetSets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { name: "Curl barra Z", order: 5, targetSets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
      { name: "Curl con mancuernas", order: 6, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
    ],
  },
  {
    name: "Pierna",
    description: "Trabajo base de cuádriceps, femoral y glúteo.",
    goal: "Fuerza e hipertrofia pierna",
    exercises: [
      { name: "Sentadilla con mancuernas", order: 1, targetSets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
      { name: "Zancadas", order: 2, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { name: "Peso muerto rumano", order: 3, targetSets: 4, repsMin: 8, repsMax: 10, restSeconds: 90 },
      { name: "Extensión de cuádriceps", order: 4, targetSets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { name: "Curl femoral", order: 5, targetSets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
    ],
  },
  {
    name: "Cardio y boxeo",
    description: "Sesión mixta de cardio continuo y trabajo por rounds.",
    goal: "Resistencia y acondicionamiento",
    exercises: [
      { name: "Cinta de correr", order: 1, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "10-20 min progresivos." },
      { name: "Bicicleta estática", order: 2, targetSets: 1, repsMin: null, repsMax: null, restSeconds: 30, notes: "8-15 min a ritmo estable." },
      { name: "Saco de boxeo", order: 3, targetSets: 6, repsMin: null, repsMax: null, restSeconds: 60, notes: "Rounds técnicos o de potencia." },
    ],
  },
  {
    name: "Full body",
    description: "Rutina general para trabajar todo el cuerpo en una sola sesión.",
    goal: "Mantenimiento global",
    exercises: [
      { name: "Press banca", order: 1, targetSets: 3, repsMin: 6, repsMax: 8, restSeconds: 90 },
      { name: "Remo bajo en polea", order: 2, targetSets: 3, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Sentadilla con mancuernas", order: 3, targetSets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { name: "Press militar con mancuernas", order: 4, targetSets: 3, repsMin: 8, repsMax: 10, restSeconds: 75 },
      { name: "Plancha", order: 5, targetSets: 3, repsMin: null, repsMax: null, restSeconds: 45, notes: "Mantén tiempo bajo tensión constante." },
    ],
  },
];

export async function seedInitialRoutines(profileId: number) {
  const db = await getDatabase();

  for (const routine of initialRoutines) {
    await db.runAsync(
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

    const routineRow = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM routines WHERE profile_id = ? AND name = ? LIMIT 1;",
      [profileId, routine.name],
    );

    if (!routineRow) {
      continue;
    }

    for (const exercise of routine.exercises) {
      const exerciseRow = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM exercises WHERE profile_id = ? AND name = ? LIMIT 1;",
        [profileId, exercise.name],
      );

      if (!exerciseRow) {
        continue;
      }

      await db.runAsync(
        `
          INSERT OR IGNORE INTO routine_exercises (
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
}
