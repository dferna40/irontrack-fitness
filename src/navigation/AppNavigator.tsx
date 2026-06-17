import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { EquipmentFormScreen } from "../screens/EquipmentFormScreen";
import { EquipmentScreen } from "../screens/EquipmentScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { ExerciseFormScreen } from "../screens/ExerciseFormScreen";
import { ExerciseTechniqueScreen } from "../screens/ExerciseTechniqueScreen";
import { ExercisesScreen } from "../screens/ExercisesScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { RoutinesScreen } from "../screens/RoutinesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TrainScreen } from "../screens/TrainScreen";
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
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: "Historial" }}
          />
          <Stack.Screen
            name="Progress"
            component={ProgressScreen}
            options={{ title: "Progreso" }}
          />
          <Stack.Screen
            name="Equipment"
            component={EquipmentScreen}
            options={({ navigation }) => ({
              title: "Material del gimnasio",
              headerRight: () => (
                <HeaderAction
                  label="Nuevo"
                  onPress={() => navigation.navigate("EquipmentForm")}
                />
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
        </>
      )}
    </Stack.Navigator>
  );
}
