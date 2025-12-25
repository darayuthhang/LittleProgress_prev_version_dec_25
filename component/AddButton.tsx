import { Link } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR, SECOND_PRIMARY_COLOR } from '@/constant/colorConstant';
import * as Haptics from 'expo-haptics';

type AddButtonProps = {
  ahrefText?: string;
};

export default function AddButton({ ahrefText = '/modal' }: AddButtonProps) {
  return (
    <Link href={ahrefText} asChild>
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
    // position: 'absolute',
    // right: 10,
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
