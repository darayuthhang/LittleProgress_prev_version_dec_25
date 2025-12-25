import FancyButton from "@/component/FancyButton";
import { IconShortGoalPicker } from "@/component/IconShortGoalPicker";
import NiceAlert from "@/component/NiceAlert";
import { PRIMARY_BACKGROUND } from "@/constant/colorConstant";
import { LIMIT_FREE_HABITS } from "@/constant/constant";
import { CategoryShortGoalKey, iconCategoryShortGoalConstant } from "@/constant/iconConstant";
import { useRevenueCat } from "@/context/RevenueCatProvider";
import { useDb } from "@/db/client";
import {
  getShortGoalsByDate,
  insertShortGoal,
  updateShortGoalById,
} from "@/db/shortGoalQueries";
import NotificationService from "@/utils/NotificationService";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import "dayjs/locale/en";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { getLocales } from "expo-localization";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,

  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
// ⚙️ Day.js Setup
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
const deviceLocale = getLocales()[0]?.languageTag || "en";
dayjs.locale(deviceLocale);

const DEFAULT_TIME = dayjs().format("HH:mm");

// ✨ Recommendations Data with Icons
const GOAL_SUGGESTIONS = [
  // Health & Wellness
  { title: "Drink Water", iconKey: "drinkWater" },
  { title: "Workout", iconKey: "fitness" },
  { title: "Meditate", iconKey: "mediation" },
  { title: "Sleep 8 Hours", iconKey: "sleep" },
  { title: "Take Vitamins", iconKey: "healthcare" },
  { title: "Eat Healthy", iconKey: "eating" },
  { title: "Go for a Walk", iconKey: "walk" },
  
  // Productivity & Learning
  { title: "Read 15 mins", iconKey: "study" },
  { title: "Learn Something New", iconKey: "learn" },
  { title: "Journaling", iconKey: "writing" },
  { title: "Time Management", iconKey: "manage_time" },
  
  // Home & Family
  { title: "Tidy Room", iconKey: "clean" },
  { title: "Cook a Meal", iconKey: "cook" },
  { title: "Do Laundry", iconKey: "laundry" },
  { title: "Care for Pet", iconKey: "careForPet" },
  { title: "Family Time", iconKey: "spendTimeHome" },
  
  // Self-Care & Hobbies
  { title: "Listen to Music", iconKey: "listen_music" },
  { title: "No Social Media", iconKey: "social" },
  { title: "Celebrate Small Win", iconKey: "small_win" },
  
  // Finance & Career
  { title: "Track Budget", iconKey: "budget" },
  { title: "Pay Bills", iconKey: "pay_bill" },
];

// ✨ Memoized Item to prevent re-renders of all items when typing
// ✨ Memoized Item to prevent re-renders of all items when typing
const SuggestionItem = React.memo(({ item, onPress, isSmallDevice }: { item: typeof GOAL_SUGGESTIONS[0], onPress: (item: any) => void, isSmallDevice: boolean, isSelected?: boolean }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      // ✨ Fixed width for Horizontal
      !isSmallDevice && { width: '100%', marginRight: 0 },
    ]}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <Image
      source={iconCategoryShortGoalConstant[item.iconKey as keyof typeof iconCategoryShortGoalConstant]}
      style={styles.chipIcon}
      resizeMode="contain"
      fadeDuration={0}
    />
    <Text style={styles.chipText}>{item.title}</Text>
  </TouchableOpacity>
));

export default function ShortGoalModal() {

  const isPresented = router.canGoBack();

  const db = useDb();
  const params = useLocalSearchParams<{
    id?: string;
    goal?: string;
    description?: string;
    icon_category?: string;
    date?: string;
    isReminder?: string;
    notificationId?: string;
    reminderDateTimeSecond?: string;
    isPriority?: string;
  }>();

  // 🧠 State Initialization
  const isEditMode = !!params.id;
  const { height } = useWindowDimensions();
  // iPhone SE has height ~667. Standard iPhones ~844. Pro Max ~932.
  const isSmallDevice = height < 750;
  const isLargeDevice = height >= 900;

  // ✨ Helper: Chunk data for Multi-Row Layout
  const chunkedSuggestions = useMemo(() => {
    // SE: 1 row, Normal: 3 rows, Max: 4 rows
    let chunkSize = 3;
    if (isSmallDevice) chunkSize = 1;
    if (isLargeDevice) chunkSize = 4;

    const chunks = [];
    for (let i = 0; i < GOAL_SUGGESTIONS.length; i += chunkSize) {
      chunks.push(GOAL_SUGGESTIONS.slice(i, i + chunkSize));
    }
    return chunks;
  }, [isSmallDevice, isLargeDevice]);

  const [goal, setGoal] = useState<string>(params.goal || "");
  const [iconCategory, setIconCategory] = useState<CategoryShortGoalKey | null>(
    (params.icon_category as CategoryShortGoalKey) || "default"
  );
  const [countHabits, setcountHabits] = useState<Number>(0);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const { isPro, showPaywall } = useRevenueCat();

  // 🗓️ Date State
  const today = dayjs().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    params?.date ? params.date : today
  );
  const [endDate, setEndDate] = useState<string>("");
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // ⏰ Time State
  const initialTime = params?.reminderDateTimeSecond
    ? dayjs(params.reminderDateTimeSecond, "YYYY-MM-DDTHH:mm").format("HH:mm")
    : DEFAULT_TIME;
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [tempSelectedTime, setTempSelectedTime] = useState(initialTime);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isReminderEnabled, setIsReminderEnabled] = useState(
    params.isReminder === "true"
  );
  const [isPriority, setIsPriority] = useState(params.isPriority === "true");
  // ✅ Format date and time for display
  const formattedStartDate = dayjs(startDate).format("L");
  const formattedEndDate = endDate ? dayjs(endDate).format("L") : "None";
  const formattedTime = dayjs(selectedTime, "HH:mm").format("h:mm A");

  // Bottom Sheet Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const calendarBottomSheetRef = useRef<BottomSheet>(null);
  const timeBottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const calendarSnapPoints = useMemo(() => ["50%"], []);
  const timeSnapPoints = useMemo(() => ["40%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const fetchGoals = async () => {
    try {
      const formattedDate = dayjs(startDate).format("YYYY-MM-DD");
      const result = await getShortGoalsByDate(db, formattedDate);
      setcountHabits(result?.length || 0);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [db, startDate])
  );

  const onChangeTime = (event: any, date: Date | undefined) => {
    setShowTimePicker(Platform.OS === "ios");
    if (date) {
      const newTime = dayjs(date).format("HH:mm");
      if (Platform.OS === "ios") {
        setTempSelectedTime(newTime);
      } else {
        setSelectedTime(newTime);
        setShowTimePicker(false);
      }
    } else if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
  };

  const setReminderState = async (enable: boolean) => {
    if (enable) {
      
      const permissionGranted = await NotificationService.requestPermission(
        true
      );

      if (!permissionGranted) {
        Alert.alert(
          "Reminder Permission Required",
          "Please enable notifications in your device settings to set a reminder time for this goal.",
          [{ text: "OK" }]
        );
        setIsReminderEnabled(false);
        setShowTimePicker(false);
        return;
      }
    } else {
      let notificationId = params?.notificationId || "";
      if(notificationId){
        await NotificationService.cancel(notificationId);
      }
      setShowTimePicker(false);
    }
    setIsReminderEnabled(enable);

    if (enable) {
      setShowTimePicker(true);
    }
  };

  const onToggleTimePicker = () => {
    if (isReminderEnabled) {
      if (Platform.OS === 'ios') {
        setTempSelectedTime(selectedTime);
        timeBottomSheetRef.current?.expand();
      } else {
        setShowTimePicker(true);
      }
    }
  };

  const onConfirmTime = () => {
    setSelectedTime(tempSelectedTime);
    timeBottomSheetRef.current?.close();
  };

  const handleSave = async () => {
    if (!goal.trim()) {
      console.warn("Goal is required. Please enter a goal before saving.");
      return;
    }

    const icon = iconCategory || "default";
    const shortGoalId = parseInt(params.id || "0", 10);

    try {
      if (isEditMode && params.id) {
        // Edit mode - update single entry
        const reminderDatetime = `${startDate} ${selectedTime}`;
        const reminderDateAndTimeSecond = dayjs(reminderDatetime).format("YYYY-MM-DDTHH:mm");
        const hasGoalTextChanged = params.goal !== goal;
        let notificationId = params.notificationId || "";

        const prevReminderDateTime = params.reminderDateTimeSecond;
        const existReminderDateTime = reminderDateAndTimeSecond;
        const isSameDateAndTime = dayjs(prevReminderDateTime).isSame(
          existReminderDateTime,
          "minute"
        );
        const isTimeDateDifferent = !isSameDateAndTime;

        if (isReminderEnabled) {
          if (isTimeDateDifferent || hasGoalTextChanged) {
            if (notificationId) {
              await NotificationService.cancel(notificationId);
            }
            notificationId = await NotificationService.schedule(
              goal,
              existReminderDateTime
            );
          } else if (!notificationId) {
            notificationId = await NotificationService.schedule(
              goal,
              existReminderDateTime
            );
          }
        } else if (!isReminderEnabled && params.notificationId) {
          await NotificationService.cancel(params.notificationId);
          notificationId = "";
        }

        await updateShortGoalById(
          db,
          shortGoalId,
          goal,
          "",
          icon,
          startDate,
          isReminderEnabled,
          notificationId,
          existReminderDateTime,
          isPriority
        );
      } else {
        // Create mode - handle date range
        if (!isPro && Number(countHabits) >= LIMIT_FREE_HABITS) {
          setShowLimitAlert(true);
          return;
        }

        const datesToCreate: string[] = [];
        
        if (endDate && dayjs(endDate).isAfter(dayjs(startDate))) {
          // Create entries for date range
          let currentDate = dayjs(startDate);
          const finalDate = dayjs(endDate);
          
          while (currentDate.isBefore(finalDate, 'day') || currentDate.isSame(finalDate, 'day')) {
            datesToCreate.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(1, 'day');
          }
        } else {
          // Single date
          datesToCreate.push(startDate);
        }
        
        // Create entry for each date
        for (const dateStr of datesToCreate) {
          const reminderDatetime = `${dateStr} ${selectedTime}`;
          const reminderDateAndTimeSecond = dayjs(reminderDatetime).format("YYYY-MM-DDTHH:mm");
          let notificationId = "";

          if (isReminderEnabled) {
            notificationId = await NotificationService.schedule(
              goal,
              reminderDateAndTimeSecond
            );
          }
         
          
          const completed = false;
          await insertShortGoal(
            db,
            goal,
            "",
            icon,
            dateStr,
            completed,
            isReminderEnabled,
            notificationId,
            reminderDateAndTimeSecond,
            isPriority,
            endDate
          );
        }
      }
      router.back();
    } catch (error) {
      console.error("Error saving short goal:", error);
    }
  };

  const onSelectCategory = (category: CategoryShortGoalKey) => {
    setIconCategory(category);
    bottomSheetRef.current?.close();
  };
  
  const onDateSelect = async (date: string) => {
    if (isSelectingEndDate) {
      setEndDate(date);
    } else {
      setStartDate(date);
      // Clear end date if new start date is after current end date
      if (endDate && dayjs(date).isAfter(dayjs(endDate))) {
        setEndDate("");
      }
    }
    calendarBottomSheetRef.current?.close();
  };

  // ✨ Stable handler
  const handleRecommendationPress = useCallback((item: { title: string; iconKey: string }) => {
    setIconCategory(item.iconKey as CategoryShortGoalKey);
    setGoal(item.title);
  }, []);

  const isDisabled = !goal.trim();
  const timeDateObject = dayjs(selectedTime, "HH:mm").toDate();
  const tempTimeDateObject = dayjs(tempSelectedTime, "HH:mm").toDate();

  // Memoize suggestion render for better performance
  const renderSuggestionColumn = useCallback(
    ({ item: columnItems }: { item: typeof GOAL_SUGGESTIONS }) => (
      <View style={{ gap: 8, marginRight: 12 }}>
        {columnItems.map((suggestion) => (
          <SuggestionItem
            key={suggestion.title}
            item={suggestion}
            isSelected={false} // ✨ Disabled selection state
            onPress={handleRecommendationPress}
            isSmallDevice={isSmallDevice}
          />
        ))}
      </View>
    ),
    [handleRecommendationPress, isSmallDevice, isLargeDevice] // ✨ Removed 'goal' dependency
  );

  // getItemLayout for suggestions FlatList
  const getSuggestionItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 36, // Approximate chip height
      offset: 36 * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: typeof GOAL_SUGGESTIONS[0], index: number) => `suggestion-${index}`, []);
const ITEM_HEIGHT = 52; // Estimated height of one chip + margin
const SUGGESTIONS_HEIGHT = 7 * ITEM_HEIGHT; // 5 items * 52px = 260px
  return (
          <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: PRIMARY_BACKGROUND }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <NiceAlert
          visible={showLimitAlert}
          onClose={() => setShowLimitAlert(false)}
          message={`Free plan can only create ${LIMIT_FREE_HABITS} habits per day. Upgrade to create more.`}
        />
  
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
             {/* Main Scroll Container */}
             <ScrollView 
               contentContainerStyle={styles.scrollContainer} 
               keyboardShouldPersistTaps="handled"
               showsVerticalScrollIndicator={false}
             >
                {/* Header: Icon & Close */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 }}>
                  <TouchableOpacity 
                    style={styles.prominentIconContainer} 
                    onPress={() => bottomSheetRef.current?.expand()}
                    activeOpacity={0.7}
                  >
                     <Image 
                       source={iconCategoryShortGoalConstant[iconCategory || "default"]} 
                       style={styles.prominentIcon} 
                     />
                     <View style={styles.editBadge}>
                       <Ionicons name="pencil" size={12} color="#fff" />
                     </View>
                  </TouchableOpacity>
                  
                  {isPresented && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => router.back()}
                    >
                      <Ionicons name="close" size={25} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
  
                {/* Main Form Card */}
                <View style={styles.card}>
                  {/* Goal Input */}
                  <View style={{ marginBottom: 0 }}>
                    <TextInput
                      style={[styles.input, { marginBottom: 0 }]}
                      placeholder="Enter a goal"
                      placeholderTextColor="#999"
                      value={goal}
                      maxLength={50}
                      onChangeText={setGoal}
                    />
                    <Text style={{ textAlign: 'right', color: '#9CA3AF', fontSize: 12 }}>
                      {goal.length}/50
                    </Text>
                  </View>
  
                  {/* Start Date */}
                  <TouchableOpacity
                    style={styles.rowItem}
                    onPress={() => {
                      setIsSelectingEndDate(false);
                      calendarBottomSheetRef.current?.expand();
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconBox, { backgroundColor: "#E0F2FE" }]}>
                        <Ionicons name="calendar-outline" size={20} color="#0284C7" />
                      </View>
                      <Text style={styles.rowLabel}>Start Date</Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.valueText}>{formattedStartDate}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#ccc" />
                    </View>
                  </TouchableOpacity>
  
                  <View style={styles.divider} />
  
                  {/* End Date */}
                  <TouchableOpacity
                    style={styles.rowItem}
                    onPress={() => {
                      setIsSelectingEndDate(true);
                      calendarBottomSheetRef.current?.expand();
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconBox, { backgroundColor: "#E0F2FE" }]}>
                        <Ionicons name="calendar-outline" size={20} color="#0284C7" />
                      </View>
                      <Text style={styles.rowLabel}>End Date (Optional)</Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.valueText}>{formattedEndDate}</Text>
                      {endDate ? (
                        <TouchableOpacity onPress={() => setEndDate("")} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color="#ccc" />
                      )}
                    </View>
                  </TouchableOpacity>
  
                  <View style={styles.divider} />
  
                  {/* Daily Reminder */}
                  <View style={styles.rowItem}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
                        <Ionicons name="alarm-outline" size={20} color="#D97706" />
                      </View>
                      <Text style={[styles.rowLabel, { marginRight: 10 }]}>Daily Reminder</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {isReminderEnabled && (
                        <TouchableOpacity
                          style={[styles.timeButton, { paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }]}
                          onPress={onToggleTimePicker}
                        >
                          <Text style={[styles.timeButtonText, { fontSize: 16 }]}>{formattedTime}</Text>
                          <Ionicons name="chevron-down" size={16} color="#15803D" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      )}
                      <Switch
                        trackColor={{ false: "#e0e0e0", true: "#22C55E" }}
                        thumbColor={"#fff"}
                        ios_backgroundColor="#e0e0e0"
                        onValueChange={setReminderState}
                        value={isReminderEnabled}
                        style={{ transform: [{ scale: 0.8 }] }}
                      />
                    </View>
                  </View>
  
                  <View style={styles.divider} />
  
                  {/* Priority */}
                  <View style={styles.rowItem}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
                        <Ionicons name="star-outline" size={20} color="#D97706" />
                      </View>
                      <Text style={styles.rowLabel}>Mark as Priority</Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#e0e0e0", true: "#22C55E" }}
                      thumbColor={"#fff"}
                      ios_backgroundColor="#e0e0e0"
                      onValueChange={setIsPriority}
                      value={isPriority}
                      style={{ transform: [{ scale: 0.8 }] }}
                    />
                  </View>
  
                  {/* Android Time Picker */}
                  {isReminderEnabled && Platform.OS === 'android' && showTimePicker && (
                    <View style={{ alignItems: 'flex-end', paddingBottom: 10 }}>
                      <DateTimePicker
                        value={timeDateObject}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onChangeTime}
                      />
                    </View>
                  )}
                </View>
  
                {/* ✨ Suggestions (Multi-Row Carousel) */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.title, { fontSize: 12, color: "#666", marginBottom: 10 }]}>Suggestions</Text>
                  <FlatList
                    horizontal
                    data={chunkedSuggestions}
                    renderItem={renderSuggestionColumn}
                    keyExtractor={(_, index) => `col-${index}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 4 }}
                    // 🚀 PERFORMANCE PROPS
                    initialNumToRender={isSmallDevice ? 6 : 3} // Render fewer columns if they are taller
                    maxToRenderPerBatch={4}
                    windowSize={3}
                    removeClippedSubviews={true}
                  />
                </View>
             </ScrollView>
          </View>
  
          {/* ✨ Sticky Save Footer */}
          <View style={{ 
            paddingHorizontal: 16, 
            paddingVertical: 12, 
            backgroundColor: PRIMARY_BACKGROUND,
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.05)"
          }}>
            <FancyButton
              title={isEditMode ? "Update" : "Save"}
              onPress={handleSave}
              backgroundColor="#22C55E"
              disabled={isDisabled}
              style={{ width: '100%', marginBottom: Platform.OS === 'ios' ? 0 : 10 }}
              buttonStyle={{ paddingVertical: 12 }}
              textStyle={{ fontSize: 16, fontWeight: '600' }}
            />
          </View>
        </SafeAreaView>
         
         
          


      {/* Bottom Sheet for Icon Selection */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
  
        <BottomSheetView style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>Choose an Icon</Text>
          <TouchableOpacity 
            onPress={() => bottomSheetRef.current?.close()} 
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>
          <IconShortGoalPicker
            defaultKey={iconCategory ?? undefined}
            onSelect={onSelectCategory}
            numColumns={4}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Bottom Sheet for Calendar Selection */}
      <BottomSheet
        ref={calendarBottomSheetRef}
        index={-1}
        snapPoints={calendarSnapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sheetTitle}>{isSelectingEndDate ? "Select End Date" : "Select Start Date"}</Text>
            <TouchableOpacity 
              onPress={() => calendarBottomSheetRef.current?.close()} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <Calendar
          style={{marginBottom: 30}}
            current={isSelectingEndDate ? (endDate || startDate) : startDate}
            minDate={isSelectingEndDate ? startDate : today}
            onDayPress={(day) => {
              onDateSelect(day.dateString);
            }}
            markedDates={{
              [isSelectingEndDate ? (endDate || "") : startDate]: {
                selected: true,
                selectedColor: "#22C55E",
                selectedTextColor: "#fff",
              },
            }}
            theme={{
              todayTextColor: "#22C55E",
              arrowColor: "#22C55E",
              textDayFontWeight: "600",
            }}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Bottom Sheet for Time Selection */}
      <BottomSheet
        ref={timeBottomSheetRef}
        index={-1}
        snapPoints={timeSnapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sheetTitle}>Select Time</Text>
            <TouchableOpacity 
              onPress={() => timeBottomSheetRef.current?.close()} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center', width: '100%' }}>
            {Platform.OS === 'ios' && (
              <DateTimePicker
                value={tempTimeDateObject}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={onChangeTime}
                themeVariant="light"
                textColor="#000"
                style={{ width: '100%' }}
              />
            )}
          </View>
          <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20, marginBottom: 30, alignItems: 'flex-end' }}>
            <FancyButton
              title="Done"
              onPress={onConfirmTime}
              backgroundColor="#22C55E"
              style={{ width: 'auto' }}
              buttonStyle={{ paddingHorizontal: 30 }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
    scrollContainer2: {
    flexGrow: 1,
    height:"50%"
 
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  container: {},
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#111",
  },
  input: {



    // marginBottom: 15,
    backgroundColor: "#fff",
  
    // Keep your other styling properties (e.g., placeholderTextColor, padding, font size)
    
    // --- Add/Modify these properties to remove the border ---
    borderWidth: 0, // Explicitly set border width to zero
    borderColor: 'transparent', // Ensure border color is transparent if borderWidth is > 0
    borderBottomWidth: 0, // If only a bottom border was present
    // You might also need to set border color to remove it visually if borderWidth is implied
    
    // Example of other styles you might keep:
    padding: 10,
    fontSize: 20,
    fontWeight: "600",
    color: '#000',
    // ...

  },
  // ✨ Styles for Recommendations
recommendationScrollVertical: {
    // Allows items to wrap onto new lines
    flexDirection: 'column',
    
   

  },
  chip: {
    // flex: 1, // ✨ REMOVED GRID STRETCH for Horizontal
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    // Premium Look: Remove border, add soft shadow
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12, // Larger touch target
    marginRight: 12, // Restored fixed margin for horizontal
    marginTop: 2, // Space for shadow
    marginBottom: 2, // Space for shadow
    shadowColor: "#000", // Soft shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chipIcon: {
    width: 32, // Goldilocks size
    height: 32,
    marginRight: 10,
  },
  chipText: {
    // flex: 1, // ✨ REMOVED wrap for horizontal
    fontSize: 14,
    color: "#374151", // Softer text color
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  optional: {
    color: "#999",
    fontSize: 12,
    fontWeight: "400",
  },
  // 🆕 Modern Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    // Soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 44, // Align with text, skipping icon
  },
  calendarWrapper: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  timePickerContainer: {
    paddingTop: 0,
    paddingBottom: 10,
    alignItems: "flex-end", // Aligns time to the right
  },
  timeButton: {
    backgroundColor: "#F0FDF4", // Light green bg
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#15803D",
  },
  pickerWrapper: {
    flex:1,
    marginTop: 10,

    alignItems:"center",
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 12,
  },
  prominentIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",    // backgroundColor: "#F3E8FF",
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: "#511c74ff",
    // shadowColor: "#5a5656ff",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 3,
    // shadowRadius: 4,
    // elevation: 3,
  },
  prominentIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});