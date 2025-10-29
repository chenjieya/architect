import { View, StyleSheet, Text, Image, Dimensions } from "react-native";

export interface INoDataProps {
  text?: string;
}

const { width } = Dimensions.get("window");

export default function NoData({ text = "暂无数据" }: INoDataProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/no-data.png")}
        resizeMode="contain"
        style={styles.imageStyle}
      />
      <Text style={styles.textStyle}>{text}</Text>
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
  imageStyle: {
    width: width * 0.5,
    height: width * 0.5 * 0.5
  },
  textStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ddd",
    marginTop: 10
  }
});
