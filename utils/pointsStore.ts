import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TURTLES } from "../constant/turtles";

interface PointsState {
  totalPoints: number;
  unlockedTurtles: string[];
  addPoints: (points: number) => string[]; // Returns newly unlocked turtle IDs
}

export const usePointsStore = create(
  persist<PointsState>(
    (set, get) => ({
      totalPoints: 0,
      unlockedTurtles: ["default_turtle"],
      addPoints: (points) => {
        const { totalPoints, unlockedTurtles } = get();
        const newTotal = totalPoints + points;
        const newUnlocks: string[] = [];

        TURTLES.forEach((turtle) => {
          if (
            newTotal >= turtle.requiredPoints &&
            !unlockedTurtles.includes(turtle.id)
          ) {
            newUnlocks.push(turtle.id);
          }
        });

        set({
          totalPoints: newTotal,
          unlockedTurtles: [...unlockedTurtles, ...newUnlocks],
        });

        return newUnlocks;
      },
    }),
    {
      name: "points-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
