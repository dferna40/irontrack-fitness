import { StyleSheet, Text } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { theme } from "../theme";

export function DataBackupScreen() {
  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Datos y copia de seguridad</Text>
        <Text style={styles.meta}>
          Esta sección queda preparada para exportación local, importación y copias de seguridad.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Estado actual</Text>
        <Text style={styles.meta}>
          La app funciona principalmente offline con SQLite local. La gestión de copias todavía no
          está implementada en esta fase.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
