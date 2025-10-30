import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  Pressable,
  Keyboard
} from "react-native";
import { useState } from "react";
import { MD5 } from "../utils/md5";
import { useDispatch, useSelector } from "react-redux";
import { setFanyiCatch } from "../store/fanyi/fanYiSlice";
import type { RootState } from "../store/store";
export default function HomeScreen() {
  const [text, setText] = useState("");
  // 存储翻译结果
  const [result, setResult] = useState("");

  const dispatch = useDispatch();
  const useSelectorType = useSelector.withTypes<RootState>();
  const { currentIndex, languageList } = useSelectorType(
    (state) => state.fanyi
  );
  async function translateHandler() {
    if (!text.trim()) {
      alert("请输入要翻译的文本");
      return;
    }
    const appid = "20251029002485895";
    const salt = new Date().getTime();
    const sign = MD5(`${appid}${text.trim()}${salt}gkdvzlTMeqK53WQfa9CD`);
    const to = languageList[currentIndex].lang;
    try {
      const res = await fetch(
        `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${text}&from=zh&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const data = await res.json();
      console.log(data, "data");
      if (data.trans_result?.length) {
        const res = data.trans_result[0].dst;
        console.log(res, "res");
        setResult(res);
        // 设置缓存
        dispatch(setFanyiCatch({ from: text, to: res }));
      } else {
        alert("翻译有误");
      }
    } catch (err) {
      console.log(err, "err");
      alert("翻译失败");
    }
  }

  return (
    <View style={styles.container}>
      {/* 状态栏 */}
      <StatusBar barStyle="light-content" />
      {/* 提示当前翻译的语言 */}
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 20 }}>
          将当前中文翻译为：
          <Text style={{ color: "#BCCCFB", fontWeight: "600" }}>
            {languageList[currentIndex].chs}
          </Text>
        </Text>
      </View>

      {/* 输入要翻译的文本 */}
      <TextInput
        style={styles.textInputStyle}
        multiline
        numberOfLines={10}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => {
          Keyboard.dismiss();
          translateHandler();
        }}
        placeholder="请输入要翻译的文本"
      />

      {/* 翻译结果页面 */}
      <Pressable style={styles.resultContainer} onPress={translateHandler}>
        <Text style={styles.resultTitle}>译文：</Text>
        <Text>{result}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10
  },
  titleContainer: {
    paddingTop: 10,
    paddingBottom: 10
  },
  textInputStyle: {
    borderWidth: 1,
    borderColor: "#BCCCFB",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flex: 0.7
  },
  resultContainer: {
    flex: 1,
    padding: 10
  },
  resultTitle: {
    fontSize: 18,
    marginBottom: 10
  }
});
