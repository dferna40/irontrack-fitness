import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  ActiveWorkoutExercise,
  ActiveWorkoutSetDraft,
  WorkoutDifficulty,
  WorkoutDiscomfortLevel,
  WorkoutType,
} from "../types/models";

interface ActiveWorkoutSession {
  routineId: number | null;
  routineName: string;
  workoutType: WorkoutType;
  startedAt: string;
  exercises: ActiveWorkoutExercise[];
  currentExerciseIndex: number;
  draftWeight: number;
  draftReps: number;
  completedSets: Record<number, ActiveWorkoutSetDraft[]>;
}

interface StartWorkoutInput {
  routineId: number | null;
  routineName: string;
  workoutType: WorkoutType;
  exercises: ActiveWorkoutExercise[];
}

interface FinalizeWorkoutInput {
  difficulty: WorkoutDifficulty;
  discomfortLevel: WorkoutDiscomfortLevel;
  notes: string;
}

interface TrainingSessionValue {
  session: ActiveWorkoutSession | null;
  currentExercise: ActiveWorkoutExercise | null;
  startRoutineWorkout: (input: StartWorkoutInput) => void;
  updateDraftWeight: (delta: number) => void;
  updateDraftReps: (delta: number) => void;
  completeCurrentSet: (restSecondsUsed?: number) => ActiveWorkoutSetDraft | null;
  addExtraSet: () => void;
  goToNextExercise: () => void;
  jumpToExercise: (exerciseIndex: number) => void;
  getCompletedSetsForExercise: (exerciseId: number) => ActiveWorkoutSetDraft[];
  updateCompletedSet: (exerciseId: number, setNumber: number, weight: number, reps: number) => void;
  removeCompletedSet: (exerciseId: number, setNumber: number) => void;
  finalizePayload: (input: FinalizeWorkoutInput) => {
    startedAt: string;
    routineId: number | null;
    routineName: string;
    workoutType: WorkoutType;
    exercises: ActiveWorkoutExercise[];
    sets: ActiveWorkoutSetDraft[];
    difficulty: WorkoutDifficulty;
    discomfortLevel: WorkoutDiscomfortLevel;
    notes: string;
  } | null;
  clearSession: () => void;
}

const TrainingSessionContext = createContext<TrainingSessionValue | undefined>(undefined);

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);

  const currentExercise = session ? session.exercises[session.currentExerciseIndex] ?? null : null;

  const startRoutineWorkout = (input: StartWorkoutInput) => {
    const firstExercise = input.exercises[0];
    setSession({
      routineId: input.routineId,
      routineName: input.routineName,
      workoutType: input.workoutType,
      startedAt: new Date().toISOString(),
      exercises: input.exercises,
      currentExerciseIndex: 0,
      draftWeight: firstExercise?.targetWeight ?? 0,
      draftReps: firstExercise?.targetRepsMax ?? firstExercise?.targetRepsMin ?? 0,
      completedSets: {},
    });
  };

  const getCompletedSetsForExercise = (exerciseId: number) =>
    session?.completedSets[exerciseId] ?? [];

  const syncDraftToExercise = (nextSession: ActiveWorkoutSession, exerciseIndex: number) => {
    const nextExercise = nextSession.exercises[exerciseIndex];
    const existingSets = nextSession.completedSets[nextExercise.exerciseId] ?? [];
    const lastSet = existingSets[existingSets.length - 1];

    return {
      ...nextSession,
      currentExerciseIndex: exerciseIndex,
      draftWeight: lastSet?.weight ?? nextExercise.targetWeight ?? 0,
      draftReps:
        lastSet?.reps ?? nextExercise.targetRepsMax ?? nextExercise.targetRepsMin ?? 0,
    };
  };

  const updateDraftWeight = (delta: number) => {
    setSession((current) =>
      current
        ? { ...current, draftWeight: Math.max(0, Number((current.draftWeight + delta).toFixed(2))) }
        : current,
    );
  };

  const updateDraftReps = (delta: number) => {
    setSession((current) =>
      current ? { ...current, draftReps: Math.max(0, current.draftReps + delta) } : current,
    );
  };

  const completeCurrentSet = (restSecondsUsed?: number) => {
    if (!session || !currentExercise) {
      return null;
    }

    const nextSetNumber = (session.completedSets[currentExercise.exerciseId]?.length ?? 0) + 1;
    const nextSet: ActiveWorkoutSetDraft = {
      exerciseId: currentExercise.exerciseId,
      setNumber: nextSetNumber,
      weight: session.draftWeight,
      reps: session.draftReps,
      completed: true,
      restSecondsUsed: restSecondsUsed ?? currentExercise.restSeconds,
      notes: "",
    };

    setSession((current) => {
      if (!current) {
        return current;
      }

      const currentSets = current.completedSets[currentExercise.exerciseId] ?? [];
      return {
        ...current,
        completedSets: {
          ...current.completedSets,
          [currentExercise.exerciseId]: [...currentSets, nextSet],
        },
      };
    });

    return nextSet;
  };

  const addExtraSet = () => {
    if (!session || !currentExercise) {
      return;
    }

    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((item) =>
          item.exerciseId === currentExercise.exerciseId
            ? { ...item, targetSets: item.targetSets + 1 }
            : item,
        ),
      };
    });
  };

  const goToNextExercise = () => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextIndex = Math.min(current.exercises.length - 1, current.currentExerciseIndex + 1);
      return syncDraftToExercise(current, nextIndex);
    });
  };

  const jumpToExercise = (exerciseIndex: number) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const safeIndex = Math.max(0, Math.min(current.exercises.length - 1, exerciseIndex));
      return syncDraftToExercise(current, safeIndex);
    });
  };

  const updateCompletedSet = (
    exerciseId: number,
    setNumber: number,
    weight: number,
    reps: number,
  ) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextSets = (current.completedSets[exerciseId] ?? []).map((item) =>
        item.setNumber === setNumber ? { ...item, weight, reps } : item,
      );

      return {
        ...current,
        completedSets: {
          ...current.completedSets,
          [exerciseId]: nextSets,
        },
      };
    });
  };

  const removeCompletedSet = (exerciseId: number, setNumber: number) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextSets = (current.completedSets[exerciseId] ?? [])
        .filter((item) => item.setNumber !== setNumber)
        .map((item, index) => ({ ...item, setNumber: index + 1 }));

      return {
        ...current,
        completedSets: {
          ...current.completedSets,
          [exerciseId]: nextSets,
        },
      };
    });
  };

  const finalizePayload = (input: FinalizeWorkoutInput) => {
    if (!session) {
      return null;
    }

    const sets = Object.values(session.completedSets).flat();

    return {
      startedAt: session.startedAt,
      routineId: session.routineId,
      routineName: session.routineName,
      workoutType: session.workoutType,
      exercises: session.exercises,
      sets,
      difficulty: input.difficulty,
      discomfortLevel: input.discomfortLevel,
      notes: input.notes,
    };
  };

  const clearSession = () => setSession(null);

  const value = useMemo(
    () => ({
      session,
      currentExercise,
      startRoutineWorkout,
      updateDraftWeight,
      updateDraftReps,
      completeCurrentSet,
      addExtraSet,
      goToNextExercise,
      jumpToExercise,
      getCompletedSetsForExercise,
      updateCompletedSet,
      removeCompletedSet,
      finalizePayload,
      clearSession,
    }),
    [session, currentExercise],
  );

  return (
    <TrainingSessionContext.Provider value={value}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSession() {
  const context = useContext(TrainingSessionContext);
  if (!context) {
    throw new Error("useTrainingSession must be used within TrainingSessionProvider");
  }
  return context;
}
