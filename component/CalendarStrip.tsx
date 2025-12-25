import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import React, { useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
dayjs.extend(isoWeek);

// NOTE: Ensure your paths for colorConstant are correct
import { PRIMARY_COLOR } from "@/constant/colorConstant";

type CalendarStripProps = {
  currentDate: dayjs.Dayjs;
  selectedDate: dayjs.Dayjs;
  onSelectDate: (date: dayjs.Dayjs) => void;
  onMonthChange?: (date: dayjs.Dayjs) => void;
};

type WeekItem = {
  id: string;
  start: dayjs.Dayjs;
};

// --- START: Extracted and Memoized Week Component ---
type RenderWeekProps = {
    item: WeekItem;
    width: number; 
    selectedDate: dayjs.Dayjs;
    today: dayjs.Dayjs;
    onSelectDate: (date: dayjs.Dayjs) => void;
  };
  
  const getWeekDays = (startOfWeek: dayjs.Dayjs) =>
    Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  
  /* 
   * SIMPLIFIED RENDER WEEK 
   * Removed memo() to guarantee updates on selection change 
   */
  const RenderWeek = ({ 
      item, 
      width, 
      selectedDateString, // Pass primitive string for 100% safe comparison 
      today, 
      onSelectDate 
  }: any) => {
    const weekDays = useMemo(() => getWeekDays(item.start), [item.start]);
  
    return (
      <View style={{ width }}>
        <View style={styles.weekContainer}>
          {weekDays.map((day) => {
            // String comparison is safer than object reference
            const isSelected = day.format("YYYY-MM-DD") === selectedDateString;
            const isToday = day.isSame(today, "day");
  
            return (
              <TouchableOpacity
                key={day.format("YYYY-MM-DD")}
                style={[
                  styles.dayContainer,
                  isSelected && styles.dayContainerSelected,
                  isToday && !isSelected && styles.dayContainerToday, // Outline the whole container for Today
                ]}
                onPress={() => onSelectDate(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                    isToday && !isSelected && styles.todayText,
                  ]}
                >
                  {day.format("dd")}
                </Text>
  
                <View
                  style={[
                    styles.dayCircle,
                    isSelected && styles.dayCircleSelected,
                    // isToday && !isSelected && styles.dayCircleToday, // Removed: Container handles border now
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.dayNumberSelected,
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {day.format("D")}
                  </Text>
                </View>
  
                {isToday && !isSelected && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
// --- END: Extracted and Memoized Week Component ---


const TABLET_WIDTH_THRESHOLD = 600;

export default function CalendarStrip({
  currentDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: CalendarStripProps) {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList<WeekItem>>(null);
  const today = dayjs();

  const WEEKS_BEFORE = 52;
  const WEEKS_AFTER = 52;

  const base = today.startOf("isoWeek");

  // Memoize the weeks array so it's only calculated once
  const weeks = useMemo(() => {
    return Array.from(
      { length: WEEKS_BEFORE + WEEKS_AFTER },
      (_, i) => {
        const offset = i - WEEKS_BEFORE;
        const start = base.add(offset, "week");
        return { id: `week-${i}-${start.format("YYYY-MM-DD")}`, start };
      }
    );
  }, [base]); // Depend on 'base' (which is start of today's isoWeek) - only calculates once

  const todayIndex = WEEKS_BEFORE;
  const initialized = useRef(false);

  useEffect(() => {
    // Scroll to today's week on initial load
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: todayIndex,
        animated: false,
      });
      if (onMonthChange) {
        onMonthChange(today);
      }
      initialized.current = true;
    }, 50);
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    const selectedWeekStart = selectedDate.startOf("isoWeek");
    const index = weeks.findIndex((w) =>
      w.start.isSame(selectedWeekStart, "day")
    );
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [selectedDate, weeks]);

  // Use a callback for renderItem to avoid creating a new function on every render
  const selectedDateString = selectedDate.format("YYYY-MM-DD");

  const renderItemCallback = ({ item }: { item: WeekItem }) => (
    <RenderWeek
      item={item}
      width={width}
      selectedDateString={selectedDateString} // Pass string
      today={today}
      onSelectDate={onSelectDate}
    />
  );

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!initialized.current) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    const newWeekStart = weeks[index].start;
    if (onMonthChange) {
      onMonthChange(newWeekStart.add(3, "day"));
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={weeks}
        extraData={selectedDateString} // Re-render when string changes
        renderItem={renderItemCallback} // Use the memoized callback
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        initialScrollIndex={todayIndex}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={{ width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    // paddingBottom: 8, // Increased padding
  },

  calendarWrapper: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  monthText: {
    textAlign: "center",
    fontSize: 18, 
    fontFamily: "Poppins_500Medium",
    color: "#333", 
    marginBottom: 8, 
  },

  /* Full-width row */
  weekContainer: {
    flexDirection: "row",
    width: "100%",
    paddingRight: 20, // ✨ CHANGE: Set to 0 to remove padding on the sides
    // paddingVertical: 8,
    // marginRight:14
  },

  /* Whole touch area for each day */
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1, 
    // paddingVertical: 6,
    padding:6,
    // paddingRight:14
  },
  
  dayContainerSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24, // Pill shape
    // Shadow for depth
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  dayContainerToday: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 24,
  },

  /* WEEKDAY LABEL (Mo, Tu, We...) */
  dayLabel: {
    fontSize: 12, 
    color: "#555", 
    textTransform: "uppercase",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2, // Tiny space between label and circle
  },

  dayLabelSelected: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },

  /* CIRCLE behind the number */
  dayCircle: {
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: "center",
    justifyContent: "center",
  },

  dayCircleSelected: {
    backgroundColor: "#FFFFFF", 
  },

  /* DAY NUMBER (17, 18...) */
  dayNumber: {
    fontSize: 16, 
    color: "#333", 
    fontFamily: "Poppins_600SemiBold",
  },

  dayNumberSelected: {
    color: PRIMARY_COLOR,
    fontFamily: "Poppins_700Bold",
  },

  todayText: {
    // color: PRIMARY_COLOR,
    fontFamily: "Poppins_600SemiBold",
  },

  /* Today dot */
  dot: {
    // width: 6, 
    // height: 6, 
    // borderRadius: 3, 
    // backgroundColor: PRIMARY_COLOR,
    // marginTop: 4,
  },
});