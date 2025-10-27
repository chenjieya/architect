import { View, StyleSheet, Text, Pressable, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import type { NavigationProp } from "@react-navigation/native";

type DetailScreenNavigationProp = NavigationProp<RootStackParamList, "Detail">;

const { width } = Dimensions.get("window");

export default function HomeTabScreen() {
  const navigation = useNavigation<DetailScreenNavigationProp>();

  function onPressFunction() {
    navigation.navigate("Detail", {
      itemId: 86,
      otherParam: "anything you want here"
    });
  }

  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
      <Pressable onPress={onPressFunction} style={styles.buttonContainer}>
        <Text style={styles.textStyle}>跳转到详情页面</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  buttonContainer: {
    height: 30,
    width: width - 100,
    backgroundColor: "skyblue",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  textStyle: {
    color: "white",
    fontSize: 12
  }
});
