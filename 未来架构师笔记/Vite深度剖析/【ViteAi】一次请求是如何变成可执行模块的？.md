这一篇开始**真正下潜到 Vite 的“内部运行机制”**，也是后面插件、HMR、性能优化的**总前提**。

---

> 如果你只把 Vite 当成一个“很快的脚手架”，那你永远写不好插件、也解释不清它的行为。  
> **真正的 Vite，是一个精心设计的 ESM 中间件服务器。**

这一篇我们回答一个核心问题：

> 👉 **浏览器请求一个模块时，Vite 在中间到底做了什么？**

---

## 1. 先建立正确的认知：Vite Dev Server ≠ Webpack Dev Server

### 1.1 传统 Dev Server 的职责

以 Webpack Dev Server 为例，它的职责是：

- 提供一个 HTTP 服务
- **返回“已经打包好的 bundle”**
- HMR 本质是“替换 bundle 片段”

```text
浏览器
  ↓
请求 /bundle.js
  ↓
返回一个巨大 JS 文件
```

---

### 1.2 Vite Dev Server 的本质

一句话定性：

> **Vite Dev Server 是一个“基于 ESM 的模块编译中间件”**

它不返回 bundle，而是：

- 拦截浏览器的模块请求
- 动态编译
- 返回**单个 ESM 模块**

```text
浏览器
  ↓
请求 /src/main.ts
  ↓
Vite 编译并返回 main.ts 对应的 JS 模块
```

📌 **这是两种完全不同的世界观**

---

## 2. 从一个真实请求开始（最重要）

假设你访问页面：

```html
<script type="module" src="/src/main.ts"></script>
```

浏览器会发起请求：

```http
GET /src/main.ts
```

我们就从这一步开始拆。

---

## 3. Vite 如何拦截并处理模块请求？

### 3.1 Vite Dev Server 的技术基础

Vite 的 server 基于：

- **Node.js**
- **connect / koa 风格中间件**
- 一个极其清晰的 middleware pipeline

简化结构：

```ts
const middlewares = [
  servePublicMiddleware,
  transformMiddleware,
  hmrMiddleware,
  errorMiddleware,
]
```

👉 **每个请求都会穿过这些中间件**

---

### 3.2 第一步：判断是不是“模块请求”

Vite 会先判断：

- 是不是 JS / TS / Vue / JSX？
- 是不是 ESM 请求？
- 是不是特殊路径（`/@modules/`）

```ts
function isJSRequest(url: string) {
  return /\.(js|ts|jsx|tsx|vue)$/.test(url)
}
```

如果是模块请求，进入 **transform 流程**。

---

## 4. 核心步骤一：读取源码（File → Code）

```ts
// 伪代码
const code = fs.readFileSync(filePath, 'utf-8')
```

此时的代码可能是：

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

📌 **注意：这还是“原始源码”**

---

## 5. 核心步骤二：Import 分析与重写（极其关键）

### 5.1 为什么要重写 import？

浏览器只认识：

```js
import xxx from '/绝对或相对路径'
```

但源码里可能是：

```ts
import { createApp } from 'vue'
```

浏览器并不知道 `vue` 是什么。

---

### 5.2 Vite 的解决方案：import 重写

Vite 会把它改成：

```js
import { createApp } from '/@modules/vue'
```

#### 5.2.1 伪实现示意

```ts
function rewriteImports(code: string) {
  return code.replace(/from\s+['"]([^'"]+)['"]/g, (match, specifier) => {
    if (isBareImport(specifier)) {
      return `from "/@modules/${specifier}"`
    }
    return match
  })
}
```

📌 **这一步是 Vite 能跑起来的核心之一**

---

## 6. 核心步骤三：模块转译（esbuild 介入）

### 6.1 浏览器不能直接执行 TS

```ts
const count: number = 1
```

浏览器会直接报错。

---

### 6.2 Vite 使用 esbuild 做“极快转译”

```ts
import { transform } from 'esbuild'

const result = await transform(code, {
  loader: 'ts',
  target: 'esnext',
  sourcemap: true,
})
```

输出结果：

```js
const count = 1
```

📌 **注意：这里只是 transform，不是 bundle**

---

## 7. Vue SFC 是如何被处理的？

这是很多人模糊的地方。

### 7.1 浏览器请求 `.vue` 文件

```http
GET /src/App.vue
```

---

### 7.2 Vite 如何拆解 `.vue`？

```vue
<template>
  <div>{{ msg }}</div>
</template>

<script setup lang="ts">
const msg = 'Hello Vite'
</script>
```

Vite 会把它拆成多个“虚拟模块”：

```js
// App.vue?type=script
export default {
  setup() {
    const msg = 'Hello Vite'
    return { msg }
  },
}

// App.vue?type=template
export function render() {
  return h('div', msg)
}
```

最终返回一个 ESM 模块：

```js
import { render } from '/src/App.vue?type=template'

export default {
  render,
}
```

📌 **每一个部分，都是独立可请求的模块**

---

## 8. 依赖模块请求：/@modules 是什么？

当浏览器请求：

```http
GET /@modules/vue
```

Vite 会：

1. 找到 `node_modules/vue`
2. 解析它的 ESM 入口（`module` / `exports`）
3. 返回 ESM 格式代码

```ts
// 简化逻辑
const pkg = require('vue/package.json')
const entry = pkg.module || pkg.exports
```

---

## 9. HMR 是如何“插进来”的？

### 9.1 Vite 的 HMR 前提条件

- 模块是 ESM
- 每个模块都是独立请求

👉 **这意味着：可以精准更新**

---

### 9.2 Vite 注入的 HMR runtime

Vite 会在模块底部自动注入：

```js
import.meta.hot.accept((newModule) => {
  // 替换逻辑
})
```

开发者可以手写：

```ts
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

📌 **HMR 不再是“魔法”，而是 ESM 能力的自然延伸**

---

## 10. 完整请求生命周期总结（非常重要）

```text
浏览器请求模块
  ↓
Vite 判断模块类型
  ↓
读取文件内容
  ↓
分析 & 重写 import
  ↓
esbuild / plugin transform
  ↓
注入 HMR 代码
  ↓
返回 ESM 给浏览器
```

---

## 11. 你现在应该真正理解的 4 件事

1. **Vite Dev Server 是“请求驱动”的**
2. **每个模块都是独立编译的**
3. **import 重写是连接浏览器与 node_modules 的桥梁**
4. **插件和 HMR，都是插在这条 pipeline 上的**
