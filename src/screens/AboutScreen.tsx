import { StyleSheet, Text } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { theme } from "../theme";
import { APP_NAME } from "../utils/constants";

export function AboutScreen() {
  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Acerca de</Text>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.meta}>
          App pensada para gestionar entrenamientos en un gimnasio personal en casa, rápida de usar
          en Android y centrada en trabajo offline.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Versión actual de la base</Text>
        <Text style={styles.meta}>
          Proyecto Expo + React Native con base de datos SQLite local y sin backend en esta fase.
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
  appName: {
    color: theme.colors.accent,
    fontSize: 26,
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
