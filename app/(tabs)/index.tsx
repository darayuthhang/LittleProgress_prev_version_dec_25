import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddButtonShowPayWall from "@/component/AddButtonShowPayWall";
import AddButtonWithID from "@/component/AddButtonWithId";
import CalendarStrip from "@/component/CalendarStrip";
import GoalCard from "@/component/GoalCard";
import ProgressBar from "@/component/ProgressBar";
import { PRIMARY_COLOR, THIRD_COLOR } from "@/constant/colorConstant";
import { LIMIT_FREE_HABITS } from "@/constant/constant";
import { SHORT_TERM_GOAL_MODAL } from "@/constant/endPointConstant";
import { iconCategoryShortGoalConstant } from "@/constant/iconConstant";
import { Turtle } from "@/constant/turtles";
import { useRevenueCat } from "@/context/RevenueCatProvider";
import { useDb } from "@/db/client";
import {
  deleteShortGoal,
  getShortGoalsByGoalId,
  updateShortGoalCompletion,
  updateShortGoalPriority,
  updateShortGoalReminder,
} from "@/db/shortGoalQueries";
import NotificationService from "@/utils/NotificationService";
import { usePointsStore } from "@/utils/pointsStore";
import { askForReview } from "@/utils/Review";
import { useStreakStore } from "@/utils/streakStore";
import { showLittleProgressToast } from "@/utils/ToastPopup";
import { ExtensionStorage } from "@bacons/apple-targets";

const storage = new ExtensionStorage("group.com.darayuthhang.LittleProgress");
type Goal = {
  id: number;
  goal: string;
  description: string | null;
  date: string;
  icon_category: string | null;
  completed: boolean | null;
  is_reminder: boolean | null;
  notification_id: string | null;
  reminder_datetime: string | null;
  is_priority: boolean | null;
};

// Memoized calendar and progress components
const MemoCalendar = React.memo(CalendarStrip);
const MemoProgress = React.memo(ProgressBar);
const MemoGoalCard = React.memo(GoalCard);



export default function IndexScreen() {
  const [habits, setHabits] = useState<Goal[]>([]);
  const db = useDb();
  

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { isPro, showPaywall } = useRevenueCat();
  const { addPoints, totalPoints } = usePointsStore();

  const [unlockedTurtle, setUnlockedTurtle] = useState<Turtle | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { checkStreak, currentStreak } = useStreakStore();
  const [headerTitle, setHeaderTitle] = useState(dayjs().format("MMMM YYYY"));
  const [showDatePicker, setShowDatePicker] = useState(false);
const reviewTimeoutRef = useRef(false);

  const onDateChange = (event: any, date?: Date) => {
    if (date) {
      setShowDatePicker(false);
      const newDate = dayjs(date);
      onHandleSelectDate(newDate);
      setHeaderTitle(newDate.format("MMMM YYYY"));
    } else if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const formattedDate = useMemo(
    () => dayjs(selectedDate).format("YYYY-MM-DD"),
    [selectedDate]
  );
// Add this helper inside IndexScreen or as a utility
const syncToWidget = (data: Goal[]) => {
  try {
    // We only want to show today's or relevant goals in the widget
    // Mapping keys to match what Swift expects (lgoal vs goal)
    const widgetData = data.map(item => ({
      id: item.id,
      lgoal: item.goal,
      description: item.description,
      date: item.date,
      iconCategory: item.icon_category,
      completed: item.completed,
      isReminder: item.is_reminder,
      notificationId: item.notification_id,
      reminderDatetime: item.reminder_datetime,
      isPriority: item.is_priority
    }));

    // Save as stringified JSON
    storage.set("todos", JSON.stringify(widgetData));
    
    // Trigger Native Widget Reload
    // reloadAllTimelines();
  } catch (e) {
    console.error("Failed to sync to widget", e);
  }
};
  // -------------------
  // 🔥 Optimized DB fetch
  // -------------------
  const fetchGoals = useCallback(async () => {
    try {
      const result = await getShortGoalsByGoalId(db as any, formattedDate);
      setHabits(result);
      // SYNC TO WIDGET HERE
    syncToWidget(result);
      // Only run ONCE
      if(result.length > 0){
        await getReview();
      }
      
      
     
  
      return result;
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  }, [db, formattedDate]);
  const getReview = async () => {
    // const SECOND_DAY = 1;
    // if (currentStreak == SECOND_DAY) {
    //   let res = await askForReview();
    // }
    await askForReview();
  };
  // Only run when screen  is focused
  useFocusEffect(
    useCallback(() => {
      //force update is bug 
  // checkForUpdate()
      fetchGoals();
  
 
    }, [fetchGoals])
  );

  // -------------------
  // Handlers
  // -------------------

  const onHandleEdit = useCallback(
    (
      id: string,
      goal: string,
      description?: string,
      icon_category?: string,
      date?: string,
      isReminder?: boolean,
      notificationId: string = "",
      reminderDateTimeSecond: string = ""
    ) => {
      router.push({
        pathname: `/modal-to-stack/${SHORT_TERM_GOAL_MODAL}`,
        params: {
          id,
          goal,
          description,
          icon_category,
          date,
          isReminder: isReminder ? "true" : "false",
          notificationId,
          reminderDateTimeSecond,
        },
      });
    },
    []
  );

  const handleOnDone = useCallback(
    async (completed: boolean, id: string) => {
      try {
        let isCompleted = await updateShortGoalCompletion(
          db as any,
          Number(id),
          completed
        );

        if (isCompleted) {
          // showLittleProgressToast();
          const newUnlockIds = addPoints(5);

          // if (newUnlockIds.length > 0) {
          //   const turtle = TURTLES.find((t) => t.id === newUnlockIds[0]);
          //   if (turtle) {
          //     setUnlockedTurtle(turtle);
          //     setShowUnlockModal(true);
          //   }
          // }
        }

        fetchGoals();
      } catch (e) {
        Alert.alert("Error", "Failed to update completion");
      }
    },
    [addPoints, fetchGoals, db]
  );

  const handleTogglePriority = useCallback(
    async (id: string, isPriority: boolean) => {
      try {
        await updateShortGoalPriority(db as any, Number(id), isPriority);
        fetchGoals(); // Refresh list to re-sort
      } catch (e) {
        Alert.alert("Error", "Failed to update priority");
      }
    },
    [fetchGoals, db]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete Goal",
        "Are you sure you want to delete this goal?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const goalToDelete = habits.find((h) => h.id.toString() === id);
                if (goalToDelete?.notification_id) {
                  await NotificationService.cancel(goalToDelete.notification_id);
                }

                await deleteShortGoal(db as any, Number(id));
                fetchGoals();
                showLittleProgressToast(true, "Goal deleted successfully"); // Reusing toast for success
              } catch (e) {
                Alert.alert("Error", "Failed to delete goal");
              }
            },
          },
        ]
      );
    },
    [fetchGoals, db, habits]
  );

  const onHandleSelectDate = useCallback((date: dayjs.Dayjs) => {
    setSelectedDate(date);
  }, []);

  const onMonthChange = useCallback((date: dayjs.Dayjs) => {
    setHeaderTitle(date.format("MMMM YYYY"));
  }, []);

  const completedCount = habits.filter((item) => item.completed).length;
  const notCompletedCount = habits.filter((item) => !item.completed).length;

  //limit to 3 habits for free user per day 
  const canAddHabit = habits.length < LIMIT_FREE_HABITS;

  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{id: string, goal: string, date: string, notificationId?: string} | null>(null);

  const handleSetReminder = useCallback(
    (
      id: string,
      goal: string,
      description?: string,
      icon_category?: string,
      date?: string,
      isReminder?: boolean,
      notificationId: string = "",
      reminderDateTimeSecond: string = ""
    ) => {
       setSelectedGoal({ id, goal, date: date || dayjs().format("YYYY-MM-DD"), notificationId });
       setIsReminderEnabled(!!isReminder);
       
       if (reminderDateTimeSecond) {
         setReminderTime(dayjs(reminderDateTimeSecond).toDate());
       } else {
         setReminderTime(new Date());
       }
       
       setReminderModalVisible(true);
    },
    []
  );

  const onReminderTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setReminderModalVisible(false);
      if (event.type === 'set' && date) {
        saveReminder(date);
      }
    } else {
      if (date) setReminderTime(date);
    }
  };

  const saveReminder = async (selectedDate: Date) => {
      if (!selectedGoal) return;
      
      try {
          const hasPermission = await NotificationService.requestPermission(true);
          if (!hasPermission) {
              Alert.alert(
                  "Permission Required",
                  "Please enable notifications to set reminders.",
                  [{ text: "OK" }]
              );
              return;
          }

          const timeStr = dayjs(selectedDate).format("HH:mm");
          const dateTimeStr = `${selectedGoal.date} ${timeStr}`;
          const reminderDateAndTimeSecond = dayjs(dateTimeStr).format("YYYY-MM-DDTHH:mm");
          
          if (selectedGoal.notificationId) {
            await NotificationService.cancel(selectedGoal.notificationId);
          }
         
          // Schedule new notification
          let notificationId = null;
            notificationId = await NotificationService.schedule(
              selectedGoal.goal,
              reminderDateAndTimeSecond
            );
            
          // Update DB
          await updateShortGoalReminder(db as any, Number(selectedGoal.id), true, notificationId, reminderDateAndTimeSecond);
          
          fetchGoals();
          setReminderModalVisible(false);
          showLittleProgressToast(true, "Reminder sent! You will be notified.");
      } catch (e) {
          console.error(e);
          Alert.alert("Error", "Failed to set reminder");
      }
  };

  const handleTimerPress = useCallback((id: string) => {
    router.push({
      pathname: "/timer-screen",
      params: { id },
    });
  }, []);

  const sections = useMemo(() => [
    { title: "Priority", data: habits.filter((h) => h.is_priority) },
    { title: "Non-Priority", data: habits.filter((h) => !h.is_priority) },
  ].filter((section) => section.data.length > 0), [habits]);

  // -------------------
  // FlatList Optimizations
  // -------------------
  const renderItem = useCallback(
    ({ item }: { item: Goal }) => (
      <MemoGoalCard
        id={item.id.toString()}
        goal={item.goal}
        completed={item.completed ?? false}
        isReminder={item.is_reminder ?? false}
        notificationId={item.notification_id ?? ""}
        reminderDateTimeSecond={item.reminder_datetime ?? ""}
        onEdit={onHandleEdit}
        onSetReminder={handleSetReminder}
        onDone={handleOnDone}
        iconImage={
          iconCategoryShortGoalConstant[
            (item.icon_category ??
              "default") as keyof typeof iconCategoryShortGoalConstant
          ]
        }
        description={item.description ?? ""}
        onPress={handleTimerPress}
        date={item.date}
        isPriority={item.is_priority ?? false}
        onTogglePriority={handleTogglePriority}
        onDelete={handleDelete}
      />
    ),
    [handleOnDone, onHandleEdit, handleSetReminder, handleTogglePriority, handleDelete, handleTimerPress]
  );

  const keyExtractor = useCallback((item: Goal) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <TurtleUnlockModal
        visible={showUnlockModal}
        turtle={unlockedTurtle}
        onClose={() => setShowUnlockModal(false)}
      /> */}

      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        {/* Left Side: Pro Button */}
        <View style={{ zIndex: 10 }}>
          {!isPro && (
            <TouchableOpacity style={styles.proButton} onPress={showPaywall}>
              <MaterialCommunityIcons name="crown" size={16} color="#fff" />
              <Text style={styles.proText}>Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Title (Absolute) */}
        <View 
          style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 0 }]} 
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Right Side: Add Button */}
        <View style={{ marginLeft: 'auto', zIndex: 10 }}>
          {isPro || canAddHabit ? (
            <AddButtonWithID
              pathName={`/modal-to-stack/${SHORT_TERM_GOAL_MODAL}`}
            />
          ) : (
            <AddButtonShowPayWall
              isShowPayWall={true}
              showPayWall={showPaywall}
            />
          )}
        </View>
      </View>

      {/* ---------- CALENDAR ---------- */}
      <MemoCalendar
        currentDate={selectedDate}
        selectedDate={selectedDate}
        onSelectDate={onHandleSelectDate}
        onMonthChange={onMonthChange}
      />

      <MemoProgress
        completed={completedCount}
        total={notCompletedCount}
        color="#FFB74D"
      />

      {/* ---------- LIST ---------- */}
      {/* ---------- LIST ---------- */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ 
            paddingVertical: 12, 
            backgroundColor: THIRD_COLOR, 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: 4
          }}>
            <View style={{ 
              backgroundColor: title === "Priority" ? "#FEF3C7" : "#E2E8F0", 
              padding: 6, 
              borderRadius: 8, 
              marginRight: 8 
            }}>
              <Ionicons 
                name={title === "Priority" ? "star" : "list"} 
                size={14} 
                color={title === "Priority" ? "#D97706" : "#64748B"} 
              />
            </View>
            <Text style={{ 
              fontSize: 13, 
              fontWeight: "700", 
              color: "#475569", 
              textTransform: 'uppercase', 
              letterSpacing: 0.8 
            }}>
              {title}
            </Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        windowSize={8}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 85 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
      />
      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <Modal
            transparent
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate.toDate()}
                    mode="date"
                    display="inline"
                    onChange={onDateChange}
                    style={styles.datePicker}
                    accentColor={PRIMARY_COLOR}
                     themeVariant="light"
                      textColor="#000"
                  />
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate.toDate()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        ))}

      {/* Reminder Picker Modal */}
      {reminderModalVisible && (
        Platform.OS === "ios" ? (
          <Modal
            transparent
            animationType="fade"
            visible={reminderModalVisible}
            onRequestClose={() => setReminderModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setReminderModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.premiumModalContainer}>
                  {/* Header */}
                  <View style={styles.modalHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={styles.modalIconContainer}>
                         {/* <Ionicons name="notifications" size={22} color={PRIMARY_COLOR} /> */}
                         <Image source={require("@/assets/icons/little-progress.png")} style={{ width: 40, height: 40 }} />
                      </View>
                      <Text style={styles.modalTitle}>Daily Reminder</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setReminderModalVisible(false)} 
                      style={styles.closeButton}
                      hitSlop={{top:10, bottom:10, left:10, right:10}}
                    >
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Toggle Row (ShortGoalModal Style) */}
                  <View style={styles.reminderToggleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.alarmIconBox}>
                        <Ionicons name="alarm-outline" size={20} color="#D97706" />
                      </View>
                      <Text style={styles.reminderLabel}>Daily Reminder</Text>
                    </View>
                    <Switch
                      value={isReminderEnabled}
                      onValueChange={async (value) => {
                        if (value) { 
                          const hasPermission = await NotificationService.requestPermission(true);
                          if (hasPermission) {
                            setIsReminderEnabled(true);
                          } else {
                            Alert.alert(
                              "Permission Required",
                              "Please enable notifications to set reminders.",
                              [{ text: "OK" }]
                            );
                            setIsReminderEnabled(false);
                          }
                        } else {
                          setIsReminderEnabled(false);
                        }
                      }}
                      trackColor={{ false: "#E5E7EB", true: PRIMARY_COLOR }}
                      thumbColor="#fff"
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>

                  {/* Date Picker */}
                  {isReminderEnabled && (
                    <View style={styles.pickerWrapper}>
                       <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        display="spinner"
                        onChange={onReminderTimeChange}
                        style={{ height: 140 }} 
                        textColor="#111827"
                      />
                    </View>
                  )}

                  {/* Save Button */}
                  <TouchableOpacity 
                    style={[styles.saveButton]}
                    activeOpacity={0.8}
                    onPress={async () => {
                      if (isReminderEnabled) {
                        await saveReminder(reminderTime);
                      } else {
                        // Turn OFF reminder
                        if (selectedGoal) {
                           try {
                             if (selectedGoal.notificationId) {
                              await NotificationService.cancel(selectedGoal.notificationId);
                            }                            
                            await updateShortGoalReminder(db as any, Number(selectedGoal.id), false, null, null);
                            fetchGoals();
                            showLittleProgressToast(true, "Reminder turned off");
                           } catch (e) {
                             console.error("Error turning off reminder", e);
                           }
                        }
                        setReminderModalVisible(false);
                      }
                    }}
                  >
                    <Text style={[styles.saveButtonText]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="default"
            is24Hour={false}
            onChange={onReminderTimeChange}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THIRD_COLOR,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  proText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  pointContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pointText: {
    fontWeight: "800",
    color: "#FFF",
    marginRight: 6,
    fontSize: 15,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    width: "90%",
    alignItems: "center",
  },
  datePicker: {
    width: "100%",
    color: "#060606ff"
  },
  premiumModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  alarmIconBox: {
    width: 38, // Slightly larger touch target
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF3C7', // Amber-100
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#1F2937',
  },
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },

});
