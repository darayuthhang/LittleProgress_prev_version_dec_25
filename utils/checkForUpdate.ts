import * as Application from 'expo-application';
import { Alert, AppState, Linking } from 'react-native';

const APP_STORE_ID = `https://apps.apple.com/us/app/littleprogress-habit-tracker/id6754607105`; // your app Apple ID

interface ItunesLookupResult {
  version: string;
}

interface ItunesLookupResponse {
  resultCount: number;
  results: ItunesLookupResult[];
}

// Simple semantic version comparison
const isVersionOutdated = (current: string, latest: string): boolean => {
  const currParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currParts.length, latestParts.length); i++) {
    const curr = currParts[i] || 0;
    const lat = latestParts[i] || 0;
    if (curr < lat) return true;
    if (curr > lat) return false;
  }
  return false; // same version
};

export const checkForUpdate = async (testLatestVersion?: string): Promise<void> => {
  // 1. Safety Checks: Skip in Development/Expo Go unless explicitly testing
  if (!testLatestVersion) {
    if (__DEV__) {
      console.log("Skipping update check in development mode");
      return;
    }
    if (Application.applicationId === 'host.exp.exponent') {
      // Skip if running in Expo Go (bundle ID won't match App Store)
      return;
    }
  }

  try {
    const currentVersion = Application.nativeApplicationVersion;
    let latestVersion = testLatestVersion;

    if (!latestVersion) {
      // 2. Fetch latest version from App Store
      // Adding country=US helps avoid caching issues and ensures we check the main store
      const response = await fetch(
        `https://itunes.apple.com/lookup?bundleId=${Application.applicationId}&country=US`
      );
      const data: ItunesLookupResponse = await response.json();
      latestVersion = data.results[0]?.version;
    }

    if (!latestVersion || !currentVersion) return;

    // 3. Compare versions
    if (isVersionOutdated(currentVersion, latestVersion)) {
      // 4. Recursive Alert Function with AppState
      const showUpdateAlert = () => {
        Alert.alert(
          "Update Required",
          "Please update to the latest version to continue using the app.",
          [
            {
              text: "Update Now",
              onPress: () => {
                Linking.openURL(APP_STORE_ID).catch(err => 
                  console.error("Error opening App Store:", err)
                );
              },
            },
          ],
          { cancelable: false } // Prevent dismissing by tapping outside
        );
      };

      showUpdateAlert();

      // 5. Add AppState listener to re-show alert when returning from background
      // This covers the case where user goes to App Store and comes back without updating
      const subscription = AppState.addEventListener("change", (nextAppState) => {
        if (nextAppState === "active") {
          showUpdateAlert();
        }
      });
      
      // We don't remove the subscription because we want to block the user indefinitely 
      // until they update (which restarts the app).
    }
  } catch (error) {
    console.log("Update check failed:", error);
  }
};
