import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProgressBarProps = {
  completed: number;
  total: number;
  color?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  color = "#81C784",
}) => {
  const progress = total > 0 ? completed / total : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>

        {/* Celebration icon next to the text */}
        <Ionicons
          name="sparkles-outline"
          size={22}
          color="#FFD54F"
          style={{ marginRight: 6, marginTop: 2 }}
        />

        {/* Your original text */}
        <Text
          style={styles.motivationText}
          numberOfLines={3}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {total} goals left for today!
        </Text>

        {/* YOUR ORIGINAL IMAGE — NOT REMOVED */}
        <Image
          source={require("@/assets/icons/main-icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 0,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },

  icon: {
    width: 50,
    height: 50,
    marginLeft: 8,
  },

  motivationText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    lineHeight: 20,
  },
});

export default ProgressBar;
