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
        <Text style={styles.meta}>No hay entrenamiento activo.</Text>
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
      <Card>
        <Text style={styles.title}>{session.routineName}</Text>
        <Text style={styles.meta}>
          {session.workoutType === "free" ? "Entrenamiento libre" : "Entrenamiento de rutina"}
        </Text>
        <Text style={styles.meta}>Ejercicio {summaryText}</Text>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.meta}>Serie actual: {currentSetNumber}</Text>
        <Text style={styles.meta}>
          Objetivo: {currentExercise.targetSets} series ·{" "}
          {currentExercise.targetRepsMin ?? "-"}
          {currentExercise.targetRepsMax ? `-${currentExercise.targetRepsMax}` : ""} reps
        </Text>
        <Text style={styles.meta}>Peso objetivo: {currentExercise.targetWeight ?? 0} kg</Text>
        <Text style={styles.meta}>Descanso configurado: {currentExercise.restSeconds}s</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Ajuste rápido</Text>
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
        <Text style={styles.metricValue}>Peso actual: {session.draftWeight} kg</Text>
        <Text style={styles.metricValue}>Reps actuales: {session.draftReps}</Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.meta}>
                  Serie {set.setNumber}: {set.weight} kg · {set.reps} reps
                </Text>
              </View>
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

      <PrimaryButton label="Completar serie" onPress={handleCompleteSet} />
      <SecondaryButton label="Añadir serie extra" onPress={addExtraSet} />
      <SecondaryButton label="Siguiente ejercicio" onPress={goToNextExercise} />
      <SecondaryButton
        label="Ver técnica"
        onPress={() =>
          navigation.navigate("ExerciseTechnique", { exerciseId: currentExercise.exerciseId })
        }
      />
      <SecondaryButton
        label="Finalizar"
        onPress={() => {
          if (!Object.values(session.completedSets).flat().length) {
            Alert.alert("Sin series", "Completa al menos una serie antes de finalizar.");
            return;
          }
          navigation.navigate("WorkoutSummary");
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  exerciseName: {
    color: theme.colors.accent,
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
  metricRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  metricValue: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  smallButton: {
    minHeight: 40,
    paddingHorizontal: 10,
  },
  editBlock: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  flexInput: {
    flex: 1,
  },
});
