import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastVisitDate: string | null;
  hasDiscoveredTurtle: boolean;
  streakBroken: boolean;
  preservedStreak: number;
  checkStreak: () => { updated: boolean; broken: boolean };
  syncStreak: (current: number, best: number) => void;
  recoverStreak: () => void;
  acknowledgeBrokenStreak: () => void;
}

export const useStreakStore = create(
  persist<StreakState>(
    (set, get) => ({
      currentStreak: 0,
      bestStreak: 0,
      lastVisitDate: null,
      hasDiscoveredTurtle: false,
      streakBroken: false,
      preservedStreak: 0,
      
      syncStreak: (current, best) => {
          const { currentStreak, bestStreak } = get();
          // Only sync if different to avoid unnecessary updates
          if (current !== currentStreak || best !== bestStreak) {
              set({ currentStreak: current, bestStreak: best });
          }
      },
      
      checkStreak: () => {
        const { lastVisitDate, currentStreak, bestStreak, hasDiscoveredTurtle } = get();
        const today = dayjs().format("YYYY-MM-DD");

        if (lastVisitDate === today) {
          return { updated: false, broken: false }; // Already visited today
        }

        const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        const dayBeforeYesterday = dayjs().subtract(2, "day").format("YYYY-MM-DD");

        let newStreak = 1;
        let isBroken = false;
        let preserved = 0;

        if (lastVisitDate === yesterday) {
          // Continuity maintained
          newStreak = currentStreak + 1;
        } else if (lastVisitDate === dayBeforeYesterday && currentStreak > 0) {
          // Missed EXACTLY one day -> Grace Period (Broken but recoverable)
          isBroken = true;
          preserved = currentStreak;
          newStreak = 1; // Temporary reset until recovered
        } else {
          // Missed 2+ days or first time -> Hard Reset
          newStreak = 1;
          isBroken = false;
        }

        const discoveredTurtle = hasDiscoveredTurtle || newStreak >= 7;
        const newBestStreak = Math.max(bestStreak || 0, newStreak);

        set({
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          lastVisitDate: today,
          hasDiscoveredTurtle: discoveredTurtle,
          streakBroken: isBroken,
          preservedStreak: preserved,
        });

        return { updated: true, broken: isBroken };
      },

      recoverStreak: () => {
        const { preservedStreak, bestStreak } = get();
        if (preservedStreak > 0) {
          const recovered = preservedStreak + 1; // Restore + today's credit
          set({
            currentStreak: recovered,
            bestStreak: Math.max(bestStreak, recovered),
            streakBroken: false,
            preservedStreak: 0,
          });
        }
      },

      acknowledgeBrokenStreak: () => {
        set({
          streakBroken: false,
          preservedStreak: 0,
        });
      },
    }),
    {
      name: "streak-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
