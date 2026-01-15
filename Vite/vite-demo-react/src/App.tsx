import React, { useState } from "react";

// 默认导出必须有名字，这样热替换才会实现，否则是热加载模式（也就是刷新页面）
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>welcome!</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </>
  );
}
