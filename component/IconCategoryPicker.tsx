import React, { useEffect, useMemo, useState } from "react";
import { View, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { iconCategoryConstant } from "@/constant/iconConstant";
import { CategoryKey } from "@/constant/iconConstant";

interface IconCategoryPickerProps {
  /** Which key should be active initially if nothing is selected yet */
  defaultKey?: CategoryKey;              // e.g., "default" or "technology"
  /** Controlled selected key (optional). If provided, component is controlled */
  selectedKey?: CategoryKey;
  /** Callback when user selects an icon */
  onSelect?: (key: CategoryKey) => void;
  /** How many columns to show (default 7 like your example) */
  numColumns?: number;
  /** Optionally pass a custom data map; defaults to iconCategoryConstant */
  data?: Record<CategoryKey, any>;
}

export const IconCategoryPicker: React.FC<IconCategoryPickerProps> = ({
  defaultKey,
  selectedKey,
  onSelect,
  numColumns = 7,
  data,
}) => {
  const map = (data ?? iconCategoryConstant) as typeof iconCategoryConstant;
  const keys = useMemo(() => Object.keys(map) as CategoryKey[], [map]);
        
  // Uncontrolled internal selection (falls back to defaultKey once)
  const [internalSelected, setInternalSelected] = useState<CategoryKey | null>(null);

  // Initialize default active once (uncontrolled mode only)
  useEffect(() => {
    if (selectedKey === undefined) {
      // If defaultKey provided and exists, use it; else do nothing
      if (defaultKey && keys.includes(defaultKey)) {
        setInternalSelected(defaultKey);
      }
    }
  }, [defaultKey, selectedKey, keys]);

  const activeKey: CategoryKey | null = selectedKey ?? internalSelected;

  return (
    <FlatList
      data={keys}
      keyExtractor={(item) => item}
      numColumns={numColumns}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isActive = activeKey === item;
        return (
          <TouchableOpacity
            onPress={() => {
              onSelect?.(item);
              if (selectedKey === undefined) setInternalSelected(item); // uncontrolled
            }}
            activeOpacity={0.8}
            style={[styles.item, isActive && styles.activeItem]}
          >
            <Image source={map[item]} style={styles.icon} />
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
item: {
    // 👇 CRITICAL FIX: Allows the item to take up an equal share of the row
    flex: 1, 
    minWidth: 70, // Ensures a minimum practical width
    alignItems: 'center', // Centers the icon inside the flexible space
    
    // Original styles
    padding: 2,
    marginVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    borderWidth: 2,              
    borderColor: "transparent",  
  },
  activeItem: {
    borderColor: "#22C55E",      
  },
  icon: {
    // Keeping icon size fixed is usually desired for touch targets
    width: 60, 
    height: 60,
    borderRadius: 5,
  },
});