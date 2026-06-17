import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getExerciseProgressDetail } from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { ExerciseProgressDetail } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseProgressDetail">;

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

export function ExerciseProgressDetailScreen({ route }: Props) {
  const { profile } = useAppState();
  const [detail, setDetail] = useState<ExerciseProgressDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        return;
      }

      const nextDetail = await getExerciseProgressDetail(profile.id, route.params.exerciseId);
      setDetail(nextDetail);
    };

    void load();
  }, [profile, route.params.exerciseId]);

  if (!detail) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Cargando progreso del ejercicio...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>{detail.exerciseName}</Text>
        <Text style={styles.meta}>
          Último peso usado: {detail.lastWeightUsed ?? 0} kg
        </Text>
        <Text style={styles.meta}>
          Mejor peso usado: {detail.bestWeightUsed ?? 0} kg
        </Text>
        <Text style={styles.meta}>
          Última fecha entrenada: {formatDate(detail.lastTrainedDate)}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mejor serie</Text>
        {detail.bestSet ? (
          <>
            <Text style={styles.meta}>Fecha: {formatDate(detail.bestSet.date)}</Text>
            <Text style={styles.meta}>
              Serie {detail.bestSet.setNumber}: {detail.bestSet.weight} kg ·{" "}
              {detail.bestSet.reps} reps
            </Text>
            <Text style={styles.meta}>Volumen: {detail.bestSet.volume} kg</Text>
          </>
        ) : (
          <Text style={styles.meta}>Sin series registradas.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Historial reciente</Text>
        {detail.recentHistory.map((item) => (
          <View key={`${item.workoutId}-${item.setNumber}-${item.date}`} style={styles.historyRow}>
            <Text style={styles.meta}>{formatDate(item.date)}</Text>
            <Text style={styles.meta}>Serie {item.setNumber}</Text>
            <Text style={styles.meta}>{item.weight} kg</Text>
            <Text style={styles.meta}>{item.reps} reps</Text>
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
  historyRow: {
    gap: 4,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
