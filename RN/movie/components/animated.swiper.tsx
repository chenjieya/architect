import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Animated
} from "react-native";

const { width: windowWidth } = Dimensions.get("window");

const images = new Array(6).fill(
  "https://images.unsplash.com/photo-1493612276216-ee3925520721?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
);
export default function App() {
  const offectX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        {/* 图片 */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: offectX } } }],
            { useNativeDriver: false }
          )}
        >
          {images.map((item, index) => {
            return (
              <View style={{ width: windowWidth, height: 250 }} key={index}>
                <ImageBackground
                  resizeMode="cover"
                  source={{ uri: item }}
                  style={styles.imageStyle}
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.infoText}>
                      {"Image - " + (index + 1)}
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            );
          })}
        </ScrollView>
        {/* 小圆点 */}
        <View style={styles.indicatorContainer}>
          {images.map((item, index) => {
            return (
              <Animated.View
                style={[
                  styles.normalDot,
                  {
                    width: offectX.interpolate({
                      inputRange: [
                        windowWidth * (index - 1),
                        windowWidth * index,
                        windowWidth * (index + 1)
                      ],
                      outputRange: [8, 16, 8],
                      extrapolate: "clamp" // 当输入值超出范围的时候，输出值不要按照比例缩放，而是直接返回输出值
                    })
                  }
                ]}
                key={index}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  scrollContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center"
  },

  imageStyle: {
    flex: 1,
    width: windowWidth,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  textContainer: {
    backgroundColor: "rgba(0,0,0, 0.7)",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 5
  },
  infoText: {
    color: "#fff",
    fontSize: 16
  },
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "silver",
    marginHorizontal: 4
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});
