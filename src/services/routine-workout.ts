import { getExercisesForRoutine } from "../repositories/routineExerciseRepository";
import { getRoutineById } from "../repositories/routineRepository";
import { getLastWeightUsedMap } from "../repositories/workoutRepository";
import { ActiveWorkoutExercise, Routine, RoutineExerciseWithExercise } from "../types/models";

function toActiveExercise(item: RoutineExerciseWithExercise): ActiveWorkoutExercise {
  return {
    routineExerciseId: item.id,
    exerciseId: item.exerciseId,
    exerciseOrder: item.exerciseOrder,
    name: item.exercise.name,
    type: item.exercise.type,
    muscleGroup: item.exercise.muscleGroup,
    targetSets: item.targetSets ?? 1,
    targetRepsMin: item.targetRepsMin,
    targetRepsMax: item.targetRepsMax,
    targetWeight: item.targetWeight,
    restSeconds: item.restSeconds ?? item.exercise.defaultRestSeconds ?? 60,
    notes: item.notes,
  };
}

export async function prepareRoutineWorkout(profileId: number, routineId: number): Promise<{
  routine: Routine;
  exercises: ActiveWorkoutExercise[];
}> {
  const [routine, items] = await Promise.all([
    getRoutineById(routineId),
    getExercisesForRoutine(routineId),
  ]);

  if (!routine) {
    throw new Error("No se encontro la rutina.");
  }

  if (!items.length) {
    throw new Error("La rutina no tiene ejercicios para empezar.");
  }

  const lastWeightMap = await getLastWeightUsedMap(
    profileId,
    items.map((item) => item.exerciseId),
  );

  return {
    routine,
    exercises: items.map((item) => {
      const activeExercise = toActiveExercise(item);
      const lastWeightUsed = lastWeightMap.get(item.exerciseId);

      return {
        ...activeExercise,
        targetWeight: lastWeightUsed ?? activeExercise.targetWeight,
      };
    }),
  };
}
