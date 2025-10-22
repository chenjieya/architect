import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
  Dimensions
} from "react-native";

interface IProps {
  isShow: boolean;
  title?: string;
  content?: string;
  buttonContent?: string;
  imageSource: number;
  closeDialog: () => void;
}

const { width } = Dimensions.get("window");

export default class freeDialog extends PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  closeHandler() {
    this.props.closeDialog();
  }
  render() {
    if (!this.props.isShow) {
      return null;
    }
    return (
      <View style={styles.containerBg}>
        {/* 上面 */}
        <View style={styles.dialogBg}>
          {/* 图片 */}
          <Image style={styles.logoStyle} source={this.props.imageSource} />
          {/* 内容 */}
          <Text style={styles.titleStyle}>{this.props.title}</Text>
          <Text style={styles.contentStyle}>{this.props.content}</Text>

          {/* 按钮 */}
          <Pressable>
            <ImageBackground
              resizeMode="stretch"
              source={require("../assets/commen_btn.png")}
              style={styles.buttonStyle}
            >
              <Text style={styles.btnContentStyle}>
                {this.props.buttonContent}
              </Text>
            </ImageBackground>
          </Pressable>
        </View>
        {/* 下面 */}
        <Pressable
          style={styles.btnCloseStyle}
          onPress={this.closeHandler.bind(this)}
        >
          <Image
            source={require("../assets/ic_close.png")}
            style={{
              height: 38,
              width: 38
            }}
          />
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerBg: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  dialogBg: {
    width: width - 100,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center"
  },
  logoStyle: {
    height: ((width - 100) * 258) / 400,
    width: width - 100
  },
  titleStyle: {
    marginTop: 14,
    color: "#333333",
    fontSize: 18,
    fontWeight: "600"
  },
  contentStyle: {
    marginTop: 5,
    color: "#333333",
    fontSize: 14,
    fontWeight: "400"
  },
  buttonStyle: {
    height: ((width - 135) * 88) / 480,
    width: width - 180,
    marginTop: 36,
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  btnContentStyle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "600"
  },
  btnCloseStyle: {
    padding: 10,
    marginTop: 33,
    alignItems: "center"
  }
});
