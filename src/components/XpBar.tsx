import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface XpBarProps {
  currentLabel: string;
  progressPercent: number;
}

export function XpBar({ currentLabel, progressPercent }: XpBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, progressPercent))}%` }]} />
      </View>
      <Text style={styles.label}>{currentLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  track: {
    height: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceSoft,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fill: {
    height: "100%",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
