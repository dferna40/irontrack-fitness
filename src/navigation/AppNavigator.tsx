import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ActiveWorkoutScreen } from "../screens/ActiveWorkoutScreen";
import { CardioSessionScreen } from "../screens/CardioSessionScreen";
import { EquipmentFormScreen } from "../screens/EquipmentFormScreen";
import { EquipmentScreen } from "../screens/EquipmentScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { ExerciseFormScreen } from "../screens/ExerciseFormScreen";
import { ExerciseProgressDetailScreen } from "../screens/ExerciseProgressDetailScreen";
import { ExerciseTechniqueScreen } from "../screens/ExerciseTechniqueScreen";
import { ExercisesScreen } from "../screens/ExercisesScreen";
import { FreeWorkoutSetupScreen } from "../screens/FreeWorkoutSetupScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { RoutineDetailScreen } from "../screens/RoutineDetailScreen";
import { RoutineFormScreen } from "../screens/RoutineFormScreen";
import { RoutinesScreen } from "../screens/RoutinesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TimerSettingsScreen } from "../screens/TimerSettingsScreen";
import { TrainScreen } from "../screens/TrainScreen";
import { WorkoutDetailScreen } from "../screens/WorkoutDetailScreen";
import { WorkoutSummaryScreen } from "../screens/WorkoutSummaryScreen";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";

export type RootStackParamList = {
  AppTabs: undefined;
  Onboarding: undefined;
  History: undefined;
  Progress: undefined;
  Equipment: undefined;
  EquipmentForm: { equipmentId?: number } | undefined;
  ExerciseDetail: { exerciseId: number };
  ExerciseForm: { exerciseId?: number } | undefined;
  ExerciseTechnique: { exerciseId: number };
  ExerciseProgressDetail: { exerciseId: number };
  FreeWorkoutSetup: undefined;
  CardioSession: undefined;
  RoutineDetail: { routineId: number };
  RoutineForm: { routineId?: number } | undefined;
  ActiveWorkout: undefined;
  WorkoutSummary: undefined;
  WorkoutDetail: { workoutId: number };
  TimerSettings: undefined;
};

export type AppTabParamList = {
  Inicio: undefined;
  Entrenar: undefined;
  Ejercicios: undefined;
  Rutinas: undefined;
  Configuracion: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

function HeaderAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      style={{ minHeight: 36, paddingHorizontal: 12 }}
    />
  );
}

function AppTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 14 }}>•</Text>,
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Entrenar" component={TrainScreen} />
      <Tab.Screen name="Ejercicios" component={ExercisesScreen} />
      <Tab.Screen name="Rutinas" component={RoutinesScreen} />
      <Tab.Screen
        name="Configuracion"
        component={SettingsScreen}
        options={{ title: "Configuración" }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { profile } = useAppState();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!profile ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="AppTabs"
            component={AppTabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Historial" }} />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: "Progreso" }} />
          <Stack.Screen
            name="Equipment"
            component={EquipmentScreen}
            options={({ navigation }) => ({
              title: "Material del gimnasio",
              headerRight: () => (
                <HeaderAction label="Nuevo" onPress={() => navigation.navigate("EquipmentForm")} />
              ),
            })}
          />
          <Stack.Screen
            name="EquipmentForm"
            component={EquipmentFormScreen}
            options={({ route }) => ({
              title: route.params?.equipmentId ? "Editar material" : "Nuevo material",
            })}
          />
          <Stack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
            options={({ navigation, route }) => ({
              title: "Detalle de ejercicio",
              headerRight: () => (
                <HeaderAction
                  label="Editar"
                  onPress={() =>
                    navigation.navigate("ExerciseForm", { exerciseId: route.params.exerciseId })
                  }
                />
              ),
            })}
          />
          <Stack.Screen
            name="ExerciseForm"
            component={ExerciseFormScreen}
            options={({ route }) => ({
              title: route.params?.exerciseId ? "Editar ejercicio" : "Nuevo ejercicio",
            })}
          />
          <Stack.Screen
            name="ExerciseTechnique"
            component={ExerciseTechniqueScreen}
            options={{ title: "Ver técnica" }}
          />
          <Stack.Screen
            name="ExerciseProgressDetail"
            component={ExerciseProgressDetailScreen}
            options={{ title: "Progreso por ejercicio" }}
          />
          <Stack.Screen
            name="FreeWorkoutSetup"
            component={FreeWorkoutSetupScreen}
            options={{ title: "Entrenamiento libre" }}
          />
          <Stack.Screen
            name="CardioSession"
            component={CardioSessionScreen}
            options={{ title: "Modo cardio" }}
          />
          <Stack.Screen
            name="RoutineDetail"
            component={RoutineDetailScreen}
            options={({ navigation, route }) => ({
              title: "Detalle de rutina",
              headerRight: () => (
                <HeaderAction
                  label="Editar"
                  onPress={() =>
                    navigation.navigate("RoutineForm", { routineId: route.params.routineId })
                  }
                />
              ),
            })}
          />
          <Stack.Screen
            name="RoutineForm"
            component={RoutineFormScreen}
            options={({ route }) => ({
              title: route.params?.routineId ? "Editar rutina" : "Nueva rutina",
            })}
          />
          <Stack.Screen
            name="ActiveWorkout"
            component={ActiveWorkoutScreen}
            options={{ title: "Entrenamiento activo" }}
          />
          <Stack.Screen
            name="WorkoutSummary"
            component={WorkoutSummaryScreen}
            options={{ title: "Finalizar entrenamiento" }}
          />
          <Stack.Screen
            name="WorkoutDetail"
            component={WorkoutDetailScreen}
            options={{ title: "Detalle de entrenamiento" }}
          />
          <Stack.Screen
            name="TimerSettings"
            component={TimerSettingsScreen}
            options={{ title: "Temporizador" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
