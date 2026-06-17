import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { initDatabase } from "../database/migrations";
import {
  getAppearanceSettings,
  updateAppearanceSettings as persistAppearanceSettings,
} from "../repositories/appearanceSettingsRepository";
import { getAppSettings, updateAppSettings as persistAppSettings } from "../repositories/appSettingsRepository";
import { ensureDefaultMotivationalQuotes } from "../repositories/motivationalQuoteRepository";
import { getActiveProfile } from "../repositories/userProfileRepository";
import { seedInitialEquipment } from "../seed/initialEquipment";
import { seedInitialExercises } from "../seed/initialExercises";
import { seedInitialRoutines } from "../seed/initialRoutines";
import {
  AppearanceSettings,
  AppSettings,
  UpdateAppearanceSettingsInput,
  UpdateAppSettingsInput,
  UserProfile,
} from "../types/models";

interface AppStateValue {
  isReady: boolean;
  error: string | null;
  profile: UserProfile | null;
  settings: AppSettings | null;
  appearanceSettings: AppearanceSettings | null;
  setProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  refreshSettings: () => Promise<void>;
  saveSettings: (input: UpdateAppSettingsInput) => Promise<void>;
  refreshAppearanceSettings: () => Promise<void>;
  saveAppearanceSettings: (input: UpdateAppearanceSettingsInput) => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);

  const refreshProfile = async () => {
    const activeProfile = await getActiveProfile();

    if (activeProfile) {
      await seedInitialEquipment(activeProfile.id);
      await seedInitialExercises(activeProfile.id);
      await seedInitialRoutines(activeProfile.id);
    }

    setProfile(activeProfile);
  };

  const refreshSettings = async () => {
    const nextSettings = await getAppSettings();
    setSettings(nextSettings);
  };

  const refreshAppearanceSettings = async () => {
    const nextSettings = await getAppearanceSettings();
    setAppearanceSettings(nextSettings);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError(null);
        await initDatabase();
        await ensureDefaultMotivationalQuotes();
        await refreshProfile();
        await refreshSettings();
        await refreshAppearanceSettings();
      } catch (bootstrapError) {
        const message =
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Ha ocurrido un error inesperado.";
        setError(message);
      } finally {
        setIsReady(true);
      }
    };

    void bootstrap();
  }, []);

  const completeOnboarding = async (nextProfile: UserProfile) => {
    await seedInitialEquipment(nextProfile.id);
    await seedInitialExercises(nextProfile.id);
    await seedInitialRoutines(nextProfile.id);
    setProfile(nextProfile);
  };

  const saveSettings = async (input: UpdateAppSettingsInput) => {
    const nextSettings = await persistAppSettings(input);
    setSettings(nextSettings);
  };

  const saveAppearanceSettings = async (input: UpdateAppearanceSettingsInput) => {
    const nextSettings = await persistAppearanceSettings(input);
    setAppearanceSettings(nextSettings);
  };

  return (
    <AppStateContext.Provider
      value={{
        isReady,
        error,
        profile,
        settings,
        appearanceSettings,
        setProfile,
        refreshProfile,
        completeOnboarding,
        refreshSettings,
        saveSettings,
        refreshAppearanceSettings,
        saveAppearanceSettings,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
