import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions
} from "react-native";

const { width } = Dimensions.get("window");
export default function App() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function showHandler() {
    Animated.timing(fadeAnim, {
      duration: 1000,
      toValue: 1,
      useNativeDriver: true
    }).start();
  }
  function hideHandler() {
    Animated.timing(fadeAnim, {
      duration: 1000,
      toValue: 0,
      useNativeDriver: true
    }).start();
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          width: 100,
          height: 100,
          backgroundColor: "red",
          opacity: fadeAnim,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>Hello World</Text>
      </Animated.View>
      <Pressable
        style={[styles.btnContainer, { marginBottom: 15, marginTop: 15 }]}
        onPress={showHandler}
      >
        <Text style={styles.textStyle}>显示</Text>
      </Pressable>
      <Pressable style={styles.btnContainer} onPress={hideHandler}>
        <Text style={styles.textStyle}>隐藏</Text>
      </Pressable>
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
  btnContainer: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#EE7942",
    height: 38,
    width: width - 100,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  textStyle: {
    color: "#ffffff",
    fontSize: 18
  }
});
