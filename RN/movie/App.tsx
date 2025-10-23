import { useRef } from "react";
import { View, StyleSheet, Animated, PanResponder } from "react-native";

export default function App() {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gs) => {
      return true;
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false
    }),
    onPanResponderRelease: (e, gs) => {
      // 1. 效果一
      // pan.extractOffset();
      // console.log(pan);
      // console.log(gs.dx);
      // console.log(gs.dy);
      // 2. 效果二
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false
      }).start();
    }
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.box,
          {
            transform: [
              {
                translateX: pan.x
              },
              {
                translateY: pan.y
              }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      />
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
  box: {
    width: 100,
    height: 100,
    backgroundColor: "skyblue"
  }
});
