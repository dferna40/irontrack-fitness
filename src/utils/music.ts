import { Alert, Linking } from "react-native";
import { AppSettings } from "../types/models";

export type MusicContext = "weights" | "cardio" | "boxing" | "stretching";

function getMusicUrl(settings: AppSettings | null, context: MusicContext) {
  if (!settings) {
    return null;
  }

  switch (context) {
    case "weights":
      return settings.weightsPlaylistUrl;
    case "cardio":
      return settings.cardioPlaylistUrl;
    case "boxing":
      return settings.boxingPlaylistUrl;
    case "stretching":
      return settings.stretchingPlaylistUrl;
    default:
      return null;
  }
}

export async function openMusicUrl(settings: AppSettings | null, context: MusicContext) {
  const url = getMusicUrl(settings, context)?.trim();

  if (!url) {
    Alert.alert("Sin música configurada", "Guarda primero una URL en Configuración > Música.");
    return;
  }

  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert("URL no válida", "La app no puede abrir la URL configurada.");
    return;
  }

  await Linking.openURL(url);
}
