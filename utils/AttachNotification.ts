import * as Notifications from "expo-notifications";

// iOS: show alerts even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,

  }),
});
// (optional) log incoming notifications
export function attachNotificationLoggers() {
  const s1 = Notifications.addNotificationReceivedListener((n) => {
    console.log("🔔 received:", n.request.identifier, n.request.content.title);
  });
  const s2 = Notifications.addNotificationResponseReceivedListener((r) => {
    console.log("👉 user tapped action:", r.actionIdentifier, "data:", r.notification.request.content.data);
  });

  return { s1, s2 };
}
