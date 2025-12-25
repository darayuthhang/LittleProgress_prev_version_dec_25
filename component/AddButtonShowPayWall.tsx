import { PRIMARY_COLOR, SECOND_PRIMARY_COLOR } from "@/constant/colorConstant";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, TouchableOpacity, View } from "react-native";
type AddButtonProps = {
  isShowPayWall: boolean;
  showPayWall: () => void;
};
export default function AddButtonShowPayWall({
  isShowPayWall,
  showPayWall,
}: AddButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if(isShowPayWall){
          showPayWall();
                //  letUserKnowAboutToUpgrade("Free plan can only create 4 habits per day. Upgrade to create more.")
        }
   
      }}
    >
      <View style={styles.addButtonBackGround}>
        <Ionicons
          name="add"
          size={30}
          color={SECOND_PRIMARY_COLOR}
          style={{ fontWeight: "bold" }}
        />
      </View>
    </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
});
