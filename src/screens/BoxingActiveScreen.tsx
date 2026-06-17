import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createBoxingRoundSession } from "../repositories/boxingRoundRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { openMusicUrl } from "../utils/music";

type Props = NativeStackScreenProps<RootStackParamList, "BoxingActive">;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function BoxingActiveScreen({ navigation, route }: Props) {
  const { profile, settings } = useAppState();
  const { totalRounds, roundDurationSeconds, restSeconds } = route.params;
  const [currentRound, setCurrentRound] = useState(1);
  const [state, setState] = useState<"golpeo" | "descanso">("golpeo");
  const [secondsLeft, setSecondsLeft] = useState(roundDurationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(0);
  const startedAtRef = useRef(new Date().toISOString());
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (secondsLeft !== 0) {
      return;
    }

    if (state === "golpeo") {
      const nextCompleted = completedRounds + 1;
      setCompletedRounds(nextCompleted);

      if (currentRound >= totalRounds) {
        void finalizeSession(nextCompleted);
        return;
      }

      setState("descanso");
      setSecondsLeft(restSeconds);
      return;
    }

    setState("golpeo");
    setCurrentRound((value) => value + 1);
    setSecondsLeft(roundDurationSeconds);
  }, [completedRounds, currentRound, restSeconds, roundDurationSeconds, secondsLeft, state, totalRounds]);

  const finalizeSession = async (roundsDone = completedRounds) => {
    if (!profile || isSavingRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;
      await createBoxingRoundSession({
        profileId: profile.id,
        totalRounds,
        roundDurationSeconds,
        restSeconds,
        completedRounds: roundsDone,
        startedAt: startedAtRef.current,
        finishedAt: new Date().toISOString(),
      });

      Alert.alert("Sesión guardada", "La sesión de boxeo se ha guardado correctamente.", [
        {
          text: "Aceptar",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "AppTabs" }],
            }),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      isSavingRef.current = false;
    }
  };

  const statusLabel = useMemo(
    () => (state === "golpeo" ? "Golpeo" : "Descanso"),
    [state],
  );

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Boxeo por rondas</Text>
        <Text style={styles.roundLabel}>
          Ronda {currentRound} de {totalRounds}
        </Text>
        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.status}>Estado: {statusLabel}</Text>
      </Card>

      <PrimaryButton
        label={isPaused ? "Reanudar" : "Pausar"}
        onPress={() => setIsPaused((value) => !value)}
      />
      <SecondaryButton
        label="Abrir música"
        onPress={() => void openMusicUrl(settings, "boxing")}
      />
      <SecondaryButton label="Finalizar" onPress={() => void finalizeSession()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  roundLabel: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  timer: {
    color: theme.colors.accent,
    fontSize: 52,
    fontWeight: "800",
    textAlign: "center",
  },
  status: {
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
});
