import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import React, { PureComponent } from "react";
import FreeDialog from "./components/freeDialog";

const { width } = Dimensions.get("window");

interface IState {
  isShow: boolean;
}

interface IProps {}

export default class App extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isShow: false
    };
  }
  // 点击按钮做的事情，打开谈框
  pressHandler() {
    this.setState({
      isShow: !this.state.isShow
    });
  }

  renderFreeDialog() {
    return (
      <FreeDialog
        isShow={this.state.isShow}
        title="年底大促"
        content="您的新年礼品，请查收！"
        buttonContent="领取新年礼物"
        imageSource={require("./assets/dialog_bg.png")}
        closeDialog={() => {
          this.setState({
            isShow: false
          });
        }}
      />
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.btnContainer}
          onPress={this.pressHandler.bind(this)}
        >
          <Text style={styles.textStyle}>Press me</Text>
        </Pressable>

        {this.renderFreeDialog()}
      </View>
    );
  }
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
