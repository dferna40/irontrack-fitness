import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { listEquipment } from "../repositories/equipmentRepository";
import { getEquipmentForExercise } from "../repositories/exerciseEquipmentRepository";
import { listExercises, toggleFavoriteExercise } from "../repositories/exerciseRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { EquipmentItem, Exercise, ExerciseType } from "../types/models";
import { exerciseTypeOptions } from "../utils/constants";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExerciseListItem extends Exercise {
  equipmentNames: string[];
}

const muscleGroupOptions = [
  "Todos",
  "Pecho",
  "Espalda",
  "Piernas",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Cardio",
  "Boxeo",
  "Hombro posterior",
];

export function ExercisesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentItem[]>([]);
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [type, setType] = useState<ExerciseType | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);

  const loadExercises = useCallback(async () => {
    if (!profile) {
      return;
    }

    const [exerciseRows, equipmentRows] = await Promise.all([
      listExercises(profile.id, {
        search,
        muscleGroup,
        type,
        equipmentId,
        onlyActive: true,
      }),
      listEquipment(profile.id, { onlyActive: true }),
    ]);

    const itemsWithEquipment = await Promise.all(
      exerciseRows.map(async (exercise) => {
        const linkedEquipment = await getEquipmentForExercise(exercise.id);

        return {
          ...exercise,
          equipmentNames: linkedEquipment.map((item) => item.name),
        };
      }),
    );

    setItems(itemsWithEquipment);
    setEquipmentOptions(equipmentRows);
  }, [equipmentId, muscleGroup, profile, search, type]);

  useFocusEffect(
    useCallback(() => {
      void loadExercises();
    }, [loadExercises]),
  );

  const handleToggleFavorite = async (exercise: Exercise) => {
    await toggleFavoriteExercise(exercise.id, !exercise.isFavorite);
    await loadExercises();
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Ejercicios</Text>
        <Text style={styles.subtitle}>
          Catálogo local del gimnasio con filtros por nombre, grupo, tipo y material.
        </Text>
      </View>

      <TextInput
        onChangeText={setSearch}
        onSubmitEditing={() => void loadExercises()}
        placeholder="Buscar por nombre"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.search}
        value={search}
      />

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Grupo muscular</Text>
        <View style={styles.filterWrap}>
          {muscleGroupOptions.map((option) => {
            const value = option === "Todos" ? null : option;
            const selected = muscleGroup === value;

            return (
              <Pressable
                key={option}
                onPress={() => setMuscleGroup(value)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text
                  style={[styles.filterLabel, selected && styles.filterLabelSelected]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Tipo</Text>
        <View style={styles.filterWrap}>
          <Pressable
            onPress={() => setType(null)}
            style={[styles.filterChip, type === null && styles.filterChipSelected]}
          >
            <Text style={[styles.filterLabel, type === null && styles.filterLabelSelected]}>
              Todos
            </Text>
          </Pressable>
          {exerciseTypeOptions.map((option) => {
            const selected = type === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => setType(option.value)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text
                  style={[styles.filterLabel, selected && styles.filterLabelSelected]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Material</Text>
        <View style={styles.filterWrap}>
          <Pressable
            onPress={() => setEquipmentId(null)}
            style={[styles.filterChip, equipmentId === null && styles.filterChipSelected]}
          >
            <Text
              style={[styles.filterLabel, equipmentId === null && styles.filterLabelSelected]}
            >
              Limpiar
            </Text>
          </Pressable>
          {equipmentOptions.map((item) => {
            const selected = equipmentId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => setEquipmentId(item.id)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text
                  style={[styles.filterLabel, selected && styles.filterLabelSelected]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PrimaryButton
        label="Nuevo ejercicio"
        onPress={() => navigation.navigate("ExerciseForm")}
      />

      {items.map((exercise) => (
        <Card key={exercise.id}>
          <Pressable onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
                <Text style={styles.cardMeta}>
                  {exercise.muscleGroup} · {exercise.type}
                </Text>
                <Text style={styles.cardMeta}>
                  Descanso: {exercise.defaultRestSeconds ?? 0} s
                </Text>
                <Text style={styles.cardMeta}>
                  Material:{" "}
                  {exercise.equipmentNames.length
                    ? exercise.equipmentNames.join(", ")
                    : "Sin asociar"}
                </Text>
              </View>
              <Text style={styles.favorite}>{exercise.isFavorite ? "★" : "☆"}</Text>
            </View>
          </Pressable>
          <PrimaryButton
            label={exercise.isFavorite ? "Quitar favorito" : "Marcar favorito"}
            onPress={() => void handleToggleFavorite(exercise)}
          />
        </Card>
      ))}

      {items.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No hay ejercicios para estos filtros</Text>
          <Text style={styles.cardMeta}>
            Ajusta la búsqueda o limpia el filtro de material, grupo o tipo.
          </Text>
        </Card>
      ) : null}
    </ScreenContainer>
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
    lineHeight: 20,
  },
  search: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
  },
  filterSection: {
    gap: theme.spacing.sm,
  },
  filterTitle: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  filterChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  filterLabel: {
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  filterLabelSelected: {
    color: theme.colors.text,
  },
  cardHeader: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start",
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardMeta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  favorite: {
    color: theme.colors.warning,
    fontSize: 24,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
