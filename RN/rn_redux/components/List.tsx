import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import useSelectorToDo from "../store/toDoList/hooks/toDoHooks";
import { useDispatch } from "react-redux";
import {
  changeItemStatus,
  deleteToDoList
} from "../store/toDoList/toDoListSlice";
export default function List() {
  const { getTodoList } = useSelectorToDo;
  const todoList = getTodoList();
  const dispatch = useDispatch();

  function toggleStatusHandler(index: number) {
    dispatch(changeItemStatus(index));
  }

  function delItemHandler(index: number) {
    Alert.alert("提示", "确定删除吗？", [
      {
        text: "取消",
        style: "cancel"
      },
      {
        text: "确定",
        onPress: () => {
          dispatch(deleteToDoList(index));
        }
      }
    ]);
  }

  const items = todoList.map((item, index) => {
    return (
      <View style={styles.item} key={index}>
        <Pressable
          onPress={() => toggleStatusHandler(index)}
          onLongPress={() => delItemHandler(index)}
        >
          {item.IsDone ? (
            <Text style={styles.complete}>{item.title}</Text>
          ) : (
            <Text>{item.title}</Text>
          )}
        </Pressable>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {/* <View style={styles.item}>
        <Text>123</Text>
      </View>
      <View style={styles.item}>
        <Text>456</Text>
      </View>
      <View style={styles.item}>
        <Text>789</Text>
      </View> */}

      {/* 动态渲染 */}
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
  item: {
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: 300
  },
  complete: {
    textDecorationLine: "line-through"
  }
});
