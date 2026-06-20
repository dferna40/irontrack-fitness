import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { listMotivationalQuotes } from "../repositories/motivationalQuoteRepository";
import { listRoutines } from "../repositories/routineRepository";
import {
  getWorkoutProgressSummary,
  listExerciseProgressSummary,
  listWorkoutHistory,
} from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { openMusicUrl } from "../utils/music";
import type {
  ExerciseProgressSummaryItem,
  MotivationalQuote,
  Routine,
  WorkoutHistoryItem,
  WorkoutProgressSummary,
} from "../types/models";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, settings, appearanceSettings } = useAppState();
  const [suggestedRoutine, setSuggestedRoutine] = useState<Routine | null>(null);
  const [lastWorkout, setLastWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [progressSummary, setProgressSummary] = useState<WorkoutProgressSummary | null>(null);
  const [recentProgress, setRecentProgress] = useState<ExerciseProgressSummaryItem | null>(null);
  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuote[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!profile) {
          return;
        }

        const tasks: Promise<void>[] = [];

        if (appearanceSettings?.showSuggestedRoutine ?? true) {
          tasks.push(
            listRoutines(profile.id, { onlyActive: true }).then((routines) => {
              setSuggestedRoutine(getSuggestedRoutineForToday(routines));
            }),
          );
        } else {
          setSuggestedRoutine(null);
        }

        if (appearanceSettings?.showLastWorkout ?? true) {
          tasks.push(
            listWorkoutHistory(profile.id).then((history) => {
              setLastWorkout(history[0] ?? null);
            }),
          );
        } else {
          setLastWorkout(null);
        }

        if (appearanceSettings?.showWeeklySummary ?? true) {
          tasks.push(
            getWorkoutProgressSummary(profile.id).then((summary) => {
              setProgressSummary(summary);
            }),
          );
        } else {
          setProgressSummary(null);
        }

        if (appearanceSettings?.showRecentProgress ?? true) {
          tasks.push(
            listExerciseProgressSummary(profile.id).then((items) => {
              setRecentProgress(items[0] ?? null);
            }),
          );
        } else {
          setRecentProgress(null);
        }

        if (appearanceSettings?.showMotivationalQuote ?? true) {
          tasks.push(
            listMotivationalQuotes().then((items) => {
              setMotivationalQuotes(items);
            }),
          );
        } else {
          setMotivationalQuotes([]);
        }

        await Promise.all(tasks);
      };

      void load();
    }, [
      appearanceSettings?.showLastWorkout,
      appearanceSettings?.showMotivationalQuote,
      appearanceSettings?.showQuickMusic,
      appearanceSettings?.showRecentProgress,
      appearanceSettings?.showSuggestedRoutine,
      appearanceSettings?.showWeeklySummary,
      profile,
    ]),
  );

  const quote =
    motivationalQuotes.length
      ? motivationalQuotes[new Date().getDate() % motivationalQuotes.length]?.text
      : null;

  return (
    <ScreenContainer>
      <Card style={styles.heroCard}>
        <Text style={styles.kicker}>IRONTRACK FITNESS</Text>
        <Text style={styles.title}>
          {profile ? `Hola, ${profile.name}` : "Bienvenido a IronTrack"}
        </Text>
        <Text style={styles.subtitle}>
          Tu centro de control para entrenar en casa con una app rápida, clara y cómoda en Android.
        </Text>
        <View style={styles.heroActions}>
          <PrimaryButton
            label="Ir a rutinas"
            onPress={() => navigation.navigate("RoutinesLibrary")}
            style={styles.flexButton}
          />
          <SecondaryButton
            label="Ver progreso"
            onPress={() => navigation.navigate("Progress")}
            style={styles.flexButton}
          />
        </View>
      </Card>

      {(appearanceSettings?.showSuggestedRoutine ?? true) && suggestedRoutine ? (
        <Card>
          <SectionHeader title="Rutina sugerida" helper="Lista para continuar sin perder tiempo" />
          <Text style={styles.cardText}>{suggestedRoutine.name}</Text>
          <Text style={styles.cardMeta}>{suggestedRoutine.goal || "Rutina activa disponible"}</Text>
          <PrimaryButton
            label="Ver rutina"
            onPress={() => navigation.navigate("RoutineDetail", { routineId: suggestedRoutine.id })}
          />
        </Card>
      ) : null}

      {appearanceSettings?.showLastWorkout ?? true ? (
        <Card>
          <SectionHeader title="Último entrenamiento" helper="Consulta tu última sesión guardada" />
          {lastWorkout ? (
            <>
              <Text style={styles.cardText}>
                {lastWorkout.routineName || formatWorkoutType(lastWorkout.workoutType)}
              </Text>
              <Text style={styles.cardMeta}>
                {formatDate(lastWorkout.date)} · {lastWorkout.setCount} series ·{" "}
                {lastWorkout.durationMinutes ?? 0} min
              </Text>
              <SecondaryButton
                label="Ver detalle"
                onPress={() => navigation.navigate("WorkoutDetail", { workoutId: lastWorkout.id })}
              />
            </>
          ) : (
            <Text style={styles.cardMeta}>Todavía no hay entrenamientos guardados.</Text>
          )}
        </Card>
      ) : null}

      {(appearanceSettings?.showWeeklySummary ?? true) && progressSummary ? (
        <Card>
          <SectionHeader title="Resumen semanal" helper="Tu ritmo actual de entrenamiento" />
          <View style={styles.summaryRow}>
            <SummaryBox label="Semana" value={String(progressSummary.workoutsThisWeek)} />
            <SummaryBox label="Mes" value={String(progressSummary.workoutsThisMonth)} />
            <SummaryBox label="Series" value={String(progressSummary.totalSets)} />
          </View>
          <SecondaryButton label="Ver progreso" onPress={() => navigation.navigate("Progress")} />
        </Card>
      ) : null}

      {appearanceSettings?.showQuickMusic ?? true ? (
        <Card>
          <SectionHeader title="Acceso rápido a música" helper="Abre tu playlist sin salir del flujo" />
          <PrimaryButton label="Abrir música" onPress={() => void openMusicUrl(settings, "weights")} />
        </Card>
      ) : null}

      {appearanceSettings?.showRecentProgress ?? true ? (
        <Card>
          <SectionHeader title="Progreso reciente" helper="Último ejercicio con datos registrados" />
          {recentProgress ? (
            <>
              <Text style={styles.cardText}>{recentProgress.exerciseName}</Text>
              <Text style={styles.cardMeta}>
                Último peso: {recentProgress.lastWeightUsed ?? 0} kg · Mejor peso:{" "}
                {recentProgress.bestWeightUsed ?? 0} kg
              </Text>
              <SecondaryButton
                label="Abrir progreso"
                onPress={() =>
                  navigation.navigate("ExerciseProgressDetail", {
                    exerciseId: recentProgress.exerciseId,
                  })
                }
              />
            </>
          ) : (
            <Text style={styles.cardMeta}>Aún no hay progreso reciente para mostrar.</Text>
          )}
        </Card>
      ) : null}

      {(appearanceSettings?.showMotivationalQuote ?? true) && quote ? (
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteKicker}>HOY TOCA</Text>
          <Text style={styles.quote}>{quote}</Text>
        </Card>
      ) : null}

      <Card>
        <SectionHeader title="Accesos rápidos" helper="Atajos útiles para moverte por la app" />
        <View style={styles.quickActions}>
          <PrimaryButton label="Ver material" onPress={() => navigation.navigate("Equipment")} />
          <SecondaryButton label="Historial" onPress={() => navigation.navigate("History")} />
          <SecondaryButton label="Progreso" onPress={() => navigation.navigate("Progress")} />
        </View>
      </Card>
    </ScreenContainer>
  );
}

function SectionHeader({ title, helper }: { title: string; helper: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.sectionHelper}>{helper}</Text>
    </View>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatWorkoutType(type: WorkoutHistoryItem["workoutType"]) {
  return type === "free" ? "Entrenamiento libre" : "Rutina";
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getSuggestedRoutineForToday(routines: Routine[]) {
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

  const firstStrengthRoutine = routines.find(
    (routine) => routine.name !== "Cardio VR" && routine.name !== "Viernes cardio y abdominales",
  );

  return firstStrengthRoutine ?? routines[0];
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.surface,
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  sectionHeader: {
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  sectionHelper: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  cardText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  cardMeta: {
    color: theme.colors.textMuted,
    lineHeight: 21,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  quoteCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
  },
  quoteKicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  quote: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
  },
  quickActions: {
    gap: theme.spacing.sm,
  },
});
