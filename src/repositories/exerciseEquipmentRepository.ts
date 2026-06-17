import { getDatabase } from "../database/client";
import { EquipmentItem } from "../types/models";

interface EquipmentRow {
  id: number;
  profile_id: number;
  name: string;
  category: string;
  description: string | null;
  notes: string | null;
  is_favorite: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapEquipmentRow(row: EquipmentRow): EquipmentItem {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    category: row.category,
    description: row.description,
    notes: row.notes,
    isFavorite: Boolean(row.is_favorite),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function setExerciseEquipment(exerciseId: number, equipmentIds: number[]) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM exercise_equipment WHERE exercise_id = ?;", [exerciseId]);

    for (const equipmentId of equipmentIds) {
      await tx.runAsync(
        `
          INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id)
          VALUES (?, ?);
        `,
        [exerciseId, equipmentId],
      );
    }
  });
}

export async function addEquipmentToExercise(exerciseId: number, equipmentId: number) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id)
      VALUES (?, ?);
    `,
    [exerciseId, equipmentId],
  );
}

export async function getEquipmentForExercise(exerciseId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EquipmentRow>(
    `
      SELECT e.*
      FROM equipment e
      INNER JOIN exercise_equipment ee ON ee.equipment_id = e.id
      WHERE ee.exercise_id = ?
      ORDER BY e.name COLLATE NOCASE ASC;
    `,
    [exerciseId],
  );

  return rows.map(mapEquipmentRow);
}

export async function getExerciseIdsByEquipment(equipmentId: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercise_id: number }>(
    `
      SELECT exercise_id
      FROM exercise_equipment
      WHERE equipment_id = ?;
    `,
    [equipmentId],
  );

  return rows.map((row) => row.exercise_id);
}
