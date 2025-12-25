import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const AnalyticsProfileHeader = () => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Image
          source={require("@/assets/icons/little-progress.png")}
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>Little Turtle</Text>
        <Text style={styles.profileSubtitle}>Level: Turtle Premium</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ANALYTICS_THEME.CARD_BG,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
  profileSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
  },
});
