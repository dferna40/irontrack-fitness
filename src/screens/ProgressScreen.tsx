import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getWorkoutProgressSummary,
  listExerciseProgressSummary,
} from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import {
  ExerciseProgressSummaryItem,
  WorkoutProgressSummary,
} from "../types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(date: string | null) {
  if (!date) {
    return "Sin entrenamientos";
  }

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

function formatWorkoutName(name: string | null) {
  if (!name) {
    return "Sin entrenamientos";
  }

  if (name === "routine") {
    return "Entrenamiento de rutina";
  }

  if (name === "free") {
    return "Entrenamiento libre";
  }

  return name;
}

function formatVolume(volume: number) {
  return `${Math.round(volume * 100) / 100} kg`;
}

export function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [summary, setSummary] = useState<WorkoutProgressSummary | null>(null);
  const [exerciseItems, setExerciseItems] = useState<ExerciseProgressSummaryItem[]>([]);

  const loadProgress = useCallback(async () => {
    if (!profile) {
      return;
    }

    const [nextSummary, nextExercises] = await Promise.all([
      getWorkoutProgressSummary(profile.id),
      listExerciseProgressSummary(profile.id),
    ]);

    setSummary(nextSummary);
    setExerciseItems(nextExercises);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress]),
  );

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Progreso</Text>
        <Text style={styles.subtitle}>
          Resumen básico de actividad, volumen acumulado y progreso por ejercicio.
        </Text>
      </View>

      <Card>
        <Text style={styles.metricLabel}>Entrenamientos de esta semana</Text>
        <Text style={styles.metricValue}>{summary?.workoutsThisWeek ?? 0}</Text>
      </Card>

      <Card>
        <Text style={styles.metricLabel}>Entrenamientos de este mes</Text>
        <Text style={styles.metricValue}>{summary?.workoutsThisMonth ?? 0}</Text>
      </Card>

      <Card>
        <Text style={styles.metricLabel}>Último entrenamiento</Text>
        <Text style={styles.metricValue}>
          {formatWorkoutName(summary?.lastWorkoutName ?? null)}
        </Text>
        <Text style={styles.meta}>{formatDate(summary?.lastWorkoutDate ?? null)}</Text>
      </Card>

      <Card>
        <Text style={styles.metricLabel}>Total de series realizadas</Text>
        <Text style={styles.metricValue}>{summary?.totalSets ?? 0}</Text>
      </Card>

      <Card>
        <Text style={styles.metricLabel}>Volumen total aproximado</Text>
        <Text style={styles.metricValue}>
          {formatVolume(summary?.totalVolume ?? 0)}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Progreso por ejercicio</Text>
        {exerciseItems.length ? (
          exerciseItems.map((item) => (
            <Pressable
              key={item.exerciseId}
              onPress={() =>
                navigation.navigate("ExerciseProgressDetail", {
                  exerciseId: item.exerciseId,
                })
              }
              style={styles.exerciseRow}
            >
              <Text style={styles.exerciseName}>{item.exerciseName}</Text>
              <Text style={styles.meta}>
                Último peso: {item.lastWeightUsed ?? 0} kg
              </Text>
              <Text style={styles.meta}>
                Mejor peso: {item.bestWeightUsed ?? 0} kg
              </Text>
              <Text style={styles.meta}>
                Última fecha: {formatDate(item.lastTrainedDate)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.meta}>Aún no hay ejercicios con progreso registrado.</Text>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 28,
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
  exerciseRow: {
    gap: 4,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
