import { FilterType } from "@/component/analytics/AnalyticsFilter";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useMemo } from "react";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

interface AnalyticsData {
  date: string;
  completed: boolean | null;
  icon_category: string | null;
}

export const useAnalyticsStats = (data: AnalyticsData[], filter: FilterType) => {
  return useMemo(() => {
    const now = dayjs();
    let filteredGoals = [];
    let chartData = [];

    if (filter === "Week") {
      // Last 7 Days
      for (let i = 6; i >= 0; i--) {
        const d = now.subtract(i, "day");
        const dateStr = d.format("YYYY-MM-DD");
        const dayGoals = data.filter((item) => item.date === dateStr);
        const total = dayGoals.length;
        const completed = dayGoals.filter((item) => item.completed).length;

        chartData.push({
          label: d.format("ddd"),
          date: dateStr,
          total,
          completed,
          rate: total > 0 ? completed / total : 0,
        });
        filteredGoals.push(...dayGoals);
      }
    } else if (filter === "Month") {
      // Last 4 Weeks
      for (let i = 3; i >= 0; i--) {
        const startOfWeek = now.subtract(i, "week").startOf("isoWeek");
        const endOfWeek = now.subtract(i, "week").endOf("isoWeek");

        const weekGoals = data.filter((item) => {
          const d = dayjs(item.date);
          return (
            d.isAfter(startOfWeek.subtract(1, "day")) &&
            d.isBefore(endOfWeek.add(1, "day"))
          );
        });

        const total = weekGoals.length;
        const completed = weekGoals.filter((item) => item.completed).length;

        chartData.push({
          label: startOfWeek.format("MMM D"),
          date: startOfWeek.format("MMM DD"),
          total,
          completed,
          rate: total > 0 ? completed / total : 0,
        });
        filteredGoals.push(...weekGoals);
      }
    } else if (filter === "Year") {
      // Last 12 Months
      for (let i = 11; i >= 0; i--) {
        const d = now.subtract(i, "month");
        const monthStr = d.format("YYYY-MM");

        const monthGoals = data.filter((item) =>
          item.date.startsWith(monthStr)
        );
        const total = monthGoals.length;
        const completed = monthGoals.filter((item) => item.completed).length;

        chartData.push({
          label: d.format("MMM"),
          date: monthStr,
          total,
          completed,
          rate: total > 0 ? completed / total : 0,
        });
        filteredGoals.push(...monthGoals);
      }
    }

    const total = filteredGoals.length;
    const completed = filteredGoals.filter((g) => g.completed).length;
    const rate = total > 0 ? completed / total : 0;

    // Category Breakdown
    const categoryCounts: Record<string, number> = {};
    filteredGoals.forEach((g) => {
      if (g.completed && g.icon_category) {
        categoryCounts[g.icon_category] =
          (categoryCounts[g.icon_category] || 0) + 1;
      }
    });
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // Top 3

    return { total, completed, rate, chartData, topCategories };
  }, [data, filter]);
};
