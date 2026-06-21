export type ThemeMode = "dark";
export type AppearanceThemeMode = "dark" | "light" | "system";
export type WeightUnit = "kg" | "lb";
export type DistanceUnit = "km" | "mi";
export type ProfileLevel = "beginner" | "intermediate" | "advanced";
export type ExerciseType = "fuerza" | "cardio" | "boxeo" | "movilidad" | "abdomen";
export type ExerciseMediaType = "gif" | "webp" | "mp4" | "jpg" | "png";
export type CardStyle = "compact" | "normal" | "large";
export type TextSize = "small" | "normal" | "large";
export type TimerStyle = "digital" | "circular" | "bar";
export type BackgroundMode = "default" | "solid" | "gradient" | "image";

export interface UserProfile {
  id: number;
  name: string;
  goal: string;
  level: ProfileLevel;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  preferredTheme: ThemeMode;
  accentColor: string;
  pinEnabled: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileInput {
  name: string;
  goal: string;
  level: ProfileLevel;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  preferredTheme: ThemeMode;
  accentColor: string;
  pinEnabled?: boolean;
  pinHash?: string | null;
  biometricEnabled?: boolean;
}

export interface UpdateUserProfileInput extends Partial<CreateUserProfileInput> {
  id: number;
}

export interface EquipmentItem {
  id: number;
  profileId: number;
  name: string;
  category: string;
  description: string | null;
  notes: string | null;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentInput {
  profileId: number;
  name: string;
  category: string;
  description?: string;
  notes?: string;
  isFavorite?: boolean;
  isActive?: boolean;
}

export interface UpdateEquipmentInput extends CreateEquipmentInput {
  id: number;
}

export interface EquipmentFilters {
  onlyActive?: boolean;
  onlyFavorites?: boolean;
}

export interface Exercise {
  id: number;
  profileId: number;
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  description: string | null;
  technicalNotes: string | null;
  executionTips: string | null;
  defaultRestSeconds: number | null;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseInput {
  profileId: number;
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  description?: string;
  technicalNotes?: string;
  executionTips?: string;
  defaultRestSeconds?: number | null;
  isFavorite?: boolean;
  isActive?: boolean;
}

export interface UpdateExerciseInput extends CreateExerciseInput {
  id: number;
}

export interface ExerciseFilters {
  search?: string;
  muscleGroup?: string | null;
  type?: ExerciseType | null;
  equipmentId?: number | null;
  onlyActive?: boolean;
}

export interface ExerciseEquipmentLink {
  id: number;
  exerciseId: number;
  equipmentId: number;
}

export interface ExerciseWithRelations extends Exercise {
  equipment: EquipmentItem[];
  media: ExerciseMedia | null;
}

export interface ExerciseMedia {
  id: number;
  exerciseId: number;
  mediaType: ExerciseMediaType;
  mimeType: string | null;
  originalFileName: string | null;
  localPath: string;
  originalWidth: number | null;
  originalHeight: number | null;
  processedWidth: number | null;
  processedHeight: number | null;
  fileSize: number | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertExerciseMediaInput {
  exerciseId: number;
  mediaType: ExerciseMediaType;
  mimeType?: string | null;
  originalFileName?: string | null;
  localPath: string;
  originalWidth?: number | null;
  originalHeight?: number | null;
  processedWidth?: number | null;
  processedHeight?: number | null;
  fileSize?: number | null;
  durationSeconds?: number | null;
}

export interface Routine {
  id: number;
  profileId: number;
  name: string;
  description: string | null;
  goal: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineInput {
  profileId: number;
  name: string;
  description?: string;
  goal?: string;
  isActive?: boolean;
}

export interface UpdateRoutineInput extends CreateRoutineInput {
  id: number;
}

export interface RoutineFilters {
  onlyActive?: boolean;
}

export interface RoutineExercise {
  id: number;
  routineId: number;
  exerciseId: number;
  exerciseOrder: number;
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeight: number | null;
  restSeconds: number | null;
  notes: string | null;
}

export interface RoutineExerciseWithExercise extends RoutineExercise {
  exercise: Exercise;
}

export type WorkoutType = "routine" | "free";
export type WorkoutDifficulty = "Fácil" | "Normal" | "Difícil" | "Muy difícil";
export type WorkoutDiscomfortLevel =
  | "Sin molestias"
  | "Molestia leve"
  | "Molestia moderada"
  | "Dolor";

export interface Workout {
  id: number;
  profileId: number;
  routineId: number | null;
  workoutType: WorkoutType;
  date: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number | null;
  difficulty: WorkoutDifficulty | null;
  discomfortLevel: WorkoutDiscomfortLevel | null;
  notes: string | null;
}

export interface CreateWorkoutInput {
  profileId: number;
  routineId?: number | null;
  workoutType: WorkoutType;
  date: string;
  startedAt: string;
  finishedAt?: string | null;
  durationMinutes?: number | null;
  difficulty?: WorkoutDifficulty | null;
  discomfortLevel?: WorkoutDiscomfortLevel | null;
  notes?: string | null;
}

export interface WorkoutSet {
  id: number;
  workoutId: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  restSecondsUsed: number | null;
  notes: string | null;
}

export interface CreateWorkoutSetInput {
  workoutId: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  restSecondsUsed?: number | null;
  notes?: string | null;
}

export interface WorkoutHistoryItem {
  id: number;
  date: string;
  routineName: string | null;
  workoutType: WorkoutType;
  durationMinutes: number | null;
  difficulty: WorkoutDifficulty | null;
  discomfortLevel: WorkoutDiscomfortLevel | null;
  exerciseCount: number;
  setCount: number;
}

export interface WorkoutDetailExerciseSet {
  id: number;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  restSecondsUsed: number | null;
  notes: string | null;
}

export interface WorkoutDetailExercise {
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutDetailExerciseSet[];
}

export interface WorkoutDetail {
  id: number;
  date: string;
  routineName: string | null;
  workoutType: WorkoutType;
  durationMinutes: number | null;
  difficulty: WorkoutDifficulty | null;
  discomfortLevel: WorkoutDiscomfortLevel | null;
  notes: string | null;
  exercises: WorkoutDetailExercise[];
}

export interface WorkoutProgressSummary {
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  lastWorkoutDate: string | null;
  lastWorkoutName: string | null;
  totalSets: number;
  totalVolume: number;
}

export type XpSourceType = "workout_completed" | "achievement_unlocked" | "manual_adjustment";
export type AchievementCategory = "workout_count" | "workout_type" | "streak" | "progression";
export type AchievementCriteriaType =
  | "total_workouts"
  | "total_strength_workouts"
  | "total_cardio_workouts"
  | "streak_days";

export interface GamificationProfile {
  id: number;
  profileId: number;
  totalXp: number;
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface XpEvent {
  id: number;
  profileId: number;
  workoutId: number | null;
  sourceType: XpSourceType;
  sourceId: number | null;
  xpAmount: number;
  reason: string;
  metadata: string | null;
  createdAt: string;
}

export interface LevelDefinition {
  id: number;
  level: number;
  xpRequired: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string | null;
  xpReward: number;
  isActive: boolean;
  criteriaType: AchievementCriteriaType;
  criteriaValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileAchievement {
  id: number;
  profileId: number;
  achievementId: number;
  progressValue: number;
  unlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementWithStatus extends AchievementDefinition {
  progressValue: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
}

export interface GamificationProgress {
  profile: GamificationProfile;
  currentLevelTitle: string;
  nextLevel: number | null;
  nextLevelTitle: string | null;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number | null;
  progressPercent: number;
  recentXpEvents: XpEvent[];
  unlockedAchievementsCount: number;
}

export interface ExerciseProgressSummaryItem {
  exerciseId: number;
  exerciseName: string;
  lastWeightUsed: number | null;
  bestWeightUsed: number | null;
  lastTrainedDate: string | null;
}

export interface ExerciseProgressHistoryItem {
  workoutId: number;
  date: string;
  setNumber: number;
  weight: number;
  reps: number;
  volume: number;
}

export interface ExerciseProgressDetail {
  exerciseId: number;
  exerciseName: string;
  lastWeightUsed: number | null;
  bestWeightUsed: number | null;
  bestSet: ExerciseProgressHistoryItem | null;
  lastTrainedDate: string | null;
  recentHistory: ExerciseProgressHistoryItem[];
}

export interface AppSettings {
  id: number;
  defaultRestSeconds: number;
  autoStartRest: boolean;
  progressionRecommendationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  localNotificationEnabled: boolean;
  keepScreenAwake: boolean;
  quickAdd15Enabled: boolean;
  quickAdd30Enabled: boolean;
  quickAdd60Enabled: boolean;
  rememberFocusMode: boolean;
  largeSessionThumbnails: boolean;
  weightsPlaylistUrl: string | null;
  cardioPlaylistUrl: string | null;
  boxingPlaylistUrl: string | null;
  stretchingPlaylistUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAppSettingsInput {
  defaultRestSeconds?: number;
  autoStartRest?: boolean;
  progressionRecommendationsEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  localNotificationEnabled?: boolean;
  keepScreenAwake?: boolean;
  quickAdd15Enabled?: boolean;
  quickAdd30Enabled?: boolean;
  quickAdd60Enabled?: boolean;
  rememberFocusMode?: boolean;
  largeSessionThumbnails?: boolean;
  weightsPlaylistUrl?: string | null;
  cardioPlaylistUrl?: string | null;
  boxingPlaylistUrl?: string | null;
  stretchingPlaylistUrl?: string | null;
}

export interface AppearanceSettings {
  id: number;
  themeMode: AppearanceThemeMode;
  accentColor: string;
  cardStyle: CardStyle;
  textSize: TextSize;
  timerStyle: TimerStyle;
  backgroundMode: BackgroundMode;
  backgroundSolidColor: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  backgroundImagePath: string | null;
  backgroundImageOpacity: number;
  backgroundDarkOverlay: number;
  backgroundBlurRadius: number;
  showSuggestedRoutine: boolean;
  showLastWorkout: boolean;
  showWeeklySummary: boolean;
  showQuickMusic: boolean;
  showRecentProgress: boolean;
  showMotivationalQuote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAppearanceSettingsInput {
  themeMode?: AppearanceThemeMode;
  accentColor?: string;
  cardStyle?: CardStyle;
  textSize?: TextSize;
  timerStyle?: TimerStyle;
  backgroundMode?: BackgroundMode;
  backgroundSolidColor?: string;
  backgroundGradientStart?: string;
  backgroundGradientEnd?: string;
  backgroundImagePath?: string | null;
  backgroundImageOpacity?: number;
  backgroundDarkOverlay?: number;
  backgroundBlurRadius?: number;
  showSuggestedRoutine?: boolean;
  showLastWorkout?: boolean;
  showWeeklySummary?: boolean;
  showQuickMusic?: boolean;
  showRecentProgress?: boolean;
  showMotivationalQuote?: boolean;
}

export interface MotivationalQuote {
  id: number;
  text: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMotivationalQuoteInput {
  text: string;
}

export interface UpdateMotivationalQuoteInput {
  id: number;
  text: string;
}

export interface ActiveWorkoutSetDraft {
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  restSecondsUsed: number | null;
  notes: string;
}

export interface ActiveWorkoutExercise {
  routineExerciseId: number;
  exerciseId: number;
  exerciseOrder: number;
  name: string;
  type: ExerciseType;
  muscleGroup: string;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeight: number | null;
  restSeconds: number;
  notes: string | null;
}

export type CardioType = "cinta de correr" | "bicicleta estática";
export type CardioIntensity = "suave" | "media" | "alta";

export interface CardioSession {
  id: number;
  profileId: number;
  cardioType: CardioType;
  durationMinutes: number;
  intensity: CardioIntensity;
  distance: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardioSessionInput {
  profileId: number;
  cardioType: CardioType;
  durationMinutes: number;
  intensity: CardioIntensity;
  distance?: number | null;
  notes?: string | null;
}

export interface BoxingRoundSession {
  id: number;
  profileId: number;
  totalRounds: number;
  roundDurationSeconds: number;
  restSeconds: number;
  completedRounds: number;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoxingRoundSessionInput {
  profileId: number;
  totalRounds: number;
  roundDurationSeconds: number;
  restSeconds: number;
  completedRounds: number;
  startedAt: string;
  finishedAt?: string | null;
}
