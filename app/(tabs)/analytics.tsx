import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  UIManager,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ANALYTICS_THEME } from "@/constant/analyticsTheme";
import { useDb } from "@/db/client";
import { getAnalyticsData } from "@/db/shortGoalQueries";
import { useAnalyticsStats } from "@/hooks/useAnalyticsStats";
import { useStreakStore } from "@/utils/streakStore";

// Components
import { AnalyticsCompletionChart } from "@/component/analytics/AnalyticsCompletionChart";
import { AnalyticsConsistencyChart } from "@/component/analytics/AnalyticsConsistencyChart";
import { AnalyticsFilter, FilterType } from "@/component/analytics/AnalyticsFilter";
import { AnalyticsProfileHeader } from "@/component/analytics/AnalyticsProfileHeader";
import { AnalyticsStatsGrid } from "@/component/analytics/AnalyticsStatsGrid";
import { AnalyticsStreakBanner } from "@/component/analytics/AnalyticsStreakBanner";
import { LockedFeatureView } from "@/component/LockedFeatureView";
import { useRevenueCat } from "@/context/RevenueCatProvider";



if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AnalyticsScreen() {
  const db = useDb();
  const { isPro, showPaywall } = useRevenueCat();
  const { currentStreak, bestStreak } = useStreakStore();
  const [data, setData] = useState<
    { date: string; completed: boolean | null; icon_category: string | null }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("Week");

  const fetchData = useCallback(async () => {
    try {
      const result = await getAnalyticsData(db as any);
      setData(result);
      
      // Sync streak from DB to ensure consistency (e.g. after data import)
      const { getCurrentStreakFromDb, getBestStreakFromDb } = require('@/db/streakQueries');
      const dbCurrent = await getCurrentStreakFromDb(db);
      const dbBest = await getBestStreakFromDb(db);
      
      // If DB has data, make sure store matches
      if (dbCurrent > 0 || dbBest > 0) {
         useStreakStore.getState().syncStreak(dbCurrent, dbBest);
      }
      
    } catch (e) {
      console.error(e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      // seedStreakData(db);
      fetchData();
    }, [fetchData])
  );

  const handleFilterChange = (newFilter: FilterType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(newFilter);
  };

  const stats = useAnalyticsStats(data, filter);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  /* 
    We render the content regardless, but if !isPro we overlay the LockedFeatureView.
    To prevent interaction with the background content when locked, the overlay covers it.
    However, since we want the background to be visible, we don't return early.
  */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={isPro} // Disable scrolling if locked
        >
          <AnalyticsProfileHeader />
          
          <AnalyticsStreakBanner
            currentStreak={currentStreak}
            bestStreak={bestStreak}
          />

          <AnalyticsFilter filter={filter} onFilterChange={handleFilterChange} />

          <AnalyticsCompletionChart rate={stats.rate} />

          <AnalyticsStatsGrid
            completed={stats.completed}
            total={stats.total}
          />

          <AnalyticsConsistencyChart chartData={stats.chartData} />

          {/* <AnalyticsFocusAreas
            topCategories={stats.topCategories}
            totalCompleted={stats.completed}
          /> */}
        </ScrollView>

        {!isPro && (
          <LockedFeatureView
            title="Unlock Analytics"
            description="Track your progress and consistency with detailed analytics."
            onUnlock={showPaywall}
            overlay
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ANALYTICS_THEME.BG_COLOR,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
});
