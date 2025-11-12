export default {
  // 和服务器通信获取数据
  fetchData(id: number) {
    return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
      .then((res) => res.json())
      .then((res) => res);
  }
};
