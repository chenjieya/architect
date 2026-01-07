> 在深入学习 Vite 配置、插件和性能优化之前，你必须先回答一个问题：  
> **Vite 到底解决了什么问题？它和传统构建工具的“世界观”有什么本质不同？**

这篇文章，我们不讲配置、不讲插件，**只讲 Vite 的“第一性原理”**。

---

## 1. Vite 出现之前，前端构建到底在痛什么？

### 1.1 传统构建工具的基本工作模式

以 Webpack 为代表的传统构建工具，核心流程是：

```text
入口文件
  ↓
解析依赖（递归）
  ↓
打包成 Bundle
  ↓
启动 Dev Server
```

**关键点：一切都发生在“启动之前”**

也就是说：

- 启动 dev server 之前
- 所有模块必须先被解析、打包
- 项目越大，启动越慢

#### 1.1.1 举个直观的例子

```js
// main.js
import Vue from 'vue'
import App from './App.vue'
import './styles/index.css'
```

Webpack 在 dev 启动时会：

- 解析 `main.js`
- 解析 `vue`、`App.vue`、CSS
- 递归解析所有依赖
- 构建完整依赖图
- 输出 bundle（即使是内存里的）

👉 **哪怕你只访问一个页面，也要“全量构建”**

---

### 1.2 规模一大，问题立刻爆炸

当项目达到一定规模时：

| 问题       | 表现                     |
| ---------- | ------------------------ |
| 启动慢     | 冷启动 30s、60s          |
| 热更新慢   | 改一行代码，等 3~5 秒    |
| 心智负担重 | loader / plugin 概念复杂 |
| 调试困难   | bundle 后源码被重写      |

**本质问题只有一句话：**

> **“打包”被强行提前到了开发阶段**

---

## 2. Vite 的核心思想：开发阶段，为什么一定要打包？

Vite 的出现，其实只问了一个非常“反直觉”的问题：

> 👉 **浏览器都原生支持 ES Module 了，为什么开发阶段还要打包？**

---

## 3. Vite 的根本设计理念（非常重要）

### 3.1 开发阶段：利用浏览器能力

Vite 在开发阶段的策略是：

> **不打包，只做按需编译（On-demand Compilation）**

也就是说：

- 不提前构建整个依赖图
- 浏览器要哪个模块，Vite 再处理哪个

#### 3.1.1 ESM 在浏览器里的真实运行方式

```html
<script type="module" src="/src/main.ts"></script>
```

浏览器会：

1. 请求 `main.ts`
2. 解析 `import` 语句
3. 再发 HTTP 请求加载依赖模块
4. 依次执行

👉 **浏览器天然就是一个“模块加载器”**

---

### 3.2 Vite Dev Server 本质是什么？

一句话定义：

> **Vite Dev Server = ESM 中间件服务器**

它做的事情非常“克制”：

- 拦截浏览器的模块请求
- 返回浏览器能执行的 ESM 代码
- 不关心“最终 bundle 长什么样”

---

## 4. Vite 开发阶段的真实工作流程（核心）

我们用一个最小项目来看：

```bash
src/
├── main.ts
├── App.vue
└── components/Hello.vue
```

### 4.1 浏览器访问时发生了什么？

```text
浏览器访问 /
  ↓
请求 /src/main.ts
  ↓
Vite 返回编译后的 ESM
  ↓
浏览器发现 import App.vue
  ↓
请求 /src/App.vue
  ↓
Vite 编译 Vue SFC
  ↓
返回 JS 模块
```

📌 **重点：所有行为都是“按需发生”的**

---

### 4.2 你能在 Network 面板看到什么？

你会看到：

```text
GET /src/main.ts
GET /src/App.vue
GET /src/components/Hello.vue
```

**每个模块一个请求，没有 bundle**

这就是 Vite “快”的第一个原因。

---

## 5. Vite 为什么需要 esbuild？

### 5.1 问题：谁来做“预处理”？

浏览器虽然支持 ESM，但并不支持：

- TypeScript
- JSX
- 一些新语法（取决于浏览器）

👉 **Vite 需要一个“极快的转译器”**

### 5.2 esbuild 的角色定位

Vite 使用 **esbuild** 来处理：

- TS → JS
- JSX → JS
- 依赖预构建（node_modules）

```ts
// Vite 中的典型场景（简化）
esbuild.transform(code, {
  loader: 'ts',
  target: 'esnext',
})
```

📌 注意：

- **esbuild 不负责打包**
- 只负责“把代码变成浏览器能跑的样子”

---

## 6. 依赖预构建：Vite 的第一个“工程级妥协”

### 6.1 为什么 node_modules 不能直接走 ESM？

问题包括：

- 依赖里有 CJS
- 单个库文件非常多（lodash）
- 深层 import 导致请求爆炸

### 6.2 Vite 的解决方案：Dependency Pre-Bundling

在**首次启动时**：

```text
node_modules
  ↓
esbuild 预构建
  ↓
缓存到 .vite
```

```ts
// vite.config.ts
export default {
  optimizeDeps: {
    include: ['lodash'],
  },
}
```

📌 注意：

- **只发生一次**
- 只针对第三方依赖
- 不影响源码的按需加载

---

## 7. 生产环境为什么又用 Rollup？

### 7.1 开发 vs 生产的目标不同

| 阶段 | 目标           |
| ---- | -------------- |
| 开发 | 快、可调试     |
| 生产 | 体积小、性能优 |

### 7.2 Rollup 的优势

- Tree Shaking 极强
- 产物可控
- 插件生态成熟

```ts
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
        },
      },
    },
  },
}
```

👉 **Vite = Dev 用原生 ESM + Build 用 Rollup**

---

## 8. Vite 的整体架构图（概念总结）

```text
            ┌────────────┐
Browser ───▶│ Vite Server│
            │            │
            │  Plugin    │
            │  Pipeline  │
            └────┬───────┘
                 │
        ┌────────┴────────┐
        │                 │
   esbuild           Rollup
 (Dev 转译)        (Prod 打包)
```

---

## 9. 这一篇你必须记住的 3 句话

1. **Vite 的快不是“优化”，而是“架构变化”**
2. **开发阶段：不打包，按需编译**
3. **Vite 是“浏览器优先”的构建工具**
