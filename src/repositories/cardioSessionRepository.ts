import { getDatabase } from "../database/client";
import { CardioSession, CreateCardioSessionInput } from "../types/models";

interface CardioSessionRow {
  id: number;
  profile_id: number;
  cardio_type: CardioSession["cardioType"];
  duration_minutes: number;
  intensity: CardioSession["intensity"];
  distance: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CardioSessionRow): CardioSession {
  return {
    id: row.id,
    profileId: row.profile_id,
    cardioType: row.cardio_type,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    distance: row.distance,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCardioSession(input: CreateCardioSessionInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO cardio_sessions (
        profile_id, cardio_type, duration_minutes, intensity, distance, notes
      ) VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.cardioType,
      input.durationMinutes,
      input.intensity,
      input.distance ?? null,
      input.notes ?? null,
    ],
  );

  const row = await db.getFirstAsync<CardioSessionRow>(
    "SELECT * FROM cardio_sessions WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la sesión de cardio guardada.");
  }

  return mapRow(row);
}
