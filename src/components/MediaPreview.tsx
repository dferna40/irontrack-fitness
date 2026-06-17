import { Image, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { ExerciseMedia } from "../types/models";
import { theme } from "../theme";

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  return <VideoView player={player} style={styles.media} nativeControls={false} />;
}

export function MediaPreview({ media }: { media: ExerciseMedia | null }) {
  return (
    <View style={styles.frame}>
      {media ? (
        media.mediaType === "mp4" ? (
          <VideoPreview uri={media.localPath} />
        ) : (
          <Image source={{ uri: media.localPath }} style={styles.media} resizeMode="contain" />
        )
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin recurso visual</Text>
          <Text style={styles.emptyText}>
            Añade una imagen, GIF, WebP o vídeo para reforzar la técnica.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  media: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.black,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
