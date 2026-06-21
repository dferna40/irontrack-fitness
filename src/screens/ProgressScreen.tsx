import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { XpBar } from "../components/XpBar";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getWorkoutProgressSummary,
  listExerciseProgressSummary,
} from "../repositories/workoutRepository";
import { useAppState } from "../services/app-state";
import {
  getGamificationAchievements,
  getGamificationProgress,
} from "../services/gamification";
import { theme } from "../theme";
import {
  AchievementWithStatus,
  ExerciseProgressSummaryItem,
  GamificationProgress,
  WorkoutProgressSummary,
} from "../types/models";
import { repairTextEncoding } from "../utils/text";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(date: string | null) {
  if (!date) {
    return "Sin entrenamientos";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return repairTextEncoding(date);
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatWorkoutName(name: string | null) {
  if (!name) {
    return "Sin entrenamientos";
  }

  if (name === "routine") {
    return "Entrenamiento de rutina";
  }

  if (name === "free") {
    return "Entrenamiento libre";
  }

  return repairTextEncoding(name);
}

function formatVolume(volume: number) {
  return `${Math.round(volume * 100) / 100} kg`;
}

function getAchievementIcon(achievement: AchievementWithStatus) {
  if (achievement.icon) {
    return achievement.icon as keyof typeof MaterialCommunityIcons.glyphMap;
  }

  return achievement.isUnlocked ? "trophy" : "lock-outline";
}

export function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAppState();
  const [summary, setSummary] = useState<WorkoutProgressSummary | null>(null);
  const [exerciseItems, setExerciseItems] = useState<ExerciseProgressSummaryItem[]>([]);
  const [gamificationProgress, setGamificationProgress] = useState<GamificationProgress | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);

  const loadProgress = useCallback(async () => {
    if (!profile) {
      return;
    }

    const [nextSummary, nextExercises, nextGamificationProgress, nextAchievements] =
      await Promise.all([
        getWorkoutProgressSummary(profile.id),
        listExerciseProgressSummary(profile.id),
        getGamificationProgress(profile.id),
        getGamificationAchievements(profile.id),
      ]);

    setSummary(nextSummary);
    setExerciseItems(nextExercises);
    setGamificationProgress(nextGamificationProgress);
    setAchievements(nextAchievements);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress]),
  );

  const unlockedAchievements = useMemo(
    () => achievements.filter((item) => item.isUnlocked),
    [achievements],
  );
  const pendingAchievements = useMemo(
    () => achievements.filter((item) => !item.isUnlocked),
    [achievements],
  );

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Progreso</Text>
        <Text style={styles.subtitle}>
          Tu panel de nivel, XP, logros y evolución de entrenamiento en un formato cómodo para móvil.
        </Text>
      </View>

      <Card style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelCopy}>
            <Text style={styles.levelKicker}>GAMIFICACIÓN</Text>
            <Text style={styles.levelTitle}>
              Nivel {gamificationProgress?.profile.currentLevel ?? 1}
            </Text>
            <Text style={styles.levelMeta}>
              {gamificationProgress?.currentLevelTitle ?? "Novato"} ·{" "}
              {gamificationProgress?.profile.totalXp ?? 0} XP totales
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="trophy-outline" size={28} color={theme.colors.accent} />
          </View>
        </View>

        <XpBar
          currentLabel={
            gamificationProgress?.profile.nextLevelXp
              ? `${gamificationProgress.xpIntoCurrentLevel} XP en este nivel · faltan ${gamificationProgress.xpToNextLevel ?? 0} XP para nivel ${gamificationProgress.nextLevel}`
              : "Nivel máximo actual alcanzado"
          }
          progressPercent={gamificationProgress?.progressPercent ?? 0}
        />

        <View style={styles.metricGrid}>
          <MetricTile label="XP total" value={String(gamificationProgress?.profile.totalXp ?? 0)} />
          <MetricTile
            label="Siguiente nivel"
            value={gamificationProgress?.nextLevel ? `Nivel ${gamificationProgress.nextLevel}` : "-"}
          />
          <MetricTile
            label="Logros"
            value={String(gamificationProgress?.unlockedAchievementsCount ?? 0)}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Resumen general</Text>
        <View style={styles.metricGrid}>
          <MetricTile label="Semana" value={String(summary?.workoutsThisWeek ?? 0)} />
          <MetricTile label="Mes" value={String(summary?.workoutsThisMonth ?? 0)} />
          <MetricTile label="Series" value={String(summary?.totalSets ?? 0)} />
          <MetricTile label="Volumen" value={formatVolume(summary?.totalVolume ?? 0)} />
        </View>
        <View style={styles.lastWorkoutBlock}>
          <Text style={styles.metricLabel}>Último entrenamiento</Text>
          <Text style={styles.lastWorkoutName}>
            {formatWorkoutName(summary?.lastWorkoutName ?? null)}
          </Text>
          <Text style={styles.meta}>{formatDate(summary?.lastWorkoutDate ?? null)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Logros desbloqueados</Text>
        {unlockedAchievements.length ? (
          unlockedAchievements.map((achievement) => (
            <AchievementRow key={achievement.id} achievement={achievement} unlocked />
          ))
        ) : (
          <Text style={styles.meta}>Aún no has desbloqueado logros. Completa tu siguiente sesión para empezar.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Logros pendientes</Text>
        {pendingAchievements.length ? (
          pendingAchievements.map((achievement) => (
            <AchievementRow key={achievement.id} achievement={achievement} unlocked={false} />
          ))
        ) : (
          <Text style={styles.meta}>No quedan logros pendientes en esta fase.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Progreso por ejercicio</Text>
        {exerciseItems.length ? (
          exerciseItems.map((item) => (
            <Pressable
              key={item.exerciseId}
              onPress={() =>
                navigation.navigate("ExerciseProgressDetail", {
                  exerciseId: item.exerciseId,
                })
              }
              style={styles.exerciseRow}
            >
              <Text style={styles.exerciseName}>{repairTextEncoding(item.exerciseName)}</Text>
              <Text style={styles.meta}>Último peso: {item.lastWeightUsed ?? 0} kg</Text>
              <Text style={styles.meta}>Mejor peso: {item.bestWeightUsed ?? 0} kg</Text>
              <Text style={styles.meta}>Última fecha: {formatDate(item.lastTrainedDate)}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.meta}>Aún no hay ejercicios con progreso registrado.</Text>
        )}
      </Card>
    </ScreenContainer>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function AchievementRow({
  achievement,
  unlocked,
}: {
  achievement: AchievementWithStatus;
  unlocked: boolean;
}) {
  const progressValue = Math.min(achievement.progressValue, achievement.criteriaValue);
  const progressText = unlocked
    ? `+${achievement.xpReward} XP · desbloqueado`
    : `${progressValue}/${achievement.criteriaValue}`;

  return (
    <View
      style={[
        styles.achievementRow,
        unlocked ? styles.achievementRowUnlocked : styles.achievementRowPending,
      ]}
    >
      <View
        style={[
          styles.achievementIconShell,
          unlocked ? styles.achievementIconShellUnlocked : styles.achievementIconShellPending,
        ]}
      >
        <MaterialCommunityIcons
          name={getAchievementIcon(achievement)}
          size={20}
          color={unlocked ? theme.colors.success : theme.colors.warning}
        />
      </View>
      <View style={styles.achievementCopy}>
        <Text style={styles.achievementName}>{repairTextEncoding(achievement.name)}</Text>
        <Text style={styles.meta}>{repairTextEncoding(achievement.description)}</Text>
      </View>
      <View style={styles.achievementBadge}>
        <Text style={styles.achievementBadgeText}>{progressText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    lineHeight: 21,
    fontSize: 15,
  },
  levelCard: {
    backgroundColor: theme.colors.surface,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  levelCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  levelKicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  levelTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  levelMeta: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metricTile: {
    minWidth: "47%",
    flexGrow: 1,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  lastWorkoutBlock: {
    gap: theme.spacing.xs,
  },
  lastWorkoutName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  achievementRowUnlocked: {
    backgroundColor: "#122419",
    borderColor: "#234c34",
  },
  achievementRowPending: {
    backgroundColor: theme.colors.backgroundElevated,
    borderColor: theme.colors.border,
  },
  achievementIconShell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIconShellUnlocked: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
  },
  achievementIconShellPending: {
    backgroundColor: "rgba(245, 185, 66, 0.14)",
  },
  achievementCopy: {
    flex: 1,
    gap: 3,
  },
  achievementName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  achievementBadge: {
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  achievementBadgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  exerciseRow: {
    gap: 4,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
