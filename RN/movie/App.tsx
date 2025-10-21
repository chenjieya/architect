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
  Dimensions,
  SectionList
} from "react-native";
import { queryMovies, randomRefreshMovies } from "./data/service";
import moviesData from "./data/movies.json";

const windowHeight = Dimensions.get("window").height;

let currentPage = 1; // 当前页
let pageSize = 10; // 每一页加载多少条
let totalPage = Math.ceil(moviesData.length / pageSize); // 总页数

export default function App() {
  const data = queryMovies();
  const [movieList, setMovieList] = useState<typeof data>([]);
  const [loaded, setLoaded] = useState(false);
  const [isHeaderRefreshing, setHeaderRefreshing] = useState(false);
  const [isFooterRefreshing, setFooterRefreshing] = useState(false);

  const displayingMovies = queryMovies(1, 10); // 获取第一个 10 条数据
  const incomingMovies = queryMovies(2, 10); // 获取第二个 10 条数据
  const [sectionData, setSectionData] = useState<
    { title: string; data: typeof data }[]
  >([]);

  // 模拟发送请求获取数据
  useEffect(() => {
    setLoaded(true);
    setTimeout(() => {
      // setMovieList(data);
      setSectionData([
        { title: "正在上映", data: displayingMovies },
        { title: "即将上映", data: incomingMovies }
      ]);
      setLoaded(false);
    }, 5000);
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

  // 下拉刷新
  function beginHeaderRefresh() {
    // 开始加载
    setHeaderRefreshing(true);

    // 获取数据
    const newMovie = randomRefreshMovies();
    const data = [...newMovie, ...movieList];
    setTimeout(() => {
      setMovieList(data);
      // 关闭加载
      setHeaderRefreshing(false);
    }, 1000);
  }

  // 上拉加载
  function beginFooterRefresh() {
    setFooterRefreshing(true);
    if (currentPage < totalPage) {
      currentPage++;
      const newMovie = queryMovies(currentPage, pageSize); // 查询对应页码的新数据
      const data = [...movieList, ...newMovie];
      setTimeout(() => {
        setMovieList(data);
        setFooterRefreshing(false);
      }, 1000);
    }
  }

  // function renderItemList() {
  //   return (
  //     <FlatList
  //       data={movieList}
  //       refreshing={isHeaderRefreshing}
  //       onRefresh={beginHeaderRefresh}
  //       onEndReached={beginFooterRefresh}
  //       onEndReachedThreshold={0.1}
  //       renderItem={({ item }) => {
  //         return renderItem({
  //           data: item,
  //           onPress: () => {
  //             alert("点击的电影名：" + item.title);
  //           }
  //         });
  //       }}
  //     />
  //   );
  // }

  function renderItemList() {
    return (
      <SectionList
        sections={sectionData}
        refreshing={isHeaderRefreshing}
        onRefresh={beginHeaderRefresh}
        onEndReached={beginFooterRefresh}
        onEndReachedThreshold={0.1}
        renderItem={({ item }) => {
          return renderItem({
            data: item,
            onPress: () => {
              alert("点击的电影名：" + item.title);
            }
          });
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={true}
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

  function renderFooterLoad() {
    if (isFooterRefreshing) {
      return (
        <View style={styles.footerStyle}>
          <ActivityIndicator size="small" color="#268dcd" />
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

      {/* 上拉加载 */}
      {renderFooterLoad()}
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
  },
  footerStyle: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  sectionHeader: {
    padding: 10,
    backgroundColor: "#268dcd"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  }
});
