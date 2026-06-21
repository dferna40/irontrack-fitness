import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getExercisesForRoutine } from "../repositories/routineExerciseRepository";
import { listRoutines } from "../repositories/routineRepository";
import { listWorkoutHistory } from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { prepareRoutineWorkout } from "../services/routine-workout";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { Routine } from "../types/models";
import { repairTextEncoding } from "../utils/text";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StrengthRoutineCardItem extends Routine {
  exerciseCount: number;
  exercisePreview: string[];
}

const primaryRoutineOrder = [
  "Pectoral",
  "Dorsal",
  "Piernas",
  "Hombros y brazos",
  "Viernes cardio y abdominales",
];

const secondaryRoutineOrder = ["Cardio VR"];

function sortStrengthRoutines(items: StrengthRoutineCardItem[]) {
  return [...items].sort((left, right) => {
    const leftPrimaryIndex = primaryRoutineOrder.indexOf(left.name);
    const rightPrimaryIndex = primaryRoutineOrder.indexOf(right.name);
    const leftSecondaryIndex = secondaryRoutineOrder.indexOf(left.name);
    const rightSecondaryIndex = secondaryRoutineOrder.indexOf(right.name);

    if (leftPrimaryIndex !== -1 || rightPrimaryIndex !== -1) {
      const safeLeftIndex = leftPrimaryIndex === -1 ? Number.MAX_SAFE_INTEGER : leftPrimaryIndex;
      const safeRightIndex =
        rightPrimaryIndex === -1 ? Number.MAX_SAFE_INTEGER : rightPrimaryIndex;
      return safeLeftIndex - safeRightIndex;
    }

    if (leftSecondaryIndex !== -1 || rightSecondaryIndex !== -1) {
      const safeLeftIndex =
        leftSecondaryIndex === -1 ? Number.MAX_SAFE_INTEGER : leftSecondaryIndex;
      const safeRightIndex =
        rightSecondaryIndex === -1 ? Number.MAX_SAFE_INTEGER : rightSecondaryIndex;
      return safeLeftIndex - safeRightIndex;
    }

    return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
  });
}

function getSuggestedRoutineForToday(routines: StrengthRoutineCardItem[]) {
  if (!routines.length) {
    return null;
  }

  const byName = new Map(routines.map((routine) => [routine.name, routine] as const));
  const weekday = new Date().getDay();

  const preferredNamesByDay = [
    ["Dorsal", "Cardio VR"],
    ["Pectoral", "Cardio VR"],
    ["Dorsal", "Cardio VR"],
    ["Piernas", "Cardio VR"],
    ["Hombros y brazos", "Cardio VR"],
    ["Viernes cardio y abdominales", "Cardio VR"],
    ["Pectoral", "Cardio VR"],
  ];

  const preferredNames = preferredNamesByDay[weekday] ?? [];
  for (const name of preferredNames) {
    const routine = byName.get(name);
    if (routine) {
      return routine;
    }
  }

  return routines[0] ?? null;
}

function getRoutineVisual(name: string) {
  switch (name) {
    case "Pectoral":
      return {
        icon: "arm-flex-outline" as const,
        accent: "#ff7a45",
        surface: "#3b1f16",
        label: "Pecho",
      };
    case "Dorsal":
      return {
        icon: "human-handsup" as const,
        accent: "#4db6ff",
        surface: "#142838",
        label: "Espalda",
      };
    case "Piernas":
      return {
        icon: "run-fast" as const,
        accent: "#7ed957",
        surface: "#1d3020",
        label: "Pierna",
      };
    case "Hombros y brazos":
      return {
        icon: "dumbbell" as const,
        accent: "#f5b942",
        surface: "#352915",
        label: "Hombros y brazos",
      };
    case "Viernes cardio y abdominales":
      return {
        icon: "heart-pulse" as const,
        accent: "#ff5d8f",
        surface: "#391a27",
        label: "Cardio + core",
      };
    case "Cardio VR":
      return {
        icon: "virtual-reality" as const,
        accent: "#b388ff",
        surface: "#281b3a",
        label: "VR",
      };
    default:
      return {
        icon: "clipboard-text-outline" as const,
        accent: theme.colors.accent,
        surface: theme.colors.accentSoft,
        label: "Rutina",
      };
  }
}

export function StrengthModeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const { startRoutineWorkout } = useTrainingSession();
  const [items, setItems] = useState<StrengthRoutineCardItem[]>([]);
  const [lastRoutineName, setLastRoutineName] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    if (!profile) {
      return;
    }

    const routines = await listRoutines(profile.id, { onlyActive: true });
    const enriched = await Promise.all(
      routines.map(async (routine) => {
        const exercises = await getExercisesForRoutine(routine.id);

        return {
          ...routine,
          exerciseCount: exercises.length,
          exercisePreview: exercises
            .slice(0, 3)
            .map((exercise) => repairTextEncoding(exercise.exercise.name)),
        };
      }),
    );

    const history = await listWorkoutHistory(profile.id);
    const lastRoutineWorkout = history.find((item) => item.routineName);

    setLastRoutineName(
      lastRoutineWorkout?.routineName ? repairTextEncoding(lastRoutineWorkout.routineName) : null,
    );
    setItems(sortStrengthRoutines(enriched));
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadRoutines();
    }, [loadRoutines]),
  );

  const suggestedRoutine = useMemo(() => getSuggestedRoutineForToday(items), [items]);

  const handleStartRoutine = async (routineId: number) => {
    if (!profile) {
      Alert.alert("Perfil no disponible", "No se pudo cargar el perfil activo.");
      return;
    }

    try {
      const preparedRoutine = await prepareRoutineWorkout(profile.id, routineId);

      startRoutineWorkout({
        routineId: preparedRoutine.routine.id,
        routineName: preparedRoutine.routine.name,
        workoutType: "routine",
        exercises: preparedRoutine.exercises,
      });

      navigation.navigate("ActiveWorkout");
    } catch (error) {
      Alert.alert(
        "No se pudo empezar la rutina",
        error instanceof Error ? repairTextEncoding(error.message) : "Inténtalo de nuevo.",
      );
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Modo fuerza</Text>
        <Text style={styles.subtitle}>
          Elige tu grupo muscular, entra directo y empieza con el menor número de toques posible.
        </Text>
      </View>

      {suggestedRoutine ? (
        <HighlightedRoutineCard
          routine={suggestedRoutine}
          isLastRoutine={repairTextEncoding(suggestedRoutine.name) === lastRoutineName}
          onStart={() => void handleStartRoutine(suggestedRoutine.id)}
          onOpenDetail={() =>
            navigation.navigate("RoutineDetail", { routineId: suggestedRoutine.id })
          }
        />
      ) : null}

      {items.length ? (
        items.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            highlighted={routine.id === suggestedRoutine?.id}
            isLastRoutine={repairTextEncoding(routine.name) === lastRoutineName}
            onStart={() => void handleStartRoutine(routine.id)}
            onOpenDetail={() => navigation.navigate("RoutineDetail", { routineId: routine.id })}
          />
        ))
      ) : (
        <Card>
          <Text style={styles.cardTitle}>No hay rutinas activas</Text>
          <Text style={styles.meta}>
            Cuando tengas rutinas activas, aparecerán aquí para empezar con un toque.
          </Text>
          <SecondaryButton
            label="Ir a rutinas"
            onPress={() => navigation.navigate("RoutinesLibrary")}
          />
        </Card>
      )}
    </ScreenContainer>
  );
}

function HighlightedRoutineCard({
  routine,
  isLastRoutine,
  onStart,
  onOpenDetail,
}: {
  routine: StrengthRoutineCardItem;
  isLastRoutine: boolean;
  onStart: () => void;
  onOpenDetail: () => void;
}) {
  const visual = getRoutineVisual(routine.name);
  const cardStyle = {
    ...styles.highlightCard,
    borderColor: visual.accent,
    backgroundColor: visual.surface,
  };

  return (
    <Card style={cardStyle}>
      <Text style={[styles.highlightKicker, { color: visual.accent }]}>HOY TOCA</Text>
      <View style={styles.highlightHeader}>
        <View style={[styles.iconShellLarge, { backgroundColor: "rgba(0,0,0,0.18)" }]}>
          <MaterialCommunityIcons name={visual.icon} size={32} color={visual.accent} />
        </View>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>{repairTextEncoding(routine.name)}</Text>
          <Text style={styles.highlightMeta}>
            {visual.label} · {routine.exerciseCount} ejercicios
          </Text>
        </View>
      </View>
      {isLastRoutine ? (
        <View style={styles.lastRoutineBadge}>
          <Text style={styles.lastRoutineBadgeText}>ÚLTIMA QUE HICISTE</Text>
        </View>
      ) : null}
      <Text style={styles.highlightGoal}>
        {repairTextEncoding(routine.goal || routine.description || "Rutina activa")}
      </Text>
      <Text style={styles.previewTitle}>Primeros ejercicios</Text>
      <Text style={styles.previewText}>{routine.exercisePreview.join(" · ")}</Text>
      <PrimaryButton label="Empezar ahora" onPress={onStart} />
      <SecondaryButton label="Ver detalle" onPress={onOpenDetail} />
    </Card>
  );
}

function RoutineCard({
  routine,
  highlighted,
  isLastRoutine,
  onStart,
  onOpenDetail,
}: {
  routine: StrengthRoutineCardItem;
  highlighted: boolean;
  isLastRoutine: boolean;
  onStart: () => void;
  onOpenDetail: () => void;
}) {
  const visual = getRoutineVisual(routine.name);
  const cardStyle = {
    ...styles.routineCard,
    borderColor: visual.accent,
    backgroundColor: highlighted ? visual.surface : theme.colors.surface,
  };

  return (
    <Card style={cardStyle}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconShell, { backgroundColor: visual.surface }]}>
            <MaterialCommunityIcons name={visual.icon} size={24} color={visual.accent} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{repairTextEncoding(routine.name)}</Text>
            <Text style={styles.meta}>
              {visual.label} · {routine.exerciseCount} ejercicios
            </Text>
          </View>
        </View>
        <View style={[styles.stateBadge, { borderColor: visual.accent, backgroundColor: visual.surface }]}>
          <Text style={[styles.stateBadgeText, { color: visual.accent }]}>
            {isLastRoutine ? "Última" : visual.label}
          </Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {repairTextEncoding(routine.goal || routine.description || "Rutina activa")}
      </Text>
      <Text style={styles.previewText}>{routine.exercisePreview.join(" · ")}</Text>

      <PrimaryButton label="Empezar" onPress={onStart} />
      <SecondaryButton label="Ver detalle" onPress={onOpenDetail} />
    </Card>
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
    lineHeight: 21,
    fontSize: 15,
  },
  highlightCard: {
    borderWidth: 1.5,
  },
  highlightKicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  highlightCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  highlightTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  highlightMeta: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  highlightGoal: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  lastRoutineBadge: {
    alignSelf: "flex-start",
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(255,107,44,0.15)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  lastRoutineBadgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  previewText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  routineCard: {
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconShellLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stateBadge: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  stateBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
