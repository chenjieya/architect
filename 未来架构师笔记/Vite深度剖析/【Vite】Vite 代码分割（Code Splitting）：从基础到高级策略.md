> 代码分割是优化应用性能的重要手段。本文详细讲解 Vite 中的代码分割策略和最佳实践。

---

## 1. 代码分割的好处

### 1.1 减少初始加载时间

**问题：** 所有代码打包在一个文件中，首次加载很慢。

**解决方案：** 代码分割，只加载必要的代码。

**代码演示：对比**

```javascript
// ❌ 未分割：所有代码在一个文件
// bundle.js (2MB)
// 首次加载：2MB

// ✅ 分割后：按需加载
// main.js (200KB) - 初始加载
// vendor.js (500KB) - 按需加载
// page1.js (300KB) - 按需加载
// page2.js (400KB) - 按需加载
```

**关键词解释：**

- **初始加载**：首次访问页面时加载的代码
- **按需加载**：需要时才加载的代码

---

### 1.2 按需加载

**代码演示：路由懒加载**

```javascript
// router.js
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.vue'), // 按需加载
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue'), // 按需加载
  },
]
```

**效果：**

- 访问 `/home` 时，只加载 `Home.vue`
- 访问 `/about` 时，只加载 `About.vue`

---

### 1.3 并行加载

**代码演示：并行加载**

```html
<!-- 浏览器可以并行加载多个 chunk -->
<script type="module" src="/assets/main.js"></script>
<script type="module" src="/assets/vendor.js"></script>
<script type="module" src="/assets/utils.js"></script>
```

**优势：**

- 利用浏览器并行下载能力
- 提升加载速度

---

### 1.4 缓存利用

**代码演示：缓存策略**

```javascript
// vendor.js 很少变化，可以长期缓存
// main.js 经常变化，需要频繁更新

// 用户再次访问时：
// vendor.js 从缓存读取（快）
// main.js 重新下载（小文件，快）
```

**关键词解释：**

- **缓存**：浏览器存储的资源副本
- **长期缓存**：可以长期使用的缓存

---

## 2. 单词解释

### 2.1 Bundle

**定义：**

> 打包后的文件，包含多个模块。

**代码演示：Bundle**

```javascript
// 多个模块
import { a } from './module-a.js'
import { b } from './module-b.js'
import { c } from './module-c.js'

// 打包成一个 bundle
// bundle.js 包含 a, b, c 的所有代码
```

---

### 2.2 Chunk

**定义：**

> 代码分割后的文件块。

**代码演示：Chunk**

```javascript
// 分割后
// chunk-vendor.js - 第三方库
// chunk-main.js - 应用代码
// chunk-page1.js - 页面1
// chunk-page2.js - 页面2
```

---

### 2.3 Vendor

**定义：**

> 第三方库代码。

**代码演示：Vendor Chunk**

```javascript
// vendor.js 包含：
import vue from 'vue'
import vueRouter from 'vue-router'
import lodash from 'lodash-es'
```

---

## 3. Vite 默认拆包策略

### 3.1 自动处理 Initial Chunk 和 Async Chunk

**Initial Chunk：** 初始加载的代码块。

**Async Chunk：** 异步加载的代码块。

**代码演示：自动分割**

```javascript
// main.js - Initial Chunk
import { createApp } from 'vue'
import App from './App.vue'

// page.js - Async Chunk
const loadPage = () => import('./pages/Page.vue')
```

**Vite 自动处理：**

- Initial Chunk：同步导入的代码
- Async Chunk：动态导入的代码

---

### 3.2 自动抽取 Async Chunk 中的 CSS

**代码演示：CSS 分割**

```javascript
// page.vue
<template>
  <div class="page">Page</div>
</template>

<style>
.page {
  color: red;
}
</style>
```

**分割结果：**

```
dist/
├── assets/
│   ├── page-abc123.js    # JS 代码
│   └── page-def456.css   # CSS 代码（自动分离）
```

**代码演示：禁用 CSS 分割**

```javascript
// vite.config.js
export default {
  build: {
    cssCodeSplit: false, // 禁用 CSS 代码分割
  },
}
```

**关键词解释：**

- **CSS 代码分割**：将 CSS 分成多个文件
- **自动分离**：CSS 自动从 JS 中分离

---

## 4. 自定义拆包策略

### 4.1 对象形式

**代码演示：手动分割（对象形式）**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 vue 和 vue-router 打包到 vendor
          vendor: ["vue", "vue-router"],
          // 将工具函数打包到 utils
          utils: ["./src/utils/index.js"],
        },
      },
    },
  },
};
```

**对象形式说明：**

- 键（key）：chunk 名称
- 值（value）：要打包到该 chunk 的模块数组

**分割结果：**

```
dist/
├── assets/
│   ├── vendor-abc123.js   # vue + vue-router
│   ├── utils-def456.js    # 工具函数
│   └── main-ghi789.js     # 应用代码
```

---

### 4.2 函数形式

**代码演示：函数分割（函数形式）**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 中的依赖
          if (id.includes("node_modules")) {
            // 大型库单独打包
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor-vue";
            }
            // 其他依赖
            return "vendor";
          }

          // 工具函数
          if (id.includes("/utils/")) {
            return "utils";
          }

          // 组件
          if (id.includes("/components/")) {
            return "components";
          }
        },
      },
    },
  },
};
```

**函数形式说明：**

- 参数 `id`：模块的完整路径
- 返回值：chunk 名称（字符串）或 `undefined`（使用默认策略）
- 可以动态决定如何分割

**关键词解释：**

- **manualChunks**：手动指定代码分割
- **函数形式**：使用函数动态决定分割策略

---

## 5. 预加载指令生成

### 5.1 Modulepreload

**代码演示：预加载配置**

```javascript
// vite.config.js
export default {
  build: {
    // 方式1：使用 modulePreload.polyfill
    modulePreload: {
      polyfill: true, // 生成预加载指令
    },
    // 方式2：使用 build.polyfillModulePreload（已废弃，使用上面的方式）
    // polyfillModulePreload: true,
  },
}
```

**生成的 HTML：**

```html
<!-- 自动生成的预加载指令 -->
<link rel="modulepreload" href="/assets/vendor-abc123.js" />
<link rel="modulepreload" href="/assets/main-def456.js" />
<script type="module" src="/assets/main-def456.js"></script>
```

**作用：**

- 提前加载关键模块，减少加载时间
- 优化浏览器资源加载顺序
- 提升首屏渲染性能

**关键词解释：**

- **预加载**：提前加载资源，减少等待时间
- **modulepreload**：ES 模块的预加载，浏览器原生支持
- **polyfill**：为不支持该特性的浏览器提供兼容

---

### 5.2 禁用预加载

**代码演示：禁用预加载**

```javascript
// vite.config.js
export default {
  build: {
    modulePreload: {
      polyfill: false, // 禁用预加载
    },
  },
}
```

---

## 6. 异步 Chunk 加载优化

### 6.1 Vite 的优化策略

**Vite 自动优化异步 Chunk 的加载：**

1. **智能预加载**：预加载可能需要的 chunk
2. **并行加载**：支持并行加载多个 chunk
3. **缓存优化**：优化 chunk 的缓存策略
4. **加载顺序优化**：优化 chunk 的加载顺序

**代码演示：异步加载**

```javascript
// 路由懒加载
const routes = [
  {
    path: "/home",
    component: () => import("./pages/Home.vue"), // 异步 chunk
  },
  {
    path: "/about",
    component: () => import("./pages/About.vue"), // 异步 chunk
  },
];
```

**Vite 的优化机制：**

- **自动代码分割**：每个异步导入生成独立的 chunk
- **预加载优化**：智能预加载可能需要的 chunk
- **并行加载**：支持并行加载多个 chunk
- **加载顺序**：优化 chunk 的加载顺序，减少等待时间

**代码演示：Vite 自动优化**

```html
<!-- Vite 自动生成的优化代码 -->
<link rel="modulepreload" href="/assets/Home-abc123.js" />
<link rel="modulepreload" href="/assets/About-def456.js" />
```

**关键词解释：**

- **异步 Chunk**：按需加载的代码块
- **智能预加载**：根据代码分析，预加载可能需要的 chunk
- **并行加载**：同时加载多个 chunk，提升速度

---

## 7. 循环引用问题

### 7.1 什么是循环引用？

**代码演示：循环引用**

```javascript
// a.js
import { b } from './b.js'
export const a = 'a'

// b.js
import { a } from './a.js'
export const b = 'b'
```

**问题：** 可能导致代码分割异常。

---

### 7.2 解决方案

**代码演示：使用插件**

```bash
npm install -D vite-plugin-chunk-split
```

```javascript
// vite.config.js
import { chunkSplitPlugin } from "vite-plugin-chunk-split";

export default {
  plugins: [
    chunkSplitPlugin({
      strategy: "split-by-size",
      minChunkSize: 20000,
    }),
  ],
};
```

**插件功能：**

- 自动处理循环引用问题
- 提供多种分割策略
- 优化 chunk 大小

**关键词解释：**

- **循环引用**：模块之间相互引用，可能导致代码分割异常
- **chunk-split**：代码分割插件，解决循环引用等问题
- **分割策略**：代码分割的方式（按大小、按依赖等）

**关键词解释：**

- **循环引用**：模块之间相互引用
- **chunk-split**：代码分割插件

---

## 8. 其他 Rollup 配置

### 8.1 chunkFileNames

**作用：** 自定义代码分割后的 chunk 文件命名。

**代码演示：Chunk 文件命名**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
        // [name]: chunk 名称
        // [hash]: 内容哈希值
      },
    },
  },
}
```

**输出：**

```
dist/
└── chunks/
    ├── vendor-abc123.js
    └── utils-def456.js
```

**占位符说明：**

- `[name]`：chunk 名称
- `[hash]`：内容哈希值（8位）
- `[hash:8]`：指定哈希长度
- `[ext]`：文件扩展名

---

### 8.2 entryFileNames

**作用：** 自定义入口文件的命名。

**代码演示：入口文件命名**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "js/[name]-[hash].js",
      },
    },
  },
}
```

**输出：**

```
dist/
└── js/
    ├── main-abc123.js
    └── admin-def456.js
```

---

### 8.3 assetFileNames

**作用：** 自定义静态资源文件的命名。

**代码演示：资源文件命名**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash].[ext]",
        // 或使用函数
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) {
            return "css/[name]-[hash].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
  },
}
```

**输出：**

```
dist/
├── assets/
│   ├── logo-abc123.png
│   └── icon-def456.svg
└── css/
    └── main-ghi789.css
```

**关键词解释：**

- **chunkFileNames**：代码分割后的 chunk 文件命名规则
- **entryFileNames**：入口文件的命名规则
- **assetFileNames**：静态资源文件的命名规则

---

## 9. 最佳实践

### 9.1 分割策略

**推荐策略：**

1. **第三方库**：单独打包（vendor）
2. **工具函数**：单独打包（utils）
3. **路由页面**：按路由分割
4. **大型组件**：单独打包

**代码演示：推荐配置**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 大型库单独打包
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vendor-vue'
            }
            // 其他依赖
            return 'vendor'
          }
        },
      },
    },
  },
}
```

---

### 9.2 避免过度分割

**问题：** 过度分割会导致请求过多。

**建议：**

- 每个 chunk 至少 20KB
- 初始 chunk 不超过 200KB
- 总 chunk 数量不超过 10 个

---

## 10. 总结

**代码分割要点：**

1. **自动分割**：Vite 自动处理 Initial 和 Async Chunk
2. **手动分割**：使用 manualChunks 自定义分割
3. **预加载优化**：自动生成预加载指令
4. **缓存优化**：优化 chunk 的缓存策略

**关键理念：**

> 合理的代码分割可以显著提升应用性能

这就是 Vite 代码分割的核心思想。
