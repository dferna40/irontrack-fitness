import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import * as Notifications from "expo-notifications";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export function TimerSettingsScreen() {
  const { settings, saveSettings, refreshSettings } = useAppState();
  const [defaultRestSeconds, setDefaultRestSeconds] = useState("60");
  const [autoStartRest, setAutoStartRest] = useState(true);
  const [progressionRecommendationsEnabled, setProgressionRecommendationsEnabled] =
    useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [localNotificationEnabled, setLocalNotificationEnabled] = useState(false);
  const [keepScreenAwake, setKeepScreenAwake] = useState(true);
  const [quick15, setQuick15] = useState(true);
  const [quick30, setQuick30] = useState(true);
  const [quick60, setQuick60] = useState(true);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setDefaultRestSeconds(String(settings.defaultRestSeconds));
    setAutoStartRest(settings.autoStartRest);
    setProgressionRecommendationsEnabled(settings.progressionRecommendationsEnabled);
    setSoundEnabled(settings.soundEnabled);
    setVibrationEnabled(settings.vibrationEnabled);
    setLocalNotificationEnabled(settings.localNotificationEnabled);
    setKeepScreenAwake(settings.keepScreenAwake);
    setQuick15(settings.quickAdd15Enabled);
    setQuick30(settings.quickAdd30Enabled);
    setQuick60(settings.quickAdd60Enabled);
  }, [settings]);

  const handleSave = async () => {
    if (localNotificationEnabled) {
      const permissions = await Notifications.requestPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          "Permiso necesario",
          "Sin permiso de notificaciones no se podrán mostrar avisos locales.",
        );
      }
    }

    await saveSettings({
      defaultRestSeconds: Number(defaultRestSeconds || 60),
      autoStartRest,
      progressionRecommendationsEnabled,
      soundEnabled,
      vibrationEnabled,
      localNotificationEnabled,
      keepScreenAwake,
      quickAdd15Enabled: quick15,
      quickAdd30Enabled: quick30,
      quickAdd60Enabled: quick60,
    });

    await refreshSettings();
    Alert.alert("Guardado", "La configuración se ha actualizado.");
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Temporizador y progreso</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Descanso por defecto</Text>
          <TextInput
            value={defaultRestSeconds}
            onChangeText={setDefaultRestSeconds}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="60"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <SwitchRow label="Inicio automático" value={autoStartRest} onValueChange={setAutoStartRest} />
        <SwitchRow
          label="Recomendaciones de progresión"
          value={progressionRecommendationsEnabled}
          onValueChange={setProgressionRecommendationsEnabled}
        />
        <SwitchRow label="Sonido activado" value={soundEnabled} onValueChange={setSoundEnabled} />
        <SwitchRow label="Vibración activada" value={vibrationEnabled} onValueChange={setVibrationEnabled} />
        <SwitchRow
          label="Notificación local activada"
          value={localNotificationEnabled}
          onValueChange={setLocalNotificationEnabled}
        />
        <SwitchRow
          label="Mantener pantalla activa"
          value={keepScreenAwake}
          onValueChange={setKeepScreenAwake}
        />
        <SwitchRow label="Botón rápido +15" value={quick15} onValueChange={setQuick15} />
        <SwitchRow label="Botón rápido +30" value={quick30} onValueChange={setQuick30} />
        <SwitchRow label="Botón rápido +60" value={quick60} onValueChange={setQuick60} />
      </Card>

      <PrimaryButton label="Guardar ajustes" onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "600",
    flex: 1,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
});
