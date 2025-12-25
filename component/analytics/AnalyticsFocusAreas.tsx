import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  topCategories: [string, number][];
  totalCompleted: number;
}

export const AnalyticsFocusAreas = ({ topCategories, totalCompleted }: Props) => {
  if (topCategories.length === 0) return null;

  return (
    <View style={[styles.sectionContainer, { marginTop: 20 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Top Focus Areas</Text>
        <Text style={styles.cardSubtitle}>
          Where you invest your time.
        </Text>
      </View>
      {topCategories.map(([category, count]) => (
        <View key={category} style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={styles.categoryCount}>{count} goals</Text>
          </View>
          <View style={styles.categoryBarBg}>
            <View
              style={[
                styles.categoryBarFill,
                {
                  width: `${totalCompleted > 0 ? (count / totalCompleted) * 100 : 0}%`,
                  backgroundColor: ANALYTICS_THEME.ACCENT_PURPLE,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: ANALYTICS_THEME.CARD_BG,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    width: "100%",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
    marginTop: 2,
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
  },
  categoryBarBg: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
