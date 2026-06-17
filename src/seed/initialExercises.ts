import { getDatabase } from "../database/client";
import { initialExerciseSeed } from "../utils/constants";

export async function seedInitialExercises(profileId: number) {
  const db = await getDatabase();

  for (const item of initialExerciseSeed) {
    await db.runAsync(
      `
        INSERT OR IGNORE INTO exercises (
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1);
      `,
      [
        profileId,
        item.name,
        item.muscleGroup,
        item.type,
        item.description,
        item.technicalNotes,
        item.executionTips,
        item.defaultRestSeconds,
      ],
    );

    const exercise = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM exercises WHERE profile_id = ? AND name = ? LIMIT 1;",
      [profileId, item.name],
    );

    if (!exercise) {
      continue;
    }

    for (const equipmentName of item.equipmentNames) {
      const equipment = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM equipment WHERE profile_id = ? AND name = ? LIMIT 1;",
        [profileId, equipmentName],
      );

      if (!equipment) {
        continue;
      }

      await db.runAsync(
        `
          INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id)
          VALUES (?, ?);
        `,
        [exercise.id, equipment.id],
      );
    }
  }
}
