import { CategoryShortGoalKey, iconCategoryShortGoalConstant } from "@/constant/iconConstant";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";

interface IconCategoryPickerProps {
  /** Which key should be active initially if nothing is selected yet */
  defaultKey?: CategoryShortGoalKey;              // e.g., "default" or "technology"
  /** Controlled selected key (optional). If provided, component is controlled */
  selectedKey?: CategoryShortGoalKey;
  /** Callback when user selects an icon */
  onSelect?: (key: CategoryShortGoalKey) => void;
  /** How many columns to show (default 7 like your example) */
  numColumns?: number;
  /** Optionally pass a custom data map; defaults to iconCategoryShortGoalConstant */
  data?: Record<CategoryShortGoalKey, any>;
  /** Enable scrolling (default false) */
  scrollEnabled?: boolean;
  /** Custom style for the FlatList */
  style?: any;
}

export const IconShortGoalPicker: React.FC<IconCategoryPickerProps> = ({
  defaultKey,
  selectedKey,
  onSelect,
  numColumns = 7,
  data,
  scrollEnabled = false,
  style,
}) => {
  const map = (data ?? iconCategoryShortGoalConstant) as typeof iconCategoryShortGoalConstant;
  const keys = useMemo(() => Object.keys(map) as CategoryShortGoalKey[], [map]);
        
  // Uncontrolled internal selection (falls back to defaultKey once)
  const [internalSelected, setInternalSelected] = useState<CategoryShortGoalKey | null>(null);

  // Initialize default active once (uncontrolled mode only)
  useEffect(() => {
    if (selectedKey === undefined) {
      // If defaultKey provided and exists, use it; else do nothing
      if (defaultKey && keys.includes(defaultKey)) {
        setInternalSelected(defaultKey);
      }
    }
  }, [defaultKey, selectedKey, keys]);

  const activeKey: CategoryShortGoalKey | null = selectedKey ?? internalSelected;

  return (
    <>
    {/* <Text>  Health & Fitness</Text> */}
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
    </>
   
  );
};


const styles = StyleSheet.create({
item: {
    // 👇 CRITICAL FIX: Allows the item to take up an equal share of the row
    flex: 1, 
    alignItems: 'center', 

    // Original styles
    padding: 2,
    marginVertical: 8,
    borderRadius: 6,
    borderWidth: 2,              
    borderColor: "transparent",  
  },
  activeItem: {
    borderColor: "#22C55E",      
  },
  icon: {
    // Keeping icon size fixed is usually desired for touch targets
    width: 55, 
    height: 55,
    borderRadius: 5,
  },
});