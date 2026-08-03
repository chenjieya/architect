---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 在深入学习 Vite 之前，我们需要先理解：**Vite 到底解决了什么问题？它为什么会出现？**

---

## 1. 前端工程的痛点

### 1.1 模块化需求

现代前端开发离不开模块化，主要有两种模块化规范：

#### 1.1.1 ESM (ES Modules)

```javascript
// ES Module 语法
import { debounce } from "lodash-es";
import App from "./App.vue";
export default App;
```

**特点：**

- 浏览器原生支持（现代浏览器）
- 静态分析，编译时优化
- 支持 Tree Shaking

#### 1.1.2 CommonJS

```javascript
// CommonJS 语法
const { debounce } = require("lodash");
module.exports = App;
```

**特点：**

- Node.js 原生支持
- 动态加载，运行时解析
- 浏览器不支持，需要打包

**关键词解释：**

- **ESM (ES Modules)**：JavaScript 的官方模块化标准，使用 `import/export` 语法
- **CommonJS**：Node.js 的模块化标准，使用 `require/module.exports` 语法
- **Tree Shaking**：移除未使用的代码，减小打包体积

---

### 1.2 兼容浏览器，编译高级语法

浏览器无法直接运行：

- **TypeScript**：需要编译成 JavaScript
- **JSX/TSX**：需要转换成 JavaScript
- **Vue SFC**：需要编译成 JavaScript
- **Less/SCSS**：需要编译成 CSS

**代码演示：**

```typescript
// 源代码：App.tsx
import React from "react";

interface Props {
  title: string;
}

const App: React.FC<Props> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default App;
```

```javascript
// 编译后：App.js
import React from "react";

const App = ({ title }) => {
  return React.createElement("h1", null, title);
};

export default App;
```

---

### 1.3 开发效率

传统构建工具（如 Webpack）的问题：

| 问题     | 表现                          | 影响                       |
| -------- | ----------------------------- | -------------------------- |
| 冷启动慢 | 大型项目启动需要 30s+         | 每次重启都要等待           |
| 热更新慢 | 修改代码后等待 3-5s           | 打断开发思路，影响开发体验 |
| 配置复杂 | 需要配置大量 loader 和 plugin | 学习成本高，维护困难       |
| 调试困难 | bundle 后源码被重写           | 难以定位问题               |

**代码演示：Webpack 启动流程**

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/main.js",
  // 启动前需要：
  // 1. 解析所有依赖（递归扫描）
  // 2. 构建完整依赖图
  // 3. 应用所有 loader 转换
  // 4. 打包所有模块到内存
  // 5. 启动 dev server
  // 问题：即使只访问一个页面，也要全量构建
};
```

**本质问题：**

> **"打包"被强行提前到了开发阶段**

开发阶段其实不需要打包，但传统工具强制要求先打包再启动。

---

### 1.4 生产环境代码质量

生产环境需要：

- **代码压缩**：减小文件体积
- **代码分割**：按需加载
- **Tree Shaking**：移除未使用代码
- **资源优化**：图片压缩、CSS 优化

---

## 2. 为什么选择 Vite？

### 2.1 基于浏览器原生 ESM 的支持实现模块加载 ⭐

**核心思想：**

> 既然浏览器已经支持 ESM，为什么开发阶段还要打包？

**代码演示：**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- 直接使用 type="module" -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```javascript
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

// 浏览器会直接请求这些模块
createApp(App).mount("#app");
```

**工作流程：**

```text
浏览器请求 /src/main.js
  ↓
Vite 服务器返回 main.js（未打包）
  ↓
浏览器解析 import 语句
  ↓
浏览器请求 /src/App.vue
  ↓
Vite 服务器按需编译 App.vue
  ↓
返回编译后的 JavaScript
```

**关键词解释：**

- **ESM (ES Modules)**：浏览器原生模块系统，无需打包即可使用
- **按需编译**：只编译浏览器实际请求的模块，而不是整个项目

---

### 2.2 开发环境：基于原生 ES 模块

#### 2.2.1 依赖预构建 ⭐

**为什么需要依赖预构建？**

虽然浏览器支持 ESM，但直接使用 node_modules 中的依赖会遇到两个问题：

1. **第三方打包规范无法控制**：很多 npm 包使用 CommonJS 格式，浏览器不支持
2. **请求瀑布流问题**：某些包有大量内部依赖，会产生大量 HTTP 请求

**解决方案：** 使用 esbuild 预构建依赖

**代码演示：预构建配置**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建的依赖
    include: ["vue", "vue-router"],
    // 排除预构建的依赖
    exclude: ["some-large-library"],
    // esbuild 选项
    esbuildOptions: {
      target: "es2020",
    },
  },
};
```

**工作流程：**

```text
首次启动
  ↓
扫描依赖（从入口文件递归扫描）
  ↓
识别需要预构建的依赖
  ↓
使用 esbuild 打包依赖（极快）
  ↓
输出到 node_modules/.vite/deps/
  ↓
重写 import 路径指向预构建文件
  ↓
后续启动直接使用缓存
```

**代码演示：路径重写**

```javascript
// 源代码
import { debounce } from "lodash-es";

// 预构建后，路径被重写
import { debounce } from "/node_modules/.vite/deps/lodash-es.js";
```

**关键词解释：**

- **依赖预构建**：将 node_modules 中的依赖打包成 ESM 格式，提升加载速度
- **esbuild**：用 Go 编写的极速 JavaScript 打包器，比传统工具快 10-100 倍
- **请求瀑布流**：大量串行的 HTTP 请求，严重影响加载速度

#### 2.2.2 HMR 模块热替换 ⭐

**代码演示：**

```javascript
// src/components/Button.vue
<template>
  <button @click="handleClick">{{ text }}</button>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('Click me')

const handleClick = () => {
  text.value = 'Clicked!'
}
</script>
```

修改 `text` 的值时，Vite 会：

1. 检测文件变化
2. 只重新编译该组件
3. 通过 WebSocket 推送更新
4. 浏览器只更新该组件，不刷新页面

**关键词解释：**

- **HMR (Hot Module Replacement)**：热模块替换，修改代码后无需刷新页面即可看到更新
- **WebSocket**：用于实时通信的协议，Vite 用它推送更新

HMR 的模块边界、传播和客户端执行细节见 [[【Vite】HMR 热更新原理]]。

---

### 2.3 生产环境：仍需打包

#### 2.3.1 基于成熟的打包工具 Rollup 实现生产环境打包 ⭐

**为什么生产环境需要打包？**

1. **性能优化**：减少 HTTP 请求数量
2. **代码压缩**：减小文件体积
3. **兼容性**：转换现代语法为兼容代码
4. **Tree Shaking**：移除未使用代码

**代码演示：**

```javascript
// vite.config.js
export default {
  build: {
    // 使用 Rollup 打包
    rollupOptions: {
      output: {
        // 代码分割配置
        manualChunks: {
          vendor: ["vue", "vue-router"],
          utils: ["./src/utils"],
        },
      },
    },
  },
};
```

**关键词解释：**

- **Rollup**：专注于 ES 模块的打包工具，适合库和应用的打包
- **代码分割**：将代码分成多个 chunk，按需加载

---

### 2.4 开箱即用 ⭐

Vite 提供了丰富的默认配置：

- **TypeScript 支持**：无需配置
- **CSS 预处理器**：支持 Sass、Less、Stylus
- **PostCSS**：自动配置
- **静态资源处理**：自动处理图片、字体等

**代码演示：**

```typescript
// 直接使用 TypeScript，无需配置
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import "./style.scss"; // 直接导入 SCSS

createApp(App).mount("#app");
```

---

## 3. Vite 的核心优势总结

| 特性     | 传统工具 | Vite           |
| -------- | -------- | -------------- |
| 冷启动   | 30s+     | < 1s           |
| 热更新   | 3-5s     | < 100ms        |
| 开发体验 | 需要打包 | 按需编译       |
| 生产构建 | 打包     | 打包（Rollup） |

**核心思想：**

> 开发阶段利用浏览器原生能力，生产阶段使用成熟工具打包

---

## 4. 快速开始

### 4.1 创建项目

```bash
# 使用 npm
npm create vite@latest my-app -- --template vue

# 使用 yarn
yarn create vite my-app --template vue

# 使用 pnpm
pnpm create vite my-app --template vue
```

### 4.2 项目结构

```
my-app/
├── index.html          # 入口文件
├── src/
│   ├── main.js        # 应用入口
│   ├── App.vue        # 根组件
│   └── assets/        # 静态资源
├── vite.config.js     # Vite 配置
└── package.json
```

### 4.3 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可看到应用。

---

## 5. 总结

Vite 通过以下方式解决了前端工程的痛点：

1. **利用浏览器原生 ESM**：开发阶段无需打包
2. **按需编译**：只编译请求的模块
3. **依赖预构建**：优化第三方库加载
4. **HMR**：快速热更新
5. **生产构建**：使用 Rollup 打包优化

**关键理念：**

> 开发阶段追求速度，生产阶段追求优化

这就是 Vite 的核心设计哲学。
