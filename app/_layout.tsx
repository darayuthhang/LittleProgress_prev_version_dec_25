import { LittleProgressToast } from "@/component/LittleProgressToast";
import { StreakBottomSheet } from "@/component/StreakBottomSheet";
import { DB_NAME } from "@/constant/dbConstant";
import { RevenueCatProvider } from "@/context/RevenueCatProvider";
import { attachNotificationLoggers } from "@/utils/AttachNotification";
import { useAuthStore } from "@/utils/authStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import migrations from "../drizzle/migrations";

// ⭐ FONT IMPORTS
import {
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";

const isWeb = Platform.OS === "web";


if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

// SplashScreen.preventAutoHideAsync(); // Keep splash until ready

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList:true
  }),
});

const expoDb = openDatabaseSync(DB_NAME);
const db = drizzle(expoDb);
const isDevelopmentMode = process.env.EXPO_PUBLIC_APP === "development";

export default function RootLayout() {
  // if(isDevelopmentMode){
  //    useDrizzleStudio(db);
  // }
  // ⭐ Load Fonts FIRST
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { success, error } = useMigrations(db, migrations);
  console.log("sucess");
  
  console.log(success);
  
  const { hasCompletedOnboarding, _hasHydrated } = useAuthStore();

  // Drizzle initialization
  useEffect(() => {
    const init = async () => {
      if (isDevelopmentMode) {
        attachNotificationLoggers()
       
      }

      if (success) console.log("✅ Migrations applied");
      else if (error) console.warn("⚠️ Migration failed:", error);
      else console.warn("⚠️ No migrations detected");
    };

    if (success !== undefined || error) init();
  }, [success, error]);

  // ⭐ Hide SplashScreen only when:
  // 1) Zustand hydrated
  // 2) Fonts loaded
  useEffect(() => {
    if (fontsLoaded && _hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, _hasHydrated]);

  // ⭐ Block UI until EVERYTHING is loaded
  if (!fontsLoaded || !_hasHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RevenueCatProvider>
        <SQLiteProvider
          databaseName={DB_NAME}
          options={{
            enableChangeListener: true,
          }}
        >
          <BottomSheetModalProvider>
            <Stack
              initialRouteName="index"
              // initialRouteName={
              //   hasSeenOnboarding ? "(tabs)" : "onboarding-screen"
              // }
              screenOptions={{
                headerShadowVisible: false,
                headerShown: false,
              }}
            >
              <Stack.Screen name="timer-screen" />
              <Stack.Screen name="onboarding" />

              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modal-to-stack"
                // options={{ presentation: "modal" }}
              />
            </Stack>
            <StreakBottomSheet />
          </BottomSheetModalProvider>
        </SQLiteProvider>
        <Toast
          config={{
            success: (props) => <LittleProgressToast {...props} />,
            upgrade: (props) => <LittleProgressToast {...props} />,
          }}
        />
      </RevenueCatProvider>
    </GestureHandlerRootView>
  );
}
