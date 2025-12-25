import { PRIMARY_COLOR } from "@/constant/colorConstant";
import { Turtle } from "@/constant/turtles";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TurtleUnlockModalProps {
  visible: boolean;
  turtle: Turtle | null;
  onClose: () => void;
}

export default function TurtleUnlockModal({ visible, turtle, onClose }: TurtleUnlockModalProps) {
  if (!turtle) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>New Turtle Unlocked!</Text>
          <View style={styles.imageContainer}>
             {/* Placeholder for image */}
             <Text style={{fontSize: 60}}>🐢</Text>
          </View>
          <Text style={styles.name}>{turtle.name}</Text>
          <Text style={styles.description}>{turtle.description}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: PRIMARY_COLOR,
    textAlign: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#E8F5E9", // Light green background
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
