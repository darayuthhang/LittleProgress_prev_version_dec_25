import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface Props {
  currentStreak: number;
  bestStreak: number;
}

export const AnalyticsStreakBanner = ({ currentStreak, bestStreak }: Props) => {
  // Gamification: Calculate next milestone
  const milestones = [3, 7, 14, 30, 60, 90, 100, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak) || currentStreak + 30;
  const progress = Math.min(currentStreak / nextMilestone, 1);
  const remaining = nextMilestone - currentStreak;

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.streakCountRow}>
              <Text style={styles.streakCount}>{currentStreak}</Text>
              <View style={styles.flameIconContainer}>
                <Ionicons name="flame" size={28} color="#FFF" />
              </View>
            </View>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.bestBadge}>
            <Ionicons name="trophy" size={16} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.bestText}>Best: {bestStreak}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.milestoneRow}>
            <Text style={styles.progressText}>{(progress * 100).toFixed(0)}%</Text>
            <Text style={styles.milestoneText}>Next Goal: {nextMilestone} Days</Text>
          </View>
        </View>

        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            🔥 Only {remaining} more days to hit your next milestone!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
    shadowColor: "#FF8F00", // Golden Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    backgroundColor: "#FF8F00", // Golden Fire Solid
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  streakCountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakCount: {
    fontSize: 48,
    fontFamily: "Poppins_700Bold",
    color: "#FFF",
    lineHeight: 56,
  },
  flameIconContainer: {
    marginLeft: 8,
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: -4,
  },
  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bestText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 6,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  milestoneText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  motivationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
  },
  motivationText: {
    color: "#FFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
