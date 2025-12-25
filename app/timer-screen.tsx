import { iconCategoryShortGoalConstant } from "@/constant/iconConstant";
import { useDb } from "@/db/client";
import { shortGoalTable } from "@/db/schema";
import NotificationService from "@/utils/NotificationService";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { Audio, InterruptionModeIOS } from "expo-av";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Stop } from "react-native-svg"; // Added Gradient support

// // *** CONFIGURATION ***
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// *** 🎨 NEW PSYCHOLOGY PALETTE ***
// Matching your screenshot's friendly "Turtle" vibe
const COLORS = {
  bg: "#F0FDF4",        // Very light mint background (Calming)
  surface: "#FFFFFF",   // Clean white surfaces
  
  // The "Action" Color (Matches your Checkmarks)
  accent: "#F97316",    // Vibrant Orange 
  
  // The "Brand" Color (Matches your Header)
  primary: "#22C55E",   // Fresh Green
  primaryDark: "#15803D", // Forest Green for text
  
  // UI Elements
  track: "#DCFCE7",     // Very light green for empty timer track
  subtext: "#86EFAC",   // Light green text
  border: "#BBF7D0",
};

const HOURS = Array.from({ length: 13 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const FOCUS_MODES = [
  { 
    id: "deep", 
    label: "Deep Focus", 
    icon: "flash" as const,
    image: require("@/assets/icons/daily_life/work_study/study.png"),
    desc: "No distractions"
  },
  { 
    id: "pomodoro", 
    label: "Pomodoro", 
    icon: "timer" as const,
    image: require("@/assets/icons/daily_life/work_study/manage_time.png"),
    desc: "25m work • 5m break"
  },
  { 
    id: "flow", 
    label: "Flow State", 
    icon: "infinite" as const,
    image: require("@/assets/icons/design.png"),
    desc: "Immersive work"
  },
  { 
    id: "relax", 
    label: "Relax", 
    icon: "cafe" as const,
    image: require("@/assets/icons/daily_life/mediation.png"),
    desc: "Chill vibes"
  },
];

const CLOCK_THEMES = [
  { 
    id: "classic", 
    label: "Classic", 
    colors: { track: "#F1F5F9", active: "#22C55E", accent: "#4ADE80", ticks: "#CBD5E1" },
    icon: "time" as const
  },
  { 
    id: "matcha", 
    label: "Matcha", 
    colors: { track: "#ECFCCB", active: "#65A30D", accent: "#84CC16", ticks: "#D9F99D" },
    icon: "leaf" as const
  },
  { 
    id: "ocean", 
    label: "Ocean", 
    colors: { track: "#E0F2FE", active: "#0284C7", accent: "#38BDF8", ticks: "#BAE6FD" },
    icon: "water" as const
  },
  { 
    id: "midnight", 
    label: "Midnight", 
    colors: { track: "#EDE9FE", active: "#7C3AED", accent: "#A78BFA", ticks: "#DDD6FE" },
    icon: "moon" as const
  },
  { 
    id: "sunset", 
    label: "Sunset", 
    colors: { track: "#FFEDD5", active: "#EA580C", accent: "#FB923C", ticks: "#FED7AA" },
    icon: "sunny" as const
  },
  { 
    id: "sakura", 
    label: "Sakura", 
    colors: { track: "#FCE7F3", active: "#DB2777", accent: "#F472B6", ticks: "#FBCFE8" },
    icon: "flower" as const
  },
  { 
    id: "lavender", 
    label: "Lavender", 
    colors: { track: "#F3E8FF", active: "#9333EA", accent: "#C084FC", ticks: "#E9D5FF" },
    icon: "heart" as const
  },
  { 
    id: "gold", 
    label: "Gold", 
    colors: { track: "#FEF9C3", active: "#CA8A04", accent: "#FACC15", ticks: "#FEF08A" },
    icon: "star" as const
  },
  { 
    id: "mint", 
    label: "Mint", 
    colors: { track: "#CCFBF1", active: "#0D9488", accent: "#2DD4BF", ticks: "#99F6E4" },
    icon: "snow" as const
  },
];

const BACKGROUND_SOUNDS = [
  { id: "none", label: "None", image: require("@/assets/icons/time_screen/megaphone.png"), file: null, color: "#F1F5F9" },
  { id: "rain", label: "Rain", image: require("@/assets/icons/time_screen/rain.png"), file: require("@/assets/sounds/background/rain.m4a"), color: "#E0F2FE" },
  { id: "meditation", label: "Meditation", image: require("@/assets/icons/time_screen/meditation.png"), file: require("@/assets/sounds/background/mediation.m4a"), color: "#F3E8FF" },
  { id: "forest", label: "Forest", image: require("@/assets/icons/time_screen/forest.png"), file: require("@/assets/sounds/background/forest.m4a"), color: "#DCFCE7" },
  { id: "campfire", label: "Campfire", image: require("@/assets/icons/time_screen/campfire.png"), file: require("@/assets/sounds/background/campfire.m4a"), color: "#FFEDD5" },
  { id: "ocean", label: "Ocean", image: require("@/assets/icons/time_screen/ocean.png"), file: require("@/assets/sounds/background/ocean.m4a"), color: "#CFFAFE" },
  { id: "tibet", label: "Tibet Bowl", image: require("@/assets/icons/time_screen/tibet-singing-bowl.png"), file: require("@/assets/sounds/background/tibet-singing-bowl.m4a"), color: "#FEF9C3" },
];

const secondsToParts = (sec: number) => ({
  h: Math.floor(sec / 3600),
  m: Math.floor((sec % 3600) / 60),
});

export default function TimerScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const bgSoundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef(AppState.currentState);

  // Audio loading state to prevent race conditions
  const isLoadingSound = useRef(false);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useDb();

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [iconCategory, setIconCategory] = useState("default");
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const [timerNotificationId, setTimerNotificationId] = useState<string | null>(null);
  
  const [focusMode, setFocusMode] = useState(FOCUS_MODES[0]);
  const [showFocusModes, setShowFocusModes] = useState(false);

  const [clockTheme, setClockTheme] = useState(CLOCK_THEMES[0]);
  const [showClockThemes, setShowClockThemes] = useState(false);

  const [bgSound, setBgSound] = useState(BACKGROUND_SOUNDS[0]);
  const [showBgSounds, setShowBgSounds] = useState(false);

  const snapPoints = useMemo(() => ["50%"], []);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);

  // Animation
  const progress = useRef(new Animated.Value(1)).current;
  
  const animateRing = (ratio: number) => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 500,
      useNativeDriver: false, // Reanimated not used here, standard Animated
    }).start();
  };

  useEffect(() => {
    if (timerSeconds === 0) return;
    const ratio = remainingSeconds / timerSeconds;
    animateRing(ratio <= 0 ? 0 : ratio);
  }, [remainingSeconds, timerSeconds]);

  // ================= AUDIO & NOTIFICATION SETUP =================
  useEffect(() => {
    let mounted = true;
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/timer-done.wav"),
          { shouldPlay: false }
        );
        
        if (mounted) soundRef.current = sound;
      } catch (e) {
        console.warn("Audio Setup Failed", e);
      }
    };
    setupAudio();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
      bgSoundRef.current?.unloadAsync();
      cancelScheduledNotifications(); 
    };
  }, []);

  // Optimized Audio Handler
  const playBackgroundSound = useCallback(async () => {
    if (bgSound.id === 'none' || !bgSound.file || isLoadingSound.current) return;
    
    try {
      isLoadingSound.current = true;
      
      // If sound is already loaded and matches, just play
      const status = await bgSoundRef.current?.getStatusAsync();
      if (bgSoundRef.current && status?.isLoaded) {
         await bgSoundRef.current.playAsync();
         isLoadingSound.current = false;
         return;
      }

      // Unload previous if exists
      if (bgSoundRef.current) {
        await bgSoundRef.current.unloadAsync();
      }

      // Load new sound with high quality settings
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        bgSound.file,
        { isLooping: true, shouldPlay: true, volume: 1.0 } // Full volume for quality
      );
      bgSoundRef.current = sound;
    } catch (error) {
      console.log("Error playing bg sound", error);
    } finally {
      isLoadingSound.current = false;
    }
  }, [bgSound]);

  const stopBackgroundSound = useCallback(async () => {
    try {
      if (bgSoundRef.current) {
        const status = await bgSoundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await bgSoundRef.current.pauseAsync(); // Pause instead of unload for faster resume
        }
      }
    } catch (error) {
      console.log("Error stopping bg sound", error);
    }
  }, []);

  // Handle Background Sound Selection Change - Preload or Unload
  useEffect(() => {
    const updateSound = async () => {
      
      // Always unload the previous sound first when selection changes
      if (bgSoundRef.current) {
        await bgSoundRef.current.unloadAsync();
        bgSoundRef.current = null;
      }

      if (bgSound.id === 'none') {
        return;
      }

      // If we are running, play the new sound immediately
      if (isRunning) {
        playBackgroundSound();
      }
      // If not running, we don't need to do anything; playBackgroundSound will be called when start is pressed.
      // We could preload here if we wanted, but let's keep it simple to ensure switching works.
    };
    updateSound();
  }, [bgSound]);

  // Play/Pause effect
  useEffect(() => {
    if (isRunning) {
      playBackgroundSound();
    } else {
      stopBackgroundSound();
    }
  }, [isRunning]); // Removed bgSound dependency here to avoid double-trigger

  const playDoneSound = async () => {
    if (!soundEnabled || !soundRef.current) return;
    try {
      await soundRef.current.stopAsync(); 
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.setVolumeAsync(1.0);
      await soundRef.current.playAsync();
    } catch (error) {
      console.log("Error playing sound", error);
    }
  };

  const scheduleTimerNotification = async (title: string, seconds: number) => {
    if (!soundEnabled) return;
    await cancelScheduledNotifications();
    const hasPermission = await NotificationService.requestPermission(true);
    if (!hasPermission) {
      Alert.alert("Permission Needed", "Enable notifications to hear the timer in background.");
      return;
    }
    const notifId = await NotificationService.scheduelTimeUpNotification(
      `Goal Complete: ${title} 🎉`,
      seconds
    );
    setTimerNotificationId(notifId);
  };

  const cancelScheduledNotifications = async () => {
    if (timerNotificationId) {
      await NotificationService.cancel(timerNotificationId);
      setTimerNotificationId(null);
    }
  };

  // ================= DATA LOADING =================
  useEffect(() => {
    if (!id) return;
    (async () => {
      const goalId = Number(id);
      if (Number.isNaN(goalId)) return;

      const result = await db.select().from(shortGoalTable).where(eq(shortGoalTable.id, goalId)).limit(1);
      const goal = result[0];
      if (!goal) return;

      setGoalTitle(goal.goal);
      setIconCategory(goal.icon_category || "default");

      const total = goal.timer_duration_seconds ?? 0;
      setTimerSeconds(total);
      setRemainingSeconds(total);

      const { h, m } = secondsToParts(total);
      setHours(h);
      setMinutes(m);

      setSoundEnabled(goal.timer_sound_enabled !== 0);
    })();
  }, [id]);

  // ================= TIMER LOGIC =================
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (isRunning && targetTimestamp) {
            const now = Date.now();
            const diff = Math.max(0, Math.round((targetTimestamp - now) / 1000));
            setRemainingSeconds(diff);
            if (diff <= 0) setIsRunning(false);
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isRunning, targetTimestamp]);

  useEffect(() => {
    if (!isRunning || !targetTimestamp) return;
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetTimestamp - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        setIsRunning(false);
        // playDoneSound(); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimerNotificationId(null); 
      }
    };
    tick(); 
    intervalRef.current = setInterval(tick, 500); 
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, targetTimestamp]);

  // ================= ACTIONS =================
  const handleSaveSettings = async () => {
    const total = hours * 3600 + minutes * 60;
    setTimerSeconds(total);
    setRemainingSeconds(total);
    setIsRunning(false);
    cancelScheduledNotifications();
    bottomSheetRef.current?.close();

    if (!id) return;
    await db
      .update(shortGoalTable)
      .set({
        timer_duration_seconds: total,
        timer_sound_enabled: soundEnabled ? 1 : 0,
      })
      .where(eq(shortGoalTable.id, Number(id)));
  };

  const togglePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (remainingSeconds === 0 && timerSeconds > 0) {
      const total = timerSeconds;
      setRemainingSeconds(total);
      const end = Date.now() + total * 1000;
      setTargetTimestamp(end);
      if (soundEnabled) await scheduleTimerNotification(goalTitle, total);
      setIsRunning(true);
      return;
    }
    if (isRunning) {
      setIsRunning(false);
      await cancelScheduledNotifications();
      return;
    }
    if (timerSeconds === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      bottomSheetRef.current?.expand();
      return;
    }
    const now = Date.now();
    const end = now + remainingSeconds * 1000;
    setTargetTimestamp(end);
    if (remainingSeconds > 0 && soundEnabled) {
      await scheduleTimerNotification(goalTitle, remainingSeconds);
    }
    setIsRunning(true);
  };

  const resetTimer = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRemainingSeconds(timerSeconds);
    setIsRunning(false);
    await cancelScheduledNotifications();
  };

  const handleToggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    Haptics.selectionAsync();
    if (!value && isRunning) cancelScheduledNotifications();
    else if (value && isRunning && remainingSeconds > 0) {
        await scheduleTimerNotification(goalTitle, remainingSeconds);
    }
  };

  // ================= RENDER =================
  const formatRemaining = () => {
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const { width, height } = useWindowDimensions();
  // Responsive size: limit by height for short screens (iPhone SE), limit by width for standard phones
  // Using 45% of height ensures space for top bar (approx 15%) and bottom controls (approx 20%)
  const size = Math.min(width * 0.82, height * 0.45);
  const stroke = 6; // Thinner stroke
  const padding = 10; // Extra padding to prevent clipping
  const radius = (size - stroke - padding) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedStrokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const renderTicks = useMemo(() => {
    const ticks = [];
    const cx = size / 2;
    const cy = size / 2;
    const r = radius - 25; // Position ticks inside the track

    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180); // -90 to start at top
      const isMajor = i % 5 === 0;
      const length = isMajor ? 10 : 6;
      const strokeWidth = isMajor ? 2 : 1.5;
      const color = isMajor ? clockTheme.colors.ticks : clockTheme.colors.track; // Subtle ticks

      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      const x2 = cx + (r - length) * Math.cos(angle);
      const y2 = cy + (r - length) * Math.sin(angle);

      ticks.push(
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }
    return <G>{ticks}</G>;
  }, [size, radius, clockTheme.colors.ticks, clockTheme.colors.track]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => router.push("/")}>
          <Ionicons name="chevron-down" size={28} color={COLORS.primaryDark} />
        </Pressable>
        
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {goalTitle || "Loading..."}
          </Text>
        </View>

        <Pressable
          style={styles.iconButton}
          onPress={() => {
            Haptics.selectionAsync();
            bottomSheetRef.current?.expand();
          }}
        >
          <Ionicons name="options" size={24} color={COLORS.primaryDark} />
        </Pressable>
      </View>

      {/* --- SELECTORS ROW --- */}
      <View style={styles.focusSelectorContainer}>
        {/* Focus Mode Selector */}
        {/* <TouchableOpacity 
          style={styles.focusModeCard} 
          onPress={() => setShowFocusModes(true)}
          activeOpacity={0.8}
        >
          <Image source={require("@/assets/icons/little-progress.png")} style={styles.focusTurtleIcon} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.selectorLabel}>FOCUS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.focusModeText}>{focusMode.label}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primaryDark} style={{ opacity: 0.5 }} />
            </View>
          </View>
        </TouchableOpacity> */}

        {/* Theme Selector */}
        <TouchableOpacity 
          style={styles.focusModeCard} 
          onPress={() => setShowClockThemes(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.themeIconPlaceholder, { backgroundColor: clockTheme.colors.track }]}>
            <Ionicons name={clockTheme.icon} size={18} color={clockTheme.colors.active} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.selectorLabel}>THEME</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.focusModeText}>{clockTheme.label}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primaryDark} style={{ opacity: 0.5 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Sound Selector */}
        <TouchableOpacity 
          style={styles.focusModeCard} 
          onPress={() => setShowBgSounds(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.themeIconPlaceholder, { backgroundColor: bgSound.color }]}>
            <Image source={bgSound.image} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.selectorLabel}>SOUND</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.focusModeText}>{bgSound.label}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primaryDark} style={{ opacity: 0.5 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Focus Mode Dropdown */}
        <Modal
          visible={showFocusModes}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFocusModes(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFocusModes(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select Focus Mode</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScrollContent}>
                  {FOCUS_MODES.map((mode) => (
                    <TouchableOpacity
                      key={mode.id}
                      style={[styles.visualModeCard, focusMode.id === mode.id && styles.visualModeCardActive]}
                      onPress={() => { setFocusMode(mode); setShowFocusModes(false); Haptics.selectionAsync(); }}
                      activeOpacity={0.9}
                    >
                      <View style={styles.cardImageContainer}>
                        <Image source={mode.image} style={styles.cardImage} resizeMode="contain" />
                        {focusMode.id === mode.id && <View style={styles.activeCheckBadge}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
                      </View>
                      <Text style={[styles.cardLabel, focusMode.id === mode.id && styles.cardLabelActive]}>{mode.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Theme Dropdown */}
        <Modal
          visible={showClockThemes}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClockThemes(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowClockThemes(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select Clock Theme</Text>
                <View style={styles.gridContainer}>
                  {CLOCK_THEMES.map((theme) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[styles.visualModeCard, clockTheme.id === theme.id && styles.visualModeCardActive, { marginBottom: 12 }]}
                      onPress={() => { setClockTheme(theme); setShowClockThemes(false); Haptics.selectionAsync(); }}
                      activeOpacity={0.9}
                    >
                      <View style={[styles.cardImageContainer, { backgroundColor: theme.colors.track, borderColor: theme.colors.ticks }]}>
                        <Ionicons name={theme.icon} size={32} color={theme.colors.active} />
                        {clockTheme.id === theme.id && <View style={[styles.activeCheckBadge, { backgroundColor: theme.colors.active }]}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
                      </View>
                      <Text style={[styles.cardLabel, clockTheme.id === theme.id && styles.cardLabelActive]}>{theme.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Sound Dropdown */}
        <Modal
          visible={showBgSounds}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBgSounds(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowBgSounds(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select Background Sound</Text>
                <View style={styles.gridContainer}>
                  {BACKGROUND_SOUNDS.map((sound) => (
                    <TouchableOpacity
                      key={sound.id}
                      style={[styles.visualModeCard, bgSound.id === sound.id && styles.visualModeCardActive, { marginBottom: 12 }]}
                      onPress={() => { setBgSound(sound); setShowBgSounds(false); Haptics.selectionAsync(); }}
                      activeOpacity={0.9}
                    >
                      <View style={[styles.cardImageContainer, { backgroundColor: sound.color }]}>
                        <Image source={sound.image} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
                        {bgSound.id === sound.id && <View style={[styles.activeCheckBadge, { backgroundColor: COLORS.primary }]}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
                      </View>
                      <Text style={[styles.cardLabel, bgSound.id === sound.id && styles.cardLabelActive]}>{sound.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      {/* --- TIMER VISUAL --- */}
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          {/* Background decoration */}
          <View style={styles.glowEffect} />
          
          <Svg width={size} height={size} style={styles.svg}>
            {/* Gradient Definition */}
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={clockTheme.colors.accent} stopOpacity="1" />
                <Stop offset="1" stopColor={clockTheme.colors.active} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            
            {/* Ticks Background */}
            {renderTicks}

            {/* Background Track */}
            <Circle
              stroke={clockTheme.colors.track}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              fill="none"
            />
            
            {/* Active Progress */}
            <AnimatedCircle
              stroke="url(#grad)" // Uses the theme gradient
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={animatedStrokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>

          <View style={styles.innerCircle}>
            <View style={styles.iconContainer}>
              <Image
                source={
                  iconCategoryShortGoalConstant[
                    iconCategory as keyof typeof iconCategoryShortGoalConstant
                  ]
                }
                style={styles.centerIcon}
              />
            </View>
            <Text style={styles.timerText}>{formatRemaining()}</Text>
            <View style={[styles.statusBadge, isRunning ? { backgroundColor: clockTheme.colors.accent } : styles.statusPaused]}>
              <Text style={[styles.statusText, isRunning && { color: "#FFF" }]}>
                {isRunning ? "RUNNING" : "PAUSED"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- CONTROLS --- */}
      <View style={styles.bottomControlsContainer}>
        {/* Reset */}
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
          <Ionicons name="refresh" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>

        {/* Play/Pause - THE ORANGE BUTTON */}
        <TouchableOpacity
          style={[styles.playButton, isRunning && styles.playButtonActive]}
          onPress={togglePlayPause}
          activeOpacity={0.9}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={38}
            color="#FFF"
            style={{ marginLeft: isRunning ? 0 : 4 }}
          />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            Haptics.selectionAsync();
            bottomSheetRef.current?.expand();
          }}
        >
          <Ionicons name="time" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* --- BOTTOM SHEET --- */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        style={{ zIndex: 1000 }} // Ensure sheet sits above everything
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Set Duration</Text>

          {/* Sound Toggle Card */}
          <Pressable 
            style={styles.card} 
            onPress={() => handleToggleSound(!soundEnabled)}
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: soundEnabled ? "#DCFCE7" : "#F3F4F6" },
                ]}
              >
                <Ionicons
                  name={soundEnabled ? "volume-high" : "volume-mute"}
                  size={20}
                  color={soundEnabled ? COLORS.primaryDark : "#9CA3AF"}
                />
              </View>
              <View>
                <Text style={styles.cardText}>Sound Alerts</Text>
                <Text style={styles.cardSubtext}>{soundEnabled ? "On" : "Off"}</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: "#E5E7EB", true: COLORS.primary }}
              thumbColor={"#FFF"}
            />
          </Pressable>

          {/* Picker */}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>HOURS</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.pickerItem, h === hours && styles.pickerItemSelected]}
                    onPress={() => { setHours(h); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.pickerText, h === hours && styles.pickerTextSelected]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.separatorText}>:</Text>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>MINUTES</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerItem, m === minutes && styles.pickerItemSelected]}
                    onPress={() => { setMinutes(m); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.pickerText, m === minutes && styles.pickerTextSelected]}>{m.toString().padStart(2,"0")}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <Text style={styles.saveButtonText}>Update Timer</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg, // Light mint
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 50 : 60,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primaryDark,
    opacity: 0.5,
    letterSpacing: 1,
    marginBottom: 2,
  },
  focusSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  focusModeCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    minWidth: 100,
  },
  selectorLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  focusTurtleIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  themeIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusModeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginLeft: 12,
    marginBottom: 12,
  },
  // Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)", // Lighter overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    width: "90%", // Responsive width
    maxWidth: 400,
  },
  dropdownScrollContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute evenly
    gap: 12,
  },
  visualModeCard: {
    width: "30%", // Fit 3 in a row (approx)
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  visualModeCardActive: {
    backgroundColor: "#F0FDF4",
    borderColor: COLORS.primary,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardImage: {
    width: 60,
    height: 60,
  },
  activeCheckBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#FFF",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  cardLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // No paddingBottom needed, flex: 1 handles space distribution
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowEffect: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
    transform: [{ scale: 1.2 }],
  },
  svg: {
    transform: [{ rotateZ: "0deg" }], // Ensure correct orientation
  },
  innerCircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#F0FDF4",
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFF",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  centerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  timerText: {
    fontSize: 56,
    fontWeight: "900",
    color: COLORS.primaryDark,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E6F4EA",
  },
  statusActive: {
    backgroundColor: COLORS.accent,
  },
  statusPaused: {
    backgroundColor: "#E2E8F0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  
  // --- CONTROLS ---
  bottomControlsContainer: {
    // Removed absolute positioning to prevent overlap on small screens
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    gap: 30,
    marginTop: "auto", // Pushes to bottom of flex container
    marginBottom: 40,  // Bottom margin for safety
  },
  secondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent, // Orange
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  playButtonActive: {
    backgroundColor: COLORS.primaryDark, // Turns green when running for "Safety/Stable" feel
    shadowColor: COLORS.primaryDark,
  },
  
  // --- SHEET ---
  sheetBackground: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetHandle: {
    backgroundColor: "#E2E8F0",
    width: 40,
    marginTop: 8,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  cardSubtext: {
    fontSize: 13,
    color: "#64748B",
  },
  pickerContainer: {
    flexDirection: "row",
    height: 200,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  scrollContent: {
    paddingVertical: 70, // Centers the first/last item
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 12,
    letterSpacing: 1,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: "#F0FDF4",
    width: 60,
    borderRadius: 12,
  },
  pickerText: {
    fontSize: 20,
    color: "#94A3B8",
    fontWeight: "500",
  },
  pickerTextSelected: {
    fontSize: 24,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  separatorText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#CBD5E1",
    marginTop: 35,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    marginBottom:20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    
  },
});