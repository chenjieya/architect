import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ViewProps,
  Button,
  Image,
  TextInput,
  ScrollView,
  TouchableHighlight,
  FlatList
} from "react-native";
import { useState } from "react";

function Cat(props: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <View style={styles.textContainer}>
      <Text>
        {props.name}; {count}
      </Text>

      <Button
        onPress={() => {
          setCount(count + 1);
        }}
        title="按钮点击"
      />
    </View>
  );
}

type MyComponentProps = ViewProps;

function MyComponent(props: MyComponentProps) {
  return (
    <View {...props} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text>My Component</Text>
    </View>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const data: { key: string }[] = [
    {
      key: "ab"
    },
    {
      key: "ab"
    },
    {
      key: "ab"
    },
    {
      key: "ab"
    },
    {
      key: "ab"
    },
    {
      key: "ab"
    },
    {
      key: "ab"
    }
  ];
  return (
    <View>
      <ScrollView>
        <View style={styles.container}>
          <Text>Open up App.tsx to start working on your app!</Text>
          <Cat name="Tom" />
          <Cat name="Jerry" />
          <Cat name="Garfield" />
          <Cat name="Spike" />
          <Cat name="Pluto" />
          <Cat name="Mickey" />
          <Cat name="Minnie" />
          <StatusBar style="auto" />
          <View style={{ alignItems: "flex-start" }}>
            <Text>1</Text>
            <Text>2</Text>
            <Text>3</Text>
          </View>
          <Image source={require("./assets/favicon.png")} />
          {/* 网路图片或者base64必须制定尺寸 */}
          <Image
            source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
            style={{ width: 100, height: 100 }}
          />
          <Image
            src="https://reactnative.dev/img/tiny_logo.png"
            style={{ width: 200, height: 200 }}
          ></Image>

          {/* 用户输入组件 */}
          <TextInput
            style={{
              width: 200,
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 5,
              marginBottom: 10
            }}
            onChangeText={(txt) => {
              setText(txt);
            }}
          ></TextInput>
          <Text>用户输入的内容：{text}</Text>

          {/* button按钮组件 */}
          <Button
            onPress={() => console.log("点击了button按钮")}
            title="Learn More"
            color="#841584"
          />

          {/* TouchableHighlight */}
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
            onPress={() => alert("Pressed!")}
          >
            <MyComponent />
          </TouchableHighlight>
        </View>
      </ScrollView>

      <FlatList
        data={data}
        renderItem={({ item }) => {
          return <Text>{item.key}</Text>;
        }}
        keyExtractor={(item, index) => index + ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  textContainer: {
    marginBottom: 10
  }
});
