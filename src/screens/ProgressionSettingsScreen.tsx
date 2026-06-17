import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export function ProgressionSettingsScreen() {
  const { settings, saveSettings, refreshSettings } = useAppState();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setEnabled(settings.progressionRecommendationsEnabled);
  }, [settings]);

  const handleSave = async () => {
    await saveSettings({
      progressionRecommendationsEnabled: enabled,
    });
    await refreshSettings();
    Alert.alert("Guardado", "La configuración de progresión se ha actualizado.");
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Progresión</Text>
        <Text style={styles.meta}>
          Activa o desactiva las recomendaciones simples de subida o ajuste de carga.
        </Text>
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.label}>Recomendaciones de progresión</Text>
            <Text style={styles.help}>
              Cuando estén activadas, la app mostrará sugerencias básicas tras revisar tus series.
            </Text>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
      </Card>

      <PrimaryButton label="Guardar ajustes" onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  help: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
