import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Pressable,
  GestureResponderEvent,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { queryMovies } from "./data/service";

const windowHeight = Dimensions.get("window").height;

export default function App() {
  const data = queryMovies();
  const [movieList, setMovieList] = useState<typeof data>([]);
  const [loaded, setLoaded] = useState(false);

  // 模拟发送请求获取数据
  useEffect(() => {
    setLoaded(true);
    setTimeout(() => {
      setMovieList(data);
      setLoaded(false);
    }, 10000);
  }, []);

  function renderItem(props: {
    data: any;
    onPress: (event: GestureResponderEvent) => void;
  }) {
    const { data } = props;
    return (
      <Pressable onPress={props.onPress}>
        <View style={styles.movieContainer}>
          {/*左侧 */}
          <View style={styles.imgContainer}>
            {/* 图片 */}
            <Image source={{ uri: data.movieImg }} style={styles.imgStyle} />
          </View>
          {/* 右侧 */}
          <View style={styles.rightContentContainer}>
            {/* 标题 */}
            <Text style={styles.titleStyle}>{data.title}</Text>

            {/* 上映时间 */}
            <Text style={styles.timeStyle}>{data.year}</Text>

            {/* 评分 */}
            {data.average !== "0" ? (
              <View style={styles.horizontalView}>
                <Text style={styles.titleTag}>评分</Text>
                <Text style={styles.score}>{data.average}</Text>
              </View>
            ) : (
              <View style={styles.horizontalView}>
                <Text style={styles.titleTag}>暂无评分</Text>
              </View>
            )}

            {/* 导演 */}
            <View style={styles.horizontalView}>
              <Text style={styles.titleTag}>导演</Text>
              <Text style={styles.name}>{data.directors}</Text>
            </View>

            {/* 主演 */}
            <View style={styles.horizontalView}>
              <Text style={styles.titleTag}>主演</Text>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {data.casts}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // 渲染标题
  function renderTitle() {
    return (
      <View style={styles.barStyle}>
        <Text style={styles.txtStyle}>电影列表</Text>
      </View>
    );
  }

  function renderItemList() {
    return (
      <FlatList
        data={movieList}
        renderItem={({ item }) => {
          return renderItem({
            data: item,
            onPress: () => {
              alert("点击的电影名：" + item.title);
            }
          });
        }}
      />
    );
  }

  // 加载条
  function renderLoad() {
    if (loaded) {
      return (
        <View style={styles.loadContainer}>
          <ActivityIndicator size="large" color="#268dcd" />
          <Text
            style={{
              color: "#666",
              paddingLeft: 10
            }}
          >
            努力加载中
          </Text>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* 渲染表头 */}
      {renderTitle()}

      {/* loading */}
      {renderLoad()}

      {/* 渲染电影每一项 */}
      {renderItemList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#268dcd"
  },
  loadContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5FCFF",
    flexDirection: "row",
    height: windowHeight
  },
  movieContainer: {
    flexDirection: "row",
    padding: 10,
    borderColor: "#e0e0e0",
    borderBottomWidth: 1,
    backgroundColor: "#F5FCFF"
  },
  barStyle: {
    width: "100%",
    height: 48,
    justifyContent: "center",
    backgroundColor: "#268dcd"
  },
  txtStyle: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center"
  },
  imgContainer: {
    width: 110,
    height: 150,
    backgroundColor: "#f0f0f0"
  },
  imgStyle: {
    width: "100%",
    height: "100%"
  },
  rightContentContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5
  },
  titleStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "left"
  },
  timeStyle: {
    textAlign: "left",
    color: "#777777",
    marginTop: 10
  },
  horizontalView: {
    flexDirection: "row",
    marginTop: 10
  },
  titleTag: {
    color: "#666666",
    marginRight: 2
  },
  score: {
    color: "#ff8800",
    fontWeight: "bold"
  },
  name: {
    color: "#333333",
    flex: 1
  }
});
