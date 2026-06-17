import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export function MusicSettingsScreen() {
  const { settings, saveSettings, refreshSettings } = useAppState();
  const [weightsPlaylistUrl, setWeightsPlaylistUrl] = useState("");
  const [cardioPlaylistUrl, setCardioPlaylistUrl] = useState("");
  const [boxingPlaylistUrl, setBoxingPlaylistUrl] = useState("");
  const [stretchingPlaylistUrl, setStretchingPlaylistUrl] = useState("");

  useEffect(() => {
    if (!settings) {
      return;
    }

    setWeightsPlaylistUrl(settings.weightsPlaylistUrl ?? "");
    setCardioPlaylistUrl(settings.cardioPlaylistUrl ?? "");
    setBoxingPlaylistUrl(settings.boxingPlaylistUrl ?? "");
    setStretchingPlaylistUrl(settings.stretchingPlaylistUrl ?? "");
  }, [settings]);

  const isValidExternalUrl = (value: string) => {
    if (!value.trim()) {
      return true;
    }

    try {
      const url = new URL(value.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const entries = [
      { label: "Playlist de pesas", value: weightsPlaylistUrl },
      { label: "Playlist de cardio", value: cardioPlaylistUrl },
      { label: "Playlist de boxeo", value: boxingPlaylistUrl },
      { label: "Playlist de estiramientos", value: stretchingPlaylistUrl },
    ];

    const invalid = entries.find((entry) => !isValidExternalUrl(entry.value));
    if (invalid) {
      Alert.alert(
        "URL inválida",
        `${invalid.label} debe empezar por http:// o https://`,
      );
      return;
    }

    await saveSettings({
      weightsPlaylistUrl: weightsPlaylistUrl.trim() || null,
      cardioPlaylistUrl: cardioPlaylistUrl.trim() || null,
      boxingPlaylistUrl: boxingPlaylistUrl.trim() || null,
      stretchingPlaylistUrl: stretchingPlaylistUrl.trim() || null,
    });

    await refreshSettings();
    Alert.alert("Guardado", "Las URLs de música se han actualizado.");
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Música externa</Text>
        <Text style={styles.meta}>
          Guarda enlaces externos para abrir tus playlists sin reproducir música dentro de la app.
        </Text>
      </Card>

      <Card>
        <UrlField
          label="Playlist de pesas"
          value={weightsPlaylistUrl}
          onChangeText={setWeightsPlaylistUrl}
          placeholder="https://..."
        />
        <UrlField
          label="Playlist de cardio"
          value={cardioPlaylistUrl}
          onChangeText={setCardioPlaylistUrl}
          placeholder="https://..."
        />
        <UrlField
          label="Playlist de boxeo"
          value={boxingPlaylistUrl}
          onChangeText={setBoxingPlaylistUrl}
          placeholder="https://..."
        />
        <UrlField
          label="Playlist de estiramientos"
          value={stretchingPlaylistUrl}
          onChangeText={setStretchingPlaylistUrl}
          placeholder="https://..."
        />
      </Card>

      <PrimaryButton label="Guardar URLs" onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}

function UrlField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
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
  },
});
