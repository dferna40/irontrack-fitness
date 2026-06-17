import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../theme";
import { PlaceholderScreen } from "./Shared";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ExercisesScreen() {
  const navigation = useNavigation<NavigationProp>();
  return (
    <PlaceholderScreen
      title="Ejercicios"
      description="Catálogo pendiente para una fase posterior. De momento dejamos el acceso al material configurado del gimnasio."
    >
      <Card>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>
          Material del gimnasio
        </Text>
        <Text style={{ color: theme.colors.textMuted, lineHeight: 20 }}>
          Gestiona aquí el equipo disponible antes de asociarlo a ejercicios y rutinas.
        </Text>
        <PrimaryButton
          label="Abrir material"
          onPress={() => navigation.navigate("Equipment")}
        />
      </Card>
    </PlaceholderScreen>
  );
}
