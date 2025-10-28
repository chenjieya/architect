import { View, TextInput, Button, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { addToDoList } from "../store/toDoList/toDoListSlice";
import { useState } from "react";
export default function Input() {
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();
  // 添加待办列表
  function addListHandler() {
    dispatch(addToDoList(title));
    setTitle("");
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Add a task"
        placeholderTextColor="#999"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <Button title="Add" onPress={addListHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: "row",
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  input: {
    width: 300,
    backgroundColor: "#FFF",
    height: 40,
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#DDD"
  }
});
