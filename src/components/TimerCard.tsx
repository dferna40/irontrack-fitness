import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { theme } from "../theme";

interface TimerCardProps {
  initialSeconds: number;
  autoStart?: boolean;
  showQuick15?: boolean;
  showQuick30?: boolean;
  showQuick60?: boolean;
  onFinish?: () => void;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerCard({
  initialSeconds,
  autoStart = false,
  showQuick15 = true,
  showQuick30 = true,
  showQuick60 = true,
  onFinish,
}: TimerCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(autoStart);
  }, [autoStart, initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onFinish?.();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onFinish]);

  const isFinished = secondsLeft === 0;
  const statusLabel = useMemo(() => {
    if (isFinished) {
      return "Descanso completado";
    }

    return isRunning ? "Contando descanso" : "Temporizador en pausa";
  }, [isFinished, isRunning]);

  return (
    <Card>
      <Text style={styles.label}>Descanso</Text>
      <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
      <Text style={styles.status}>{statusLabel}</Text>

      <View style={styles.row}>
        {!isRunning && secondsLeft === initialSeconds ? (
          <PrimaryButton label="Iniciar" onPress={() => setIsRunning(true)} style={styles.button} />
        ) : null}
        {isRunning ? (
          <SecondaryButton label="Pausar" onPress={() => setIsRunning(false)} style={styles.button} />
        ) : null}
        {!isRunning && secondsLeft < initialSeconds && secondsLeft > 0 ? (
          <PrimaryButton label="Reanudar" onPress={() => setIsRunning(true)} style={styles.button} />
        ) : null}
        <SecondaryButton label="Saltar" onPress={() => setSecondsLeft(0)} style={styles.button} />
      </View>

      <View style={styles.row}>
        {showQuick15 ? (
          <SecondaryButton
            label="+15 s"
            onPress={() => setSecondsLeft((current) => current + 15)}
            style={styles.button}
          />
        ) : null}
        {showQuick30 ? (
          <SecondaryButton
            label="+30 s"
            onPress={() => setSecondsLeft((current) => current + 30)}
            style={styles.button}
          />
        ) : null}
        {showQuick60 ? (
          <SecondaryButton
            label="+60 s"
            onPress={() => setSecondsLeft((current) => current + 60)}
            style={styles.button}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  time: {
    color: theme.colors.accent,
    fontSize: 44,
    fontWeight: "800",
    textAlign: "center",
  },
  status: {
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  button: {
    flexGrow: 1,
    flexBasis: 120,
  },
});
