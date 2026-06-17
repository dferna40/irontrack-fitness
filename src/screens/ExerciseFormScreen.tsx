import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { MediaPreview } from "../components/MediaPreview";
import { OptionSelector } from "../components/OptionSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { listEquipment } from "../repositories/equipmentRepository";
import {
  getEquipmentForExercise,
  setExerciseEquipment,
} from "../repositories/exerciseEquipmentRepository";
import { getMediaForExercise } from "../repositories/exerciseMediaRepository";
import {
  createExercise,
  getExerciseById,
  updateExercise,
} from "../repositories/exerciseRepository";
import { useAppState } from "../services/app-state";
import { pickAndStoreExerciseMedia, removeExerciseMedia } from "../services/exercise-media";
import { theme } from "../theme";
import { EquipmentItem, ExerciseMedia, ExerciseType } from "../types/models";
import { exerciseTypeOptions } from "../utils/constants";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseForm">;

export function ExerciseFormScreen({ navigation, route }: Props) {
  const { profile } = useAppState();
  const exerciseId = route.params?.exerciseId;
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [type, setType] = useState<ExerciseType>("fuerza");
  const [description, setDescription] = useState("");
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [executionTips, setExecutionTips] = useState("");
  const [defaultRestSeconds, setDefaultRestSeconds] = useState("60");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentItem[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [media, setMedia] = useState<ExerciseMedia | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profile) {
        return;
      }

      const equipmentList = await listEquipment(profile.id, {});
      setAvailableEquipment(equipmentList);

      if (!exerciseId) {
        return;
      }

      const exercise = await getExerciseById(exerciseId);

      if (!exercise) {
        Alert.alert("Ejercicio no encontrado", "No se ha podido cargar el ejercicio.");
        navigation.goBack();
        return;
      }

      const [exerciseEquipment, exerciseMedia] = await Promise.all([
        getEquipmentForExercise(exerciseId),
        getMediaForExercise(exerciseId),
      ]);

      setName(exercise.name);
      setMuscleGroup(exercise.muscleGroup);
      setType(exercise.type);
      setDescription(exercise.description ?? "");
      setTechnicalNotes(exercise.technicalNotes ?? "");
      setExecutionTips(exercise.executionTips ?? "");
      setDefaultRestSeconds(
        exercise.defaultRestSeconds ? String(exercise.defaultRestSeconds) : "",
      );
      setIsFavorite(exercise.isFavorite);
      setIsActive(exercise.isActive);
      setSelectedEquipmentIds(exerciseEquipment.map((item) => item.id));
      setMedia(exerciseMedia);
    };

    void load();
  }, [exerciseId, navigation, profile]);

  const toggleEquipment = (equipmentId: number) => {
    setSelectedEquipmentIds((current) =>
      current.includes(equipmentId)
        ? current.filter((id) => id !== equipmentId)
        : [...current, equipmentId],
    );
  };

  const handlePickMedia = async () => {
    if (!exerciseId) {
      Alert.alert(
        "Guarda primero",
        "Crea o guarda el ejercicio antes de añadir el recurso visual.",
      );
      return;
    }

    try {
      const nextMedia = await pickAndStoreExerciseMedia(exerciseId);
      if (nextMedia) {
        setMedia(nextMedia);
      }
    } catch (error) {
      Alert.alert(
        "No se pudo añadir el recurso visual",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleRemoveMedia = async () => {
    if (!exerciseId) {
      return;
    }

    await removeExerciseMedia(exerciseId);
    setMedia(null);
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    if (!name.trim()) {
      Alert.alert("Nombre obligatorio", "El nombre del ejercicio es obligatorio.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        profileId: profile.id,
        name,
        muscleGroup: muscleGroup.trim() || "General",
        type,
        description,
        technicalNotes,
        executionTips,
        defaultRestSeconds: defaultRestSeconds.trim()
          ? Number(defaultRestSeconds)
          : null,
        isFavorite,
        isActive,
      };

      const savedExercise = exerciseId
        ? await updateExercise({ id: exerciseId, ...payload })
        : await createExercise(payload);

      await setExerciseEquipment(savedExercise.id, selectedEquipmentIds);
      navigation.navigate("ExerciseDetail", { exerciseId: savedExercise.id });
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.sectionTitle}>Datos básicos</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Ej. Press banca"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Grupo muscular</Text>
          <TextInput
            onChangeText={setMuscleGroup}
            placeholder="Ej. Pecho"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={muscleGroup}
          />
        </View>

        <OptionSelector
          label="Tipo"
          options={exerciseTypeOptions}
          selectedValue={type}
          onChange={setType}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Material</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.equipmentWrap}>
            {availableEquipment.map((item) => {
              const selected = selectedEquipmentIds.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleEquipment(item.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Entrenamiento</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Descripción general"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            textAlignVertical="top"
            value={description}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Descanso recomendado (segundos)</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setDefaultRestSeconds}
            placeholder="60"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={defaultRestSeconds}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Favorito</Text>
          <Switch
            onValueChange={setIsFavorite}
            thumbColor={isFavorite ? theme.colors.accent : "#d1d5db"}
            trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
            value={isFavorite}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Activo</Text>
          <Switch
            onValueChange={setIsActive}
            thumbColor={isActive ? theme.colors.accent : "#d1d5db"}
            trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
            value={isActive}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Técnica</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Notas técnicas</Text>
          <TextInput
            multiline
            onChangeText={setTechnicalNotes}
            placeholder="Puntos técnicos clave"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            textAlignVertical="top"
            value={technicalNotes}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Consejos de ejecución</Text>
          <TextInput
            multiline
            onChangeText={setExecutionTips}
            placeholder="Consejos prácticos"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            textAlignVertical="top"
            value={executionTips}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recurso visual</Text>
        <MediaPreview media={media} />
        <PrimaryButton label="Seleccionar recurso visual" onPress={() => void handlePickMedia()} />
        {media ? (
          <SecondaryButton label="Eliminar recurso visual" onPress={() => void handleRemoveMedia()} />
        ) : null}
      </Card>

      <PrimaryButton
        disabled={isSaving}
        label={isSaving ? "Guardando..." : "Guardar ejercicio"}
        onPress={() => void handleSave()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  multiline: {
    minHeight: 96,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  equipmentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.pill,
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
