import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { Card } from "../components/Card";
import { OptionSelector } from "../components/OptionSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createWorkoutWithSets } from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import { awardWorkoutCompletionXp } from "../services/gamification";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { buildProgressRecommendations } from "../utils/progression";
import { workoutDifficultyOptions, workoutDiscomfortOptions } from "../utils/constants";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutSummary">;

export function WorkoutSummaryScreen({ navigation }: Props) {
  const { profile, settings } = useAppState();
  const { session, finalizePayload, clearSession } = useTrainingSession();
  const [difficulty, setDifficulty] =
    useState<(typeof workoutDifficultyOptions)[number]>("Normal");
  const [discomfortLevel, setDiscomfortLevel] =
    useState<(typeof workoutDiscomfortOptions)[number]>("Sin molestias");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!profile || !session) {
    return (
      <ScreenContainer>
        <Text style={styles.body}>No hay entrenamiento para resumir.</Text>
      </ScreenContainer>
    );
  }

  const completedSets = Object.values(session.completedSets).flat();
  const recommendations = settings?.progressionRecommendationsEnabled
    ? buildProgressRecommendations(session.exercises, session.completedSets)
    : [];

  const handleSave = async () => {
    const payload = finalizePayload({ difficulty, discomfortLevel, notes });
    if (!payload) {
      return;
    }

    try {
      setIsSaving(true);
      const finishedAt = new Date().toISOString();
      const durationMinutes = Math.max(
        1,
        Math.round(
          (new Date(finishedAt).getTime() - new Date(payload.startedAt).getTime()) / 60000,
        ),
      );

      const workout = await createWorkoutWithSets(
        {
          profileId: profile.id,
          routineId: payload.routineId,
          workoutType: payload.workoutType,
          date: payload.startedAt.slice(0, 10),
          startedAt: payload.startedAt,
          finishedAt,
          durationMinutes,
          difficulty,
          discomfortLevel,
          notes,
        },
        payload.sets.map((set) => ({
          workoutId: 0,
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
          restSecondsUsed: set.restSecondsUsed,
          notes: set.notes,
        })),
      );

      await awardWorkoutCompletionXp(profile.id, workout);

      clearSession();
      navigation.reset({
        index: 0,
        routes: [{ name: "AppTabs" }],
      });
    } catch (error) {
      Alert.alert(
        "No se pudo guardar el entrenamiento",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Resumen del entrenamiento</Text>
        <Text style={styles.body}>
          {session.workoutType === "free"
            ? "Modo: Entrenamiento libre"
            : `Rutina: ${session.routineName}`}
        </Text>
        <Text style={styles.body}>Ejercicios: {session.exercises.length}</Text>
        <Text style={styles.body}>Series completadas: {completedSets.length}</Text>
      </Card>

      {recommendations.length ? (
        <Card>
          <Text style={styles.sectionTitle}>Recomendaciones de progresión</Text>
          {recommendations.map((item) => (
            <Text key={item.exerciseId} style={styles.body}>
              {item.exerciseName}: {item.message}
            </Text>
          ))}
        </Card>
      ) : null}

      <Card>
        <OptionSelector
          label="Dificultad"
          options={workoutDifficultyOptions.map((item) => ({ label: item, value: item }))}
          selectedValue={difficulty}
          onChange={setDifficulty}
        />
        <OptionSelector
          label="Molestias"
          options={workoutDiscomfortOptions.map((item) => ({ label: item, value: item }))}
          selectedValue={discomfortLevel}
          onChange={setDiscomfortLevel}
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Nota libre"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          multiline
        />
      </Card>

      <PrimaryButton
        label={isSaving ? "Guardando..." : "Guardar entrenamiento"}
        onPress={() => void handleSave()}
        disabled={isSaving}
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
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    color: theme.colors.textMuted,
    lineHeight: 21,
  },
  input: {
    minHeight: 100,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    textAlignVertical: "top",
  },
});
