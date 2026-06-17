import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { OptionSelector } from "../components/OptionSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { createProfile } from "../repositories/userProfileRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import {
  accentColorOptions,
  distanceUnitOptions,
  profileGoalOptions,
  profileLevelOptions,
  themeOptions,
  weightUnitOptions,
} from "../utils/constants";
import { ProfileLevel, ThemeMode } from "../types/models";

export function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(profileGoalOptions[0]);
  const [level, setLevel] = useState<ProfileLevel>("beginner");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [preferredTheme, setPreferredTheme] = useState<ThemeMode>("dark");
  const [accentColor, setAccentColor] = useState(accentColorOptions[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Nombre obligatorio", "Introduce un nombre para crear tu perfil local.");
      return;
    }

    try {
      setIsSubmitting(true);

      const profile = await createProfile({
        name,
        goal,
        level,
        weightUnit,
        distanceUnit,
        preferredTheme,
        accentColor,
      });

      await completeOnboarding(profile);
    } catch (error) {
      Alert.alert(
        "No se pudo crear el perfil",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.kicker}>IRONTRACK FITNESS</Text>
        <Text style={styles.title}>Tu gimnasio en casa, listo para empezar</Text>
        <Text style={styles.subtitle}>
          Crea un perfil local para arrancar rápido y mantener la app centrada
          en entrenamientos offline.
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Perfil inicial</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Ej. Sergio"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={name}
          />
        </View>

        <OptionSelector
          label="Objetivo"
          options={profileGoalOptions.map((item) => ({ label: item, value: item }))}
          selectedValue={goal}
          onChange={setGoal}
        />

        <OptionSelector
          label="Nivel"
          options={profileLevelOptions}
          selectedValue={level}
          onChange={setLevel}
        />

        <OptionSelector
          label="Unidad de peso"
          options={weightUnitOptions}
          selectedValue={weightUnit}
          onChange={setWeightUnit}
        />

        <OptionSelector
          label="Unidad de distancia"
          options={distanceUnitOptions}
          selectedValue={distanceUnit}
          onChange={setDistanceUnit}
        />

        <OptionSelector
          label="Tema inicial"
          options={themeOptions}
          selectedValue={preferredTheme}
          onChange={setPreferredTheme}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Color principal</Text>
          <View style={styles.colorRow}>
            {accentColorOptions.map((color) => {
              const isSelected = color === accentColor;

              return (
                <Pressable
                  key={color}
                  onPress={() => setAccentColor(color)}
                  style={[
                    styles.colorOuter,
                    isSelected && { borderColor: theme.colors.text },
                  ]}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      isSelected && styles.colorSelected,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          disabled={isSubmitting}
          label={isSubmitting ? "Creando perfil..." : "Crear perfil local"}
          onPress={() => void handleSubmit()}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
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
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  colorOuter: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: theme.radii.pill,
    padding: 4,
  },
  colorSwatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
});
