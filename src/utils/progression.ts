import { ActiveWorkoutExercise, ActiveWorkoutSetDraft } from "../types/models";

export interface ExerciseProgressRecommendation {
  exerciseId: number;
  exerciseName: string;
  message: string;
}

export function buildProgressRecommendations(
  exercises: ActiveWorkoutExercise[],
  completedSets: Record<number, ActiveWorkoutSetDraft[]>,
) {
  const recommendations: ExerciseProgressRecommendation[] = [];

  for (const exercise of exercises) {
    const sets = completedSets[exercise.exerciseId] ?? [];
    if (!sets.length) {
      continue;
    }

    const completedTargetSets = sets.length >= exercise.targetSets;
    const minReps = exercise.targetRepsMin;
    const maxReps = exercise.targetRepsMax;

    if (completedTargetSets && maxReps !== null) {
      const closeToHighRange = sets
        .slice(0, exercise.targetSets)
        .every((set) => set.reps >= Math.max(1, maxReps - 1));

      if (closeToHighRange) {
        recommendations.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          message: `Buen progreso. En el próximo entrenamiento podrías intentar subir 2,5 kg.`,
        });
        continue;
      }
    }

    if (minReps !== null) {
      const belowMinimum = sets.some((set) => set.reps < minReps);

      if (belowMinimum) {
        recommendations.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          message: `No llegaste al rango mínimo. En el próximo entrenamiento conviene mantener el peso o bajarlo un poco.`,
        });
      }
    }
  }

  return recommendations;
}
