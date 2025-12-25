import { PRIMARY_COLOR } from "@/constant/colorConstant";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface FancyButtonProps {
  title: string;
  onPress?: () => void;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function FancyButton({
  title,
  onPress,
  backgroundColor = PRIMARY_COLOR,
  style,
  textStyle,
  disabled = false,
}: FancyButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  // darker version of backgroundColor
  const darkerColor = PRIMARY_COLOR; // tweak for your main color

  return (
    <View style={[styles.container, style]}>
      {/* Bottom shadow layer (depth) */}
      <View
        style={[
          styles.bottomLayer,
          { backgroundColor: darkerColor },
          disabled && styles.disabledShadow,
        ]}
      />

      {/* Main animated button */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={disabled ? 1 : 0.8}
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            { backgroundColor },
            disabled && styles.disabledButton,
          ]}
          disabled={disabled}
        >
          <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
            {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "50%",
    
  },
  bottomLayer: {

    position: "absolute",
    bottom: -4, // height of shadow depth
    left: 0,
    right: 0,
    height: 50, // same or slightly smaller than main button height
    borderRadius: 12,
    zIndex: 0,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
  },
  disabledShadow: {
    // opacity: 0.6,
  },
  disabledButton: {
    // backgroundColor: PRIMARY_COLOR,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledText: {
    color: "#E5E7EB",
  },
});
