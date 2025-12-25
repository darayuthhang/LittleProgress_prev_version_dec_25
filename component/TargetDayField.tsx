import React, { useState } from "react";
import { Platform, Modal, View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView } from "react-native";
// Assuming Ionicons is available in the environment (common in Expo/RN setups)
import Ionicons from 'react-native-vector-icons/Ionicons'; 

// Define a premium, clean color palette
const ACCENT_GREEN = "#00BFA5"; // Vibrant teal-green for impact
const BACKGROUND_WHITE = "#FFFFFF"; // Crisp white
const DARK_TEXT = "#212121"; // Near black for text
const PRIMARY_TEXT = "#424242"; // Darker text for labels
const SUBTLE_GRAY = "#E0E0E0"; // Light gray for dividers and borders
const DANGER_RED = "#E74C3C";

// Type updated to string to cover all fixed and custom number values
type TargetDay = string; 

// Define the available options (Updated with 1 Year and Custom)
const TARGET_OPTIONS = [
    { value: "30", label: "30 days", description: "Form a Routine", type: "fixed" },
    { value: "60", label: "60 days", description: "Habit Builder", type: "fixed" },
    { value: "90", label: "90 days", description: "Lifestyle Changer", type: "fixed" },
    { value: "365", label: "1 Year", description: "Long-term Mastery", type: "fixed" },
    { value: "custom", label: "Custom days", description: "Set your own duration", type: "custom" },
] as const;

export function TargetDaysField({
  value,
  onChange,
}: {
  value: TargetDay;
  onChange: (v: TargetDay) => void;
}) {
  const [open, setOpen] = useState(false);
  // State to toggle between the list ('select') and the input ('custom') view
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  // State to hold the temporary input for custom days
  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFixedOption = TARGET_OPTIONS.some(o => o.value === value);

  // Function to determine the display label for the trigger field
  const labelFor = (v: TargetDay) => {
    const fixedOption = TARGET_OPTIONS.find(o => o.value === v);
    if (fixedOption) {
        return `${fixedOption.label} — ${fixedOption.description}`;
    }
    // Custom day count
    return `${v} days — Custom Duration`;
  };

  // Logic when pressing an option in the list
  const handleOptionPress = (optionValue: TargetDay) => {
    if (optionValue === 'custom') {
        setMode('custom');
        // Pre-fill input if current value is already a custom number
        if (!isFixedOption) {
            setCustomInput(value);
        } else {
            setCustomInput('');
        }
    } else {
        // Fixed option selected: close immediately
        onChange(optionValue as TargetDay);
        setOpen(false);
    }
  };

  // Logic when saving the custom input
  const handleSaveCustom = () => {
    const num = parseInt(customInput, 10);
    if (num > 0 && num <= 3650) { // Max 10 years, for example
        onChange(String(num));
        setOpen(false);
        setError(null);
    } else {
        setError("Please enter a valid number of days (1-3650).");
    }
  };

  // Reset state on modal open
  const handleOpenModal = () => {
    setOpen(true);
    setMode('select');
    setError(null);
  };
  
  // --- Render Functions for Modal Content ---

  const renderSelectionList = () => (
    <View style={styles.optionContainer}>
      {TARGET_OPTIONS.map((option) => {
        // Custom selection logic: fixed matches value, custom matches if value is NOT fixed
        const isSelected = option.type === 'fixed' 
          ? option.value === value 
          : option.value === 'custom' && !isFixedOption;
        
        return (
          <Pressable
            key={option.value}
            style={styles.optionItem}
            onPress={() => handleOptionPress(option.value)}
          >
            <View>
              <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
            </View>
            
            {/* Selection Icon */}
            {isSelected && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={ACCENT_GREEN} 
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const renderCustomInput = () => (
    <View style={styles.customInputView}>
      <Text style={styles.inputHeader}>Enter Number of Days</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={(text) => {
            setCustomInput(text.replace(/[^0-9]/g, '')); // Only allow numbers
            if (error) setError(null); // Clear error on edit
        }}
        value={customInput}
        placeholder="e.g., 120"
        keyboardType="numeric"
        returnKeyType="done"
        maxLength={4}
        autoFocus
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonRow}>
        <Pressable 
            style={[styles.actionButton, styles.backButton]} 
            onPress={() => setMode('select')}
        >
            <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
        <Pressable 
            style={[styles.actionButton, styles.saveButton]} 
            onPress={handleSaveCustom}
        >
            <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save Duration</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      {/* 1. The Trigger Field (Styled for premium look) */}
      <Pressable
        style={styles.field}
        onPress={handleOpenModal}
      >
        <Text style={styles.fieldText}>{labelFor(value)}</Text>
        <Ionicons name="chevron-down" size={18} color={PRIMARY_TEXT} />
      </Pressable>

      {/* 2. Modern Bottom Sheet Modal (Used for both iOS and Android) */}
      <Modal 
          visible={open} 
          transparent 
          animationType="slide" 
          onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop Press to Close */}
        <Pressable 
            style={styles.sheetBackdrop} 
            onPress={() => setOpen(false)}
        >
          <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingContainer}
          >
            {/* Sheet Container */}
            <View style={styles.modernSheet} onTouchStart={(e) => e.stopPropagation()}>
              
              {/* Drag Handle */}
              <View style={styles.sheetHandleArea}>
                <View style={styles.sheetHandle} />
              </View>

              {/* Header Title */}
              <View style={[styles.sheetHeader, {justifyContent: 'center'}]}>
                <Text style={styles.sheetTitle}>
                    {mode === 'select' ? 'Select Target Duration' : 'Customize Days'}
                </Text>
              </View>
              
              {/* Dynamic Content */}
              {mode === 'select' ? renderSelectionList() : renderCustomInput()}
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

// ------------------------------------------------------------------
// --- STYLESHEET (MODERN & BEAUTIFUL SELECTION LIST) ---
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  // --- Input Field Styles (Clean & Premium) ---
  field: {
    flexDirection: 'row',
    marginBottom:15,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SUBTLE_GRAY,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: BACKGROUND_WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fieldText: { 
    fontSize: 16, 
    color: PRIMARY_TEXT, 
    fontWeight: '500', 
  },

  // --- Modern Bottom Sheet Styles ---
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "flex-end",
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modernSheet: { 
    backgroundColor: BACKGROUND_WHITE,
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SUBTLE_GRAY,
  },
  sheetTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: DARK_TEXT,
  },
  // Clean, minimal drag handle
  sheetHandleArea: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 45,
    height: 4,
    borderRadius: 2,
    backgroundColor: SUBTLE_GRAY,
  },
  
  // --- Custom Option List Styles ---
  optionContainer: {
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SUBTLE_GRAY,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  optionDescription: {
    fontSize: 14,
    color: PRIMARY_TEXT,
    marginTop: 2,
  },
  selectedOptionLabel: {
    color: ACCENT_GREEN, // Highlight selected label text with green
  },
  
  // --- Custom Input Styles ---
  customInputView: {
    padding: 20,
    alignItems: 'center',
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: PRIMARY_TEXT,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: SUBTLE_GRAY,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 24,
    fontWeight: '700',
    color: ACCENT_GREEN,
    textAlign: 'center',
    width: '100%',
    maxWidth: 200,
    marginBottom: 15,
  },
  errorText: {
    color: DANGER_RED,
    fontSize: 14,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: SUBTLE_GRAY,
  },
  saveButton: {
    backgroundColor: ACCENT_GREEN,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  saveButtonText: {
    color: BACKGROUND_WHITE,
  },
  
  // Removed Android Picker styles as the Modal is now used for both platforms
});
