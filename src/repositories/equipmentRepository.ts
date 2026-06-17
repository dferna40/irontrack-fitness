import { getDatabase } from "../database/client";
import {
  CreateEquipmentInput,
  EquipmentFilters,
  EquipmentItem,
  UpdateEquipmentInput,
} from "../types/models";

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

function mapRow(row: EquipmentRow): EquipmentItem {
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

export async function listEquipment(profileId: number, filters: EquipmentFilters = {}) {
  const db = await getDatabase();
  const conditions = ["profile_id = ?"];
  const params: Array<number> = [profileId];

  if (filters.onlyActive) {
    conditions.push("is_active = 1");
  }

  if (filters.onlyFavorites) {
    conditions.push("is_favorite = 1");
  }

  const rows = await db.getAllAsync<EquipmentRow>(
    `
      SELECT * FROM equipment
      WHERE ${conditions.join(" AND ")}
      ORDER BY is_favorite DESC, name COLLATE NOCASE ASC;
    `,
    params,
  );

  return rows.map(mapRow);
}

export async function getEquipmentById(id: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<EquipmentRow>(
    "SELECT * FROM equipment WHERE id = ? LIMIT 1;",
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function createEquipment(input: CreateEquipmentInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO equipment (
        profile_id,
        name,
        category,
        description,
        notes,
        is_favorite,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.name.trim(),
      input.category.trim(),
      input.description?.trim() ?? "",
      input.notes?.trim() ?? "",
      input.isFavorite ? 1 : 0,
      input.isActive === false ? 0 : 1,
    ],
  );

  const row = await db.getFirstAsync<EquipmentRow>(
    "SELECT * FROM equipment WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el material creado.");
  }

  return mapRow(row);
}

export async function updateEquipment(input: UpdateEquipmentInput) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE equipment
      SET
        profile_id = ?,
        name = ?,
        category = ?,
        description = ?,
        notes = ?,
        is_favorite = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [
      input.profileId,
      input.name.trim(),
      input.category.trim(),
      input.description?.trim() ?? "",
      input.notes?.trim() ?? "",
      input.isFavorite ? 1 : 0,
      input.isActive ? 1 : 0,
      input.id,
    ],
  );

  const row = await db.getFirstAsync<EquipmentRow>(
    "SELECT * FROM equipment WHERE id = ? LIMIT 1;",
    [input.id],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el material actualizado.");
  }

  return mapRow(row);
}

export async function deactivateEquipment(id: number) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE equipment
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [id],
  );
}

export async function toggleFavoriteEquipment(id: number, isFavorite: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE equipment
      SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    [isFavorite ? 1 : 0, id],
  );
}

