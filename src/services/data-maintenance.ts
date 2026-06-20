import * as FileSystem from "expo-file-system/legacy";
import { getDatabase } from "../database/client";
import { ensureDefaultMotivationalQuotes } from "../repositories/motivationalQuoteRepository";
import { seedInitialEquipment } from "../seed/initialEquipment";
import { seedInitialExercises } from "../seed/initialExercises";

const EXERCISE_MEDIA_DIRECTORY = `${FileSystem.documentDirectory}exercise-media/`;
const APPEARANCE_BACKGROUND_DIRECTORY = `${FileSystem.documentDirectory}appearance-background/`;
const EXPORT_DIRECTORY = `${FileSystem.documentDirectory}exports/`;

export async function restoreInitialEquipmentData(profileId: number) {
  await seedInitialEquipment(profileId);
}

export async function restoreInitialExercisesData(profileId: number) {
  await seedInitialExercises(profileId);
}

export async function clearTrainingHistory(profileId: number) {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM workouts WHERE profile_id = ?;", [profileId]);
    await tx.runAsync("DELETE FROM cardio_sessions WHERE profile_id = ?;", [profileId]);
    await tx.runAsync("DELETE FROM boxing_rounds WHERE profile_id = ?;", [profileId]);
  });
}

export async function resetAllLocalData() {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM workouts;");
    await tx.runAsync("DELETE FROM cardio_sessions;");
    await tx.runAsync("DELETE FROM boxing_rounds;");
    await tx.runAsync("DELETE FROM routine_exercises;");
    await tx.runAsync("DELETE FROM routines;");
    await tx.runAsync("DELETE FROM exercise_equipment;");
    await tx.runAsync("DELETE FROM exercise_media;");
    await tx.runAsync("DELETE FROM exercises;");
    await tx.runAsync("DELETE FROM equipment;");
    await tx.runAsync("DELETE FROM motivational_quotes;");
    await tx.runAsync("DELETE FROM user_profiles;");
    await tx.runAsync("DELETE FROM app_settings;");
    await tx.runAsync("DELETE FROM appearance_settings;");
  });

  await cleanupLocalFiles();
  await ensureDefaultMotivationalQuotes();
}

async function cleanupLocalFiles() {
  const directories = [
    EXERCISE_MEDIA_DIRECTORY,
    APPEARANCE_BACKGROUND_DIRECTORY,
    EXPORT_DIRECTORY,
  ];

  for (const directory of directories) {
    try {
      await FileSystem.deleteAsync(directory, { idempotent: true });
    } catch (error) {
      console.warn("No se pudo limpiar un directorio local", directory, error);
    }
  }
}
