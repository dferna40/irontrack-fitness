import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../components/Card";
import { OptionSelector } from "../components/OptionSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { pickAndStoreBackgroundImage, removeStoredBackgroundImage } from "../services/appearance-background";
import { useAppState } from "../services/app-state";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../theme";
import {
  accentColorOptions,
  appearanceThemeOptions,
  backgroundColorOptions,
  backgroundModeOptions,
  cardStyleOptions,
  gradientPresetOptions,
  textSizeOptions,
  timerStyleOptions,
} from "../utils/constants";
import {
  AppearanceThemeMode,
  BackgroundMode,
  CardStyle,
  TextSize,
  TimerStyle,
} from "../types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const MIN_OPACITY = 0.1;
const MAX_OPACITY = 1;
const MIN_DARKEN = 0;
const MAX_DARKEN = 0.85;
const MIN_BLUR = 0;
const MAX_BLUR = 20;

export function AppearanceSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    appearanceSettings,
    saveAppearanceSettings,
    refreshAppearanceSettings,
  } = useAppState();
  const [themeMode, setThemeMode] = useState<AppearanceThemeMode>("dark");
  const [accentColor, setAccentColor] = useState(accentColorOptions[0]);
  const [cardStyle, setCardStyle] = useState<CardStyle>("normal");
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [timerStyle, setTimerStyle] = useState<TimerStyle>("digital");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("default");
  const [backgroundSolidColor, setBackgroundSolidColor] = useState(backgroundColorOptions[0]);
  const [backgroundGradientStart, setBackgroundGradientStart] = useState(
    gradientPresetOptions[0].start,
  );
  const [backgroundGradientEnd, setBackgroundGradientEnd] = useState(gradientPresetOptions[0].end);
  const [backgroundImagePath, setBackgroundImagePath] = useState<string | null>(null);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.35);
  const [backgroundDarkOverlay, setBackgroundDarkOverlay] = useState(0.45);
  const [backgroundBlurRadius, setBackgroundBlurRadius] = useState(0);
  const [showSuggestedRoutine, setShowSuggestedRoutine] = useState(true);
  const [showLastWorkout, setShowLastWorkout] = useState(true);
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);
  const [showQuickMusic, setShowQuickMusic] = useState(true);
  const [showRecentProgress, setShowRecentProgress] = useState(true);
  const [showMotivationalQuote, setShowMotivationalQuote] = useState(true);

  useEffect(() => {
    if (!appearanceSettings) {
      return;
    }

    setThemeMode(appearanceSettings.themeMode);
    setAccentColor(appearanceSettings.accentColor);
    setCardStyle(appearanceSettings.cardStyle);
    setTextSize(appearanceSettings.textSize);
    setTimerStyle(appearanceSettings.timerStyle);
    setBackgroundMode(appearanceSettings.backgroundMode);
    setBackgroundSolidColor(appearanceSettings.backgroundSolidColor);
    setBackgroundGradientStart(appearanceSettings.backgroundGradientStart);
    setBackgroundGradientEnd(appearanceSettings.backgroundGradientEnd);
    setBackgroundImagePath(appearanceSettings.backgroundImagePath);
    setBackgroundImageOpacity(appearanceSettings.backgroundImageOpacity);
    setBackgroundDarkOverlay(appearanceSettings.backgroundDarkOverlay);
    setBackgroundBlurRadius(appearanceSettings.backgroundBlurRadius);
    setShowSuggestedRoutine(appearanceSettings.showSuggestedRoutine);
    setShowLastWorkout(appearanceSettings.showLastWorkout);
    setShowWeeklySummary(appearanceSettings.showWeeklySummary);
    setShowQuickMusic(appearanceSettings.showQuickMusic);
    setShowRecentProgress(appearanceSettings.showRecentProgress);
    setShowMotivationalQuote(appearanceSettings.showMotivationalQuote);
  }, [appearanceSettings]);

  const handlePickImage = async () => {
    try {
      const storedPath = await pickAndStoreBackgroundImage(backgroundImagePath);
      if (!storedPath) {
        return;
      }

      setBackgroundImagePath(storedPath);
      setBackgroundMode("image");
      if (backgroundDarkOverlay < 0.4) {
        setBackgroundDarkOverlay(0.4);
      }
    } catch (error) {
      Alert.alert(
        "No se pudo seleccionar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleRestoreDefault = async () => {
    await removeStoredBackgroundImage(backgroundImagePath);
    setBackgroundMode("default");
    setBackgroundImagePath(null);
    setBackgroundImageOpacity(0.35);
    setBackgroundDarkOverlay(0.45);
    setBackgroundBlurRadius(0);
  };

  const handleSave = async () => {
    if (backgroundMode === "image" && !backgroundImagePath) {
      Alert.alert("Fondo incompleto", "Selecciona una imagen o vuelve al fondo por defecto.");
      return;
    }

    await saveAppearanceSettings({
      themeMode,
      accentColor,
      cardStyle,
      textSize,
      timerStyle,
      backgroundMode,
      backgroundSolidColor,
      backgroundGradientStart,
      backgroundGradientEnd,
      backgroundImagePath,
      backgroundImageOpacity,
      backgroundDarkOverlay,
      backgroundBlurRadius,
      showSuggestedRoutine,
      showLastWorkout,
      showWeeklySummary,
      showQuickMusic,
      showRecentProgress,
      showMotivationalQuote,
    });

    await refreshAppearanceSettings();
    Alert.alert("Guardado", "La configuración de apariencia se ha actualizado.");
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Apariencia</Text>
        <Text style={styles.meta}>
          Ajusta tema, tarjetas, temporizador y un fondo personalizado manteniendo la legibilidad.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Vista previa</Text>
        <View style={styles.previewFrame}>
          <BackgroundPreview
            mode={backgroundMode}
            solidColor={backgroundSolidColor}
            gradientStart={backgroundGradientStart}
            gradientEnd={backgroundGradientEnd}
            imagePath={backgroundImagePath}
            imageOpacity={backgroundImageOpacity}
            darkOverlay={backgroundDarkOverlay}
            blurRadius={backgroundBlurRadius}
            accentColor={accentColor}
          />
        </View>
      </Card>

      <Card>
        <OptionSelector
          label="Tema"
          options={appearanceThemeOptions}
          selectedValue={themeMode}
          onChange={setThemeMode}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Color principal</Text>
          <View style={styles.colorRow}>
            {accentColorOptions.map((color) => {
              const isSelected = color === accentColor;

              return (
                <Pressable
                  key={color}
                  onPress={() => setAccentColor(color)}
                  style={[styles.colorOuter, isSelected && { borderColor: theme.colors.text }]}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      isSelected && styles.colorSelected,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <OptionSelector
          label="Estilo de tarjetas"
          options={cardStyleOptions}
          selectedValue={cardStyle}
          onChange={setCardStyle}
        />

        <OptionSelector
          label="Tamaño de texto"
          options={textSizeOptions}
          selectedValue={textSize}
          onChange={setTextSize}
        />

        <OptionSelector
          label="Estilo de temporizador"
          options={timerStyleOptions}
          selectedValue={timerStyle}
          onChange={setTimerStyle}
        />
      </Card>

      <Card>
        <OptionSelector
          label="Fondo"
          options={backgroundModeOptions}
          selectedValue={backgroundMode}
          onChange={setBackgroundMode}
        />

        {backgroundMode === "solid" ? (
          <View style={styles.field}>
            <Text style={styles.label}>Color sólido</Text>
            <View style={styles.colorRow}>
              {backgroundColorOptions.map((color) => {
                const isSelected = color === backgroundSolidColor;

                return (
                  <Pressable
                    key={color}
                    onPress={() => setBackgroundSolidColor(color)}
                    style={[styles.colorOuter, isSelected && { borderColor: theme.colors.text }]}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        isSelected && styles.colorSelected,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {backgroundMode === "gradient" ? (
          <View style={styles.field}>
            <Text style={styles.label}>Degradado</Text>
            <View style={styles.presetColumn}>
              {gradientPresetOptions.map((preset) => {
                const isSelected =
                  preset.start === backgroundGradientStart && preset.end === backgroundGradientEnd;

                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      setBackgroundGradientStart(preset.start);
                      setBackgroundGradientEnd(preset.end);
                    }}
                    style={[styles.presetButton, isSelected && styles.presetButtonSelected]}
                  >
                    <LinearGradient
                      colors={[preset.start, preset.end]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.presetGradient}
                    />
                    <Text style={styles.presetLabel}>{preset.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {backgroundMode === "image" ? (
          <View style={styles.field}>
            <Text style={styles.label}>Imagen personalizada</Text>
            <SecondaryButton label="Seleccionar imagen" onPress={() => void handlePickImage()} />
            <SecondaryButton label="Restaurar fondo por defecto" onPress={() => void handleRestoreDefault()} />
            <Text style={styles.help}>
              La vista previa mantiene una capa oscura para asegurar contraste del texto.
            </Text>

            <AdjustRow
              label="Opacidad de imagen"
              value={backgroundImageOpacity}
              displayValue={`${Math.round(backgroundImageOpacity * 100)}%`}
              onDecrease={() =>
                setBackgroundImageOpacity((current) => clamp(current - 0.05, MIN_OPACITY, MAX_OPACITY))
              }
              onIncrease={() =>
                setBackgroundImageOpacity((current) => clamp(current + 0.05, MIN_OPACITY, MAX_OPACITY))
              }
            />
            <AdjustRow
              label="Oscurecer fondo"
              value={backgroundDarkOverlay}
              displayValue={`${Math.round(backgroundDarkOverlay * 100)}%`}
              onDecrease={() =>
                setBackgroundDarkOverlay((current) => clamp(current - 0.05, MIN_DARKEN, MAX_DARKEN))
              }
              onIncrease={() =>
                setBackgroundDarkOverlay((current) => clamp(current + 0.05, MIN_DARKEN, MAX_DARKEN))
              }
            />
            <AdjustRow
              label="Desenfoque"
              value={backgroundBlurRadius}
              displayValue={`${backgroundBlurRadius.toFixed(0)} px`}
              onDecrease={() =>
                setBackgroundBlurRadius((current) => clamp(current - 1, MIN_BLUR, MAX_BLUR))
              }
              onIncrease={() =>
                setBackgroundBlurRadius((current) => clamp(current + 1, MIN_BLUR, MAX_BLUR))
              }
            />
          </View>
        ) : null}

        {backgroundMode !== "image" ? (
          <SecondaryButton label="Restaurar fondo por defecto" onPress={() => void handleRestoreDefault()} />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Inicio</Text>
        <Text style={styles.help}>
          Elige qué bloques quieres ver en la pantalla principal.
        </Text>
        <SwitchRow
          label="Rutina sugerida"
          value={showSuggestedRoutine}
          onValueChange={setShowSuggestedRoutine}
        />
        <SwitchRow
          label="Último entrenamiento"
          value={showLastWorkout}
          onValueChange={setShowLastWorkout}
        />
        <SwitchRow
          label="Resumen semanal"
          value={showWeeklySummary}
          onValueChange={setShowWeeklySummary}
        />
        <SwitchRow
          label="Acceso rápido a música"
          value={showQuickMusic}
          onValueChange={setShowQuickMusic}
        />
        <SwitchRow
          label="Progreso reciente"
          value={showRecentProgress}
          onValueChange={setShowRecentProgress}
        />
        <SwitchRow
          label="Frase motivacional"
          value={showMotivationalQuote}
          onValueChange={setShowMotivationalQuote}
        />
        <SecondaryButton
          label="Gestionar frases motivacionales"
          onPress={() => navigation.navigate("MotivationalQuotesSettings")}
        />
      </Card>

      <PrimaryButton label="Guardar apariencia" onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}

function BackgroundPreview({
  mode,
  solidColor,
  gradientStart,
  gradientEnd,
  imagePath,
  imageOpacity,
  darkOverlay,
  blurRadius,
  accentColor,
}: {
  mode: BackgroundMode;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  imagePath: string | null;
  imageOpacity: number;
  darkOverlay: number;
  blurRadius: number;
  accentColor: string;
}) {
  const content = (
    <View style={styles.previewContent}>
      <View style={[styles.previewBadge, { backgroundColor: accentColor }]}>
        <Text style={styles.previewBadgeText}>IRONTRACK</Text>
      </View>
      <Text style={styles.previewTitle}>Entrenamiento activo</Text>
      <Text style={styles.previewMeta}>Ronda 3 de 6 · Descanso 60 s</Text>
      <View style={styles.previewCard}>
        <Text style={styles.previewCardTitle}>Press banca</Text>
        <Text style={styles.previewCardMeta}>4 series · 8-10 reps · 70 kg</Text>
      </View>
    </View>
  );

  if (mode === "image" && imagePath) {
    return (
      <ImageBackground
        source={{ uri: imagePath }}
        blurRadius={blurRadius}
        resizeMode="cover"
        style={styles.previewBackground}
        imageStyle={{ opacity: imageOpacity }}
      >
        <View style={[styles.previewOverlay, { backgroundColor: `rgba(0,0,0,${darkOverlay})` }]}>
          {content}
        </View>
      </ImageBackground>
    );
  }

  if (mode === "gradient") {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.previewBackground}
      >
        <View style={[styles.previewOverlay, { backgroundColor: "rgba(0,0,0,0.28)" }]}>{content}</View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.previewBackground,
        { backgroundColor: mode === "solid" ? solidColor : theme.colors.background },
      ]}
    >
      <View style={[styles.previewOverlay, { backgroundColor: "rgba(0,0,0,0.18)" }]}>{content}</View>
    </View>
  );
}

function AdjustRow({
  label,
  displayValue,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  displayValue: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.adjustRow}>
      <View style={styles.adjustCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.help}>{displayValue}</Text>
      </View>
      <View style={styles.adjustButtons}>
        <Pressable onPress={onDecrease} style={styles.adjustButton}>
          <Text style={styles.adjustButtonText}>-</Text>
        </Pressable>
        <Pressable onPress={onIncrease} style={styles.adjustButton}>
          <Text style={styles.adjustButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  help: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  colorOuter: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: theme.radii.pill,
    padding: 4,
  },
  colorSwatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  previewFrame: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewBackground: {
    minHeight: 220,
    justifyContent: "center",
  },
  previewOverlay: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "flex-end",
  },
  previewContent: {
    gap: theme.spacing.sm,
  },
  previewBadge: {
    alignSelf: "flex-start",
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBadgeText: {
    color: theme.colors.black,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
  },
  previewTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "800",
  },
  previewMeta: {
    color: "#dbe4f0",
    fontSize: 14,
  },
  previewCard: {
    borderRadius: theme.radii.md,
    backgroundColor: "rgba(20,26,34,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  previewCardTitle: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  previewCardMeta: {
    color: "#dbe4f0",
  },
  presetColumn: {
    gap: theme.spacing.sm,
  },
  presetButton: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceElevated,
  },
  presetButtonSelected: {
    borderColor: theme.colors.accent,
  },
  presetGradient: {
    height: 52,
  },
  presetLabel: {
    color: theme.colors.text,
    fontWeight: "600",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  adjustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  adjustCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  adjustButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  adjustButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  adjustButtonText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
});
