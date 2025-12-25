// utils/calculateGoalProgress.ts
export function calculateGoalProgress(
  start_date: string | number, // timestamp (seconds) or date string
  target_days: number
) {
  // Normalize date (support both seconds + "YYYY-MM-DD HH:mm:ss")
  const startDate =
    typeof start_date === "number"
      ? new Date(start_date * 1000)
      : new Date(
          start_date.includes(" ")
            ? start_date.replace(" ", "T")
            : start_date
        );
        //get current user device date to keep recalculate each day
  const now = new Date();

  // Calculate full days passed between start and now
  const daysPassed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Prevent negative values (if future start date)
  const safeDaysPassed = Math.max(0, daysPassed);

  // Calculate days left based on real difference
  const dayLeft = Math.max(0, target_days - safeDaysPassed);

  // Calculate progress percentage
  const progress =
    target_days > 0 ? safeDaysPassed / target_days : 0;

  // Mark goal complete if all days passed
  const completed = safeDaysPassed >= target_days;

  return { daysPassed: safeDaysPassed, dayLeft, progress, completed };
}
