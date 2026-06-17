import { getDatabase } from "../database/client";
import { BoxingRoundSession, CreateBoxingRoundSessionInput } from "../types/models";

interface BoxingRoundRow {
  id: number;
  profile_id: number;
  total_rounds: number;
  round_duration_seconds: number;
  rest_seconds: number;
  completed_rounds: number;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: BoxingRoundRow): BoxingRoundSession {
  return {
    id: row.id,
    profileId: row.profile_id,
    totalRounds: row.total_rounds,
    roundDurationSeconds: row.round_duration_seconds,
    restSeconds: row.rest_seconds,
    completedRounds: row.completed_rounds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createBoxingRoundSession(input: CreateBoxingRoundSessionInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO boxing_rounds (
        profile_id,
        total_rounds,
        round_duration_seconds,
        rest_seconds,
        completed_rounds,
        started_at,
        finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      input.profileId,
      input.totalRounds,
      input.roundDurationSeconds,
      input.restSeconds,
      input.completedRounds,
      input.startedAt,
      input.finishedAt ?? null,
    ],
  );

  const row = await db.getFirstAsync<BoxingRoundRow>(
    "SELECT * FROM boxing_rounds WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la sesión de boxeo guardada.");
  }

  return mapRow(row);
}
