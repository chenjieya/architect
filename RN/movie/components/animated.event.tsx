import { useRef } from "react";
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView
} from "react-native";

const { width } = Dimensions.get("window");
export default function App() {
  const offectX = useRef(new Animated.Value(0)).current;

  return (
    <View>
      <ScrollView
        horizontal={true}
        style={styles.imageStyle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: offectX } } }],
          {
            useNativeDriver: false
          }
        )}
      >
        <Animated.Image
          style={[
            styles.imageStyle,
            {
              opacity: offectX.interpolate({
                inputRange: [0, width],
                outputRange: [1, 0]
              })
            }
          ]}
          src="https://img1.baidu.com/it/u=2438160282,1620721127&fm=253&app=138&f=JPEG?w=1283&h=800"
          resizeMode="cover"
        />
        <Image
          style={styles.imageStyle}
          src="https://img0.baidu.com/it/u=2140465804,1539393789&fm=253&app=138&f=JPEG?w=1256&h=800"
          resizeMode="cover"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  imageStyle: {
    height: 200,
    width: width
  }
});
