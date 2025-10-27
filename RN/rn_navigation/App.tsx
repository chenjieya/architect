import { StyleSheet, Image, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RootStackParamList } from "./types/navigation";

import HomeScreen from "./views/HomeScreen";
import HomeTabScreen from "./views/HomeTabScreen";
import DetailScreen from "./views/DetailScreen";
import DetailTabScreen from "./views/DetailTabScreen";
import ProfileScreen from "./views/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={require("./assets/favicon.png")}
    />
  );
}

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={
        {
          // headerStyle: { backgroundColor: 'tomato' },
          // headerTitle: () => <LogoTitle />,
        }
      }
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "首页",
          headerStyle: {
            backgroundColor: "skyblue"
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold"
          }
        }}
      />
      {/* <Stack.Screen name="Detail" component={DetailScreen} options={{ title: '详情' }} /> */}
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({
          title: route.params.itemId + "详情页",
          headerRight: () => (
            <Button onPress={() => alert("This is a button!")} title="Info" />
          ),
          headerBackTitle: "Custom Back",
          headerBackTitleStyle: { fontSize: 30 }
        })}
      />
    </Stack.Navigator>
  );
}

// tabs
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeTabScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStackRoute() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Detail" component={DetailTabScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      {/* 堆栈 */}
      {/* {RootStack()} */}

      {/* tabs */}
      {RootStackRoute()}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
