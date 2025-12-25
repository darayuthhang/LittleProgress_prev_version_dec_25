import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

export default function NiceAlert({ visible, onClose, message }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 280,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Free Plan Limit
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: "#444",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {message}
          </Text>

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: "#81C784",
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
