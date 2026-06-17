import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { SecondaryButton } from "../components/SecondaryButton";
import {
  createMotivationalQuote,
  deleteMotivationalQuote,
  listMotivationalQuotes,
  updateMotivationalQuote,
} from "../repositories/motivationalQuoteRepository";
import { useAppState } from "../services/app-state";
import { theme } from "../theme";
import { MotivationalQuote } from "../types/models";

export function MotivationalQuotesScreen() {
  const {
    appearanceSettings,
    saveAppearanceSettings,
    refreshAppearanceSettings,
  } = useAppState();
  const [quotes, setQuotes] = useState<MotivationalQuote[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [newQuote, setNewQuote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const loadQuotes = useCallback(async () => {
    const items = await listMotivationalQuotes();
    setQuotes(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setEnabled(appearanceSettings?.showMotivationalQuote ?? true);
      void loadQuotes();
    }, [appearanceSettings?.showMotivationalQuote, loadQuotes]),
  );

  const defaultQuotes = quotes.filter((quote) => quote.isDefault);
  const customQuotes = quotes.filter((quote) => !quote.isDefault);

  const handleSaveVisibility = async (value: boolean) => {
    try {
      setEnabled(value);
      await saveAppearanceSettings({
        showMotivationalQuote: value,
      });
      await refreshAppearanceSettings();
    } catch (error) {
      setEnabled(!value);
      Alert.alert(
        "No se pudo actualizar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleCreate = async () => {
    if (!newQuote.trim()) {
      Alert.alert("Frase obligatoria", "Escribe una frase antes de guardarla.");
      return;
    }

    try {
      await createMotivationalQuote({ text: newQuote });
      setNewQuote("");
      await loadQuotes();
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleSaveEdit = async () => {
    if (editingId === null || !editingText.trim()) {
      Alert.alert("Frase obligatoria", "La frase no puede quedar vacía.");
      return;
    }

    try {
      await updateMotivationalQuote({ id: editingId, text: editingText });
      setEditingId(null);
      setEditingText("");
      await loadQuotes();
    } catch (error) {
      Alert.alert(
        "No se pudo actualizar",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const handleDelete = (quote: MotivationalQuote) => {
    Alert.alert("Eliminar frase", "¿Quieres borrar esta frase personalizada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteMotivationalQuote(quote.id);
              if (editingId === quote.id) {
                setEditingId(null);
                setEditingText("");
              }
              await loadQuotes();
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar",
                error instanceof Error ? error.message : "Inténtalo de nuevo.",
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Card>
        <Text style={styles.title}>Frases motivacionales</Text>
        <Text style={styles.meta}>
          Gestiona las frases que pueden aparecer en Inicio y decide si quieres mostrarlas.
        </Text>
      </Card>

      <Card>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Mostrar frases en Inicio</Text>
          <Switch value={enabled} onValueChange={(value) => void handleSaveVisibility(value)} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Frases predeterminadas</Text>
        {defaultQuotes.map((quote) => (
          <View key={quote.id} style={styles.quoteRow}>
            <Text style={styles.quoteText}>{quote.text}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Añadir frase personalizada</Text>
        <TextInput
          value={newQuote}
          onChangeText={setNewQuote}
          multiline
          style={[styles.input, styles.multiline]}
          placeholder="Escribe una frase breve"
          placeholderTextColor={theme.colors.textMuted}
          textAlignVertical="top"
        />
        <PrimaryButton label="Guardar frase" onPress={() => void handleCreate()} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Frases personalizadas</Text>
        {customQuotes.length ? (
          customQuotes.map((quote) => (
            <View key={quote.id} style={styles.customQuoteCard}>
              {editingId === quote.id ? (
                <>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    multiline
                    style={[styles.input, styles.multiline]}
                    placeholder="Edita la frase"
                    placeholderTextColor={theme.colors.textMuted}
                    textAlignVertical="top"
                  />
                  <PrimaryButton label="Guardar cambios" onPress={() => void handleSaveEdit()} />
                  <SecondaryButton
                    label="Cancelar edición"
                    onPress={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.quoteText}>{quote.text}</Text>
                  <SecondaryButton
                    label="Editar"
                    onPress={() => {
                      setEditingId(quote.id);
                      setEditingText(quote.text);
                    }}
                  />
                  <SecondaryButton label="Eliminar" onPress={() => handleDelete(quote)} />
                </>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.meta}>Todavía no has añadido frases personalizadas.</Text>
        )}
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
  meta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "600",
    flex: 1,
  },
  quoteRow: {
    paddingVertical: theme.spacing.xs,
  },
  quoteText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  customQuoteCard: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  multiline: {
    minHeight: 96,
  },
});
