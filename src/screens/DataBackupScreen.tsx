import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { Card } from "../components/Card";
import { DangerButton } from "../components/DangerButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import { useAppState } from "../services/app-state";
import {
  clearTrainingHistory,
  resetAllLocalData,
  restoreInitialEquipmentData,
  restoreInitialExercisesData,
} from "../services/data-maintenance";
import { exportWorkoutsToCsv } from "../services/workout-csv-export";
import { theme } from "../theme";

const RESET_CONFIRMATION_TEXT = "REINICIAR";

export function DataBackupScreen() {
  const {
    profile,
    refreshProfile,
    refreshSettings,
    refreshAppearanceSettings,
  } = useAppState();
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isRestoringExercises, setIsRestoringExercises] = useState(false);
  const [isRestoringEquipment, setIsRestoringEquipment] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");

  const handleExportCsv = async () => {
    if (!profile) {
      return;
    }

    try {
      setIsExportingCsv(true);
      const fileUri = await exportWorkoutsToCsv(profile.id);
      Alert.alert(
        "CSV generado",
        `La exportación de entrenamientos se ha generado correctamente.\n\n${fileUri}`,
      );
    } catch (error) {
      Alert.alert(
        "No se pudo exportar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsExportingCsv(false);
    }
  };

  const confirmRestoreExercises = () => {
    if (!profile) {
      return;
    }

    Alert.alert(
      "Restaurar ejercicios iniciales",
      "Se intentarán volver a insertar los ejercicios base sin borrar los actuales.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            void (async () => {
              try {
                setIsRestoringExercises(true);
                await restoreInitialExercisesData(profile.id);
                Alert.alert("Ejercicios restaurados", "Los ejercicios iniciales se han restaurado.");
              } catch (error) {
                Alert.alert(
                  "No se pudo restaurar",
                  error instanceof Error ? error.message : "Inténtalo de nuevo.",
                );
              } finally {
                setIsRestoringExercises(false);
              }
            })();
          },
        },
      ],
    );
  };

  const confirmRestoreEquipment = () => {
    if (!profile) {
      return;
    }

    Alert.alert(
      "Restaurar material inicial",
      "Se intentará volver a insertar el material base sin borrar el actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            void (async () => {
              try {
                setIsRestoringEquipment(true);
                await restoreInitialEquipmentData(profile.id);
                Alert.alert("Material restaurado", "El material inicial se ha restaurado.");
              } catch (error) {
                Alert.alert(
                  "No se pudo restaurar",
                  error instanceof Error ? error.message : "Inténtalo de nuevo.",
                );
              } finally {
                setIsRestoringEquipment(false);
              }
            })();
          },
        },
      ],
    );
  };

  const confirmClearHistory = () => {
    if (!profile) {
      return;
    }

    Alert.alert(
      "Borrar historial",
      "Se eliminarán los entrenamientos guardados, el cardio y las sesiones de boxeo. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar historial",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setIsClearingHistory(true);
                await clearTrainingHistory(profile.id);
                Alert.alert("Historial borrado", "El historial de entrenamientos se ha eliminado.");
              } catch (error) {
                Alert.alert(
                  "No se pudo borrar",
                  error instanceof Error ? error.message : "Inténtalo de nuevo.",
                );
              } finally {
                setIsClearingHistory(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleResetAll = async () => {
    if (resetConfirmation.trim() !== RESET_CONFIRMATION_TEXT) {
      Alert.alert(
        "Confirmación obligatoria",
        `Escribe ${RESET_CONFIRMATION_TEXT} para poder reiniciar todos los datos.`,
      );
      return;
    }

    try {
      setIsResettingAll(true);
      await resetAllLocalData();
      await refreshProfile();
      await refreshSettings();
      await refreshAppearanceSettings();
      setResetConfirmation("");
      Alert.alert("Datos reiniciados", "Todos los datos locales se han reiniciado correctamente.");
    } catch (error) {
      Alert.alert(
        "No se pudo reiniciar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    } finally {
      setIsResettingAll(false);
    }
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Datos y copia de seguridad</Text>
        <Text style={styles.meta}>
          Gestiona exportaciones locales y tareas de mantenimiento con confirmaciones de seguridad.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Exportar entrenamientos</Text>
        <Text style={styles.meta}>
          Genera un archivo CSV con fecha, tipo, rutina, ejercicio, serie, peso, repeticiones,
          dificultad, molestias y notas.
        </Text>
        <PrimaryButton
          label={isExportingCsv ? "Exportando CSV..." : "Exportar entrenamientos a CSV"}
          onPress={() => void handleExportCsv()}
          disabled={isExportingCsv}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Restauración</Text>
        <Text style={styles.meta}>
          Reaplica contenido inicial sin borrar manualmente lo que ya tengas guardado.
        </Text>
        <SecondaryButton
          label={isRestoringExercises ? "Restaurando ejercicios..." : "Restaurar ejercicios iniciales"}
          onPress={confirmRestoreExercises}
          disabled={isRestoringExercises || isRestoringEquipment || isClearingHistory || isResettingAll}
        />
        <SecondaryButton
          label={isRestoringEquipment ? "Restaurando material..." : "Restaurar material inicial"}
          onPress={confirmRestoreEquipment}
          disabled={isRestoringExercises || isRestoringEquipment || isClearingHistory || isResettingAll}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Borrado</Text>
        <Text style={styles.meta}>
          Estas acciones eliminan información. Revisa bien antes de continuar.
        </Text>
        <DangerButton
          label={isClearingHistory ? "Borrando historial..." : "Borrar historial"}
          onPress={confirmClearHistory}
          disabled={isRestoringExercises || isRestoringEquipment || isClearingHistory || isResettingAll}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Reinicio total</Text>
        <Text style={styles.meta}>
          Elimina todos los datos locales de la app, incluido perfil, material, ejercicios,
          rutinas, historial, frases y configuración.
        </Text>
        <Text style={styles.confirmationLabel}>
          Escribe {RESET_CONFIRMATION_TEXT} para confirmar
        </Text>
        <TextInput
          value={resetConfirmation}
          onChangeText={setResetConfirmation}
          autoCapitalize="characters"
          style={styles.input}
          placeholder={RESET_CONFIRMATION_TEXT}
          placeholderTextColor={theme.colors.textMuted}
        />
        <DangerButton
          label={isResettingAll ? "Reiniciando datos..." : "Reiniciar todos los datos"}
          onPress={() => void handleResetAll()}
          disabled={
            isRestoringExercises ||
            isRestoringEquipment ||
            isClearingHistory ||
            isResettingAll ||
            resetConfirmation.trim() !== RESET_CONFIRMATION_TEXT
          }
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  confirmationLabel: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
});
