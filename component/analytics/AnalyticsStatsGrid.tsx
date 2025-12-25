import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  completed: number;
  total: number;
}

export const AnalyticsStatsGrid = ({ completed, total }: Props) => {
  return (
    <View style={styles.gridContainer}>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: ANALYTICS_THEME.ACCENT_GREEN }]}>
          {completed}
        </Text>
        <Text style={styles.statLabel}>Completed Goals</Text>
        <Text style={styles.statInsight}>Wins this period</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: ANALYTICS_THEME.ACCENT_BLUE }]}>
          {total}
        </Text>
        <Text style={styles.statLabel}>Total Goals</Text>
        <Text style={styles.statInsight}>Planned activities</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: ANALYTICS_THEME.CARD_BG,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
  statInsight: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
    marginTop: 2,
  },
});
