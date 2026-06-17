import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TrainScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { session, currentExercise } = useTrainingSession();

  if (!session || !currentExercise) {
    return (
      <ScreenContainer>
        <Card>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "800" }}>
            Entrenar
          </Text>
          <Text style={{ color: theme.colors.textMuted, lineHeight: 20 }}>
            Elige si quieres hacer fuerza libre o registrar una sesión rápida de cardio.
          </Text>
          <PrimaryButton
            label="Entrenamiento libre"
            onPress={() => navigation.navigate("FreeWorkoutSetup")}
          />
          <SecondaryButton
            label="Modo cardio"
            onPress={() => navigation.navigate("CardioSession")}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "800" }}>
          Sesión activa
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>
          {session.workoutType === "free"
            ? "Modo: Entrenamiento libre"
            : `Rutina: ${session.routineName}`}
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>
          Ejercicio actual: {currentExercise.name}
        </Text>
        <PrimaryButton
          label="Volver al entrenamiento"
          onPress={() => navigation.navigate("ActiveWorkout")}
        />
        {session.workoutType === "routine" && session.routineId ? (
          <SecondaryButton
            label="Ver rutina"
            onPress={() =>
              navigation.navigate("RoutineDetail", { routineId: session.routineId as number })
            }
          />
        ) : null}
      </Card>
    </ScreenContainer>
  );
}
