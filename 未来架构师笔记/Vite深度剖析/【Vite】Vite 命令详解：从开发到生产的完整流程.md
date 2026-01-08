> Vite 提供了几个核心命令，每个命令都有其特定的用途。本文详细解析这些命令的使用场景和配置。

---

## 1. Vite 命令概览

Vite 提供了以下核心命令：

- `vite`：启动开发服务器
- `vite build`：生产构建
- `vite preview`：预览生产构建
- `vite optimize`：手动优化依赖

---

## 2. vite：开发服务器

### 2.1 基本使用

**命令：**

```bash
vite
# 或
npm run dev
```

**功能：**

启动开发服务器，提供热更新功能。

**代码演示：package.json**

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

---

### 2.2 配置选项

**代码演示：命令行参数**

```bash
# 指定端口
vite --port 3000

# 指定主机
vite --host

# 指定模式
vite --mode development

# 打开浏览器
vite --open
```

**代码演示：vite.config.js**

```javascript
export default {
  server: {
    port: 3000,
    host: true, // 监听所有地址
    open: true, // 自动打开浏览器
    cors: true, // 启用 CORS
    // 代理配置
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
};
```

**关键词解释：**

- **开发服务器**：提供开发环境的 HTTP 服务器
- **热更新（HMR）**：修改代码后自动更新，无需刷新页面
- **代理（Proxy）**：将请求转发到其他服务器

---

### 2.3 入口文件：index.html

**重要概念：**

> Vite 的入口文件是 `index.html`，而不是 JavaScript 文件。这是 Vite 与传统构建工具的重要区别。

**为什么使用 HTML 作为入口？**

1. **符合浏览器原生行为**：浏览器直接请求 HTML 文件
2. **无需配置**：不需要指定 entry 入口
3. **更直观**：HTML 文件就是应用的入口点

**代码演示：index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- 入口脚本：使用 type="module" -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**工作流程：**

```text
浏览器请求 /
  ↓
Vite 返回 index.html（未修改）
  ↓
浏览器解析 HTML
  ↓
遇到 <script type="module" src="/src/main.js">
  ↓
浏览器请求 /src/main.js
  ↓
Vite 按需编译 main.js
  ↓
返回编译后的 JavaScript
  ↓
浏览器继续请求依赖模块
  ↓
Vite 按需编译并返回
```

**开发环境 vs 生产环境：**

**开发环境：**

- HTML 文件位置：项目根目录
- 访问路径：`http://localhost:5173/`

**生产环境：**

- HTML 文件会被处理（注入资源引用）
- 输出到 `dist/index.html`

**代码演示：多页面应用**

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>

<!-- admin.html -->
<script type="module" src="/src/admin.js"></script>
```

**关键词解释：**

- **入口文件**：应用的起始文件，Vite 使用 HTML 作为入口
- **type="module"**：告诉浏览器这是 ES 模块，启用 ESM 支持

---

## 3. vite build：生产构建

### 3.1 基本使用

**命令：**

```bash
vite build
# 或
npm run build
```

**功能：**

使用 Rollup 打包应用，生成生产环境代码。

**代码演示：package.json**

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

### 3.2 构建配置

**代码演示：vite.config.js**

```javascript
export default {
  build: {
    // 输出目录
    outDir: "dist",
    // 静态资源目录
    assetsDir: "assets",
    // 资源内联阈值（4KB）
    assetsInlineLimit: 4096,
    // CSS 代码分割
    cssCodeSplit: true,
    // 源码映射
    sourcemap: false,
    // 压缩方式
    minify: "esbuild", // 或 'terser'
    // Rollup 配置
    rollupOptions: {
      input: {
        main: "./index.html",
        admin: "./admin.html"
      },
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"]
        }
      }
    }
  }
};
```

**关键词解释：**

- **生产构建**：将源代码打包成生产环境可用的代码
- **代码分割**：将代码分成多个文件，按需加载
- **源码映射（Sourcemap）**：用于调试的映射文件

---

### 3.3 多页面应用（MPA）

**代码演示：多页面配置**

```javascript
// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
        mobile: resolve(__dirname, "mobile.html")
      }
    }
  }
});
```

**目录结构：**

```
project/
├── index.html      # 主页面
├── admin.html      # 管理页面
├── mobile.html     # 移动端页面
└── src/
    ├── main.js     # 主页面入口
    ├── admin.js    # 管理页面入口
    └── mobile.js   # 移动端页面入口
```

**构建结果：**

```
dist/
├── index.html
├── admin.html
├── mobile.html
└── assets/
    ├── main-abc123.js
    ├── admin-def456.js
    └── mobile-ghi789.js
```

**访问方式：**

- 主页面：`http://localhost:5173/`
- 管理页面：`http://localhost:5173/admin.html`
- 移动端：`http://localhost:5173/mobile.html`

**关键词解释：**

- **多页面应用（MPA）**：有多个 HTML 入口的应用
- **单页面应用（SPA）**：只有一个 HTML 入口的应用

---

## 4. vite preview：预览生产构建

### 4.1 基本使用

**命令：**

```bash
vite preview
# 或
npm run preview
```

**功能：**

预览生产构建的结果，用于测试生产环境。

**代码演示：package.json**

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

### 4.2 配置选项

**代码演示：命令行参数**

```bash
# 指定端口
vite preview --port 4173

# 指定主机
vite preview --host
```

**代码演示：vite.config.js**

```javascript
export default {
  preview: {
    port: 4173,
    host: true,
    open: true
  }
};
```

**使用场景：**

1. **测试生产构建**：确保构建结果正确
2. **性能测试**：测试生产环境的性能
3. **部署前检查**：部署前最后检查

**关键词解释：**

- **预览**：查看生产构建的结果
- **生产环境模拟**：模拟生产环境的运行

---

## 5. vite optimize：手动优化依赖

### 5.1 基本使用

**命令：**

```bash
vite optimize
# 或
npm run optimize
```

**功能：**

手动触发依赖预构建，通常不需要手动执行。

**代码演示：package.json**

```json
{
  "scripts": {
    "optimize": "vite optimize"
  }
}
```

---

### 5.2 使用场景

**什么时候需要手动优化？**

1. **依赖更新后**：更新了 node_modules 后
2. **配置变更后**：修改了 `optimizeDeps` 配置
3. **缓存问题**：依赖缓存出现问题

**代码演示：清除缓存并重新优化**

```bash
# 删除缓存
rm -rf node_modules/.vite

# 重新优化
vite optimize
```

**关键词解释：**

- **依赖优化**：预构建 node_modules 中的依赖
- **缓存**：存储预构建结果，提升启动速度

---

## 6. 命令组合使用

### 6.1 完整的开发流程

**代码演示：package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "optimize": "vite optimize"
  }
}
```

**工作流程：**

```text
开发阶段
  ↓
npm run dev
  ↓
修改代码
  ↓
热更新自动应用

生产阶段
  ↓
npm run build
  ↓
npm run preview（可选）
  ↓
部署到服务器
```

---

### 6.2 高级用法

**代码演示：条件构建**

```json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "vite build --mode production",
    "build:test": "vite build --mode test",
    "build:dev": "vite build --mode development"
  }
}
```

**代码演示：watch 模式**

```json
{
  "scripts": {
    "build:watch": "vite build --watch"
  }
}
```

**关键词解释：**

- **模式（Mode）**：不同的构建模式，对应不同的环境变量
- **Watch 模式**：监听文件变化，自动重新构建

---

## 7. 环境变量与模式

### 7.1 模式概念

**Vite 的模式：**

- `development`：开发模式（`vite` 命令）
- `production`：生产模式（`vite build` 命令）

**代码演示：指定模式**

```bash
# 开发模式
vite --mode development

# 生产模式
vite build --mode production

# 自定义模式
vite build --mode staging
```

---

### 7.2 环境变量文件

**代码演示：.env 文件**

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=开发环境

# .env.production
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=生产环境
```

**代码演示：使用环境变量**

```javascript
// src/config.js
export const API_URL = import.meta.env.VITE_API_URL;
export const APP_TITLE = import.meta.env.VITE_APP_TITLE;
```

**关键词解释：**

- **环境变量**：不同环境下的配置值
- **模式**：不同的运行环境

---

## 8. 总结

**Vite 命令总结：**

| 命令            | 用途       | 使用场景       |
| --------------- | ---------- | -------------- |
| `vite`          | 开发服务器 | 日常开发       |
| `vite build`    | 生产构建   | 构建生产版本   |
| `vite preview`  | 预览构建   | 测试生产构建   |
| `vite optimize` | 优化依赖   | 手动触发预构建 |

**关键点：**

1. **开发阶段**：使用 `vite` 启动开发服务器
2. **生产阶段**：使用 `vite build` 构建
3. **测试阶段**：使用 `vite preview` 预览
4. **优化阶段**：使用 `vite optimize` 手动优化

**设计理念：**

> 每个命令都有明确的用途，简单易用

这就是 Vite 命令设计的核心思想。
