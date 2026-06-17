import { getDatabase } from "../database/client";
import { initialEquipmentSeed } from "../utils/constants";

export async function seedInitialEquipment(profileId: number) {
  const db = await getDatabase();

  for (const item of initialEquipmentSeed) {
    await db.runAsync(
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
      [profileId, item.name, item.category, "", item.notes ?? ""],
    );
  }
}
