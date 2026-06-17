import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { initDatabase } from "../database/migrations";
import { getActiveProfile } from "../repositories/userProfileRepository";
import { seedInitialEquipment } from "../seed/initialEquipment";
import { seedInitialExercises } from "../seed/initialExercises";
import { UserProfile } from "../types/models";

interface AppStateValue {
  isReady: boolean;
  error: string | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    const activeProfile = await getActiveProfile();

    if (activeProfile) {
      await seedInitialEquipment(activeProfile.id);
      await seedInitialExercises(activeProfile.id);
    }

    setProfile(activeProfile);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError(null);
        await initDatabase();
        await refreshProfile();
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
    setProfile(nextProfile);
  };

  return (
    <AppStateContext.Provider
      value={{
        isReady,
        error,
        profile,
        setProfile,
        refreshProfile,
        completeOnboarding,
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
