import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDb } from "@/db/client";
import FancyButton from "@/component/FancyButton";
import { PRIMARY_BACKGROUND } from "@/constant/colorConstant";
import { IconCategoryPicker } from "@/component/IconCategoryPicker";
import { CategoryKey } from "@/constant/iconConstant";
import { insertGoal, updateGoalById } from "@/db/goalQueries";
import { TargetDaysField } from "@/component/TargetDayField";

export default function LongGoalModal() {
  const isPresented = router.canGoBack();
  const db = useDb();
  const params = useLocalSearchParams<{
    id?: string;
    goal?: string;
    description?: string;
    target_days?: string;
    icon_category?: string;
  }>();

  // 🧠 Determine if edit mode
  const isEditMode = !!params.id;

  // 🧠 State with fallback defaults
  const [goal, setGoal] = useState<string>(params.goal || "");
  const [description, setDescription] = useState<string>(
    params.description || ""
  );
  const [targetDays, setTargetDays] = useState<string>(
    params.target_days || "30"
  );
  const [iconCategory, setIconCategory] = useState<CategoryKey | null>(
    (params.icon_category as CategoryKey) || "default"
  );

  const handleSave = async () => {
    if (!goal.trim()) {
      Alert.alert("Goal is required", "Please enter a goal before saving.");
      return;
    }

    const targetDaysNum = parseInt(targetDays, 10) || 0;

    try {
      if (isEditMode && params.id) {
        // 🟩 Update existing goal
        await updateGoalById(
          db,
          parseInt(params.id),
          goal,
          description,
          targetDaysNum,
          iconCategory
        );
        // Alert.alert("Updated!", "Your goal has been updated successfully.");
      } else {
        // 🆕 Create new goal
        const start_date = Math.floor(Date.now() / 1000);
        await insertGoal(
          db,
          goal,
          start_date,
          targetDaysNum,
          description,
          iconCategory
        );
        // Alert.alert("Saved!", "Your new goal has been created.");
      }

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while saving.");
    }
  };

  const onSelectCategory = (category: CategoryKey) => {
    setIconCategory(category);
  };

  const isDisabled = !goal.trim();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: PRIMARY_BACKGROUND }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Close Button */}
        {isPresented && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.container}>
          <Text style={styles.title}>
            {isEditMode ? "Edit Goal" : "Long Term Goal"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: Become a better doctor"
            placeholderTextColor="#999"
            value={goal}
            maxLength={75}
            onChangeText={setGoal}
          />

          <Text style={styles.title}>
            Your why?{" "}
            <Text style={styles.optional}>
              (Optional, but helps you stay motivated 💪)
            </Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: To help people and make my family proud"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            maxLength={250}
            multiline
          />

          <Text style={styles.title}>
            How many days to achieve this goal?
          </Text>
          <TargetDaysField
            value={targetDays as "30" | "60" | "90"}
            onChange={setTargetDays}
          />

          <Text style={styles.title}>
            Pick an icon <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <IconCategoryPicker
            defaultKey={iconCategory ?? undefined}
            onSelect={onSelectCategory}
          />

         
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
             <FancyButton
            title={isEditMode ? "Update Goal" : "Save Goal"}
            onPress={handleSave}
            backgroundColor="#22C55E"
            disabled={isDisabled}
            style={{ marginTop: 5, marginBottom: 25}}
          />
      </View>
  
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  container: {},
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  optional: {
    color: "#999",
    fontSize: 12,
    fontWeight: "400",
  },
});
