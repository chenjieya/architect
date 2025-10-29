import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import type { RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import { changeLanguage } from "../store/fanyi/fanYiSlice";

export default function LanguageScreen() {
  const useSelectotType = useSelector.withTypes<RootState>();
  const { languageList, currentIndex } = useSelectotType(
    (state) => state.fanyi
  );

  const dispatch = useDispatch();

  return (
    <ScrollView>
      {languageList.map(function (item, index) {
        return (
          <Pressable
            key={index}
            onPress={() => dispatch(changeLanguage(index))}
          >
            {index === currentIndex ? (
              <View style={[styles.lanItem, styles.selected]}>
                <Text style={styles.lanTitle}>{item.chs}</Text>
                <AntDesign name="check" size={20} color="#fff" />
              </View>
            ) : (
              <View style={styles.lanItem}>
                <Text style={styles.lanTitle}>{item.chs}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lanItem: {
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    backgroundColor: "#BACCE3",
    paddingLeft: 10
  },
  selected: {
    paddingRight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  lanTitle: {
    lineHeight: 50,
    color: "#fff"
  }
});
