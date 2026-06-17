import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { DangerButton } from "../components/DangerButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import {
  deactivateEquipment,
  listEquipment,
  toggleFavoriteEquipment,
} from "../repositories/equipmentRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { EquipmentItem } from "../types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function EquipmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const loadEquipment = useCallback(async () => {
    if (!profile) {
      return;
    }

    const rows = await listEquipment(profile.id, { onlyActive, onlyFavorites });
    setEquipment(rows);
  }, [onlyActive, onlyFavorites, profile]);

  useFocusEffect(
    useCallback(() => {
      void loadEquipment();
    }, [loadEquipment]),
  );

  const handleToggleFavorite = async (item: EquipmentItem) => {
    try {
      await toggleFavoriteEquipment(item.id, !item.isFavorite);
      await loadEquipment();
    } catch (error) {
      Alert.alert(
        "No se pudo actualizar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleDeactivate = async (item: EquipmentItem) => {
    Alert.alert(
      "Desactivar material",
      `¿Quieres desactivar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deactivateEquipment(item.id);
                await loadEquipment();
              } catch (error) {
                Alert.alert(
                  "No se pudo desactivar",
                  error instanceof Error ? error.message : "Inténtalo de nuevo.",
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Material disponible</Text>
        <Text style={styles.subtitle}>
          Gestiona tu equipo del gimnasio personal sin depender de conexión.
        </Text>
      </View>

      <View style={styles.filters}>
        <Pressable
          onPress={() => setOnlyActive((value) => !value)}
          style={[styles.filterChip, onlyActive && styles.filterChipSelected]}
        >
          <Text style={[styles.filterLabel, onlyActive && styles.filterLabelSelected]}>
            Solo activos
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOnlyFavorites((value) => !value)}
          style={[styles.filterChip, onlyFavorites && styles.filterChipSelected]}
        >
          <Text
            style={[styles.filterLabel, onlyFavorites && styles.filterLabelSelected]}
          >
            Solo favoritos
          </Text>
        </Pressable>
      </View>

      <PrimaryButton
        label="Añadir material"
        onPress={() => navigation.navigate("EquipmentForm")}
      />

      {equipment.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No hay material para este filtro</Text>
          <Text style={styles.emptyText}>
            Ajusta los filtros o añade un nuevo elemento del gimnasio.
          </Text>
        </Card>
      ) : (
        equipment.map((item) => (
          <Card key={item.id}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>
              <Text style={styles.favoriteMark}>{item.isFavorite ? "★" : "☆"}</Text>
            </View>

            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
            {!item.isActive ? <Text style={styles.inactive}>Desactivado</Text> : null}

            <View style={styles.actions}>
              <SecondaryButton
                label={item.isFavorite ? "Quitar favorito" : "Marcar favorito"}
                onPress={() => void handleToggleFavorite(item)}
                style={styles.actionButton}
              />
              <SecondaryButton
                label="Editar"
                onPress={() =>
                  navigation.navigate("EquipmentForm", { equipmentId: item.id })
                }
                style={styles.actionButton}
              />
              <DangerButton
                label="Desactivar"
                onPress={() => handleDeactivate(item)}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ))
      )}
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
    fontSize: 15,
    lineHeight: 21,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  filterChip: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
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
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardCategory: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  favoriteMark: {
    color: theme.colors.warning,
    fontSize: 24,
  },
  notes: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  inactive: {
    color: theme.colors.danger,
    fontWeight: "700",
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
});

