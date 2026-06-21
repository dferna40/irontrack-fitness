import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
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
          <Text style={styles.title}>Entrenar</Text>
          <Text style={styles.meta}>
          Empieza una sesión de fuerza con tus rutinas, lanza un entrenamiento libre o registra
            cardio y boxeo.
          </Text>

          <View style={styles.modeGroup}>
            <Text style={styles.sectionLabel}>Fuerza</Text>
            <PrimaryButton
              label="Modo fuerza"
              onPress={() => navigation.navigate("StrengthMode")}
            />
            <Text style={styles.helperText}>
              Elige la rutina del grupo muscular que quieras entrenar hoy.
            </Text>
          </View>

          <View style={styles.modeGroup}>
            <Text style={styles.sectionLabel}>Flexible</Text>
            <SecondaryButton
              label="Entrenamiento libre"
              onPress={() => navigation.navigate("FreeWorkoutSetup")}
            />
            <Text style={styles.helperText}>
              Para sesiones sin rutina cerrada, a tu ritmo y con ejercicios manuales.
            </Text>
          </View>

          <View style={styles.modeGroup}>
            <Text style={styles.sectionLabel}>Cardio y boxeo</Text>
            <SecondaryButton
              label="Modo cardio"
              onPress={() => navigation.navigate("CardioSession")}
            />
            <SecondaryButton
              label="Boxeo por rondas"
              onPress={() => navigation.navigate("BoxingSetup")}
            />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
          <Text style={styles.title}>Sesión activa</Text>
        <Text style={styles.meta}>
          {session.workoutType === "free"
            ? "Modo: Entrenamiento libre"
            : `Rutina: ${session.routineName}`}
        </Text>
        <Text style={styles.meta}>Ejercicio actual: {currentExercise.name}</Text>
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

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    fontSize: 15,
  },
  modeGroup: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionLabel: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  helperText: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
});
