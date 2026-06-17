import { Alert, Image } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { deleteExerciseMedia, upsertExerciseMedia } from "../repositories/exerciseMediaRepository";
import { ExerciseMedia, ExerciseMediaType } from "../types/models";
import { mediaTypeExtensions } from "../utils/constants";

const MEDIA_DIRECTORY = `${FileSystem.documentDirectory}exercise-media/`;
const RECOMMENDED_WIDTH = 800;
const RECOMMENDED_HEIGHT = 600;
const MINIMUM_WIDTH = 400;
const MINIMUM_HEIGHT = 300;

function getExtensionFromAsset(asset: ImagePicker.ImagePickerAsset) {
  const fileName = asset.fileName ?? asset.uri.split("/").pop() ?? "";
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return extension;
}

function toMediaType(extension: string): ExerciseMediaType | null {
  switch (extension) {
    case "gif":
      return "gif";
    case "webp":
      return "webp";
    case "mp4":
      return "mp4";
    case "jpg":
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    default:
      return null;
  }
}

function getResizedDimensions(width: number, height: number) {
  const ratio = Math.min(RECOMMENDED_WIDTH / width, RECOMMENDED_HEIGHT / height);

  if (ratio >= 1) {
    return { width, height };
  }

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function confirmLowResolution(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Resolución baja",
      "Este recurso visual tiene una resolución baja y puede verse borroso. ¿Quieres usarlo igualmente?",
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Usar igualmente", onPress: () => resolve(true) },
      ],
    );
  });
}

export async function pickAndStoreExerciseMedia(exerciseId: number) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Se necesita permiso para acceder a la biblioteca del dispositivo.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets.length) {
    return null;
  }

  const asset = result.assets[0];
  const extension = getExtensionFromAsset(asset);

  if (!mediaTypeExtensions.includes(extension as (typeof mediaTypeExtensions)[number])) {
    throw new Error("Formato no permitido. Usa gif, webp, mp4, jpg, jpeg o png.");
  }

  const mediaType = toMediaType(extension);

  if (!mediaType) {
    throw new Error("No se pudo identificar el tipo del recurso visual.");
  }

  const width = asset.width ?? null;
  const height = asset.height ?? null;
  const isImage = mediaType !== "mp4";

  if (
    isImage &&
    width &&
    height &&
    (width < MINIMUM_WIDTH || height < MINIMUM_HEIGHT) &&
    !(await confirmLowResolution())
  ) {
    return null;
  }

  await FileSystem.makeDirectoryAsync(MEDIA_DIRECTORY, { intermediates: true });

  let sourceUri = asset.uri;
  let processedWidth = width;
  let processedHeight = height;
  let destinationExtension = extension === "jpeg" ? "jpg" : extension;

  if (
    isImage &&
    width &&
    height &&
    (width > RECOMMENDED_WIDTH || height > RECOMMENDED_HEIGHT) &&
    mediaType !== "gif"
  ) {
    const resized = getResizedDimensions(width, height);
    const saveFormat =
      mediaType === "png"
        ? ImageManipulator.SaveFormat.PNG
        : mediaType === "webp"
          ? ImageManipulator.SaveFormat.WEBP
          : ImageManipulator.SaveFormat.JPEG;

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: resized }],
      { compress: 1, format: saveFormat },
    );

    sourceUri = manipulated.uri;
    processedWidth = manipulated.width;
    processedHeight = manipulated.height;
    destinationExtension =
      mediaType === "png" ? "png" : mediaType === "webp" ? "webp" : "jpg";
  }

  const fileName = `exercise-${exerciseId}-${Date.now()}.${destinationExtension}`;
  const destinationUri = `${MEDIA_DIRECTORY}${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  const fileInfo = await FileSystem.getInfoAsync(destinationUri, { size: true });

  return upsertExerciseMedia({
    exerciseId,
    mediaType,
    mimeType: asset.mimeType ?? null,
    originalFileName: asset.fileName ?? null,
    localPath: destinationUri,
    originalWidth: width,
    originalHeight: height,
    processedWidth,
    processedHeight,
    fileSize: fileInfo.exists ? fileInfo.size ?? null : null,
    durationSeconds:
      typeof asset.duration === "number" ? Math.round(asset.duration / 1000) : null,
  });
}

export async function removeExerciseMedia(exerciseId: number) {
  const existing = await deleteExerciseMedia(exerciseId);

  if (existing?.localPath) {
    try {
      await FileSystem.deleteAsync(existing.localPath, { idempotent: true });
    } catch (error) {
      console.warn("No se pudo borrar el archivo local del recurso visual", error);
    }
  }

  return existing;
}

export async function resolveMediaImageSize(media: ExerciseMedia) {
  if (media.mediaType === "mp4") {
    return null;
  }

  return new Promise<{ width: number; height: number } | null>((resolve) => {
    Image.getSize(
      media.localPath,
      (width, height) => resolve({ width, height }),
      () => resolve(null),
    );
  });
}
