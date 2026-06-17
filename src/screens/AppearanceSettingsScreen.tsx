import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export function AppearanceSettingsScreen() {
  const { profile } = useAppState();

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Apariencia</Text>
        <Text style={styles.meta}>
          Base preparada para futuras opciones visuales sin cambiar todavía el tema desde aquí.
        </Text>
      </Card>

      <Card>
        <InfoRow label="Tema activo" value={profile?.preferredTheme ?? "dark"} />
        <View style={styles.row}>
          <Text style={styles.label}>Color principal</Text>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: profile?.accentColor ?? theme.colors.accent },
              ]}
            />
            <Text style={styles.value}>{profile?.accentColor ?? theme.colors.accent}</Text>
          </View>
        </View>
        <Text style={styles.help}>
          La edición visual avanzada queda reservada para la fase de personalización.
        </Text>
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
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  help: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
