import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { requestLocalNotificationPermissions } from "../services/notifications";
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
  const [rememberFocusMode, setRememberFocusMode] = useState(false);
  const [largeSessionThumbnails, setLargeSessionThumbnails] = useState(false);

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
    setRememberFocusMode(settings.rememberFocusMode);
    setLargeSessionThumbnails(settings.largeSessionThumbnails);
  }, [settings]);

  const handleSave = async () => {
    let nextLocalNotificationEnabled = localNotificationEnabled;

    if (localNotificationEnabled) {
      const permissionResult = await requestLocalNotificationPermissions();

      if (!permissionResult.supported) {
        nextLocalNotificationEnabled = false;
        Alert.alert(
          "No disponible en Expo Go",
          "Las notificaciones locales del temporizador no estan disponibles en Expo Go. Para probarlas necesitaras una build de desarrollo o una app compilada.",
        );
      } else if (!permissionResult.granted) {
        Alert.alert(
          "Permiso necesario",
          "Sin permiso de notificaciones no se podran mostrar avisos locales.",
        );
      }
    }

    await saveSettings({
      defaultRestSeconds: Number(defaultRestSeconds || 60),
      autoStartRest,
      progressionRecommendationsEnabled,
      soundEnabled,
      vibrationEnabled,
      localNotificationEnabled: nextLocalNotificationEnabled,
      keepScreenAwake,
      quickAdd15Enabled: quick15,
      quickAdd30Enabled: quick30,
      quickAdd60Enabled: quick60,
      rememberFocusMode,
      largeSessionThumbnails,
    });

    await refreshSettings();
    Alert.alert("Guardado", "La configuracion se ha actualizado.");
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

        <SwitchRow label="Inicio automatico" value={autoStartRest} onValueChange={setAutoStartRest} />
        <SwitchRow
          label="Recomendaciones de progresion"
          value={progressionRecommendationsEnabled}
          onValueChange={setProgressionRecommendationsEnabled}
        />
        <SwitchRow label="Sonido activado" value={soundEnabled} onValueChange={setSoundEnabled} />
        <SwitchRow label="Vibracion activada" value={vibrationEnabled} onValueChange={setVibrationEnabled} />
        <SwitchRow
          label="Notificacion local activada"
          value={localNotificationEnabled}
          onValueChange={setLocalNotificationEnabled}
        />
        <SwitchRow
          label="Mantener pantalla activa"
          value={keepScreenAwake}
          onValueChange={setKeepScreenAwake}
        />
        <SwitchRow
          label="Recordar modo foco"
          value={rememberFocusMode}
          onValueChange={setRememberFocusMode}
        />
        <SwitchRow
          label="Miniaturas grandes en Ver sesion"
          value={largeSessionThumbnails}
          onValueChange={setLargeSessionThumbnails}
        />
        <SwitchRow label="Boton rapido +15" value={quick15} onValueChange={setQuick15} />
        <SwitchRow label="Boton rapido +30" value={quick30} onValueChange={setQuick30} />
        <SwitchRow label="Boton rapido +60" value={quick60} onValueChange={setQuick60} />
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
