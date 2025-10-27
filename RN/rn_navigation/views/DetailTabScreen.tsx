import { View, StyleSheet, Text, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");

export default function DetailScreen() {
  useFocusEffect(
    useCallback(() => {
      console.log("进入到详情页面");

      return () => {
        console.log("退出详情页面");
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text>DetailScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
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
