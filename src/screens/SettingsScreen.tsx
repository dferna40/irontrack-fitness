import type { ReactNode } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.description}>
          Organiza ajustes locales y accesos rápidos sin salir del flujo principal de la app.
        </Text>
      </View>

      <SettingsSection title="Gestión">
        <SettingsLink label="Perfil" onPress={() => navigation.navigate("ProfileSettings")} />
        <SettingsLink label="Material" onPress={() => navigation.navigate("Equipment")} />
        <SettingsLink
          label="Ejercicios"
          onPress={() => navigation.navigate("ExercisesLibrary")}
        />
        <SettingsLink label="Rutinas" onPress={() => navigation.navigate("RoutinesLibrary")} />
      </SettingsSection>

      <SettingsSection title="Entrenamiento">
        <SettingsLink
          label="Temporizador"
          onPress={() => navigation.navigate("TimerSettings")}
        />
        <SettingsLink
          label="Progresión"
          onPress={() => navigation.navigate("ProgressionSettings")}
        />
      </SettingsSection>

      <SettingsSection title="Multimedia">
        <SettingsLink label="Música" onPress={() => navigation.navigate("MusicSettings")} />
        <SettingsLink
          label="Apariencia"
          onPress={() => navigation.navigate("AppearanceSettings")}
        />
      </SettingsSection>

      <SettingsSection title="Datos">
        <SettingsLink
          label="Datos y copia de seguridad"
          onPress={() => navigation.navigate("DataBackup")}
        />
      </SettingsSection>

      <SettingsSection title="App">
        <SettingsLink label="Acerca de" onPress={() => navigation.navigate("About")} />
      </SettingsSection>
    </ScreenContainer>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.links}>{children}</View>
    </Card>
  );
}

function SettingsLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  links: {
    gap: theme.spacing.xs,
  },
  link: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  linkLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  linkArrow: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: "700",
  },
});
