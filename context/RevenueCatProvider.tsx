// context/RevenueCatProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

type RevenueCatContextType = {
  isPro: boolean;
  showPaywall: () => Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextType>({
  isPro: false,
  showPaywall: async () => {},
});

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        // let revenueCatSecretKey = process.env.REVENUE_CAT_SECRET_KEY
        // if(process.env.EXPO_PUBLIC_APP === "development"){
        //     revenueCatSecretKey = process.env.EXPO_PUBLIC_REVENUE_CAT_SECRET_KEY
        // }
        // 🔑 Initialize RevenueCat before using UI
        // 1. Check the platform and configure RevenueCat with the correct key
        if (Platform.OS === "ios") {
          Purchases.configure({ apiKey: `appl_hTGvZeYLSbUbduGACwwzCRclYZy` });
        } else if (Platform.OS === "android") {
          Purchases.configure({ apiKey: "" });
        }

        // // ✅ Check customer info for entitlement
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info:", customerInfo);

        if (
          customerInfo.entitlements.active["pro_yearly_2"] ||
          customerInfo.entitlements.active["pro_monthly_2"]
        ) {
          setIsPro(true);
        }
      } catch (err) {
        console.warn("RevenueCat setup failed:", err);
      }
    };
    setup();
  }, []);

  const showPaywall = async () => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "Monthly&Yearly2",
      });
      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {

        setIsPro(true);

        setTimeout(() => {
          Alert.alert(
            "Success",
            result === PAYWALL_RESULT.PURCHASED
              ? "🎉 Purchase successful! You’ve unlocked Pro features."
              : "✅ Your previous purchase has been restored."
          );
        }, 500);
      } else {
        // setTimeout(() => {
        //   Alert.alert("Error", "Cannot find your purchase");
        // }, 500);
      }
    } catch (error) {
      console.error("Error presenting paywall:", error);
    }
  };

  return (
    <RevenueCatContext.Provider value={{ isPro, showPaywall }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
