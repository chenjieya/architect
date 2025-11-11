// 该函数的作用是将 url 后面的查询字符串转为对象
const getSearchObj = () => {
  // ?a=1&b=2
  const { search } = window.location;

  // a=1&b=2
  const searchStr = search.slice(1);

  // ['a=1', 'b=2']
  const pairs = searchStr.split("&");

  // { 'a': '1' }
  const searchObj: Record<string, string> = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    searchObj[key!] = value!;
  });

  return searchObj;
};

export default {
  getSearchObj
};
