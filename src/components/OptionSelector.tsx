import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface OptionSelectorProps<T extends string> {
  label: string;
  options: Array<Option<T>>;
  selectedValue: T;
  onChange: (value: T) => void;
}

export function OptionSelector<T extends string>({
  label,
  options,
  selectedValue,
  onChange,
}: OptionSelectorProps<T>) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  optionSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  optionLabel: {
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: theme.colors.text,
  },
});
