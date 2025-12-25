import { PRIMARY_COLOR } from "@/constant/colorConstant";
import { insertStreakRecord } from "@/db/streakQueries";
import { useAuthStore } from "@/utils/authStore";
import { useStreakStore } from "@/utils/streakStore";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { drizzle } from "drizzle-orm/expo-sqlite";

import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export const StreakBottomSheet = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // Make it taller to fit the premium content
  const snapPoints = useMemo(() => ["65%"], []);
  const { checkStreak, currentStreak, streakBroken, preservedStreak, recoverStreak, acknowledgeBrokenStreak } = useStreakStore();
  const { hasCompletedOnboarding } = useAuthStore();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    // Check streak on mount or when onboarding completes
    const timer = setTimeout(async () => {
      const updated = checkStreak();
      if (updated) {
        // Persist to DB
        const today = new Date().toISOString().split("T")[0];
        try {
          await insertStreakRecord(drizzleDb, today, currentStreak);
        } catch (e) {
          console.error("Failed to save streak to DB:", e);
        }
        bottomSheetModalRef.current?.present();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    []
  );

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  // Dynamic Week Logic:
  // Calculate which "batch" of 7 days the user is currently in.
  // Batch 0: Days 1-7
  // Batch 1: Days 8-14
  // etc.
  const batchIndex = Math.floor((currentStreak - 1) / 7);
  const startDay = batchIndex * 7 + 1;
  const days = Array.from({ length: 7 }, (_, i) => startDay + i);

  // Render Broken Streak UI
  if (streakBroken) {
      return (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
          onDismiss={() => {
              if (streakBroken) acknowledgeBrokenStreak();
          }}
        >
          <BottomSheetView style={styles.contentContainer}>
             <View style={styles.header}>
              <View style={styles.iconContainer}>
                 <View style={[styles.iconGradient, { backgroundColor: '#F3F4F6', shadowColor: '#9CA3AF' }]}>
                    <Ionicons name="heart-dislike" size={48} color="#EF4444" />
                 </View>
              </View>
              
              <Text style={styles.title}>Streak Broken!</Text>
              <Text style={styles.subtitle}>
                You missed yesterday and lost your {preservedStreak} day streak.
              </Text>
            </View>

            <TouchableOpacity style={styles.premiumCard} onPress={handleRecover}>
                <View style={[styles.premiumIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <FontAwesome5 name="magic" size={20} color="#6366F1" />
                </View>
                <View style={styles.premiumContent}>
                    <Text style={styles.premiumTitle}>Repair Streak</Text>
                    <Text style={styles.premiumSub}>Restore your {preservedStreak} day streak.</Text>
                </View>
                <View style={{ backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>FREE</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={handleRecover} activeOpacity={0.8} style={{ width: '100%', marginBottom: 12 }}>
                    <View
                        style={[styles.button, { backgroundColor: '#4F46E5' }]}
                    >
                        <Text style={styles.buttonText}>Repair Streak</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleClose} style={{ padding: 12 }}>
                    <Text style={{ color: '#6B7280', fontFamily: 'Poppins_600SemiBold' }}>Start Over</Text>
                </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
    >
      <BottomSheetView style={styles.contentContainer}>
        
        {/* Header Celebration */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
             <View
                style={[styles.iconGradient, { backgroundColor: '#FF8F00' }]}
             >
                <Ionicons name="flame" size={48} color="white" />
             </View>
             <View style={styles.badge}>
                <Text style={styles.badgeText}>On Fire!</Text>
             </View>
          </View>
          
          <Text style={styles.title}>{currentStreak} Day Streak!</Text>
          <Text style={styles.subtitle}>
            Every day counts! You're building a powerful habit.
          </Text>
        </View>

        {/* Weekly Progress Map */}
        <View style={styles.weekContainer}>
           <Text style={styles.weekTitle}>Weekly Progress</Text>
           <View style={styles.daysContainer}>
            {days.map((day) => {
              const isCompleted = day <= currentStreak;
              const isToday = day === currentStreak;
              
              return (
                <View key={day} style={styles.dayWrapper}>
                  <View
                    style={[
                      styles.dayCircle,
                      isCompleted && styles.dayCircleCompleted,
                      isToday && styles.dayCircleToday,
                    ]}
                  >
                    {isCompleted && !isToday ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Text style={[styles.dayText, isToday && { color: PRIMARY_COLOR }]}>{day}</Text>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>Day {day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Main Action */}
        <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.8} style={{ width: '100%', marginBottom: 40 }}>
                <View
                    style={[styles.button, { backgroundColor: PRIMARY_COLOR }]}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </View>
            </TouchableOpacity>
        </View>

      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
  
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#FF8F00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  badge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309', // Darker Amber for text readability
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: '80%',
  },
  weekContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  weekTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dayWrapper: {
    alignItems: "center",
    gap: 6,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleCompleted: {
    backgroundColor: PRIMARY_COLOR,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'white',
  },
  dayText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#9CA3AF",
  },
  dayLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    color: "#9CA3AF",
  },
  dayLabelToday: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  premiumCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  premiumIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#312E81",
  },
  premiumSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#6366F1",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "white",
  },
  footerContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  }
});
