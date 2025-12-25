import { PRIMARY_COLOR, SECOND_PRIMARY_COLOR } from '@/constant/colorConstant';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link, RelativePathString } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type AddButtonWithIDProps = {
 // Changed type to primitive 'string' and ensured RelativePathString is available (if needed)
  pathName?: string | RelativePathString; 
};

// 💡 FIX: Provide a runtime default pathName to prevent 'undefined' being passed to Link.
const DEFAULT_PATH = '/(app)/create-goal'; // Replace with a sensible default route for your app

export default function AddButtonWithID({

  // Provide a default value here
  pathName = DEFAULT_PATH, 
}: AddButtonWithIDProps) {
  
  return (
    <Link
      href={{
          // pathName is now guaranteed to be a string
          pathname: "/modal-to-stack/ShortGoalModal", 
          // params: { limitHabit: limitHabit } 
        }}
      asChild
    >
      <TouchableOpacity
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <View style={styles.addButtonBackGround}>
          <Ionicons
            name="add"
            size={30}
            color={SECOND_PRIMARY_COLOR}
            style={{ fontWeight: 'bold' }}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  addButtonBackGround: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 999,
    padding: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
});
