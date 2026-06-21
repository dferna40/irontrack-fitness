import { getDatabase } from "../database/client";
import { initialEquipmentSeed } from "../utils/constants";
import { normalizeTextKey, repairTextEncoding } from "../utils/text";

export async function seedInitialEquipment(profileId: number) {
  const db = await getDatabase();
  const existingRows = await db.getAllAsync<{ id: number; name: string }>(
    "SELECT id, name FROM equipment WHERE profile_id = ?;",
    [profileId],
  );
  const existingMap = new Map(existingRows.map((row) => [normalizeTextKey(row.name), row] as const));

  for (const item of initialEquipmentSeed) {
    const safeName = repairTextEncoding(item.name) ?? item.name;
    const safeCategory = repairTextEncoding(item.category) ?? item.category;
    const safeNotes = repairTextEncoding(item.notes ?? "") ?? "";
    const existing = existingMap.get(normalizeTextKey(safeName));

    if (existing) {
      await db.runAsync(
        `
          UPDATE equipment
          SET name = ?, category = ?, notes = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?;
        `,
        [safeName, safeCategory, safeNotes, existing.id],
      );
      continue;
    }

    const result = await db.runAsync(
      `
        INSERT OR IGNORE INTO equipment (
          profile_id,
          name,
          category,
          description,
          notes,
          is_favorite,
          is_active
        ) VALUES (?, ?, ?, ?, ?, 0, 1);
      `,
      [profileId, safeName, safeCategory, "", safeNotes],
    );

    if (result.lastInsertRowId) {
      existingMap.set(normalizeTextKey(safeName), {
        id: Number(result.lastInsertRowId),
        name: safeName,
      });
    }
  }
}
