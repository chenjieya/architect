import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
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

export default function App() {
  return (
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
  textContainer: {
    marginBottom: 10
  }
});
