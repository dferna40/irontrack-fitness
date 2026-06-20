import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { listExercises } from "../repositories/exerciseRepository";
import {
  getExercisesForRoutine,
  replaceRoutineExercises,
} from "../repositories/routineExerciseRepository";
import {
  createRoutine,
  duplicateRoutine,
  getRoutineById,
  updateRoutine,
} from "../repositories/routineRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { Exercise, RoutineExerciseWithExercise } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "RoutineForm">;

type DraftRoutineExercise = {
  id?: number;
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  targetSets: string;
  targetRepsMin: string;
  targetRepsMax: string;
  targetWeight: string;
  restSeconds: string;
  notes: string;
};

function toDraftItem(item: RoutineExerciseWithExercise): DraftRoutineExercise {
  return {
    id: item.id,
    exerciseId: item.exerciseId,
    exerciseName: item.exercise.name,
    exerciseOrder: item.exerciseOrder,
    targetSets: item.targetSets?.toString() ?? "",
    targetRepsMin: item.targetRepsMin?.toString() ?? "",
    targetRepsMax: item.targetRepsMax?.toString() ?? "",
    targetWeight: item.targetWeight?.toString() ?? "",
    restSeconds: (item.restSeconds ?? item.exercise.defaultRestSeconds ?? 60).toString(),
    notes: item.notes ?? "",
  };
}

export function RoutineFormScreen({ navigation, route }: Props) {
  const { profile } = useAppState();
  const routineId = route.params?.routineId;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [items, setItems] = useState<DraftRoutineExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        return;
      }

      try {
        const exerciseRows = await listExercises(profile.id, { onlyActive: true });
        setAvailableExercises(exerciseRows);

        if (!routineId) {
          return;
        }

        const [routine, routineItems] = await Promise.all([
          getRoutineById(routineId),
          getExercisesForRoutine(routineId),
        ]);

        if (!routine) {
          Alert.alert("Rutina no encontrada", "No se ha podido cargar la rutina.");
          navigation.goBack();
          return;
        }

        setName(routine.name);
        setDescription(routine.description ?? "");
        setGoal(routine.goal ?? "");
        setIsActive(routine.isActive);
        setItems(routineItems.map(toDraftItem));
      } catch (error) {
        Alert.alert(
          "No se pudo cargar",
          error instanceof Error ? error.message : "Inténtalo de nuevo.",
        );
        navigation.goBack();
      }
    };

    void load();
  }, [navigation, profile, routineId]);

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
        exerciseName: exercise.name,
        exerciseOrder: current.length + 1,
        targetSets: "3",
        targetRepsMin: "8",
        targetRepsMax: "12",
        targetWeight: "",
        restSeconds: exercise.defaultRestSeconds?.toString() ?? "60",
        notes: "",
      },
    ]);
    setSelectedExerciseId(null);
  };

  const updateItem = (index: number, field: keyof DraftRoutineExercise, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const applyRestPreset = (index: number, seconds: number) => {
    updateItem(index, "restSeconds", String(seconds));
  };

  const removeItem = (index: number) => {
    setItems((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, exerciseOrder: itemIndex + 1 })),
    );
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    const normalized = next.map((item, itemIndex) => ({
      ...item,
      exerciseOrder: itemIndex + 1,
    }));
    setItems(normalized);

    if (routineId) {
      try {
        await replaceRoutineExercises(
          routineId,
          normalized.map((item) => ({
            routineId,
            exerciseId: item.exerciseId,
            exerciseOrder: item.exerciseOrder,
            targetSets: item.targetSets ? Number(item.targetSets) : null,
            targetRepsMin: item.targetRepsMin ? Number(item.targetRepsMin) : null,
            targetRepsMax: item.targetRepsMax ? Number(item.targetRepsMax) : null,
            targetWeight: item.targetWeight ? Number(item.targetWeight) : null,
            restSeconds: item.restSeconds ? Number(item.restSeconds) : null,
            notes: item.notes,
          })),
        );
      } catch (error) {
        Alert.alert(
          "No se pudo reordenar",
          error instanceof Error ? error.message : "Inténtalo de nuevo.",
        );
      }
    }
  };

  const saveRoutine = async () => {
    if (!profile) {
      return;
    }
    if (!name.trim()) {
      Alert.alert("Nombre obligatorio", "La rutina necesita un nombre.");
      return;
    }

    for (const item of items) {
      const targetSets = item.targetSets ? Number(item.targetSets) : null;
      const targetRepsMin = item.targetRepsMin ? Number(item.targetRepsMin) : null;
      const targetRepsMax = item.targetRepsMax ? Number(item.targetRepsMax) : null;
      const targetWeight = item.targetWeight ? Number(item.targetWeight) : null;
      const restSeconds = item.restSeconds ? Number(item.restSeconds) : null;

      if (targetSets !== null && (!Number.isFinite(targetSets) || targetSets <= 0)) {
        Alert.alert(
          "Series inválidas",
          `Revisa las series objetivo de ${item.exerciseName}.`,
        );
        return;
      }

      if (
        targetRepsMin !== null &&
        (!Number.isFinite(targetRepsMin) || targetRepsMin < 0)
      ) {
        Alert.alert(
          "Repeticiones inválidas",
          `Revisa las repeticiones mínimas de ${item.exerciseName}.`,
        );
        return;
      }

      if (
        targetRepsMax !== null &&
        (!Number.isFinite(targetRepsMax) || targetRepsMax < 0)
      ) {
        Alert.alert(
          "Repeticiones inválidas",
          `Revisa las repeticiones máximas de ${item.exerciseName}.`,
        );
        return;
      }

      if (
        targetRepsMin !== null &&
        targetRepsMax !== null &&
        targetRepsMax < targetRepsMin
      ) {
        Alert.alert(
          "Rango inválido",
          `Las repeticiones máximas no pueden ser menores que las mínimas en ${item.exerciseName}.`,
        );
        return;
      }

      if (targetWeight !== null && (!Number.isFinite(targetWeight) || targetWeight < 0)) {
        Alert.alert("Peso inválido", `Revisa el peso objetivo de ${item.exerciseName}.`);
        return;
      }

      if (restSeconds !== null && (!Number.isFinite(restSeconds) || restSeconds < 0)) {
        Alert.alert("Descanso inválido", `Revisa el descanso de ${item.exerciseName}.`);
        return;
      }
    }

    try {
      setIsSaving(true);
      const routine = routineId
        ? await updateRoutine({
            id: routineId,
            profileId: profile.id,
            name,
            description,
            goal,
            isActive,
          })
        : await createRoutine({
            profileId: profile.id,
            name,
            description,
            goal,
            isActive,
          });

      await replaceRoutineExercises(
        routine.id,
        items.map((item, index) => ({
          routineId: routine.id,
          exerciseId: item.exerciseId,
          exerciseOrder: index + 1,
          targetSets: item.targetSets ? Number(item.targetSets) : null,
          targetRepsMin: item.targetRepsMin ? Number(item.targetRepsMin) : null,
          targetRepsMax: item.targetRepsMax ? Number(item.targetRepsMax) : null,
          targetWeight: item.targetWeight ? Number(item.targetWeight) : null,
          restSeconds: item.restSeconds ? Number(item.restSeconds) : null,
          notes: item.notes,
        })),
      );

      navigation.navigate("RoutineDetail", { routineId: routine.id });
    } catch (error) {
      Alert.alert(
        "No se pudo guardar la rutina",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!routineId) {
      return;
    }
    try {
      const duplicated = await duplicateRoutine(routineId);
      navigation.navigate("RoutineDetail", { routineId: duplicated.id });
    } catch (error) {
      Alert.alert(
        "No se pudo duplicar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.sectionTitle}>Datos básicos</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre de la rutina"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, styles.multiline]}
          multiline
        />
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder="Objetivo"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Activa</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
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
          <Text style={styles.cardTitle}>
            {item.exerciseOrder}. {item.exerciseName}
          </Text>

          <View style={styles.row}>
            <SecondaryButton label="Subir" onPress={() => void moveItem(index, "up")} style={styles.inlineButton} />
            <SecondaryButton label="Bajar" onPress={() => void moveItem(index, "down")} style={styles.inlineButton} />
            <SecondaryButton label="Quitar" onPress={() => removeItem(index)} style={styles.inlineButton} />
          </View>

          <View style={styles.row}>
            <TextInput value={item.targetSets} onChangeText={(value) => updateItem(index, "targetSets", value)} placeholder="Series" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.smallInput]} keyboardType="number-pad" />
            <TextInput value={item.targetRepsMin} onChangeText={(value) => updateItem(index, "targetRepsMin", value)} placeholder="Reps min" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.smallInput]} keyboardType="number-pad" />
            <TextInput value={item.targetRepsMax} onChangeText={(value) => updateItem(index, "targetRepsMax", value)} placeholder="Reps max" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.smallInput]} keyboardType="number-pad" />
          </View>
          <View style={styles.row}>
            <TextInput value={item.targetWeight} onChangeText={(value) => updateItem(index, "targetWeight", value)} placeholder="Peso objetivo" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.smallInput]} keyboardType="decimal-pad" />
            <TextInput value={item.restSeconds} onChangeText={(value) => updateItem(index, "restSeconds", value)} placeholder="Descanso" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.smallInput]} keyboardType="number-pad" />
          </View>
          <View style={styles.restPresetRow}>
            {[45, 60, 75, 90].map((seconds) => {
              const selected = item.restSeconds === String(seconds);

              return (
                <Pressable
                  key={seconds}
                  onPress={() => applyRestPreset(index, seconds)}
                  style={[styles.restPresetChip, selected && styles.restPresetChipSelected]}
                >
                  <Text
                    style={[
                      styles.restPresetChipLabel,
                      selected && styles.restPresetChipLabelSelected,
                    ]}
                  >
                    {seconds}s
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={item.notes}
            onChangeText={(value) => updateItem(index, "notes", value)}
            placeholder="Notas"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />
        </Card>
      ))}

      <PrimaryButton
        label={isSaving ? "Guardando..." : "Guardar rutina"}
        onPress={() => void saveRoutine()}
        disabled={isSaving}
      />
      {routineId ? (
        <SecondaryButton label="Duplicar rutina" onPress={() => void handleDuplicate()} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
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
    paddingVertical: theme.spacing.sm,
    flex: 1,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  smallInput: {
    minWidth: 90,
  },
  restPresetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  restPresetChip: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    minWidth: 68,
    alignItems: "center",
  },
  restPresetChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  restPresetChipLabel: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  restPresetChipLabelSelected: {
    color: theme.colors.accent,
  },
  inlineButton: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.colors.text,
    fontWeight: "600",
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
});
