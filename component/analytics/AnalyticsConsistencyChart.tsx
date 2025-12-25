import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChartData {
  label: string;
  date: string;
  total: number;
  completed: number;
  rate: number;
}

interface Props {
  chartData: ChartData[];
}

export const AnalyticsConsistencyChart = ({ chartData }: Props) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Consistency</Text>
        <Text style={styles.cardSubtitle}>
          Visualizing your daily effort.
        </Text>
      </View>
      <View style={styles.barChartContainer}>
        {chartData.map((item) => (
          <View key={item.date} style={styles.barColumn}>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${item.rate * 100}%`,
                    backgroundColor: ANALYTICS_THEME.ACCENT_GOLD,
                  },
                  item.rate === 1 && { backgroundColor: ANALYTICS_THEME.ACCENT_GREEN },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
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
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    marginTop: 16,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barBackground: {
    width: 12,
    height: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
  },
});
