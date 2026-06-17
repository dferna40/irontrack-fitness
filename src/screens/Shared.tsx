import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { theme } from "../theme";

export function PlaceholderScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
      <Card>
        <Text style={styles.cardTitle}>Base preparada</Text>
        <Text style={styles.cardText}>
          Esta pantalla ya forma parte de la navegación principal y queda lista
          para crecer en la siguiente fase sin rehacer estructura.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardText: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});

