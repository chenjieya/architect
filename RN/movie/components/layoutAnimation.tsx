import { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const customAnime = {
  // 第一个动画
  customSpring: {
    duration: 10000,
    create: {
      springDamping: 0.3, // 弹跳动画阻尼系数
      type: LayoutAnimation.Types.spring, // 动画类型
      property: LayoutAnimation.Properties.scaleXY // 动画属性
    },
    update: {
      springDamping: 0.6, // 弹跳动画阻尼系数
      type: LayoutAnimation.Types.spring, // 动画类型
      property: LayoutAnimation.Properties.scaleXY // 动画属性
    }
  },
  // 第二个动画
  customLinear: {
    duration: 1000,
    create: {
      springDamping: 0.6, // 弹跳动画阻尼系数
      type: LayoutAnimation.Types.linear, // 动画类型
      property: LayoutAnimation.Properties.opacity // 动画属性
    },
    update: {
      springDamping: 0.6, // 弹跳动画阻尼系数
      type: LayoutAnimation.Types.linear, // 动画类型
      property: LayoutAnimation.Properties.opacity // 动画属性
    }
  }
};

export default function App() {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);

  function pressHandler() {
    // 设置动画
    LayoutAnimation.configureNext(customAnime.customLinear);

    setWidth(width + 20);
    setHeight(height + 20);
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          width,
          height,
          backgroundColor: "orange",
          marginBottom: 30
        }}
      ></View>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "yellow" : "red"
          },
          styles.button
        ]}
        onPress={pressHandler}
      >
        <Text>Press me</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    padding: 10,
    borderRadius: 5
  }
});
