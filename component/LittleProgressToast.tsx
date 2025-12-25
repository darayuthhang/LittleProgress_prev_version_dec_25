import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

export const LittleProgressToast = (props: BaseToastProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.toastBox}>
        {/* 🐢 Turtle mascot (replace with your own image) */}
        <Image
          source={require("@/assets/icons/toast/toast_icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />

        <View style={{ flexShrink: 1 }}>
          <Text style={styles.title}>{props.text1}</Text>
          {props.text2 ? <Text style={styles.subtitle}>{props.text2}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  toastBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: "92%",
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "#CFCFCF",
    fontSize: 13,
    marginTop: 2,
  },
});
