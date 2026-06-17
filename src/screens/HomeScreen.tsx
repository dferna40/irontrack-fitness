import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.kicker}>GYM OFFLINE</Text>
        <Text style={styles.title}>
          {profile ? `Hola, ${profile.name}` : "Bienvenido a IronTrack"}
        </Text>
        <Text style={styles.subtitle}>
          Base lista para registrar tus entrenamientos en casa de forma rápida,
          práctica y centrada en Android.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Accesos rápidos</Text>
        <View style={styles.buttonGroup}>
          <PrimaryButton
            label="Ver material"
            onPress={() => navigation.navigate("Equipment")}
          />
          <SecondaryButton
            label="Historial"
            onPress={() => navigation.navigate("History")}
          />
          <SecondaryButton
            label="Progreso"
            onPress={() => navigation.navigate("Progress")}
          />
        </View>
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
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  buttonGroup: {
    gap: theme.spacing.md,
  },
});
