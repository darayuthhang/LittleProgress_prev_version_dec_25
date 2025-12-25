import { PRIMARY_COLOR } from "@/constant/colorConstant";
import { useAuthStore } from "@/utils/authStore";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const defaultImage = require("@/assets/icons/main-icon.png");
const secondImage = require("@/assets/icons/daily_life/home_family/spend-time-home.png");
const thirdImage = require("@/assets/icons/daily_life/work_study/manage_time.png");
const fourthImage = require("@/assets/icons/daily_life/social_relationship/small_win.png");

const slides = [
  {
    title: "Welcome to LittleProgress 🐢",
    subtitle: "Build better habits with tiny steps every day.",
    image: defaultImage,
  },
  {
  title: "Stay Focused with a Timer ⏳",
  subtitle: "Use the built-in focus timer to stay consistent with each habit.",
  image: secondImage,
},

  {
    title: "Stay Consistent",
    subtitle: "Gentle reminders help you stay on track.",
    image: thirdImage, // ⭐ SAME IMAGE NOW, you can change later
  },
  {
    title: "Celebrate Every Win",
    subtitle: "Slow & steady growth becomes your superpower.",
    image: fourthImage, // ⭐ SAME IMAGE NOW, you can change later
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = useAuthStore();
  const [page, setPage] = useState(0);

  const finish = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (page === slides.length - 1) return finish();
    scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  const handleScroll = (e: any) => {
    const current = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage(current);
  };

  return (
    <View style={styles.container}>
      {/* TOP RIGHT SKIP */}
      {page < slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* ----------- CAROUSEL ----------- */}
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Image
              source={s.image}
              style={styles.heroImage}
              resizeMode="contain"
            />

            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.subtitle}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ----------- DOTS ----------- */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === page ? "#81C784" : "#C8E6C9" },
            ]}
          />
        ))}
      </View>

      {/* ----------- BUTTONS ----------- */}
      <View style={styles.bottomBtns}>
        {page < slides.length - 1 ? (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={finish}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  slide: {
    width,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  skipBtn: {
    position: "absolute",
    top: 50,
    right: 25,
    zIndex: 20,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#555",
  },

  heroImage: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 14,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },

  bottomBtns: {
    paddingHorizontal: 30,
    paddingBottom: 45,
    width: "100%",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: PRIMARY_COLOR,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
});
