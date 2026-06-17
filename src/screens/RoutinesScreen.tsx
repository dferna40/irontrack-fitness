import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { duplicateRoutine } from "../repositories/routineRepository";
import { getExercisesForRoutine } from "../repositories/routineExerciseRepository";
import { listRoutines } from "../repositories/routineRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { Routine } from "../types/models";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RoutineCardItem extends Routine {
  exerciseCount: number;
}

export function RoutinesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [items, setItems] = useState<RoutineCardItem[]>([]);

  const loadRoutines = useCallback(async () => {
    if (!profile) {
      return;
    }

    const routines = await listRoutines(profile.id, { onlyActive: false });
    const enriched = await Promise.all(
      routines.map(async (routine) => {
        const exercises = await getExercisesForRoutine(routine.id);

        return {
          ...routine,
          exerciseCount: exercises.length,
        };
      }),
    );

    setItems(enriched);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadRoutines();
    }, [loadRoutines]),
  );

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.subtitle}>
          Base inicial de rutinas del gimnasio con sus ejercicios ya asociados.
        </Text>
      </View>

      <PrimaryButton
        label="Nueva rutina"
        onPress={() => navigation.navigate("RoutineForm")}
      />

      {items.map((routine) => (
        <Card key={routine.id}>
          <Text style={styles.cardTitle}>{routine.name}</Text>
          <Text style={styles.meta}>{routine.goal || "Sin objetivo definido"}</Text>
          <Text style={styles.meta}>{routine.exerciseCount} ejercicios</Text>
          <Text style={styles.meta}>
            Estado: {routine.isActive ? "Activa" : "Inactiva"}
          </Text>

          <PrimaryButton
            label="Ver detalle"
            onPress={() => navigation.navigate("RoutineDetail", { routineId: routine.id })}
          />
          <SecondaryButton
            label="Empezar"
            onPress={() => navigation.navigate("RoutineDetail", { routineId: routine.id })}
          />
          <SecondaryButton
            label="Editar"
            onPress={() => navigation.navigate("RoutineForm", { routineId: routine.id })}
          />
          <SecondaryButton
            label="Duplicar"
            onPress={() =>
              void (async () => {
                try {
                  const duplicated = await duplicateRoutine(routine.id);
                  await loadRoutines();
                  navigation.navigate("RoutineDetail", { routineId: duplicated.id });
                } catch (error) {
                  Alert.alert(
                    "No se pudo duplicar",
                    error instanceof Error ? error.message : "Inténtalo de nuevo.",
                  );
                }
              })()
            }
          />
        </Card>
      ))}

      {items.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>No hay rutinas todavía</Text>
          <Text style={styles.meta}>
            La semilla inicial no encontró ejercicios suficientes para montar rutinas.
          </Text>
        </Card>
      ) : null}
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
});
