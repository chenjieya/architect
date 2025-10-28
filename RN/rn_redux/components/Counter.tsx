import { Text, View, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../store/counter/counterSlice";
import type { RootState } from "../store/store";

const { width } = Dimensions.get("window");
export default function Counter() {
  const useSelectorType = useSelector.withTypes<RootState>();
  const count = useSelectorType((state) => state.counter.value);
  // const count = useSelector((state: RootState) => state.counter.value);
  const dispath = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        {/* 增加 */}
        <Pressable
          style={styles.btnContainer}
          onPress={() => dispath(increment())}
        >
          <Text>Increment</Text>
        </Pressable>
        {/* 数值 */}
        <Text>{count}</Text>
        {/* 减少 */}
        <Pressable
          style={styles.btnContainer}
          onPress={() => dispath(decrement())}
        >
          <Text>Decrement</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width - 100
  },
  btnContainer: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5
  }
});
