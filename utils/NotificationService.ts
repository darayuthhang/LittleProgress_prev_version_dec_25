import dayjs from "dayjs";
import * as Notifications from "expo-notifications";

export default class NotificationService {
  // 🔹 1. Ask for permission
  static async requestPermission(requestIfDenied: boolean = false) {
    try {
      const settings = await Notifications.getPermissionsAsync();

      const granted =
        settings.granted ||
        settings.ios?.status ===
          Notifications.IosAuthorizationStatus.AUTHORIZED ||
        settings.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (granted) return true;

      if (requestIfDenied) {
        const { granted: nowGranted } =
          await Notifications.requestPermissionsAsync({
            ios: { allowAlert: true, allowSound: true, allowBadge: true },
          });
        return nowGranted;
      }
      return false;
    } catch (error) {
      console.error("Permission error:", error);
      return false;
    }
  }

  // 🔹 2. Schedule one-time notification
  // 🔹 2. Schedule one-time notification
  static async schedule(goal: string, datetime: string) {
    try {
      // 1) permission + android channel
      // const ok = await requestPermission();
      // if (!ok) throw new Error("Notification permission not granted");

      // 2) strict parse: "YYYY-MM-DDTHH:mm"
      const parsed = dayjs(datetime, "YYYY-MM-DDTHH:mm", true);
      if (!parsed.isValid())
        throw new Error("Invalid datetime format (use YYYY-MM-DDTHH:mm)");

      // 3) roll to tomorrow if time already passed
      let date = parsed.toDate();
      const now = new Date();
      if (date <= now) {
        date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        console.log("Time passed — scheduling for tomorrow instead.");
        }
      const DEFAULT_SOUND = "ding.wav"
      // 4) schedule with DATE trigger (one-off at exact local time)
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Littleprogress",
          body: `${goal}`,
          sound: 'ding.wav',
          // Android-only; safe to include
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date, // <-- Date object in device's local time
        },
      });

      console.log("Notification scheduled:", id);
      return id;
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  // 🔹 4. Cancel a specific notification
  static async cancel(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log("Notification canceled:", notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  // 🔹 5. Cancel all notifications
  static async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async scheduelTimeUpNotification (title: string, second: number){
     const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Time's up!",
            body: `"${title}.`,
            sound: `timer-done.wav`, // Plays the device's default notification sound
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: second,
          },

        });
      return notificationId
  }

}
