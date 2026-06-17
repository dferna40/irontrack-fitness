import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStateProvider, useAppState } from "./src/services/app-state";
import { TrainingSessionProvider } from "./src/services/training-session";
import { theme } from "./src/theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.colors.accent,
    text: theme.colors.text,
    notification: theme.colors.accent,
  },
};

function AppContent() {
  const { isReady, error } = useAppState();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
        }}
      >
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <Text style={{ color: theme.colors.textMuted }}>
          Preparando IronTrack Fitness...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Error al iniciar la app
        </Text>
        <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <TrainingSessionProvider>
        <AppContent />
      </TrainingSessionProvider>
    </AppStateProvider>
  );
}
