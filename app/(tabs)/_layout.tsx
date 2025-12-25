
import { HOME_SCREEN, SETTINGS_SCREEN } from "@/constant/endPointConstant";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { FOURTH_COLOR } from '../../constant/colorConstant';

const TAB_COLOR = "rgba(158, 154, 154, 1)";
const TABS_ICON_SIZE = 50;  
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={
        {
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: FOURTH_COLOR,
          borderTopWidth: 0,
          height: 90, // ⬆️ make the tab bar taller
          paddingBottom: 10, // extra bottom padding
        },
        tabBarItemStyle: {
          padding: 20, // ⬆️ space inside each tab
        },
      }}
    >
      <Tabs.Screen
        name={HOME_SCREEN}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "rgba(76, 175, 80, 0.15)"
                  : "transparent",
                padding: 10,
                // padding around your icon background
                borderRadius: 20,
              }}
            >
              <Image
                source={require("@/assets/icons/tabs/home.png")}
                style={{
                  width: TABS_ICON_SIZE,
                  height: TABS_ICON_SIZE,
                  tintColor: undefined,
                }}
                
                // resizeMode="contain"
              />
                   <Text
                style={{
                  color: focused ? "#4CAF50" : TAB_COLOR,
                  fontSize: 10,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
                >Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarStyle: {
            backgroundColor: "#F5F0E6", // Match motivation screen bg
            borderTopWidth: 0,
            height: 90,
            paddingBottom: 10,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
              backgroundColor: focused
                  ? "rgba(76, 175, 80, 0.15)"
                  : "transparent",
                padding: 10,
                borderRadius: 20,
              }}
            >
                 <Image
                source={require("@/assets/icons/tabs/analytic.png")}
                style={{
                  width: TABS_ICON_SIZE,
                  height: TABS_ICON_SIZE,
                  tintColor: undefined,
                }} />
                <Text
                style={{
                  color: focused ? "#4CAF50" : TAB_COLOR,
                  fontSize: 10,
                  fontWeight: "bold",
                                    textAlign: "center",

                }}
                >Analytic</Text>
              {/* <Ionicons
                name="stats-chart"
                size={28}
                color={focused ? "#4CAF50" : "#333"}
              /> */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="motivation"
        options={{
          tabBarStyle: {
            backgroundColor: "#F5F0E6", // Match motivation screen bg
            borderTopWidth: 0,
            height: 90,
            paddingBottom: 10,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "rgba(76, 175, 80, 0.15)"
                  : "transparent",
                padding: 10,
                borderRadius: 20,
              }}
            >
               <Image
                source={require("@/assets/icons/tabs/daily_motivation.png")}
                style={{
                  width: TABS_ICON_SIZE,
                  height: TABS_ICON_SIZE,
                  tintColor: undefined,
                }} />
                  <Text
                style={{
                  color: focused ? "#4CAF50" : TAB_COLOR,
                  fontSize: 10,
                  fontWeight: "bold",
                                    textAlign: "center",

                }}
                >Inspire</Text>
              {/* <Ionicons
                name="bulb-outline"
                size={28}
                color={focused ? "#4CAF50" : "#333"}
              /> */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name={SETTINGS_SCREEN}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "rgba(76, 175, 80, 0.15)"
                  : "transparent",
                                    padding:10,

                // padding around your icon background
                borderRadius: 20,
              }}
            >
              <Image
                source={require("@/assets/icons/tabs/settings.png")}
                style={{
                  width: TABS_ICON_SIZE,
                  height: TABS_ICON_SIZE,
                  tintColor: undefined,
                }}
                
                // resizeMode="contain"
              />
                <Text
                style={{
                  color: focused ? "#4CAF50" : TAB_COLOR,
                  fontSize: 10,
                  fontWeight: "bold",
                                    textAlign: "center",

                }}
                >Setting</Text>
            </View>
          ),
        }}
      />
     
    </Tabs>
  );
}
