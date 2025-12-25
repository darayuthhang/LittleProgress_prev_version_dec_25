import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

const ACTIVE_GREEN = "#4ADE80";
const INACTIVE_GRAY = "#CBD5E1";
const DONE_BLUE = "#F97316";

type GoalCardProps = {
  id: string;
  goal: string;
  description?: string;
  date: string;
  completed: boolean;
  icon_category: string;
  iconImage?: any;
  onPress?: (id: string) => void;
  onDone?: (completed: boolean, id: string) => void;
  onEdit?: (
    id: string,
    goal: string,
    description?: string,
    icon_category?: string,
    date?: string,
    isReminder?: boolean,
    notificationId?: string,
    reminderDateTimeSecond?: string
  ) => void;
  isReminder?: boolean;
  notificationId?: string;
  reminderDateTimeSecond?: string;
  isPriority?: boolean;
  onTogglePriority?: (id: string, isPriority: boolean) => void;
  onDelete?: (id: string) => void;
  onSetReminder?: (
    id: string,
    goal: string,
    description?: string,
    icon_category?: string,
    date?: string,
    isReminder?: boolean,
    notificationId?: string,
    reminderDateTimeSecond?: string
  ) => void;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GoalCard({
  id,
  goal,
  description,
  date,
  completed,
  icon_category,
  iconImage,
  isReminder,
  notificationId,
  reminderDateTimeSecond,
  onPress,
  onDone,
  onEdit,
  isPriority,
  onTogglePriority,
  onDelete,
  onSetReminder,
}: GoalCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate the whole card icon
    Animated.spring(scale, {
      toValue: completed ? 1.1 : 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Animate the checkbox specifically for a "pop" effect
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [completed]);

  const renderLeftActions = () => (
    <View style={styles.leftActionContainer}>


      <Pressable
        style={styles.actionButton}
        onPress={() => {
          Haptics.selectionAsync();
          onSetReminder?.(
            id,
            goal,
            description,
            icon_category,
            date,
            isReminder,
            notificationId,
            reminderDateTimeSecond
          );
        }}
      >
        <Text style={{ fontSize: 24 }}>🔔</Text>
        <Text style={[styles.actionText, { color: "#ffff", fontWeight: "bold" }]}>Reminder</Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={() => {
          Haptics.selectionAsync();
          onPress?.(id); // Navigate to timer
        }}
      >
        <Text style={{ fontSize: 24 }}>⏰</Text>
        <Text style={[styles.actionText, { color: "#ffff", fontWeight: "bold" }]}>Set Timer</Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete?.(id);
        }}
      >
        <Text style={{ fontSize: 24 }}>🗑️</Text>
        <Text style={[styles.actionText, { color: "#ffff", fontWeight: "bold" }]}>Delete</Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={() => {
          Haptics.selectionAsync();
          onEdit?.(
            id,
            goal,
            description,
            icon_category,
            date,
            isReminder,
            notificationId,
            reminderDateTimeSecond
          );
        }}
      >
        <Text style={{ fontSize: 24 }}>✏️</Text>
        <Text style={[styles.actionText, { color: "#ffff", fontWeight: "bold" }]}>Edit</Text>
      </Pressable>
    </View>
  );

  const handleToggleDone = (e?: any) => {
    e?.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDone?.(!completed, id);
  };



  return (
    <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false}>
      {/* ⭐ MAKE THE CARD CLICKABLE */}
      <Pressable
        // Removed onPress navigation
        style={({ pressed }) => [
          styles.card,
          completed && { opacity: 0.9 },
          pressed && { backgroundColor: "#F3F4F6", transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* ⋮ Swipe indicator */}
        <View style={styles.swipeHint}>
          <Ionicons name="ellipsis-vertical" size={18} color="#D1D5DB" />
        </View>
  <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                Haptics.selectionAsync();
                onTogglePriority?.(id, !isPriority);
              }}
              // hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginRight: 8 }}
            >
              <Ionicons 
                name={isPriority ? "star" : "star-outline"} 
                size={20} 
                color={isPriority ? "#F59E0B" : "#9CA3AF"} 
              />
            </TouchableOpacity>
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
          {iconImage ? (
            <Image source={iconImage} style={styles.iconImage} />
          ) : (
            <Ionicons
              name={completed ? "checkmark-circle" : "ellipse-outline"}
              size={40}
              color={completed ? ACTIVE_GREEN : INACTIVE_GRAY}
            />
          )}
        </Animated.View>

        {/* Text */}
        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
            <Text
              style={[
                styles.goalText,
                completed && { textDecorationLine: "line-through", color: "#6B7280" },
                { flexShrink: 1 }
              ]}
            >
              {goal}
            </Text>
          
          </View>

          {description ? (
            <Text style={[styles.descText, completed && { color: "#9CA3AF" }]}>
              {description}
            </Text>
          ) : (
            <Text style={styles.dateText}>{dayjs(date).format("ddd, MMM D")}</Text>
          )}
        </View>

        {/* Done Button */}
        <AnimatedTouchableOpacity
          style={[
            styles.doneButtonRight,
            !completed && {
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: "#94A3B8", // Slightly darker for better visibility
              width: 36,
              height: 36,
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              shadowOpacity: 0, // Remove shadow when not completed
              elevation: 0,
              borderRadius: 12, // Squircle shape for modern look
            },
            completed && { backgroundColor: ACTIVE_GREEN, borderRadius: 12 },
            { transform: [{ scale: checkboxScale }] }
          ]}
          onPress={handleToggleDone}
          activeOpacity={0.8}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          {completed && (
            <Ionicons
              name="checkmark-sharp"
              size={18} // Slightly larger icon for better proportion
              color="#fff"
            />
          )}
        </AnimatedTouchableOpacity>
      </Pressable>
    </Swipeable>
  );
}

/* ---------- Styles ---------- */


const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 4,
  },

  swipeHint: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainer: {
    borderRadius: 50,
    padding: 6,
    marginRight: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 3,
    // shadowRadius: 4,
    // elevation: 3,
  },

  textContainer: { flex: 1 },

  goalText: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "Poppins_600SemiBold",
  },

  descText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },

  dateText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },

  doneButtonRight: {
    backgroundColor: DONE_BLUE,
    borderRadius: 999,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },

  leftActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },

  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
  },

  editButton: {},

  actionText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins_500Medium",
  },
});