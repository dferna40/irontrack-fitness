import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { listExercises } from "../repositories/exerciseRepository";
import { useAppState } from "../services/app-state";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { ActiveWorkoutExercise, Exercise } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "FreeWorkoutSetup">;

interface DraftFreeExercise {
  exerciseId: number;
  name: string;
  type: Exercise["type"];
  muscleGroup: string;
  targetSets: string;
  repsMin: string;
  repsMax: string;
  targetWeight: string;
  restSeconds: string;
}

function toActiveExercise(item: DraftFreeExercise, order: number): ActiveWorkoutExercise {
  return {
    routineExerciseId: -1 * (order + 1),
    exerciseId: item.exerciseId,
    exerciseOrder: order + 1,
    name: item.name,
    type: item.type,
    muscleGroup: item.muscleGroup,
    targetSets: Number(item.targetSets || 3),
    targetRepsMin: item.repsMin ? Number(item.repsMin) : null,
    targetRepsMax: item.repsMax ? Number(item.repsMax) : null,
    targetWeight: item.targetWeight ? Number(item.targetWeight) : null,
    restSeconds: Number(item.restSeconds || 60),
    notes: null,
  };
}

export function FreeWorkoutSetupScreen({ navigation }: Props) {
  const { profile, settings } = useAppState();
  const { startRoutineWorkout } = useTrainingSession();
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [items, setItems] = useState<DraftFreeExercise[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        return;
      }

      const rows = await listExercises(profile.id, { onlyActive: true });
      setAvailableExercises(rows);
    };

    void load();
  }, [profile]);

  const addExercise = () => {
    if (!selectedExerciseId) {
      return;
    }

    const exercise = availableExercises.find((item) => item.id === selectedExerciseId);
    if (!exercise) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        type: exercise.type,
        muscleGroup: exercise.muscleGroup,
        targetSets: "3",
        repsMin: "8",
        repsMax: "12",
        targetWeight: "",
        restSeconds: String(exercise.defaultRestSeconds ?? settings?.defaultRestSeconds ?? 60),
      },
    ]);
    setSelectedExerciseId(null);
  };

  const updateItem = (index: number, field: keyof DraftFreeExercise, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const startFreeWorkout = () => {
    if (!items.length) {
      Alert.alert("Sin ejercicios", "Añade al menos un ejercicio al entrenamiento libre.");
      return;
    }

    startRoutineWorkout({
      routineId: null,
      routineName: "Entrenamiento libre",
      workoutType: "free",
      exercises: items.map(toActiveExercise),
    });

    navigation.replace("ActiveWorkout");
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Entrenamiento libre</Text>
        <Text style={styles.meta}>
          Elige ejercicios manualmente y empieza sin depender de una rutina.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Añadir ejercicios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipWrap}>
            {availableExercises.map((exercise) => {
              const selected = selectedExerciseId === exercise.id;
              return (
                <Pressable
                  key={exercise.id}
                  onPress={() => setSelectedExerciseId(exercise.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {exercise.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <PrimaryButton label="Añadir ejercicio" onPress={addExercise} />
      </Card>

      {items.map((item, index) => (
        <Card key={`${item.exerciseId}-${index}`}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.muscleGroup} · {item.type}
          </Text>

          <View style={styles.row}>
            <TextInput
              value={item.targetSets}
              onChangeText={(value) => updateItem(index, "targetSets", value)}
              style={[styles.input, styles.smallInput]}
              keyboardType="number-pad"
              placeholder="Series"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TextInput
              value={item.repsMin}
              onChangeText={(value) => updateItem(index, "repsMin", value)}
              style={[styles.input, styles.smallInput]}
              keyboardType="number-pad"
              placeholder="Reps min"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TextInput
              value={item.repsMax}
              onChangeText={(value) => updateItem(index, "repsMax", value)}
              style={[styles.input, styles.smallInput]}
              keyboardType="number-pad"
              placeholder="Reps max"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              value={item.targetWeight}
              onChangeText={(value) => updateItem(index, "targetWeight", value)}
              style={[styles.input, styles.smallInput]}
              keyboardType="decimal-pad"
              placeholder="Peso"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TextInput
              value={item.restSeconds}
              onChangeText={(value) => updateItem(index, "restSeconds", value)}
              style={[styles.input, styles.smallInput]}
              keyboardType="number-pad"
              placeholder="Descanso"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <SecondaryButton label="Quitar" onPress={() => removeItem(index)} />
        </Card>
      ))}

      <PrimaryButton label="Empezar entrenamiento libre" onPress={startFreeWorkout} />
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
  exerciseName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  chip: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  chipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  chipLabel: {
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  chipLabelSelected: {
    color: theme.colors.text,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    flex: 1,
  },
  smallInput: {
    minWidth: 90,
  },
});
