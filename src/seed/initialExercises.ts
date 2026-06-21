import { getDatabase } from "../database/client";
import { initialExerciseSeed } from "../utils/constants";
import { normalizeTextKey, repairTextEncoding } from "../utils/text";

export async function seedInitialExercises(profileId: number) {
  const db = await getDatabase();
  const [existingExercises, existingEquipment] = await Promise.all([
    db.getAllAsync<{ id: number; name: string }>("SELECT id, name FROM exercises WHERE profile_id = ?;", [
      profileId,
    ]),
    db.getAllAsync<{ id: number; name: string }>("SELECT id, name FROM equipment WHERE profile_id = ?;", [
      profileId,
    ]),
  ]);

  const exerciseMap = new Map(
    existingExercises.map((row) => [normalizeTextKey(row.name), row] as const),
  );
  const equipmentMap = new Map(
    existingEquipment.map((row) => [normalizeTextKey(row.name), row] as const),
  );

  for (const item of initialExerciseSeed) {
    const safeName = repairTextEncoding(item.name) ?? item.name;
    const safeMuscleGroup = repairTextEncoding(item.muscleGroup) ?? item.muscleGroup;
    const safeDescription = repairTextEncoding(item.description) ?? item.description;
    const safeTechnicalNotes = repairTextEncoding(item.technicalNotes) ?? item.technicalNotes;
    const safeExecutionTips = repairTextEncoding(item.executionTips) ?? item.executionTips;
    const existingExercise = exerciseMap.get(normalizeTextKey(safeName));
    let exerciseId = existingExercise?.id ?? null;

    if (existingExercise) {
      await db.runAsync(
        `
          UPDATE exercises
          SET
            name = ?,
            muscle_group = ?,
            type = ?,
            description = ?,
            technical_notes = ?,
            execution_tips = ?,
            default_rest_seconds = ?,
            is_active = 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?;
        `,
        [
          safeName,
          safeMuscleGroup,
          item.type,
          safeDescription,
          safeTechnicalNotes,
          safeExecutionTips,
          item.defaultRestSeconds,
          existingExercise.id,
        ],
      );
    } else {
      const result = await db.runAsync(
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
          safeName,
          safeMuscleGroup,
          item.type,
          safeDescription,
          safeTechnicalNotes,
          safeExecutionTips,
          item.defaultRestSeconds,
        ],
      );

      exerciseId = Number(result.lastInsertRowId);
      exerciseMap.set(normalizeTextKey(safeName), { id: exerciseId, name: safeName });
    }

    if (!exerciseId) {
      continue;
    }

    for (const equipmentName of item.equipmentNames) {
      const safeEquipmentName = repairTextEncoding(equipmentName) ?? equipmentName;
      const equipment = equipmentMap.get(normalizeTextKey(safeEquipmentName));

      if (!equipment) {
        continue;
      }

      await db.runAsync(
        `
          INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id)
          VALUES (?, ?);
        `,
        [exerciseId, equipment.id],
      );
    }
  }
}
