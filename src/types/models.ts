export type ThemeMode = "dark";
export type WeightUnit = "kg" | "lb";
export type DistanceUnit = "km" | "mi";
export type ProfileLevel = "beginner" | "intermediate" | "advanced";
export type ExerciseType = "fuerza" | "cardio" | "boxeo" | "movilidad" | "abdomen";
export type ExerciseMediaType = "gif" | "webp" | "mp4" | "jpg" | "png";

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
