import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { OptionSelector } from "../components/OptionSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createCardioSession } from "../repositories/cardioSessionRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { CardioIntensity, CardioType } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "CardioSession">;

const cardioTypeOptions: Array<{ label: string; value: CardioType }> = [
  { label: "Cinta de correr", value: "cinta de correr" },
  { label: "Bicicleta estática", value: "bicicleta estática" },
];

const intensityOptions: Array<{ label: string; value: CardioIntensity }> = [
  { label: "Suave", value: "suave" },
  { label: "Media", value: "media" },
  { label: "Alta", value: "alta" },
];

export function CardioSessionScreen({ navigation }: Props) {
  const { profile } = useAppState();
  const [cardioType, setCardioType] = useState<CardioType>("cinta de correr");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [intensity, setIntensity] = useState<CardioIntensity>("media");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    const duration = Number(durationMinutes);
    if (!duration || duration <= 0) {
      Alert.alert("Duración obligatoria", "Introduce una duración válida en minutos.");
      return;
    }

    try {
      setIsSaving(true);
      await createCardioSession({
        profileId: profile.id,
        cardioType,
        durationMinutes: duration,
        intensity,
        distance: distance.trim() ? Number(distance) : null,
        notes: notes.trim() || null,
      });

      Alert.alert("Cardio guardado", "La sesión de cardio se ha registrado correctamente.", [
        {
          text: "Aceptar",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "AppTabs" }],
            }),
        },
      ]);
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
        <Text style={styles.title}>Modo Cardio</Text>
        <Text style={styles.meta}>
          Registra una sesión simple de cinta o bicicleta sin entrar al flujo de fuerza.
        </Text>
      </Card>

      <Card>
        <OptionSelector
          label="Máquina"
          options={cardioTypeOptions}
          selectedValue={cardioType}
          onChange={setCardioType}
        />
        <OptionSelector
          label="Intensidad"
          options={intensityOptions}
          selectedValue={intensity}
          onChange={setIntensity}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Duración (minutos)</Text>
          <TextInput
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="20"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Distancia opcional</Text>
          <TextInput
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="Ej. 5.4"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, styles.multiline]}
            placeholder="Opcional"
            placeholderTextColor={theme.colors.textMuted}
            textAlignVertical="top"
          />
        </View>
      </Card>

      <PrimaryButton
        label={isSaving ? "Guardando..." : "Guardar sesión de cardio"}
        onPress={() => void handleSave()}
        disabled={isSaving}
      />
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
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "600",
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
  },
  multiline: {
    minHeight: 96,
  },
});
