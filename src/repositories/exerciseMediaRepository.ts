import { getDatabase } from "../database/client";
import { ExerciseMedia, UpsertExerciseMediaInput } from "../types/models";

interface ExerciseMediaRow {
  id: number;
  exercise_id: number;
  media_type: ExerciseMedia["mediaType"];
  mime_type: string | null;
  original_file_name: string | null;
  local_path: string;
  original_width: number | null;
  original_height: number | null;
  processed_width: number | null;
  processed_height: number | null;
  file_size: number | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ExerciseMediaRow): ExerciseMedia {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    mediaType: row.media_type,
    mimeType: row.mime_type,
    originalFileName: row.original_file_name,
    localPath: row.local_path,
    originalWidth: row.original_width,
    originalHeight: row.original_height,
    processedWidth: row.processed_width,
    processedHeight: row.processed_height,
    fileSize: row.file_size,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMediaForExercise(exerciseId: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExerciseMediaRow>(
    "SELECT * FROM exercise_media WHERE exercise_id = ? LIMIT 1;",
    [exerciseId],
  );

  return row ? mapRow(row) : null;
}

export async function upsertExerciseMedia(input: UpsertExerciseMediaInput) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO exercise_media (
        exercise_id,
        media_type,
        mime_type,
        original_file_name,
        local_path,
        original_width,
        original_height,
        processed_width,
        processed_height,
        file_size,
        duration_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(exercise_id) DO UPDATE SET
        media_type = excluded.media_type,
        mime_type = excluded.mime_type,
        original_file_name = excluded.original_file_name,
        local_path = excluded.local_path,
        original_width = excluded.original_width,
        original_height = excluded.original_height,
        processed_width = excluded.processed_width,
        processed_height = excluded.processed_height,
        file_size = excluded.file_size,
        duration_seconds = excluded.duration_seconds,
        updated_at = CURRENT_TIMESTAMP;
    `,
    [
      input.exerciseId,
      input.mediaType,
      input.mimeType ?? null,
      input.originalFileName ?? null,
      input.localPath,
      input.originalWidth ?? null,
      input.originalHeight ?? null,
      input.processedWidth ?? null,
      input.processedHeight ?? null,
      input.fileSize ?? null,
      input.durationSeconds ?? null,
    ],
  );

  const row = await db.getFirstAsync<ExerciseMediaRow>(
    "SELECT * FROM exercise_media WHERE exercise_id = ? LIMIT 1;",
    [input.exerciseId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar el recurso visual.");
  }

  return mapRow(row);
}

export async function deleteExerciseMedia(exerciseId: number) {
  const db = await getDatabase();
  const existing = await getMediaForExercise(exerciseId);
  await db.runAsync("DELETE FROM exercise_media WHERE exercise_id = ?;", [exerciseId]);
  return existing;
}
