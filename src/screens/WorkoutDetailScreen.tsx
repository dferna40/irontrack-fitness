import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getWorkoutDetail } from "../repositories/workoutRepository";
import { theme } from "../theme";
import { WorkoutDetail } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutDetail">;

function formatWorkoutName(detail: WorkoutDetail) {
  if (detail.routineName) {
    return detail.routineName;
  }

  return detail.workoutType === "routine"
    ? "Entrenamiento de rutina"
    : "Entrenamiento libre";
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function WorkoutDetailScreen({ route }: Props) {
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      const nextDetail = await getWorkoutDetail(route.params.workoutId);
      setDetail(nextDetail);
    };

    void load();
  }, [route.params.workoutId]);

  if (!detail) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Cargando entrenamiento...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>{formatWorkoutName(detail)}</Text>
        <Text style={styles.meta}>Fecha: {formatDate(detail.date)}</Text>
        <Text style={styles.meta}>Duración: {detail.durationMinutes ?? 0} min</Text>
        <Text style={styles.meta}>Dificultad: {detail.difficulty ?? "Sin indicar"}</Text>
        <Text style={styles.meta}>
          Molestias: {detail.discomfortLevel ?? "Sin indicar"}
        </Text>
        <Text style={styles.meta}>Notas: {detail.notes || "Sin notas"}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Ejercicios realizados</Text>
        {detail.exercises.map((exercise) => (
          <View key={exercise.exerciseId} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            {exercise.sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.meta}>Serie {set.setNumber}</Text>
                <Text style={styles.meta}>{set.weight} kg</Text>
                <Text style={styles.meta}>{set.reps} reps</Text>
              </View>
            ))}
          </View>
        ))}
      </Card>
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
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  exerciseBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
});
