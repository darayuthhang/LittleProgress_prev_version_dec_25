import { calculateGoalProgress } from "@/helpers/calculateGoalHelper";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type HabitCardProps = {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
  startDate: string | number;
  targetDays: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDone?: () => void;
};

export default function HabitCard({
  image,
  title,
  subtitle,
  startDate,
  targetDays,
  onPress,
  onEdit,
  onDone,
}: HabitCardProps) {
  const { dayLeft, progress, completed } = calculateGoalProgress(
    startDate,
    targetDays
  );

  const switchRoute = () => {

  }
  // 👇 Left swipe actions
  const renderLeftActions = () => (
    <View style={styles.leftActionContainer}>
      <Pressable style={[styles.actionButton, styles.doneButton]} onPress={onDone}>
        <Ionicons name="checkmark-done" size={18} color="#fff" />
        <Text style={styles.actionText}>Done</Text>
      </Pressable>

      <Pressable style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.actionText}>Edit</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false} 
  >
    
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress?.();
        }}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* ⋮ Swipe hint (on the left side) */}
        <View style={styles.swipeHint}>
          <Ionicons name="ellipsis-vertical" size={18} color="#D1D5DB" />
        </View>

        <Image source={image} style={styles.image} />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>

          <Text style={styles.dayText}>
            {completed ? "Completed 🎉" : `${dayLeft} days left`}
          </Text>
        </View>

        {/* Right side icon section */}
        <View style={styles.rightSide}>
          {completed ? (
            <Ionicons name="checkmark-circle" size={26} color="#22C55E" />
          ) : (
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.97 }],
  },
  swipeHint: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    
  },
  textContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  dayText: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  rightSide: { marginLeft: 10 },
  // Left swipe actions
  leftActionContainer: {
    flexDirection: "row",
    alignItems: "center",
     paddingLeft: 8,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 65,
    height: "85%",
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  doneButton: {
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  editButton: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
