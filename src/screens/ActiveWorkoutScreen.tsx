import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View, Vibration } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Card } from "../components/Card";
import { MediaPreview } from "../components/MediaPreview";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { TimerCard } from "../components/TimerCard";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getMediaForExercise,
  listExerciseMediaMap,
} from "../repositories/exerciseMediaRepository";
import { useAppState } from "../services/app-state";
import { scheduleLocalNotification } from "../services/notifications";
import { useTrainingSession } from "../services/training-session";
import { theme } from "../theme";
import { ExerciseMedia } from "../types/models";
import { openMusicUrl } from "../utils/music";

type Props = NativeStackScreenProps<RootStackParamList, "ActiveWorkout">;

export function ActiveWorkoutScreen({ navigation }: Props) {
  const { settings, saveSettings } = useAppState();
  const {
    session,
    currentExercise,
    updateDraftWeight,
    updateDraftReps,
    completeCurrentSet,
    addExtraSet,
    goToNextExercise,
    jumpToExercise,
    getCompletedSetsForExercise,
    updateCompletedSet,
    removeCompletedSet,
  } = useTrainingSession();
  const [restSeconds, setRestSeconds] = useState(0);
  const [restKey, setRestKey] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [selectedRestSeconds, setSelectedRestSeconds] = useState(60);
  const [editingSetNumber, setEditingSetNumber] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");
  const [currentMedia, setCurrentMedia] = useState<ExerciseMedia | null>(null);
  const [exerciseMediaMap, setExerciseMediaMap] = useState<Map<number, ExerciseMedia>>(new Map());
  const [showSessionOverview, setShowSessionOverview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const keepAwake = async () => {
      if (settings?.keepScreenAwake) {
        await activateKeepAwakeAsync("active-workout");
      } else {
        deactivateKeepAwake("active-workout");
      }
    };

    void keepAwake();

    return () => {
      deactivateKeepAwake("active-workout");
    };
  }, [settings?.keepScreenAwake]);

  useEffect(() => {
    if (!currentExercise) {
      return;
    }

    setSelectedRestSeconds(currentExercise.restSeconds || settings?.defaultRestSeconds || 60);
    setEditingSetNumber(null);
    setEditWeight("");
    setEditReps("");
  }, [currentExercise, settings?.defaultRestSeconds]);

  useEffect(() => {
    if (typeof settings?.rememberFocusMode === "boolean") {
      setIsFocusMode(settings.rememberFocusMode);
    }
  }, [settings?.rememberFocusMode]);

  useEffect(() => {
    let isMounted = true;

    const loadMedia = async () => {
      if (!currentExercise) {
        if (isMounted) {
          setCurrentMedia(null);
        }
        return;
      }

      try {
        const media = await getMediaForExercise(currentExercise.exerciseId);
        if (isMounted) {
          setCurrentMedia(media);
        }
      } catch (error) {
        console.warn("No se pudo cargar el recurso visual del ejercicio", error);
        if (isMounted) {
          setCurrentMedia(null);
        }
      }
    };

    void loadMedia();

    return () => {
      isMounted = false;
    };
  }, [currentExercise]);

  useEffect(() => {
    let isMounted = true;

    const loadMediaAvailability = async () => {
      if (!session?.exercises.length) {
        if (isMounted) {
          setExerciseMediaMap(new Map());
        }
        return;
      }

      try {
        const mediaMap = await listExerciseMediaMap(
          session.exercises.map((item) => item.exerciseId),
        );
        if (isMounted) {
          setExerciseMediaMap(mediaMap);
        }
      } catch (error) {
        console.warn("No se pudo cargar el estado visual de la sesion", error);
        if (isMounted) {
          setExerciseMediaMap(new Map());
        }
      }
    };

    void loadMediaAvailability();

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (!session || !currentExercise) {
    return (
      <ScreenContainer>
        <Text style={styles.emptyText}>No hay entrenamiento activo.</Text>
      </ScreenContainer>
    );
  }

  const completedSets = getCompletedSetsForExercise(currentExercise.exerciseId);
  const currentSetNumber = completedSets.length + 1;
  const isLastExercise = session.currentExerciseIndex === session.exercises.length - 1;

  const handleTimerFinish = async () => {
    setIsRestActive(false);

    if (settings?.vibrationEnabled) {
      Vibration.vibrate(600);
    }

    if (settings?.localNotificationEnabled) {
      await scheduleLocalNotification({
        title: "Descanso terminado",
        body: `Sigue con ${currentExercise.name}`,
        soundEnabled: settings.soundEnabled,
      });
    }
  };

  const handleToggleFocusMode = async () => {
    const nextValue = !isFocusMode;
    setIsFocusMode(nextValue);

    if (settings?.rememberFocusMode !== nextValue) {
      try {
        await saveSettings({ rememberFocusMode: nextValue });
      } catch (error) {
        console.warn("No se pudo guardar la preferencia de modo foco", error);
      }
    }
  };

  const handleCompleteSet = () => {
    const nextSet = completeCurrentSet(selectedRestSeconds);
    if (!nextSet) {
      return;
    }

    const reachedTargetSets = nextSet.setNumber >= currentExercise.targetSets;
    const hasNextExercise = session.currentExerciseIndex < session.exercises.length - 1;

    if (reachedTargetSets && hasNextExercise) {
      goToNextExercise();
      setRestSeconds(0);
      setRestKey((current) => current + 1);
      setIsRestActive(false);
      setShowSessionOverview(false);
      return;
    }

    const nextRest =
      selectedRestSeconds || currentExercise.restSeconds || settings?.defaultRestSeconds || 60;
    setRestSeconds(nextRest);
    setRestKey((current) => current + 1);
    setIsRestActive(settings?.autoStartRest ?? true);
  };

  const saveEditedSet = () => {
    if (editingSetNumber === null) {
      return;
    }

    updateCompletedSet(
      currentExercise.exerciseId,
      editingSetNumber,
      Number(editWeight || 0),
      Number(editReps || 0),
    );
    setEditingSetNumber(null);
    setEditWeight("");
    setEditReps("");
  };

  const summaryText = useMemo(
    () => `${session.currentExerciseIndex + 1} de ${session.exercises.length}`,
    [session.currentExerciseIndex, session.exercises.length],
  );

  const sessionExerciseRows = useMemo(
    () =>
      session.exercises.map((exercise, index) => {
        const setsDone = getCompletedSetsForExercise(exercise.exerciseId).length;

        return {
          exercise,
          index,
          setsDone,
          media: exerciseMediaMap.get(exercise.exerciseId) ?? null,
          isCurrent: index === session.currentExerciseIndex,
          isFinished: setsDone >= exercise.targetSets,
        };
      }),
    [exerciseMediaMap, getCompletedSetsForExercise, session.currentExerciseIndex, session.exercises],
  );

  const overviewFooter = showSessionOverview ? (
    <PrimaryButton
      label={`Volver a ${currentExercise.name}`}
      onPress={() => setShowSessionOverview(false)}
    />
  ) : undefined;

  const renderSessionOverview = () => (
    <Card>
      <Text style={styles.sectionTitle}>Vista rapida de la sesion</Text>
      <Text style={styles.meta}>
        Toca cualquier ejercicio para saltar directamente a el. El icono indica si tiene recurso
        visual.
      </Text>

      <View style={styles.sessionOverviewList}>
        {sessionExerciseRows.map(({ exercise, index, setsDone, media, isCurrent, isFinished }) => (
          <Pressable
            key={exercise.exerciseId}
            onPress={() => {
              jumpToExercise(index);
              setShowSessionOverview(false);
            }}
            style={[
              styles.sessionExerciseRow,
              isCurrent && styles.sessionExerciseRowCurrent,
              isFinished && styles.sessionExerciseRowFinished,
            ]}
          >
            <View style={styles.sessionExerciseCopy}>
              <SessionMediaThumbnail
                media={media}
                large={settings?.largeSessionThumbnails ?? false}
              />
              <Text style={styles.sessionExerciseIndex}>{index + 1}</Text>
              <View style={styles.sessionExerciseTextBlock}>
                <View style={styles.sessionExerciseTitleRow}>
                  <Text style={styles.sessionExerciseName}>{exercise.name}</Text>
                </View>
                <Text style={styles.sessionExerciseMeta}>
                  {exercise.muscleGroup} · {setsDone}/{exercise.targetSets} series
                </Text>
              </View>
            </View>
            <Text style={styles.sessionExerciseStatus}>
              {isCurrent ? "Ahora" : isFinished ? "Hecho" : "Ir"}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );

  const renderFocusMode = () => (
    <>
      <Card style={styles.focusCard}>
        <MediaPreview media={currentMedia} />
        <View style={styles.focusHeader}>
          <Text style={styles.focusProgress}>{summaryText}</Text>
          <Text style={styles.focusRoutine}>{session.routineName}</Text>
        </View>
        <Text style={styles.focusExerciseName}>{currentExercise.name}</Text>
        <Text style={styles.focusExerciseMeta}>
          {currentExercise.muscleGroup} · Serie {currentSetNumber} de {currentExercise.targetSets}
        </Text>

        <View style={styles.focusMetricsRow}>
          <MetricCard label="Peso" value={`${session.draftWeight} kg`} />
          <MetricCard label="Reps" value={String(session.draftReps)} />
        </View>

        <View style={styles.focusButtonGrid}>
          <SecondaryButton
            label="Peso -5"
            onPress={() => updateDraftWeight(-5)}
            style={styles.focusActionButton}
          />
          <SecondaryButton
            label="Peso -2.5"
            onPress={() => updateDraftWeight(-2.5)}
            style={styles.focusActionButton}
          />
          <PrimaryButton
            label="Peso +2.5"
            onPress={() => updateDraftWeight(2.5)}
            style={styles.focusActionButton}
          />
          <PrimaryButton
            label="Peso +5"
            onPress={() => updateDraftWeight(5)}
            style={styles.focusActionButton}
          />
        </View>

        <View style={styles.focusButtonGrid}>
          <SecondaryButton
            label="Reps -1"
            onPress={() => updateDraftReps(-1)}
            style={styles.focusActionButton}
          />
          <PrimaryButton
            label="Reps +1"
            onPress={() => updateDraftReps(1)}
            style={styles.focusActionButton}
          />
        </View>

        <View style={styles.restPresetBlock}>
          <Text style={styles.subsectionLabel}>Descanso rapido</Text>
          <View style={styles.restPresetRow}>
            {[45, 60, 75, 90].map((value) => {
              const selected = selectedRestSeconds === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setSelectedRestSeconds(value)}
                  style={[styles.restPresetChip, selected && styles.restPresetChipSelected]}
                >
                  <Text
                    style={[
                      styles.restPresetChipLabel,
                      selected && styles.restPresetChipLabelSelected,
                    ]}
                  >
                    {value}s
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          label="Completar serie"
          onPress={handleCompleteSet}
          style={styles.focusCompleteButton}
        />

        <View style={styles.heroActions}>
          <SecondaryButton
            label="Ver sesion"
            onPress={() => setShowSessionOverview(true)}
            style={styles.flexButton}
          />
          <SecondaryButton
            label="Salir de foco"
            onPress={() => void handleToggleFocusMode()}
            style={styles.flexButton}
          />
        </View>
      </Card>

      {restSeconds > 0 ? (
        <TimerCard
          key={restKey}
          initialSeconds={restSeconds}
          autoStart={isRestActive}
          showQuick15={settings?.quickAdd15Enabled ?? true}
          showQuick30={settings?.quickAdd30Enabled ?? true}
          showQuick60={settings?.quickAdd60Enabled ?? true}
          onFinish={() => void handleTimerFinish()}
        />
      ) : null}
    </>
  );

  return (
    <ScreenContainer footer={overviewFooter}>
      <Card style={styles.heroCard}>
        <MediaPreview media={currentMedia} />

        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>
              {session.workoutType === "free" ? "ENTRENAMIENTO LIBRE" : "RUTINA ACTIVA"}
            </Text>
            <Text style={styles.title}>{session.routineName}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{summaryText}</Text>
          </View>
        </View>

        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {currentExercise.muscleGroup} · {currentExercise.type}
        </Text>

        <View style={styles.statsGrid}>
          <StatPill label="Serie actual" value={String(currentSetNumber)} />
          <StatPill label="Objetivo" value={`${currentExercise.targetSets} series`} />
          <StatPill
            label="Reps"
            value={`${currentExercise.targetRepsMin ?? "-"}${
              currentExercise.targetRepsMax ? `-${currentExercise.targetRepsMax}` : ""
            }`}
          />
          <StatPill label="Peso objetivo" value={`${currentExercise.targetWeight ?? 0} kg`} />
          <StatPill label="Descanso" value={`${selectedRestSeconds}s`} />
          <StatPill label="Series hechas" value={String(completedSets.length)} />
        </View>

        <View style={styles.heroActions}>
          <SecondaryButton
            label={showSessionOverview ? "Volver al ejercicio" : "Ver sesion"}
            onPress={() => setShowSessionOverview((current) => !current)}
            style={styles.flexButton}
          />
          <SecondaryButton
            label={isFocusMode ? "Salir de foco" : "Modo foco"}
            onPress={() => void handleToggleFocusMode()}
            style={styles.flexButton}
          />
        </View>
      </Card>

      {showSessionOverview ? (
        renderSessionOverview()
      ) : isFocusMode ? (
        renderFocusMode()
      ) : (
        <>
          <Card>
            <Text style={styles.sectionTitle}>Registro rapido</Text>

            <View style={styles.restPresetBlock}>
              <Text style={styles.subsectionLabel}>Descanso rapido</Text>
              <View style={styles.restPresetRow}>
                {[45, 60, 75, 90].map((value) => {
                  const selected = selectedRestSeconds === value;

                  return (
                    <Pressable
                      key={value}
                      onPress={() => setSelectedRestSeconds(value)}
                      style={[styles.restPresetChip, selected && styles.restPresetChipSelected]}
                    >
                      <Text
                        style={[
                          styles.restPresetChipLabel,
                          selected && styles.restPresetChipLabelSelected,
                        ]}
                      >
                        {value}s
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.metricSummaryRow}>
              <MetricCard label="Peso actual" value={`${session.draftWeight} kg`} />
              <MetricCard label="Reps actuales" value={String(session.draftReps)} />
            </View>

            <View style={styles.metricRow}>
              <SecondaryButton
                label="Peso -5"
                onPress={() => updateDraftWeight(-5)}
                style={styles.largeActionButton}
              />
              <SecondaryButton
                label="Peso -2.5"
                onPress={() => updateDraftWeight(-2.5)}
                style={styles.largeActionButton}
              />
            </View>

            <View style={styles.metricRow}>
              <PrimaryButton
                label="Peso +2.5"
                onPress={() => updateDraftWeight(2.5)}
                style={styles.largeActionButton}
              />
              <PrimaryButton
                label="Peso +5"
                onPress={() => updateDraftWeight(5)}
                style={styles.largeActionButton}
              />
            </View>

            <View style={styles.metricRow}>
              <SecondaryButton
                label="Reps -1"
                onPress={() => updateDraftReps(-1)}
                style={styles.largeActionButton}
              />
              <PrimaryButton
                label="Reps +1"
                onPress={() => updateDraftReps(1)}
                style={styles.largeActionButton}
              />
            </View>

            <PrimaryButton
              label="Completar serie"
              onPress={handleCompleteSet}
              style={styles.completeSetButton}
            />
          </Card>

          {restSeconds > 0 ? (
            <TimerCard
              key={restKey}
              initialSeconds={restSeconds}
              autoStart={isRestActive}
              showQuick15={settings?.quickAdd15Enabled ?? true}
              showQuick30={settings?.quickAdd30Enabled ?? true}
              showQuick60={settings?.quickAdd60Enabled ?? true}
              onFinish={() => void handleTimerFinish()}
            />
          ) : null}

          <Card>
            <Text style={styles.sectionTitle}>Series completadas</Text>
            {completedSets.length ? (
              completedSets.map((set) => (
                <View key={set.setNumber} style={styles.completedRow}>
                  <View style={styles.completedCopy}>
                    <Text style={styles.completedTitle}>Serie {set.setNumber}</Text>
                    <Text style={styles.completedMeta}>
                      {set.weight} kg · {set.reps} reps
                    </Text>
                  </View>
                  <View style={styles.completedActions}>
                    <SecondaryButton
                      label="Editar"
                      onPress={() => {
                        setEditingSetNumber(set.setNumber);
                        setEditWeight(String(set.weight));
                        setEditReps(String(set.reps));
                      }}
                      style={styles.smallButton}
                    />
                    <SecondaryButton
                      label="Quitar"
                      onPress={() => removeCompletedSet(currentExercise.exerciseId, set.setNumber)}
                      style={styles.smallButton}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.meta}>Todavia no hay series guardadas para este ejercicio.</Text>
            )}

            {editingSetNumber !== null ? (
              <View style={styles.editBlock}>
                <Text style={styles.label}>Editar serie {editingSetNumber}</Text>
                <View style={styles.metricRow}>
                  <TextInput
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="decimal-pad"
                    style={[styles.input, styles.flexInput]}
                    placeholder="Peso"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                  <TextInput
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="number-pad"
                    style={[styles.input, styles.flexInput]}
                    placeholder="Reps"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <PrimaryButton label="Guardar serie editada" onPress={saveEditedSet} />
              </View>
            ) : null}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Acciones rapidas</Text>
            <View style={styles.metricRow}>
              <SecondaryButton
                label="Anadir serie extra"
                onPress={addExtraSet}
                style={styles.flexButton}
              />
              <SecondaryButton
                label={isLastExercise ? "Ultimo ejercicio" : "Siguiente ejercicio"}
                onPress={goToNextExercise}
                style={styles.flexButton}
              />
            </View>
            <View style={styles.metricRow}>
              <SecondaryButton
                label="Ver tecnica"
                onPress={() =>
                  navigation.navigate("ExerciseTechnique", {
                    exerciseId: currentExercise.exerciseId,
                  })
                }
                style={styles.flexButton}
              />
              <SecondaryButton
                label="Abrir musica"
                onPress={() => void openMusicUrl(settings, "weights")}
                style={styles.flexButton}
              />
            </View>
            <SecondaryButton
              label="Finalizar entrenamiento"
              onPress={() => {
                if (!Object.values(session.completedSets).flat().length) {
                  Alert.alert("Sin series", "Completa al menos una serie antes de finalizar.");
                  return;
                }
                navigation.navigate("WorkoutSummary");
              }}
            />
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

function SessionMediaThumbnail({
  media,
  large,
}: {
  media: ExerciseMedia | null;
  large: boolean;
}) {
  const [videoThumbnailUri, setVideoThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      if (!media || media.mediaType !== "mp4") {
        if (isMounted) {
          setVideoThumbnailUri(null);
        }
        return;
      }

      try {
        const result = await VideoThumbnails.getThumbnailAsync(media.localPath, {
          time: 1000,
          quality: 0.6,
        });

        if (isMounted) {
          setVideoThumbnailUri(result.uri);
        }
      } catch (error) {
        console.warn("No se pudo generar miniatura del video", error);
        if (isMounted) {
          setVideoThumbnailUri(null);
        }
      }
    };

    void loadThumbnail();

    return () => {
      isMounted = false;
    };
  }, [media]);

  const thumbSizeStyle = large ? styles.sessionMediaThumbLarge : styles.sessionMediaThumbSmall;

  if (!media) {
    return (
      <View style={[styles.sessionMediaThumb, styles.sessionMediaThumbEmpty, thumbSizeStyle]}>
        <MaterialCommunityIcons
          name="image-off-outline"
          size={18}
          color={theme.colors.textMuted}
        />
      </View>
    );
  }

  if (media.mediaType === "mp4") {
    return (
      <View style={[styles.sessionMediaThumb, styles.sessionMediaThumbVideo, thumbSizeStyle]}>
        {videoThumbnailUri ? (
          <Image
            source={{ uri: videoThumbnailUri }}
            style={styles.sessionMediaThumbImage}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name="play-box-multiple-outline"
            size={20}
            color={theme.colors.accent}
          />
        )}
        <View style={styles.sessionMediaBadge}>
          <MaterialCommunityIcons
            name="play-box-multiple-outline"
            size={14}
            color={theme.colors.white}
          />
          <Text style={styles.sessionMediaBadgeText}>VIDEO</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.sessionMediaThumb, thumbSizeStyle]}>
      <Image source={{ uri: media.localPath }} style={styles.sessionMediaThumbImage} resizeMode="cover" />
      <View style={styles.sessionMediaBadge}>
        <MaterialCommunityIcons
          name={media.mediaType === "gif" ? "file-gif-box" : "image-multiple-outline"}
          size={14}
          color={theme.colors.white}
        />
        <Text style={styles.sessionMediaBadgeText}>
          {media.mediaType === "gif" ? "GIF" : "IMG"}
        </Text>
      </View>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricCardLabel}>{label}</Text>
      <Text style={styles.metricCardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.lg,
  },
  focusCard: {
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  progressBadge: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  progressBadgeText: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  exerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  statPill: {
    minWidth: "30%",
    flexGrow: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontSize: 15,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  restPresetBlock: {
    gap: theme.spacing.sm,
  },
  subsectionLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  restPresetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  restPresetChip: {
    minWidth: 68,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  restPresetChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  restPresetChipLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  restPresetChipLabelSelected: {
    color: theme.colors.accent,
  },
  metricSummaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricCardLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricCardValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  largeActionButton: {
    flex: 1,
    minHeight: 60,
  },
  completeSetButton: {
    minHeight: 64,
  },
  sessionOverviewList: {
    gap: theme.spacing.sm,
  },
  sessionExerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  sessionExerciseRowCurrent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  sessionExerciseRowFinished: {
    borderColor: theme.colors.success,
  },
  sessionExerciseCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  sessionMediaThumb: {
    borderRadius: theme.radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  sessionMediaThumbSmall: {
    width: 54,
    height: 54,
  },
  sessionMediaThumbLarge: {
    width: 78,
    height: 78,
  },
  sessionMediaThumbEmpty: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  sessionMediaThumbVideo: {
    gap: 2,
    backgroundColor: theme.colors.background,
  },
  sessionMediaThumbImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.black,
  },
  sessionMediaBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: theme.radii.pill,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  sessionMediaBadgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  sessionExerciseIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 32,
  },
  sessionExerciseTextBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sessionExerciseTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  sessionExerciseName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sessionExerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sessionExerciseStatus: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  focusHeader: {
    gap: theme.spacing.xs,
    alignItems: "center",
  },
  focusProgress: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  focusRoutine: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  focusExerciseName: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    textAlign: "center",
  },
  focusExerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  focusMetricsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  focusButtonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  focusActionButton: {
    flex: 1,
    minWidth: "47%",
    minHeight: 72,
  },
  focusCompleteButton: {
    minHeight: 78,
  },
  completedRow: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  completedCopy: {
    gap: theme.spacing.xs,
  },
  completedTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  completedMeta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  completedActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  smallButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  editBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    color: theme.colors.text,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  flexInput: {
    flex: 1,
  },
});
