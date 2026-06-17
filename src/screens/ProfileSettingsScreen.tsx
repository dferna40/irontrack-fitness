import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export function ProfileSettingsScreen() {
  const { profile } = useAppState();

  if (!profile) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>No hay perfil local disponible.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Perfil local</Text>
        <Text style={styles.meta}>
          Información base del perfil activo en este dispositivo.
        </Text>
      </Card>

      <Card>
        <InfoRow label="Nombre" value={profile.name} />
        <InfoRow label="Objetivo" value={profile.goal} />
        <InfoRow
          label="Nivel"
          value={
            profile.level === "beginner"
              ? "Principiante"
              : profile.level === "intermediate"
                ? "Intermedio"
                : "Avanzado"
          }
        />
        <InfoRow label="Unidad de peso" value={profile.weightUnit} />
        <InfoRow label="Unidad de distancia" value={profile.distanceUnit} />
        <InfoRow label="Tema" value={profile.preferredTheme} />
        <InfoRow label="Color principal" value={profile.accentColor} />
      </Card>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  row: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
