import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { listWorkoutHistory } from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { WorkoutHistoryItem } from "../types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatWorkoutName(item: WorkoutHistoryItem) {
  if (item.routineName) {
    return item.routineName;
  }

  return item.workoutType === "routine"
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

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [items, setItems] = useState<WorkoutHistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    if (!profile) {
      return;
    }

    const rows = await listWorkoutHistory(profile.id);
    setItems(rows);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>
          Revisa tus entrenamientos guardados y su resumen básico.
        </Text>
      </View>

      {items.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Todavía no hay entrenamientos guardados</Text>
          <Text style={styles.emptyText}>
            Cuando finalices una rutina, aparecerá aquí con fecha, duración y resumen.
          </Text>
        </Card>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate("WorkoutDetail", { workoutId: item.id })}
          >
            <Card>
              <Text style={styles.cardTitle}>{formatWorkoutName(item)}</Text>
              <Text style={styles.meta}>Fecha: {formatDate(item.date)}</Text>
              <Text style={styles.meta}>Duración: {item.durationMinutes ?? 0} min</Text>
              <Text style={styles.meta}>
                Dificultad: {item.difficulty ?? "Sin indicar"}
              </Text>
              <Text style={styles.meta}>
                Molestias: {item.discomfortLevel ?? "Sin indicar"}
              </Text>
              <Text style={styles.meta}>Ejercicios: {item.exerciseCount}</Text>
              <Text style={styles.meta}>Series: {item.setCount}</Text>
            </Card>
          </Pressable>
        ))
      )}
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
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
