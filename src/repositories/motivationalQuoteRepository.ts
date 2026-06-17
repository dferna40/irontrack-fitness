import { getDatabase } from "../database/client";
import {
  CreateMotivationalQuoteInput,
  MotivationalQuote,
  UpdateMotivationalQuoteInput,
} from "../types/models";

interface MotivationalQuoteRow {
  id: number;
  text: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

const defaultQuotes = [
  "Cada serie cuenta.",
  "Constancia antes que perfección.",
  "Hoy suma, aunque sea poco.",
  "Entrena con intención, no con prisa.",
];

function mapRow(row: MotivationalQuoteRow): MotivationalQuote {
  return {
    id: row.id,
    text: row.text,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureDefaultMotivationalQuotes() {
  const db = await getDatabase();

  for (const quote of defaultQuotes) {
    await db.runAsync(
      `
        INSERT INTO motivational_quotes (text, is_default)
        SELECT ?, 1
        WHERE NOT EXISTS (
          SELECT 1
          FROM motivational_quotes
          WHERE text = ? AND is_default = 1
        );
      `,
      [quote, quote],
    );
  }
}

export async function listMotivationalQuotes() {
  const db = await getDatabase();
  await ensureDefaultMotivationalQuotes();
  const rows = await db.getAllAsync<MotivationalQuoteRow>(
    `
      SELECT *
      FROM motivational_quotes
      ORDER BY is_default DESC, created_at ASC, id ASC;
    `,
  );

  return rows.map(mapRow);
}

export async function createMotivationalQuote(input: CreateMotivationalQuoteInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO motivational_quotes (text, is_default)
      VALUES (?, 0);
    `,
    [input.text.trim()],
  );

  const row = await db.getFirstAsync<MotivationalQuoteRow>(
    "SELECT * FROM motivational_quotes WHERE id = ? LIMIT 1;",
    [result.lastInsertRowId],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la frase creada.");
  }

  return mapRow(row);
}

export async function updateMotivationalQuote(input: UpdateMotivationalQuoteInput) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE motivational_quotes
      SET
        text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_default = 0;
    `,
    [input.text.trim(), input.id],
  );

  const row = await db.getFirstAsync<MotivationalQuoteRow>(
    "SELECT * FROM motivational_quotes WHERE id = ? LIMIT 1;",
    [input.id],
  );

  if (!row) {
    throw new Error("No se pudo recuperar la frase actualizada.");
  }

  return mapRow(row);
}

export async function deleteMotivationalQuote(id: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MotivationalQuoteRow>(
    "SELECT * FROM motivational_quotes WHERE id = ? LIMIT 1;",
    [id],
  );

  if (!row || row.is_default) {
    return null;
  }

  await db.runAsync("DELETE FROM motivational_quotes WHERE id = ?;", [id]);
  return mapRow(row);
}
