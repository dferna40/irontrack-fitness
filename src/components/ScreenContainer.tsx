import { ReactNode, useContext } from "react";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  footer?: ReactNode;
}

export function ScreenContainer({
  children,
  scrollable = true,
  footer,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const footerOffset = footer ? 88 : 0;
  const contentStyle = [
    styles.content,
    {
      paddingBottom:
        theme.spacing.xxxl + insets.bottom + (tabBarHeight > 0 ? tabBarHeight : 0) + footerOffset,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={contentStyle}
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              bottom: Math.max(insets.bottom, 12) + (tabBarHeight > 0 ? tabBarHeight : 0),
            },
          ]}
          pointerEvents="box-none"
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  footer: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
});
