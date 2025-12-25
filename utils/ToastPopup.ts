import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

let lastShown = 0;

export function showLittleProgressToast(isDeleteOrReminder: boolean, msg:string) {
  const now = Date.now();
  if (now - lastShown < 2000) return; // avoid spamming
  lastShown = now;

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const messages = [
  "Nice! That’s one little progress toward your goal 🐢",
  "Little progress made — slow and steady 🐢",
  "Your turtle is proud of you 🐢💚",
  "Step by step, your turtle keeps moving forward 🐢✨",
  "Tiny step today, big win tomorrow 🌱",
  "You did it! Slow progress is still progress 🐢💪",
  "Consistency beats speed — your turtle knows that 💚",
  "Little by little, you’re growing beautifully 🌿",
  "Progress is quiet but powerful 🐢🌸",
  "Even slow rivers reach the ocean 🌊 Keep flowing.",
  "Gentle progress is still moving forward 🌼",
  "Your patience is your superpower 🐢💫",
  "The turtle never rushes — and still wins the race 🐢🏁",
  "Today’s small win matters more than you think 💚",
  "Keep moving — every step brings you closer to your dream 🌱🐢",
];

  let message = messages[Math.floor(Math.random() * messages.length)];

  if(isDeleteOrReminder){
    message = msg;
  }

  Toast.show({
    type: "success",
    text1: "You're amazing!",
    text2: message,
    position: "bottom",
    bottomOffset: 100, // 👈 shows above tab bar
    visibilityTime: 3000,
    autoHide: true,
  });
}



export function letUserKnowAboutToUpgrade(msg: string) {
  const now = Date.now();
  if (now - lastShown < 2000) return; // avoid spamming
  lastShown = now;

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  Toast.show({
    type: "upgrade", // <--- FIXED
    text1: "Heads up!",
    text2: msg,
    position: "top",
    bottomOffset: 100,
    visibilityTime: 5000,
    autoHide: true,
  });
}
