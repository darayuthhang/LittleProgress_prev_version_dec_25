// SettingsScreen.tsx
import { THIRD_COLOR } from "@/constant/colorConstant";
import { useRevenueCat } from "@/context/RevenueCatProvider";
import { useDataManagement } from "@/utils/dataManagement";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ❌ temporarily disabled native modules
import * as MailComposer from "expo-mail-composer";
import * as StoreReview from "expo-store-review";

// ---- CONFIG ----
const APP_NAME = "LittleProgress";
const SUPPORT_EMAIL = "darayuthhang12@gmail.com";
const PRIVACY_URL = "https://www.lookatmylinks.com/privacy-policy";
const TERMS_URL = "https://www.lookatmylinks.com/term-condition";
const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.yourcompany.yourapp";
const IOS_STORE_URL =
  "https://apps.apple.com/app/id6754607105?action=write-review";
// ----------------
const MANAGE_SUB_URL_IOS = "https://apps.apple.com/account/subscriptions";
type SettingProps = {
  onUpgradePress?: () => void;
  onSendFeedbackOverride?: () => void;
  onRateOverride?: () => void;
};

export default function Settings({
  onUpgradePress,
  onSendFeedbackOverride,
  onRateOverride,
}: SettingProps) {

      const {  showPaywall, isPro } = useRevenueCat();
      const { exportData, importData } = useDataManagement();

  const vibrate = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

  const openURL = useCallback(async (url: string) => {
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
  }, []);

  const handleUpgrade = useCallback(async () => {
    vibrate();
    if (onUpgradePress) {
      onUpgradePress();
      return;
    }
    Alert.alert(
      "Upgrade to Pro",
      "Wire this to your paywall (e.g., RevenueCat paywall presentation)."
    );
  }, [onUpgradePress]);

const handleSendFeedback = useCallback(async () => {
  vibrate();
  if (onSendFeedbackOverride) return onSendFeedbackOverride();

  try {
    // Check if MailComposer is available (some devices have no mail setup)
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [SUPPORT_EMAIL],
        subject: `${APP_NAME} Feedback`,
      });
    } else {
      // fallback — open default mail client with mailto
      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `${APP_NAME} Feedback`
      )}`;
      await openURL(mailtoUrl);
    }
  } catch (error) {
    Alert.alert(
      "Unable to Send Feedback",
      "Please try again later or email us directly at " + SUPPORT_EMAIL
    );
  }
}, [onSendFeedbackOverride]);

const handleRate = useCallback(async () => {
  vibrate();

  if (onRateOverride) return onRateOverride();

  try {
    const isAvailable = await StoreReview.isAvailableAsync();

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
    const storeUrl = Platform.select({
      ios: IOS_STORE_URL,
      android: ANDROID_STORE_URL,
      default: IOS_STORE_URL,
    })!;
    await openURL(storeUrl);
  }
}, [onRateOverride]);

  const handlePrivacy = useCallback(() => {
    vibrate();
    openURL(PRIVACY_URL);
  }, []);

  const handleTerms = useCallback(() => {
    vibrate();
    openURL(TERMS_URL);
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <Text style={styles.header}>Settings</Text>

      {/* Section: Pro */}
      <Section title="Pro">
  {isPro ? (
    <>
      <Row
        icon="checkmark-circle-outline"
        label="You're Pro!"
        rightText="All features unlocked"
        onPress={() => Alert.alert("🥳 Thanks for supporting LittleProgress!")}
      />
      <Row
        icon="settings-outline"
        label="Manage Subscription"
        rightText="App Store"
        onPress={() =>
          Linking.openURL(MANAGE_SUB_URL_IOS)
        }
      />
    </>
  ) : (
    <Row
      icon="rocket-outline"
      label="Upgrade to Pro"
      rightText="Unlock all features"
      onPress={showPaywall}
      pill
    />
  )}
</Section>

      {/* Section: Support */}
      <Section title="Support">
        <Row icon="mail-outline" label="Send Feedback" onPress={handleSendFeedback} />
        <Row icon="star-outline" label="Rate This App" onPress={handleRate} />
      </Section>

      {/* Section: Legal */}
      <Section title="Legal">
        <Row icon="lock-closed-outline" label="Privacy Policy" onPress={handlePrivacy} />
        <Row icon="document-text-outline" label="Terms of Use" onPress={handleTerms} />
      </Section>

      {/* Section: Data Management */}
      <Section title="Your Data">
        <Row 
          icon="share-outline" 
          label="Export Data" 
          onPress={() => {
            if (!isPro) {
              showPaywall();
              return;
            }
            exportData();
          }} 
        />
        <Row 
          icon="download-outline" 
          label="Import Data" 
          onPress={() => {
            if (!isPro) {
              showPaywall();
              return;
            }
            importData();
          }} 
        />
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{APP_NAME} • v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

/* ---------- UI Primitives ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  rightText,
  onPress,
  pill = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  rightText?: string;
  onPress?: () => void;
  pill?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pill && styles.pillRow,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.rowRight}>
        {!!rightText && <Text style={styles.rowRightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#111827" />
      </View>
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: THIRD_COLOR, // 💚 main green background
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#D1FAE5",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  pillRow: {
    borderRadius: 16,
    marginHorizontal: 6,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rowPressed: {
    backgroundColor: "#F0FDF4",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIcon: {
    color: "#22C55E",
    marginRight: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowRightText: {
    fontSize: 12,
    color: "#6B7280",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    color: "#D1FAE5",
    fontSize: 12,
  },
});


