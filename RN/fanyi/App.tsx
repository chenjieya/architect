import { Image, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { store } from "./store/store";
import { Provider } from "react-redux";

import HomeScreen from "./view/HomeScreen";
import LanguageScreen from "./view/LanguageScreen";
import HistoryScreen from "./view/HistoryScreen";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

function TopScreen() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen
        name="Transform"
        options={{ title: "翻译" }}
        component={HomeScreen}
      />
      <TopTab.Screen
        name="Language"
        options={{ title: "语言" }}
        component={LanguageScreen}
      />
    </TopTab.Navigator>
  );
}

function RootScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const { name } = route;
        return {
          headerStyle: {
            backgroundColor: "#BCCCFB"
          },
          headerTintColor: "#fff",
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: Platform.OS === "ios" ? "Georgia" : "sans-serif",
            fontWeight: 300
          },
          tabBarActiveTintColor: "#BCCCFB",
          tabBarInactiveTintColor: "#bfbfbf",
          tabBarIcon: ({ focused }) => {
            let iconSource;

            if (name === "Home") {
              iconSource = focused
                ? require("./assets/icon1Sel.png")
                : require("./assets/icon1.png");
            } else {
              iconSource = focused
                ? require("./assets/icon2Sel.png")
                : require("./assets/icon2.png");
            }
            return (
              <Image
                source={iconSource}
                style={{
                  width: 30,
                  height: 30,
                  tintColor: focused ? "#BCCCFB" : "#bfbfbf"
                }}
              />
            );
          }
        };
      }}
    >
      <Tab.Screen
        name="Home"
        component={TopScreen}
        options={{ title: "首页" }}
      />
      <Tab.Screen
        name="History"
        options={{ title: "历史", tabBarLabel: "历史记录" }}
        component={HistoryScreen}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootScreen />
      </NavigationContainer>
    </Provider>
  );
}
