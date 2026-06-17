import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { MediaPreview } from "../components/MediaPreview";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getEquipmentForExercise } from "../repositories/exerciseEquipmentRepository";
import { getMediaForExercise } from "../repositories/exerciseMediaRepository";
import {
  deactivateExercise,
  getExerciseById,
  toggleFavoriteExercise,
} from "../repositories/exerciseRepository";
import { theme } from "../theme";
import { EquipmentItem, Exercise, ExerciseMedia } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseDetail">;

export function ExerciseDetailScreen({ navigation, route }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [media, setMedia] = useState<ExerciseMedia | null>(null);

  const loadDetail = useCallback(async () => {
    const nextExercise = await getExerciseById(route.params.exerciseId);

    if (!nextExercise) {
      Alert.alert("Ejercicio no encontrado", "No se ha podido cargar el ejercicio.");
      navigation.goBack();
      return;
    }

    const [nextEquipment, nextMedia] = await Promise.all([
      getEquipmentForExercise(nextExercise.id),
      getMediaForExercise(nextExercise.id),
    ]);

    setExercise(nextExercise);
    setEquipment(nextEquipment);
    setMedia(nextMedia);
  }, [navigation, route.params.exerciseId]);

  useFocusEffect(
    useCallback(() => {
      void loadDetail();
    }, [loadDetail]),
  );

  const handleToggleFavorite = async () => {
    if (!exercise) {
      return;
    }

    await toggleFavoriteExercise(exercise.id, !exercise.isFavorite);
    await loadDetail();
  };

  const handleDeactivate = async () => {
    if (!exercise) {
      return;
    }

    Alert.alert("Desactivar ejercicio", `¿Quieres desactivar "${exercise.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await deactivateExercise(exercise.id);
            await loadDetail();
          })();
        },
      },
    ]);
  };

  if (!exercise) {
    return (
      <ScreenContainer>
        <Text style={styles.muted}>Cargando ejercicio...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <MediaPreview media={media} />

      <Card>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.muscleGroup} · {exercise.type}
        </Text>
        <Text style={styles.meta}>
          Descanso recomendado: {exercise.defaultRestSeconds ?? 0} s
        </Text>
        <Text style={styles.meta}>
          Estado: {exercise.isActive ? "Activo" : "Desactivado"} ·{" "}
          {exercise.isFavorite ? "Favorito" : "No favorito"}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Material asociado</Text>
        <Text style={styles.body}>
          {equipment.length
            ? equipment.map((item) => item.name).join(", ")
            : "Sin material asociado."}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.body}>{exercise.description || "Sin descripción."}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notas técnicas</Text>
        <Text style={styles.body}>{exercise.technicalNotes || "Sin notas técnicas."}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Consejos de ejecución</Text>
        <Text style={styles.body}>{exercise.executionTips || "Sin consejos todavía."}</Text>
      </Card>

      <PrimaryButton
        label="Editar"
        onPress={() => navigation.navigate("ExerciseForm", { exerciseId: exercise.id })}
      />
      <SecondaryButton
        label={exercise.isFavorite ? "Quitar favorito" : "Marcar favorito"}
        onPress={() => void handleToggleFavorite()}
      />
      <SecondaryButton
        label="Ver técnica"
        onPress={() => navigation.navigate("ExerciseTechnique", { exerciseId: exercise.id })}
      />
      <SecondaryButton label="Recargar" onPress={() => void loadDetail()} />
      {exercise.isActive ? (
        <SecondaryButton label="Desactivar" onPress={() => void handleDeactivate()} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
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
  muted: {
    color: theme.colors.textMuted,
  },
});

