import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const BACKGROUND_DIRECTORY = `${FileSystem.documentDirectory}appearance-background/`;

function getExtensionFromUri(uri: string) {
  return uri.split(".").pop()?.toLowerCase() ?? "jpg";
}

export async function pickAndStoreBackgroundImage(currentPath?: string | null) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Se necesita permiso para acceder a la biblioteca del dispositivo.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets.length) {
    return null;
  }

  const asset = result.assets[0];

  await FileSystem.makeDirectoryAsync(BACKGROUND_DIRECTORY, { intermediates: true });

  const extension = getExtensionFromUri(asset.uri) || "jpg";
  const destination = `${BACKGROUND_DIRECTORY}background-${Date.now()}.${extension}`;

  await FileSystem.copyAsync({
    from: asset.uri,
    to: destination,
  });

  if (currentPath) {
    try {
      await FileSystem.deleteAsync(currentPath, { idempotent: true });
    } catch (error) {
      console.warn("No se pudo borrar el fondo anterior", error);
    }
  }

  return destination;
}

export async function removeStoredBackgroundImage(path?: string | null) {
  if (!path) {
    return;
  }

  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch (error) {
    console.warn("No se pudo borrar el fondo guardado", error);
  }
}
