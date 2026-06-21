import {
  AchievementDefinition,
  AchievementWithStatus,
  GamificationProgress,
  LevelDefinition,
  Workout,
} from "../types/models";
import {
  createXpEvent,
  ensureDefaultGamificationCatalog,
  ensureGamificationProfile,
  getGamificationStats,
  getProfileAchievement,
  getXpEventBySource,
  listAchievementsWithStatus,
  listActiveAchievementDefinitions,
  listLevelDefinitions,
  listRecentXpEvents,
  unlockProfileAchievement,
  updateGamificationProfile,
  upsertProfileAchievementProgress,
} from "../repositories/gamificationRepository";

export function calculateWorkoutXp(workoutType: Workout["workoutType"]) {
  switch (workoutType) {
    case "routine":
      return 25;
    case "free":
      return 20;
    default:
      return 15;
  }
}

export function calculateLevel(totalXp: number, levels: LevelDefinition[]) {
  const ordered = [...levels].sort((left, right) => left.xpRequired - right.xpRequired);
  const current =
    [...ordered].reverse().find((level) => totalXp >= level.xpRequired) ?? ordered[0] ?? null;
  const next = ordered.find((level) => level.xpRequired > totalXp) ?? null;

  if (!current) {
    return {
      currentLevel: 1,
      currentLevelTitle: "Nivel 1",
      currentLevelXp: 0,
      nextLevel: null,
      nextLevelTitle: null,
      nextLevelXp: null,
      xpIntoCurrentLevel: totalXp,
      xpToNextLevel: null,
      progressPercent: 100,
    };
  }

  const xpIntoCurrentLevel = totalXp - current.xpRequired;
  const xpToNextLevel = next ? next.xpRequired - totalXp : null;
  const progressPercent = next
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((totalXp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100,
          ),
        ),
      )
    : 100;

  return {
    currentLevel: current.level,
    currentLevelTitle: current.title,
    currentLevelXp: current.xpRequired,
    nextLevel: next?.level ?? null,
    nextLevelTitle: next?.title ?? null,
    nextLevelXp: next?.xpRequired ?? null,
    xpIntoCurrentLevel,
    xpToNextLevel,
    progressPercent,
  };
}

function getAchievementProgressValue(
  achievement: AchievementDefinition,
  stats: {
    totalWorkouts: number;
    totalStrengthWorkouts: number;
    totalCardioWorkouts: number;
  },
) {
  switch (achievement.criteriaType) {
    case "total_workouts":
      return stats.totalWorkouts;
    case "total_strength_workouts":
      return stats.totalStrengthWorkouts;
    case "total_cardio_workouts":
      return stats.totalCardioWorkouts;
    case "streak_days":
      return 0;
    default:
      return 0;
  }
}

export async function checkUnlockedAchievements(profileId: number) {
  const [definitions, stats] = await Promise.all([
    listActiveAchievementDefinitions(),
    getGamificationStats(profileId),
  ]);

  const unlocked: AchievementDefinition[] = [];

  for (const achievement of definitions) {
    const progressValue = getAchievementProgressValue(achievement, stats);
    await upsertProfileAchievementProgress(profileId, achievement.id, progressValue);
    const existingAchievement = await getProfileAchievement(profileId, achievement.id);

    if (progressValue >= achievement.criteriaValue && !existingAchievement?.unlockedAt) {
      await unlockProfileAchievement(profileId, achievement.id, progressValue);
      unlocked.push(achievement);
    }
  }

  return unlocked;
}

export async function awardWorkoutCompletionXp(profileId: number, workout: Workout) {
  await ensureDefaultGamificationCatalog();
  const profile = await ensureGamificationProfile(profileId);
  const levels = await listLevelDefinitions();
  const existingWorkoutEvent = await getXpEventBySource(profileId, "workout_completed", workout.id);

  let totalXp = profile.totalXp;
  if (!existingWorkoutEvent) {
    const workoutXp = calculateWorkoutXp(workout.workoutType);
    await createXpEvent({
      profileId,
      workoutId: workout.id,
      sourceType: "workout_completed",
      sourceId: workout.id,
      xpAmount: workoutXp,
      reason:
        workout.workoutType === "routine"
          ? "Entrenamiento de rutina completado"
          : "Entrenamiento libre completado",
    });

    totalXp += workoutXp;
  }

  const newlyUnlocked = await checkUnlockedAchievements(profileId);
  for (const achievement of newlyUnlocked) {
    const existingAchievementXpEvent = await getXpEventBySource(
      profileId,
      "achievement_unlocked",
      achievement.id,
    );

    if (existingAchievementXpEvent) {
      continue;
    }

    await createXpEvent({
      profileId,
      sourceType: "achievement_unlocked",
      sourceId: achievement.id,
      xpAmount: achievement.xpReward,
      reason: `Logro desbloqueado: ${achievement.name}`,
    });

    totalXp += achievement.xpReward;
  }

  const levelState = calculateLevel(totalXp, levels);
  await updateGamificationProfile(profileId, {
    totalXp,
    currentLevel: levelState.currentLevel,
    currentLevelXp: levelState.currentLevelXp,
    nextLevelXp: levelState.nextLevelXp,
  });

  return getGamificationProgress(profileId);
}

export async function getGamificationProgress(profileId: number): Promise<GamificationProgress> {
  await ensureDefaultGamificationCatalog();
  const [profile, levels, recentXpEvents, achievements] = await Promise.all([
    ensureGamificationProfile(profileId),
    listLevelDefinitions(),
    listRecentXpEvents(profileId, 10),
    listAchievementsWithStatus(profileId),
  ]);

  const levelState = calculateLevel(profile.totalXp, levels);

  const normalizedProfile =
    profile.currentLevel !== levelState.currentLevel ||
    profile.currentLevelXp !== levelState.currentLevelXp ||
    profile.nextLevelXp !== levelState.nextLevelXp
      ? await updateGamificationProfile(profileId, {
          totalXp: profile.totalXp,
          currentLevel: levelState.currentLevel,
          currentLevelXp: levelState.currentLevelXp,
          nextLevelXp: levelState.nextLevelXp,
        })
      : profile;

  return {
    profile: normalizedProfile,
    currentLevelTitle: levelState.currentLevelTitle,
    nextLevel: levelState.nextLevel,
    nextLevelTitle: levelState.nextLevelTitle,
    xpIntoCurrentLevel: levelState.xpIntoCurrentLevel,
    xpToNextLevel: levelState.xpToNextLevel,
    progressPercent: levelState.progressPercent,
    recentXpEvents,
    unlockedAchievementsCount: achievements.filter((item) => item.isUnlocked).length,
  };
}

export async function getGamificationAchievements(
  profileId: number,
): Promise<AchievementWithStatus[]> {
  await ensureDefaultGamificationCatalog();
  await checkUnlockedAchievements(profileId);
  return listAchievementsWithStatus(profileId);
}
