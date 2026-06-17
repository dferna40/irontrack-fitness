import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Card } from "../components/Card";
import { MediaPreview } from "../components/MediaPreview";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getEquipmentForExercise } from "../repositories/exerciseEquipmentRepository";
import { getMediaForExercise } from "../repositories/exerciseMediaRepository";
import { getExerciseById } from "../repositories/exerciseRepository";
import { theme } from "../theme";
import { EquipmentItem, Exercise, ExerciseMedia } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseTechnique">;

export function ExerciseTechniqueScreen({ route }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [media, setMedia] = useState<ExerciseMedia | null>(null);

  useEffect(() => {
    const load = async () => {
      const nextExercise = await getExerciseById(route.params.exerciseId);

      if (!nextExercise) {
        return;
      }

      const [nextEquipment, nextMedia] = await Promise.all([
        getEquipmentForExercise(nextExercise.id),
        getMediaForExercise(nextExercise.id),
      ]);

      setExercise(nextExercise);
      setEquipment(nextEquipment);
      setMedia(nextMedia);
    };

    void load();
  }, [route.params.exerciseId]);

  if (!exercise) {
    return (
      <ScreenContainer>
        <Text style={styles.body}>Cargando técnica...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <MediaPreview media={media} />
      <Card>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.meta}>{exercise.muscleGroup}</Text>
        <Text style={styles.meta}>
          {equipment.length
            ? equipment.map((item) => item.name).join(", ")
            : "Sin material asociado"}
        </Text>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Notas técnicas</Text>
        <Text style={styles.body}>{exercise.technicalNotes || "Sin notas técnicas."}</Text>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Consejos de ejecución</Text>
        <Text style={styles.body}>{exercise.executionTips || "Sin consejos todavía."}</Text>
      </Card>
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
});

