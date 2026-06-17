import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import {
  createEquipment,
  getEquipmentById,
  updateEquipment,
} from "../repositories/equipmentRepository";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentForm">;

export function EquipmentFormScreen({ navigation, route }: Props) {
  const { profile } = useAppState();
  const equipmentId = route.params?.equipmentId;
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      if (!equipmentId) {
        return;
      }

      try {
        setIsLoading(true);
        const item = await getEquipmentById(equipmentId);

        if (!item) {
          Alert.alert("Material no encontrado", "No se ha podido cargar el material.");
          navigation.goBack();
          return;
        }

        setName(item.name);
        setCategory(item.category);
        setDescription(item.description ?? "");
        setNotes(item.notes ?? "");
        setIsFavorite(item.isFavorite);
        setIsActive(item.isActive);
      } catch (error) {
        Alert.alert(
          "No se pudo cargar",
          error instanceof Error ? error.message : "Inténtalo de nuevo.",
        );
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    void loadItem();
  }, [equipmentId, navigation]);

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    if (!name.trim()) {
      Alert.alert("Nombre obligatorio", "El nombre del material es obligatorio.");
      return;
    }

    try {
      setIsSaving(true);

      if (equipmentId) {
        await updateEquipment({
          id: equipmentId,
          profileId: profile.id,
          name,
          category: category.trim() || "General",
          description,
          notes,
          isFavorite,
          isActive,
        });
      } else {
        await createEquipment({
          profileId: profile.id,
          name,
          category: category.trim() || "General",
          description,
          notes,
          isFavorite,
          isActive,
        });
      }

      navigation.goBack();
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
        <Text style={styles.title}>
          {equipmentId ? "Editar material" : "Nuevo material"}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            editable={!isLoading}
            onChangeText={setName}
            placeholder="Ej. Mancuernas ajustables"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoría</Text>
          <TextInput
            editable={!isLoading}
            onChangeText={setCategory}
            placeholder="Ej. Peso libre"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={category}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            editable={!isLoading}
            multiline
            onChangeText={setDescription}
            placeholder="Descripción opcional"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            textAlignVertical="top"
            value={description}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            editable={!isLoading}
            multiline
            onChangeText={setNotes}
            placeholder="Observaciones o detalles"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiline]}
            textAlignVertical="top"
            value={notes}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Favorito</Text>
          <Switch
            onValueChange={setIsFavorite}
            thumbColor={isFavorite ? theme.colors.accent : "#d1d5db"}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.accentSoft,
            }}
            value={isFavorite}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Activo</Text>
          <Switch
            onValueChange={setIsActive}
            thumbColor={isActive ? theme.colors.accent : "#d1d5db"}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.accentSoft,
            }}
            value={isActive}
          />
        </View>

        <PrimaryButton
          disabled={isSaving || isLoading}
          label={isSaving ? "Guardando..." : "Guardar material"}
          onPress={() => void handleSave()}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
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
});
