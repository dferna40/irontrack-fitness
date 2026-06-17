import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { duplicateRoutine } from "../repositories/routineRepository";
import { getExercisesForRoutine } from "../repositories/routineExerciseRepository";
import { getRoutineById } from "../repositories/routineRepository";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { ActiveWorkoutExercise, Routine, RoutineExerciseWithExercise } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "RoutineDetail">;

function formatRepRange(item: RoutineExerciseWithExercise) {
  if (item.targetRepsMin === null && item.targetRepsMax === null) {
    return "-";
  }

  if (item.targetRepsMin !== null && item.targetRepsMax !== null) {
    return `${item.targetRepsMin}-${item.targetRepsMax}`;
  }

  return String(item.targetRepsMin ?? item.targetRepsMax ?? "-");
}

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

export function RoutineDetailScreen({ navigation, route }: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [items, setItems] = useState<RoutineExerciseWithExercise[]>([]);
  const { startRoutineWorkout } = useTrainingSession();

  const loadRoutine = useCallback(async () => {
    const [nextRoutine, nextItems] = await Promise.all([
      getRoutineById(route.params.routineId),
      getExercisesForRoutine(route.params.routineId),
    ]);

    setRoutine(nextRoutine);
    setItems(nextItems);
  }, [route.params.routineId]);

  useFocusEffect(
    useCallback(() => {
      void loadRoutine();
    }, [loadRoutine]),
  );

  if (!routine) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Cargando rutina...</Text>
      </ScreenContainer>
    );
  }

  const handleStartRoutine = () => {
    if (!items.length) {
      Alert.alert("Sin ejercicios", "La rutina no tiene ejercicios para empezar.");
      return;
    }

    startRoutineWorkout({
      routineId: routine.id,
      routineName: routine.name,
      workoutType: "routine",
      exercises: items.map(toActiveExercise),
    });
    navigation.navigate("ActiveWorkout");
  };

  const handleDuplicate = async () => {
    const duplicated = await duplicateRoutine(routine.id);
    navigation.navigate("RoutineDetail", { routineId: duplicated.id });
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>{routine.name}</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.body}>{routine.description || "Sin descripción."}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.body}>{routine.goal || "Sin objetivo definido."}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Lista ordenada de ejercicios</Text>
        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.order}>{item.exerciseOrder}.</Text>
                <View style={styles.exerciseHeaderContent}>
                  <Text style={styles.exerciseName}>{item.exercise.name}</Text>
                  <Text style={styles.meta}>
                    {item.exercise.muscleGroup} · {item.exercise.type}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Series objetivo</Text>
                  <Text style={styles.metricValue}>{item.targetSets ?? "-"}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Rango de repeticiones</Text>
                  <Text style={styles.metricValue}>{formatRepRange(item)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Peso objetivo</Text>
                  <Text style={styles.metricValue}>
                    {item.targetWeight === null ? "-" : `${item.targetWeight} kg`}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Descanso</Text>
                  <Text style={styles.metricValue}>
                    {item.restSeconds ?? item.exercise.defaultRestSeconds ?? 0}s
                  </Text>
                </View>
              </View>

              {item.notes ? (
                <View style={styles.section}>
                  <Text style={styles.label}>Notas</Text>
                  <Text style={styles.body}>{item.notes}</Text>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.body}>Esta rutina aún no tiene ejercicios asociados.</Text>
        )}
      </Card>

      <PrimaryButton label="Empezar rutina" onPress={handleStartRoutine} />
      <SecondaryButton
        label="Editar rutina"
        onPress={() => navigation.navigate("RoutineForm", { routineId: routine.id })}
      />
      <SecondaryButton label="Duplicar rutina" onPress={() => void handleDuplicate()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  body: {
    color: theme.colors.textMuted,
    lineHeight: 21,
  },
  exerciseCard: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exerciseHeader: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start",
  },
  exerciseHeaderContent: {
    flex: 1,
    gap: 4,
  },
  order: {
    color: theme.colors.accent,
    fontWeight: "800",
    fontSize: 16,
    width: 20,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metric: {
    minWidth: "47%",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
