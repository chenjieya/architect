> 如果你不理解 Vite 插件的执行时机与职责边界，  
> 那你写的插件**要么不生效，要么性能灾难，要么行为诡异**。

这一篇，我们**不从 API 开始**，而是从**插件系统的设计哲学**讲起。

---

## 1. 先给结论：Vite 插件 ≠ Webpack 插件

一句话定性：

> **Vite 插件是“基于 Rollup 插件规范、但运行在两个世界”的统一抽象。**

这句话非常重要。

---

## 2. Vite 插件为什么要基于 Rollup？

### 2.1 历史背景（不是巧合）

- Vite 的 production build 使用 Rollup
- Rollup 插件生态成熟
- Tree Shaking、chunk 处理能力强

👉 **复用插件体系，是战略选择**

---

### 2.2 插件“一次编写，两端运行”

一个 Vite 插件：

```ts
export default {
  name: 'my-plugin',
  transform(code, id) {
    // ...
  },
}
```

它可能会：

| 阶段            | 是否执行 |
| --------------- | -------- |
| Dev Server      | ✅       |
| Build（Rollup） | ✅       |

📌 **但执行时机、上下文完全不同**

---

## 3. Vite 插件的两大运行环境（必须搞清楚）

### 3.1 开发阶段（Dev）

插件运行在：

> **Vite Dev Server 的中间件 + transform pipeline 中**

特点：

- 按请求触发
- 文件级
- 高频调用

---

### 3.2 构建阶段（Build）

插件运行在：

> **Rollup 的构建流程中**

特点：

- 全量依赖图
- 一次性执行
- 面向 bundle 结果

---

## 4. 一个插件在 Dev 阶段的完整生命周期

我们从最关键的 **Dev 阶段** 开始拆。

---

### 4.1 插件注册顺序

```ts
// vite.config.ts
export default {
  plugins: [pluginA(), pluginB()],
}
```

执行顺序：

```text
pluginA → pluginB
```

📌 **顺序即语义**

---

### 4.2 插件核心 Hook（Dev 视角）

| Hook              | 作用               |
| ----------------- | ------------------ |
| `config`          | 修改用户配置       |
| `configureServer` | 注入中间件         |
| `resolveId`       | 决定模块如何被定位 |
| `load`            | 决定模块内容       |
| `transform`       | 修改模块代码       |

---

## 5. 最重要的三个 Hook（必须会）

### 5.1 resolveId：模块“指路人”

#### 场景

```ts
import foo from 'virtual:foo'
```

浏览器请求：

```text
GET /virtual:foo
```

---

#### 插件实现

```ts
export function virtualPlugin() {
  return {
    name: 'virtual-plugin',

    resolveId(id) {
      if (id === 'virtual:foo') {
        return id
      }
    },
  }
}
```

📌 **resolveId 决定“这个模块是否存在”**

---

### 5.2 load：模块“内容提供者”

```ts
load(id) {
  if (id === 'virtual:foo') {
    return `
      export default 'Hello Vite Plugin'
    `
  }
}
```

现在：

```ts
import foo from 'virtual:foo'
console.log(foo) // Hello Vite Plugin
```

👉 **你刚刚创建了一个“不存在于文件系统”的模块**

---

### 5.3 transform：代码“加工厂”

```ts
transform(code, id) {
  if (id.endsWith('.ts')) {
    return code.replace('__DEV__', 'true')
  }
}
```

📌 **transform 是最常用，也是最危险的 Hook**

---

## 6. 插件执行顺序与 enforce

### 6.1 为什么需要 enforce？

某些插件需要：

- 最早执行（如 polyfill）
- 最后执行（如压缩）

---

### 6.2 enforce 的三种值

```ts
export default {
  enforce: 'pre', // 或 'post'
}
```

执行顺序：

```text
pre → normal → post
```

---

## 7. 插件在 Dev 和 Build 阶段的差异

这是很多人写插件踩坑的地方。

### 7.1 一个插件，两个世界

```ts
transform(code, id) {
  console.log(process.env.NODE_ENV)
}
```

| 阶段  | 输出        |
| ----- | ----------- |
| Dev   | development |
| Build | production  |

---

### 7.2 只在 Dev 执行？

```ts
export default {
  apply: 'serve',
}
```

### 7.3 只在 Build 执行？

```ts
export default {
  apply: 'build',
}
```

---

## 8. configureServer：直接接管 Dev Server

这是 **高级插件** 的入口。

```ts
configureServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url === '/ping') {
      res.end('pong')
    } else {
      next()
    }
  })
}
```

📌 **你已经在写一个“Vite 中间件”了**

---

## 9. 插件之间是如何“串联”的？

### 9.1 Plugin Container（概念）

```text
Request
  ↓
resolveId (所有插件)
  ↓
load (所有插件)
  ↓
transform (所有插件)
```

📌 每个阶段都会跑“插件链”。

---

## 10. 一个完整插件示例（可直接运行）

```ts
// vite-plugin-hello.ts
export default function helloPlugin() {
  return {
    name: 'vite-plugin-hello',

    transform(code, id) {
      if (id.endsWith('.js')) {
        return code + `\nconsole.log('Hello from plugin')`
      }
    },
  }
}
```

使用：

```ts
// vite.config.ts
import helloPlugin from './vite-plugin-hello'

export default {
  plugins: [helloPlugin()],
}
```

---

## 11. 你现在应该真正理解的东西

1. **插件是“编译管道中的函数”**
2. **resolveId / load / transform 是核心三板斧**
3. **Dev 与 Build 共用插件规范，但执行语义不同**
4. **插件顺序和 enforce 决定最终行为**
