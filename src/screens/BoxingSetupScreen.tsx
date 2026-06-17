import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useState } from "react";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "BoxingSetup">;

export function BoxingSetupScreen({ navigation }: Props) {
  const [rounds, setRounds] = useState("6");
  const [roundDuration, setRoundDuration] = useState("180");
  const [restSeconds, setRestSeconds] = useState("60");

  const startBoxing = () => {
    const totalRounds = Number(rounds);
    const roundDurationSeconds = Number(roundDuration);
    const restDurationSeconds = Number(restSeconds);

    if (!totalRounds || !roundDurationSeconds || restDurationSeconds < 0) {
      Alert.alert("Configuración inválida", "Revisa rondas, duración y descanso.");
      return;
    }

    navigation.navigate("BoxingActive", {
      totalRounds,
      roundDurationSeconds,
      restSeconds: restDurationSeconds,
    });
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Boxeo por rondas</Text>
        <Text style={styles.meta}>
          Configura rounds y descanso para trabajar con el saco de boxeo.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Número de rondas</Text>
        <TextInput
          value={rounds}
          onChangeText={setRounds}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="6"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>Duración de cada ronda (segundos)</Text>
        <TextInput
          value={roundDuration}
          onChangeText={setRoundDuration}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="180"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>Descanso entre rondas (segundos)</Text>
        <TextInput
          value={restSeconds}
          onChangeText={setRestSeconds}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="60"
          placeholderTextColor={theme.colors.textMuted}
        />
      </Card>

      <PrimaryButton label="Empezar boxeo" onPress={startBoxing} />
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
    lineHeight: 20,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
});

