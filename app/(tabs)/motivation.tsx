import { LockedFeatureView } from "@/component/LockedFeatureView";
import { MOTIVATION_THEMES } from "@/constant/motivationThemes";
import { QUOTES } from "@/constant/quotes";
import { useRevenueCat } from "@/context/RevenueCatProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 90;
const SCREEN_HEIGHT = height - TAB_BAR_HEIGHT;

export default function MotivationScreen() {
  const { isPro, showPaywall } = useRevenueCat();
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());
  const [currentTheme, setCurrentTheme] = useState(MOTIVATION_THEMES[0]);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [shuffledQuotes, setShuffledQuotes] = useState<typeof QUOTES>([]);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    // Shuffle quotes on mount to give a "new" feel
    const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
    setShuffledQuotes(shuffled);
  }, []);

  const toggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLikedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const shareQuote = async (text: string) => {
    try {
      await Share.share({
        message: `${text} - via Little Progress App`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: typeof QUOTES[0] }) => {
    const isLiked = likedQuotes.has(item.id);

    return (
      <View style={[styles.slideContainer, { width }]}>
        {/* Quote Content */}
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: currentTheme.text }]}>
            {item.text}
          </Text>
          {item.author && item.author !== "Unknown" && (
            <Text style={[styles.authorText, { color: currentTheme.accent }]}>
              - {item.author}
            </Text>
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => shareQuote(item.text)}
          >
            <Ionicons
              name="share-outline"
              size={28}
              color={currentTheme.accent}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={32}
              color={isLiked ? "#E53935" : currentTheme.accent}
            />
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.bg }]}
      edges={["top"]}
    >
      <View style={{ flex: 1 }}>
        {/* Vertical Feed */}
        <FlatList
          ref={flatListRef}
          data={shuffledQuotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          scrollEnabled={isPro} // Disable scrolling if locked
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={SCREEN_HEIGHT}
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
        />

        {!isPro && (
          <LockedFeatureView
            title="Unlock Inspiration"
            description="Get daily motivation and quotes to keep you going."
            onUnlock={showPaywall}
            overlay
          />
        )}
      </View>

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowThemePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Choose a Theme</Text>
                <View style={styles.themesGrid}>
                  {MOTIVATION_THEMES.map((theme) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeOption,
                        { backgroundColor: theme.bg },
                        currentTheme.id === theme.id && styles.selectedTheme,
                      ]}
                      onPress={() => {
                        setCurrentTheme(theme);
                        // Optional: Close on select or keep open
                        // setShowThemePicker(false); 
                      }}
                    >
                      {currentTheme.id === theme.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={theme.text}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 20,
    right: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  slideContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  quoteContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  quoteText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    textAlign: "center",
    lineHeight: 40,
  },
  authorText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    marginTop: 20,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    position: "absolute",
    bottom: 120,
  },
  actionButton: {
    padding: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  themeOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  },
  selectedTheme: {
    borderColor: "#4CAF50",
    borderWidth: 3,
  },
});
