import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { listWorkoutsForCsvExport } from "../repositories/workoutRepository";

const EXPORT_DIRECTORY = `${FileSystem.documentDirectory}exports/`;

function escapeCsvValue(value: string | number | null) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatWorkoutType(value: "routine" | "free") {
  return value === "routine" ? "rutina" : "libre";
}

export async function exportWorkoutsToCsv(profileId: number) {
  const rows = await listWorkoutsForCsvExport(profileId);

  if (!rows.length) {
    throw new Error("No hay entrenamientos guardados para exportar.");
  }

  const header = [
    "fecha",
    "tipo de entrenamiento",
    "rutina",
    "ejercicio",
    "serie",
    "peso",
    "repeticiones",
    "dificultad",
    "molestias",
    "notas",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.date,
        formatWorkoutType(row.workoutType),
        row.routineName,
        row.exerciseName,
        row.setNumber,
        row.weight,
        row.reps,
        row.difficulty,
        row.discomfortLevel,
        row.notes,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  await FileSystem.makeDirectoryAsync(EXPORT_DIRECTORY, { intermediates: true });

  const fileName = `irontrack-workouts-${new Date().toISOString().slice(0, 10)}.csv`;
  const fileUri = `${EXPORT_DIRECTORY}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, lines.join("\n"), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Exportar entrenamientos a CSV",
      UTI: "public.comma-separated-values-text",
    });
  }

  return fileUri;
}
