import { View, StyleSheet, Text, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text>ProfileScreen</Text>
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
