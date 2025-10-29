import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert
} from "react-native";
import NoData from "../components/NoData";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import type { IHistoryItem } from "../store/fanyi/state";
import { clearHistory } from "../store/fanyi/fanYiSlice";

function History({ historyArr }: { historyArr: IHistoryItem[] }) {
  const dispatch = useDispatch();
  function delHandler() {
    Alert.alert("提示", "确定要清除所有历史记录吗？", [
      {
        text: "取消",
        style: "cancel"
      },
      {
        text: "确定",
        onPress: () => {
          // 删除所有记录
          dispatch(clearHistory());
        }
      }
    ]);
  }

  return (
    <>
      {/* 上面的标题部分 */}
      <View style={styles.header}>
        <Text style={styles.font16}>翻译历史</Text>
        <Pressable style={styles.clearBtn} onPress={delHandler}>
          <Text>清除历史记录</Text>
        </Pressable>
      </View>
      {/* 下面就是所有的翻译记录 */}
      <ScrollView>
        {historyArr.map(function (item, index) {
          return (
            <View style={styles.item} key={index}>
              <View>
                <Text style={[styles.txt, styles.font16]}>{item.txt}</Text>
              </View>
              <View>
                <Text>
                  <Text>译文：</Text>
                  {item.res}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

export default function HistoryScreen() {
  const useSelectorType = useSelector.withTypes<RootState>();
  const { history: historyArr } = useSelectorType((state) => state.fanyi);
  return (
    <View style={styles.container}>
      {historyArr.length ? (
        <History historyArr={historyArr} />
      ) : (
        <NoData text="暂无历史记录" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  item: {
    marginTop: 15
  },
  txt: {
    color: "#888",
    marginBottom: 5
  },
  font16: {
    fontSize: 16
  }
});
