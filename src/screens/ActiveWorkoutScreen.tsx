import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View, Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { TimerCard } from "../components/TimerCard";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppState } from "../services/app-state";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { openMusicUrl } from "../utils/music";

type Props = NativeStackScreenProps<RootStackParamList, "ActiveWorkout">;

export function ActiveWorkoutScreen({ navigation }: Props) {
  const { settings } = useAppState();
  const {
    session,
    currentExercise,
    updateDraftWeight,
    updateDraftReps,
    completeCurrentSet,
    addExtraSet,
    goToNextExercise,
    getCompletedSetsForExercise,
    updateCompletedSet,
    removeCompletedSet,
  } = useTrainingSession();
  const [restSeconds, setRestSeconds] = useState(0);
  const [restKey, setRestKey] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [editingSetNumber, setEditingSetNumber] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  useEffect(() => {
    const keepAwake = async () => {
      if (settings?.keepScreenAwake) {
        await activateKeepAwakeAsync("active-workout");
      } else {
        deactivateKeepAwake("active-workout");
      }
    };

    void keepAwake();

    return () => {
      deactivateKeepAwake("active-workout");
    };
  }, [settings?.keepScreenAwake]);

  if (!session || !currentExercise) {
    return (
      <ScreenContainer>
        <Text style={styles.emptyText}>No hay entrenamiento activo.</Text>
      </ScreenContainer>
    );
  }

  const completedSets = getCompletedSetsForExercise(currentExercise.exerciseId);
  const currentSetNumber = completedSets.length + 1;

  const handleTimerFinish = async () => {
    setIsRestActive(false);

    if (settings?.vibrationEnabled) {
      Vibration.vibrate(600);
    }

    if (settings?.localNotificationEnabled) {
      const permissions = await Notifications.requestPermissionsAsync();
      if (permissions.granted) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Descanso terminado",
            body: `Sigue con ${currentExercise.name}`,
            sound: settings.soundEnabled ? "default" : false,
          },
          trigger: null,
        });
      }
    }
  };

  const handleCompleteSet = () => {
    const nextSet = completeCurrentSet();
    if (!nextSet) {
      return;
    }

    const nextRest = currentExercise.restSeconds || settings?.defaultRestSeconds || 60;
    setRestSeconds(nextRest);
    setRestKey((current) => current + 1);
    setIsRestActive(settings?.autoStartRest ?? true);
  };

  const saveEditedSet = () => {
    if (editingSetNumber === null) {
      return;
    }

    updateCompletedSet(
      currentExercise.exerciseId,
      editingSetNumber,
      Number(editWeight || 0),
      Number(editReps || 0),
    );
    setEditingSetNumber(null);
    setEditWeight("");
    setEditReps("");
  };

  const summaryText = useMemo(
    () => `${session.currentExerciseIndex + 1} de ${session.exercises.length}`,
    [session.currentExerciseIndex, session.exercises.length],
  );

  return (
    <ScreenContainer>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>
              {session.workoutType === "free" ? "ENTRENAMIENTO LIBRE" : "RUTINA ACTIVA"}
            </Text>
            <Text style={styles.title}>{session.routineName}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{summaryText}</Text>
          </View>
        </View>

        <Text style={styles.exerciseName}>{currentExercise.name}</Text>

        <View style={styles.statsGrid}>
          <StatPill label="Serie actual" value={String(currentSetNumber)} />
          <StatPill label="Objetivo" value={`${currentExercise.targetSets} series`} />
          <StatPill
            label="Reps"
            value={`${currentExercise.targetRepsMin ?? "-"}${
              currentExercise.targetRepsMax ? `-${currentExercise.targetRepsMax}` : ""
            }`}
          />
          <StatPill label="Peso" value={`${currentExercise.targetWeight ?? 0} kg`} />
          <StatPill label="Descanso" value={`${currentExercise.restSeconds}s`} />
          <StatPill label="Series hechas" value={String(completedSets.length)} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Registro rápido</Text>
        <View style={styles.metricSummaryRow}>
          <MetricCard label="Peso actual" value={`${session.draftWeight} kg`} />
          <MetricCard label="Reps actuales" value={String(session.draftReps)} />
        </View>
        <View style={styles.metricRow}>
          <SecondaryButton
            label="Peso -2.5"
            onPress={() => updateDraftWeight(-2.5)}
            style={styles.flexButton}
          />
          <PrimaryButton
            label="Peso +2.5"
            onPress={() => updateDraftWeight(2.5)}
            style={styles.flexButton}
          />
        </View>
        <View style={styles.metricRow}>
          <SecondaryButton
            label="Reps -1"
            onPress={() => updateDraftReps(-1)}
            style={styles.flexButton}
          />
          <PrimaryButton
            label="Reps +1"
            onPress={() => updateDraftReps(1)}
            style={styles.flexButton}
          />
        </View>
        <PrimaryButton label="Completar serie" onPress={handleCompleteSet} />
      </Card>

      {restSeconds > 0 ? (
        <TimerCard
          key={restKey}
          initialSeconds={restSeconds}
          autoStart={isRestActive}
          showQuick15={settings?.quickAdd15Enabled ?? true}
          showQuick30={settings?.quickAdd30Enabled ?? true}
          showQuick60={settings?.quickAdd60Enabled ?? true}
          onFinish={() => void handleTimerFinish()}
        />
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Series completadas</Text>
        {completedSets.length ? (
          completedSets.map((set) => (
            <View key={set.setNumber} style={styles.completedRow}>
              <View style={styles.completedCopy}>
                <Text style={styles.completedTitle}>Serie {set.setNumber}</Text>
                <Text style={styles.completedMeta}>
                  {set.weight} kg · {set.reps} reps
                </Text>
              </View>
              <View style={styles.completedActions}>
                <SecondaryButton
                  label="Editar"
                  onPress={() => {
                    setEditingSetNumber(set.setNumber);
                    setEditWeight(String(set.weight));
                    setEditReps(String(set.reps));
                  }}
                  style={styles.smallButton}
                />
                <SecondaryButton
                  label="Quitar"
                  onPress={() => removeCompletedSet(currentExercise.exerciseId, set.setNumber)}
                  style={styles.smallButton}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.meta}>Todavía no hay series guardadas para este ejercicio.</Text>
        )}

        {editingSetNumber !== null ? (
          <View style={styles.editBlock}>
            <Text style={styles.label}>Editar serie {editingSetNumber}</Text>
            <View style={styles.metricRow}>
              <TextInput
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
                style={[styles.input, styles.flexInput]}
                placeholder="Peso"
                placeholderTextColor={theme.colors.textMuted}
              />
              <TextInput
                value={editReps}
                onChangeText={setEditReps}
                keyboardType="number-pad"
                style={[styles.input, styles.flexInput]}
                placeholder="Reps"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <PrimaryButton label="Guardar serie editada" onPress={saveEditedSet} />
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.metricRow}>
          <SecondaryButton label="Añadir serie extra" onPress={addExtraSet} style={styles.flexButton} />
          <SecondaryButton
            label="Siguiente ejercicio"
            onPress={goToNextExercise}
            style={styles.flexButton}
          />
        </View>
        <View style={styles.metricRow}>
          <SecondaryButton
            label="Ver técnica"
            onPress={() =>
              navigation.navigate("ExerciseTechnique", { exerciseId: currentExercise.exerciseId })
            }
            style={styles.flexButton}
          />
          <SecondaryButton
            label="Abrir música"
            onPress={() => void openMusicUrl(settings, "weights")}
            style={styles.flexButton}
          />
        </View>
        <SecondaryButton
          label="Finalizar entrenamiento"
          onPress={() => {
            if (!Object.values(session.completedSets).flat().length) {
              Alert.alert("Sin series", "Completa al menos una serie antes de finalizar.");
              return;
            }
            navigation.navigate("WorkoutSummary");
          }}
        />
      </Card>
    </ScreenContainer>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricCardLabel}>{label}</Text>
      <Text style={styles.metricCardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.surface,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  progressBadge: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  progressBadgeText: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  statPill: {
    minWidth: "30%",
    flexGrow: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontSize: 15,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  metricSummaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricCardLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricCardValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  completedRow: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  completedCopy: {
    gap: theme.spacing.xs,
  },
  completedTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  completedMeta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  completedActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  smallButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  editBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    color: theme.colors.text,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  flexInput: {
    flex: 1,
  },
});
