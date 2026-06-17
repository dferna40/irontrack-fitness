import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Card } from "../components/Card";
import { SecondaryButton } from "../components/SecondaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../theme";
import { PlaceholderScreen } from "./Shared";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  return (
    <PlaceholderScreen
      title="Configuración"
      description="Preparada para ajustes locales, copias de seguridad y personalización futura."
    >
      <Card>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>
          Material del gimnasio
        </Text>
        <Text style={{ color: theme.colors.textMuted, lineHeight: 20 }}>
          Acceso rápido para mantener actualizado el equipo disponible.
        </Text>
        <SecondaryButton
          label="Gestionar material"
          onPress={() => navigation.navigate("Equipment")}
        />
      </Card>
    </PlaceholderScreen>
  );
}
