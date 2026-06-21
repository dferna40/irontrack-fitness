import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getExercisesForRoutine } from "../repositories/routineExerciseRepository";
import { duplicateRoutine, getRoutineById } from "../repositories/routineRepository";
import { useAppState } from "../services/app-state";
import { prepareRoutineWorkout } from "../services/routine-workout";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { Routine, RoutineExerciseWithExercise } from "../types/models";
import { repairTextEncoding } from "../utils/text";

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

export function RoutineDetailScreen({ navigation, route }: Props) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [items, setItems] = useState<RoutineExerciseWithExercise[]>([]);
  const { profile } = useAppState();
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

  const handleStartRoutine = async () => {
    if (!profile) {
      Alert.alert("Perfil no disponible", "No se pudo cargar el perfil activo.");
      return;
    }

    try {
      const preparedRoutine = await prepareRoutineWorkout(profile.id, routine.id);

      startRoutineWorkout({
        routineId: preparedRoutine.routine.id,
        routineName: preparedRoutine.routine.name,
        workoutType: "routine",
        exercises: preparedRoutine.exercises,
      });
      navigation.navigate("ActiveWorkout");
    } catch (error) {
      Alert.alert(
        "No se pudo preparar el entrenamiento",
        error instanceof Error ? repairTextEncoding(error.message) : "Inténtalo de nuevo.",
      );
    }
  };

  const handleDuplicate = async () => {
    const duplicated = await duplicateRoutine(routine.id);
    navigation.navigate("RoutineDetail", { routineId: duplicated.id });
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>{repairTextEncoding(routine.name)}</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.body}>
            {repairTextEncoding(routine.description || "Sin descripción.")}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.body}>
            {repairTextEncoding(routine.goal || "Sin objetivo definido.")}
          </Text>
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
                  <Text style={styles.exerciseName}>{repairTextEncoding(item.exercise.name)}</Text>
                  <Text style={styles.meta}>
                    {repairTextEncoding(item.exercise.muscleGroup)} ·{" "}
                    {repairTextEncoding(item.exercise.type)}
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
                  <Text style={styles.body}>{repairTextEncoding(item.notes)}</Text>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.body}>Esta rutina aún no tiene ejercicios asociados.</Text>
        )}
      </Card>

      <PrimaryButton label="Empezar rutina" onPress={() => void handleStartRoutine()} />
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
