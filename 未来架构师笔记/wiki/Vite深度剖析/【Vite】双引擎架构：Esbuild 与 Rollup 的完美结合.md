---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> Vite 采用了独特的双引擎架构：开发环境使用 Esbuild，生产环境使用 Rollup。为什么这样设计？

---

## 1. 双引擎架构概述

Vite 的核心架构特点：

> **开发环境追求速度，生产环境追求质量**

因此采用了两个不同的工具：

- **Esbuild**：开发环境（极速）
- **Rollup**：生产环境（成熟稳定）

---

## 2. Esbuild：开发环境的极速引擎

### 2.1 Esbuild 简介

**Esbuild 是什么？**

> Esbuild 是一个用 Go 编写的 JavaScript 打包器，速度极快。

**性能对比：**

| 工具    | 速度  |
| ------- | ----- |
| Esbuild | 100x+ |
| Webpack | 1x    |
| Rollup  | 10x   |
| Terser  | 1x    |

**为什么这么快？**

1. **Go 语言编写**：编译为机器码，执行速度快
2. **并行处理**：充分利用多核 CPU
3. **零依赖**：没有额外的运行时开销

**关键词解释：**

- **Esbuild**：用 Go 编写的极速 JavaScript 打包器
- **并行处理**：同时处理多个任务，提升效率

---

### 2.2 Esbuild 在 Vite 中的应用

#### 2.2.1 依赖预构建：作为 Bundle 工具

**代码演示：依赖预构建流程**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 使用 esbuild 打包依赖
    esbuildOptions: {
      target: 'es2020',
    },
  },
}
```

**工作流程：**

```text
首次启动
  ↓
扫描入口文件的依赖
  ↓
使用 esbuild 打包依赖
  ↓
输出到 node_modules/.vite/deps/
  ↓
重写 import 路径
```

**代码演示：依赖预构建结果**

```javascript
// 源代码
import { debounce } from 'lodash-es'

// 预构建后，路径被重写
import { debounce } from '/node_modules/.vite/deps/lodash-es.js'
```

**关键词解释：**

- **依赖预构建**：将 node_modules 中的依赖打包成 ESM 格式
- **Bundle**：将多个模块打包成一个文件

---

#### 2.2.2 单文件编译：作为 TS 和 JSX 编译工具

**代码演示：TypeScript 编译**

```typescript
// src/App.tsx
import React from 'react'

interface Props {
  title: string
}

const App: React.FC<Props> = ({ title }) => {
  return <h1>{title}</h1>
}

export default App
```

**Esbuild 转换后：**

```javascript
// 编译后的 JavaScript
import React from 'react'

const App = ({ title }) => {
  return React.createElement('h1', null, title)
}

export default App
```

**代码演示：Vite 配置**

```javascript
// vite.config.js
export default {
  esbuild: {
    // TypeScript 配置
    target: 'es2020',
    // JSX 配置
    jsx: 'transform', // 或 'preserve'
    // 移除 console 和 debugger
    drop: ['console', 'debugger'],
  },
}
```

**关键词解释：**

- **单文件编译**：只编译单个文件，不进行打包
- **JSX**：JavaScript 的语法扩展，用于描述 UI

---

#### 2.2.3 代码压缩：作为压缩工具

**代码演示：生产环境压缩**

```javascript
// vite.config.js
export default {
  build: {
    // 使用 esbuild 压缩（默认）
    minify: 'esbuild',
    // 或使用 terser
    // minify: 'terser'
  },
}
```

**压缩效果对比：**

```javascript
// 压缩前
function calculateSum(a, b) {
  const result = a + b
  console.log('Sum:', result)
  return result
}

// esbuild 压缩后
function calculateSum(a, b) {
  const result = a + b
  return result
}
```

**性能对比：**

| 工具    | 速度 | 压缩率 |
| ------- | ---- | ------ |
| Esbuild | 极快 | 中等   |
| Terser  | 慢   | 高     |

**关键词解释：**

- **代码压缩**：移除空白、缩短变量名等，减小文件体积
- **Minify**：压缩代码的过程

---

## 3. Rollup：生产环境的稳定引擎

### 3.1 Rollup 简介

**Rollup 是什么？**

> Rollup 是一个专注于 ES 模块的打包工具，适合库和应用的打包。

**Rollup 的特点：**

1. **Tree Shaking 优秀**：能更好地移除未使用代码
2. **输出格式灵活**：支持 ES、IIFE、UMD 等
3. **插件生态成熟**：大量社区插件

**关键词解释：**

- **Rollup**：专注于 ES 模块的打包工具
- **Tree Shaking**：移除未使用的代码

---

### 3.2 Rollup 在 Vite 中的应用

#### 3.2.1 生产环境 Bundle

**代码演示：生产构建配置**

```javascript
// vite.config.js
export default {
  build: {
    // 使用 Rollup 打包
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html',
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
}
```

**工作流程：**

```text
执行 vite build
  ↓
使用 Rollup 打包
  ↓
应用所有插件
  ↓
代码分割
  ↓
输出到 dist/
```

**关键词解释：**

- **Bundle**：将多个模块打包成一个或多个文件
- **代码分割**：将代码分成多个 chunk

---

#### 3.2.2 CSS 代码分割

**代码演示：CSS 分割**

```javascript
// vite.config.js
export default {
  build: {
    cssCodeSplit: true, // 默认开启
    rollupOptions: {
      output: {
        // CSS 文件命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
  },
}
```

**分割效果：**

```text
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── vendor-def456.js
└── css/
    ├── index-ghi789.css
    └── vendor-jkl012.css
```

**关键词解释：**

- **CSS 代码分割**：将 CSS 分成多个文件，按需加载
- **Asset**：静态资源文件

---

#### 3.2.3 预加载指令生成

**代码演示：预加载配置**

```javascript
// vite.config.js
export default {
  build: {
    modulePreload: {
      polyfill: true, // 生成预加载指令
    },
  },
}
```

**生成的 HTML：**

```html
<!-- index.html -->
<link rel="modulepreload" href="/assets/vendor-abc123.js" />
<link rel="modulepreload" href="/assets/index-def456.js" />
<script type="module" src="/assets/index-def456.js"></script>
```

**关键词解释：**

- **预加载（Preload）**：提前加载资源，提升性能
- **Modulepreload**：专门用于预加载 ES 模块

---

#### 3.2.4 异步 Chunk 加载优化

**代码演示：异步加载**

```javascript
// src/router.js
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.vue'), // 异步加载
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue'), // 异步加载
  },
]
```

**Vite 优化：**

1. **自动代码分割**：每个异步导入生成独立的 chunk
2. **预加载优化**：智能预加载可能需要的 chunk
3. **并行加载**：支持并行加载多个 chunk

**关键词解释：**

- **异步 Chunk**：按需加载的代码块
- **代码分割**：将代码分成多个文件

---

#### 3.2.5 插件兼容机制

**核心机制：Plugin Container**

Vite 在开发环境模拟 Rollup 的行为，创建一个插件容器来调用 Rollup 构建钩子，与 Rollup 如出一辙。

**代码演示：Plugin Container**

```javascript
// Vite 开发环境模拟 Rollup 插件容器
// 让 Rollup 插件可以在开发环境使用

// vite.config.js
import { defineConfig } from 'vite'
import rollupPlugin from 'some-rollup-plugin'

export default defineConfig({
  plugins: [
    // Rollup 插件可以直接使用
    rollupPlugin(),
  ],
})
```

**工作原理：**

```text
开发环境
  ↓
创建 Plugin Container（插件容器）
  ↓
模拟 Rollup 的插件 API
  ↓
调用 Rollup 构建钩子
  ↓
插件可以正常执行
```

**为什么需要 Plugin Container？**

- 开发环境不直接使用 Rollup
- 但需要支持 Rollup 插件
- 通过容器模拟 Rollup 环境，让插件正常工作

**关键词解释：**

- **Plugin Container**：插件容器，模拟 Rollup 的插件环境
- **兼容机制**：让 Rollup 插件可以在 Vite 开发环境使用
- **构建钩子**：Rollup 插件的生命周期函数

---

## 4. 双引擎的协作

### 4.1 开发环境流程

```text
启动 dev server
  ↓
使用 Esbuild 预构建依赖
  ↓
浏览器请求模块
  ↓
使用 Esbuild 编译单个文件
  ↓
返回给浏览器
```

**代码演示：开发环境**

```javascript
// 开发环境：使用 Esbuild
// vite.config.js
export default {
  // Esbuild 配置
  esbuild: {
    target: 'es2020',
    jsx: 'transform',
  },
}
```

---

### 4.2 生产环境流程

```text
执行 vite build
  ↓
使用 Rollup 打包
  ↓
应用所有插件
  ↓
代码分割和优化
  ↓
输出到 dist/
```

**代码演示：生产环境**

```javascript
// 生产环境：使用 Rollup
// vite.config.js
export default {
  build: {
    // Rollup 配置
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
}
```

---

## 5. 为什么这样设计？

### 5.1 开发环境：速度优先

**使用 Esbuild 的原因：**

1. **极速编译**：开发体验好
2. **按需编译**：只编译请求的模块
3. **快速热更新**：修改后立即看到效果

**权衡：**

- ✅ 速度快
- ❌ 功能相对简单
- ❌ Tree Shaking 不如 Rollup

---

### 5.2 生产环境：质量优先

**使用 Rollup 的原因：**

1. **Tree Shaking 优秀**：更好的代码优化
2. **插件生态成熟**：丰富的插件支持
3. **输出质量高**：生成的代码质量好

**权衡：**

- ✅ 功能强大
- ✅ 输出质量高
- ❌ 速度相对慢（但生产构建可以接受）

---

## 6. 总结

**双引擎架构的核心思想：**

> 开发环境追求速度，使用 Esbuild；生产环境追求质量，使用 Rollup。

**关键点：**

1. **Esbuild**：开发环境的极速引擎
   - 依赖预构建
   - 单文件编译
   - 代码压缩

2. **Rollup**：生产环境的稳定引擎
   - 生产构建
   - CSS 代码分割
   - 预加载优化
   - 插件兼容

**设计理念：**

> 在合适的场景使用合适的工具

这就是 Vite 双引擎架构的精髓。
