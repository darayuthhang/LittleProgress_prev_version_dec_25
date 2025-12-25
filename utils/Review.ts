import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Alert, Linking, Platform } from "react-native";

// Store URLs for fallback
const IOS_STORE_URL = "https://apps.apple.com/app/id6754607105?action=write-review";
const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=com.yourcompany.yourapp";

// Helper to open URLs
const openURL = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Cannot open link", "Please try again later.");
      return;
    }
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert("Something went wrong", "Please try again.");
  }
};
export const resetAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully!');
  } catch (e) {
    console.log('Failed to clear AsyncStorage:', e);
  }
};
export const askForReview = async () => {
  try {
    const hasAsked = await AsyncStorage.getItem("hasAskedForReview");
    if (hasAsked === "true") return; // already asked

    const isAvailable = await StoreReview.isAvailableAsync();
            try {
              if (isAvailable) {
                await StoreReview.requestReview(); // shows native in-app popup
              } else {
                const storeUrl = Platform.select({
                  ios: IOS_STORE_URL,
                  android: ANDROID_STORE_URL,
                  default: IOS_STORE_URL,
                })!;
                await openURL(storeUrl);
              }
            } catch (error) {
              // fallback to store URL if anything goes wrong
              const storeUrl = Platform.select({
                ios: IOS_STORE_URL,
                android: ANDROID_STORE_URL,
                default: IOS_STORE_URL,
              })!;
              await openURL(storeUrl);
            }
            await AsyncStorage.setItem("hasAskedForReview", "true");
    // Alert.alert(
    //   "Enjoying your streak?",
    //   "Would you like to leave a review on the App Store?",
    //   [
    //     {
    //       text: "No, thanks",
    //       style: "cancel",
    //       onPress: async () => await AsyncStorage.setItem("hasAskedForReview", "true"),
    //     },
    //     {
    //       text: "Sure!",
    //       onPress: async () => {
    //         try {
    //           if (isAvailable) {
    //             await StoreReview.requestReview(); // shows native in-app popup
    //           } else {
    //             const storeUrl = Platform.select({
    //               ios: IOS_STORE_URL,
    //               android: ANDROID_STORE_URL,
    //               default: IOS_STORE_URL,
    //             })!;
    //             await openURL(storeUrl);
    //           }
    //         } catch (error) {
    //           // fallback to store URL if anything goes wrong
    //           const storeUrl = Platform.select({
    //             ios: IOS_STORE_URL,
    //             android: ANDROID_STORE_URL,
    //             default: IOS_STORE_URL,
    //           })!;
    //           await openURL(storeUrl);
    //         }
    //         await AsyncStorage.setItem("hasAskedForReview", "true");
    //       },
    //     },
    //   ]
    // );
  } catch (error) {
    console.error("Review prompt error:", error);
  }
};
