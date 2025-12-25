import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type FilterType = "Week" | "Month" | "Year";

interface Props {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const AnalyticsFilter = ({ filter, onFilterChange }: Props) => {
  return (
    <View style={styles.filterContainer}>
      {(["Week", "Month", "Year"] as FilterType[]).map((f) => (
        <TouchableOpacity
          key={f}
          style={[
            styles.filterButton,
            filter === f && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(f)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === f && styles.filterTextActive,
            ]}
          >
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: ANALYTICS_THEME.CARD_BG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: ANALYTICS_THEME.SUBTEXT_COLOR,
  },
  filterTextActive: {
    color: ANALYTICS_THEME.TEXT_COLOR,
  },
});
