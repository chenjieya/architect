import { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";

export default function App() {
  const [localUri, setLocalUri] = useState("");
  async function selectPicker() {
    // 1. 授权
    const pickerPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!pickerPermission.granted) {
      // 用户不同意
      alert("需要访问相机胶卷的权限");
      return;
    }
    // 2. 打开相册
    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled) {
      // 用户取消图片选择
      return;
    }

    // 设置选中图片的地址
    setLocalUri(pickerResult.assets[0].uri);
  }

  async function openShareImageAsync() {
    await Sharing.shareAsync(localUri);
  }

  function goback() {
    setLocalUri("");
  }

  // 本地图片存在
  if (localUri) {
    return (
      <View style={styles.container}>
        {/* 图片展示 */}
        <Image source={{ uri: localUri }} style={styles.thumbnail} />
        {/* 分享照片的按钮 */}
        <TouchableOpacity style={styles.button} onPress={openShareImageAsync}>
          <Text style={styles.buttonText}>分享照片</Text>
        </TouchableOpacity>
        {/* 重新选择照片按钮 */}
        <TouchableOpacity style={styles.button} onPress={goback}>
          <Text style={styles.buttonText}>重新选择</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 图片展示 */}
      <Image source={require("./assets/logo.png")} style={styles.thumbnail} />
      {/* 提示文字 */}
      <Text style={styles.text}>按下按钮，与朋友分享手机中的图片</Text>
      {/* 选择图片按钮 */}
      <TouchableOpacity onPress={selectPicker} style={styles.button}>
        <Text style={styles.buttonText}>选择照片</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: "blue",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    marginTop: 10
  },
  buttonText: {
    fontSize: 16,
    color: "#fff"
  },
  text: {
    color: "#888",
    fontSize: 18,
    marginHorizontal: 15,
    textAlign: "center",
    marginBottom: 10
  },
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain"
  }
});
