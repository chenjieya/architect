> 性能优化是前端开发的重要环节。本文详细讲解 Vite 中的各种性能优化手段。

---

## 1. 优化手段概览

### 1.1 代码优化

- Tree Shaking
- 代码压缩
- 代码分割

### 1.2 网络优化

- HTTP/2
- 资源预加载
- CDN
- Gzip 压缩

### 1.3 资源优化

- 图片压缩
- 字体优化
- 静态资源优化

---

## 2. 代码优化

### 2.1 Tree Shaking（摇树优化）

**定义：**

> 移除未使用的代码，减小打包体积。

**代码演示：正确的导入方式**

```javascript
// ✅ 正确：导入具体函数
import { debounce } from 'lodash-es'

// ❌ 错误：导入整个对象
import lodash from 'lodash-es'
```

**代码演示：CommonJS 不支持**

```javascript
// ✅ 正确：ESM 支持 Tree Shaking
import { debounce } from 'lodash-es'

// ❌ 错误：CommonJS 不支持 Tree Shaking
import { debounce } from 'lodash'
```

**关键词解释：**

- **Tree Shaking**：移除未使用的代码
- **ESM**：ES 模块支持 Tree Shaking
- **CommonJS**：CommonJS 不支持 Tree Shaking

---

### 2.2 代码压缩

**代码演示：使用 Esbuild 压缩（默认）**

```javascript
// vite.config.js
export default {
  build: {
    minify: 'esbuild', // 默认，速度快
  },
}
```

**代码演示：使用 Terser 压缩**

```bash
npm install -D terser
```

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser', // 压缩效果更好
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
      },
    },
  },
}
```

**对比：**

| 工具    | 速度 | 压缩率 |
| ------- | ---- | ------ |
| Esbuild | 极快 | 中等   |
| Terser  | 慢   | 高     |

**关键词解释：**

- **代码压缩**：减小代码体积
- **minify**：压缩代码的过程
- **drop_console**：移除 console 语句

---

### 2.3 构建分析

**代码演示：使用 rollup-plugin-visualizer**

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true, // 自动打开
      filename: 'stats.html', // 输出文件
    }),
  ],
}
```

**功能说明：**

分析依赖模块的大小占比，可以让我们更有针对性的进行体积优化。

**使用：**

```bash
npm run build
# 构建成功之后会在根目录下生成一个 stats.html
```

**分析内容：**

- 每个模块的大小
- 模块之间的依赖关系
- 可以识别体积过大的模块

**关键词解释：**

- **构建分析**：分析打包结果，找出体积问题
- **可视化**：图形化展示打包结果，更直观
- **体积优化**：根据分析结果优化代码体积

---

## 3. 网络优化

### 3.1 HTTP/2

#### 3.1.1 HTTP 1.1 协议的问题

**问题 1：队头阻塞**

> 同一个 TCP 管道中同一时刻只能处理一个 HTTP 请求。

**代码演示：队头阻塞**

```text
请求1 → 等待响应1
请求2 → 等待请求1完成
请求3 → 等待请求2完成
```

**问题 2：请求排队**

> Chrome 请求数量超过 6 个时，多出来的请求只能排队、等待发送。

**代码演示：请求限制**

```text
请求1-6 → 立即发送
请求7-10 → 排队等待
```

---

#### 3.1.2 HTTP/2 的优点

**优点 1：多路复用**

> 将数据分为多个二进制帧，多个请求和响应的数据帧在同一个 TCP 通道进行传输，解决了之前的队头阻塞问题。

**代码演示：多路复用**

```text
请求1、2、3 → 同时发送
响应1、2、3 → 同时接收
```

**优点 2：Server Push**

> 服务端推送能力。可以让某些资源能够提前到达浏览器。

**代码演示：Server Push**

```text
浏览器请求 HTML
  ↓
服务器返回 HTML + 推送 CSS/JS
  ↓
浏览器提前收到资源
```

**关键词解释：**

- **HTTP/2**：HTTP 协议的第二个版本
- **多路复用**：同时处理多个请求
- **Server Push**：服务器主动推送资源

---

#### 3.1.3 Nginx 的 HTTP/2 配置

**代码演示：Nginx 配置**

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /var/www/html;
    }
}
```

---

#### 3.1.4 开发阶段使用 HTTP/2

**代码演示：使用 vite-plugin-mkcert**

```bash
npm install -D vite-plugin-mkcert
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: {
    https: true, // 启用 HTTPS
  },
  plugins: [mkcert()],
})
```

---

### 3.2 资源标识符

#### 3.2.1 DNS 预解析

**原理：**

浏览器在向跨域的服务器发送请求时，首先会进行 DNS 解析，将服务器域名解析为对应的 IP 地址。DNS 预解析可以提前完成这个过程。

**代码演示：DNS 预解析**

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com" />

<!-- 预连接：dns-prefetch 会与 preconnect 搭配使用 -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
```

**preconnect 说明：**

- **preconnect**：建立与服务器的连接，建立 TCP 通道及进行 TLS 握手，进一步降低请求延迟
- **注意**：对于 preconnect 的 link 标签一般需要加上 `crossorigin`（跨域标识）

**dns-prefetch vs preconnect：**

- **dns-prefetch**：只预解析 DNS
- **preconnect**：DNS 解析 + TCP 连接 + TLS 握手（更彻底，但消耗更多资源）

**使用建议：**

- 对于关键资源使用 `preconnect`
- 对于非关键资源使用 `dns-prefetch`

**关键词解释：**

- **DNS 预解析**：提前解析域名，减少 DNS 查询时间
- **预连接（preconnect）**：提前建立连接，包括 DNS、TCP、TLS
- **crossorigin**：跨域标识，用于 CORS 请求

---

#### 3.2.2 Preload 预加载

**作用：** 提前加载关键资源，减少等待时间。

**代码演示：Preload**

```html
<!-- 预加载关键资源 -->
<!-- 一般会声明 href 和 as 属性，分别表示资源地址和资源类型 -->
<link rel="preload" href="/assets/main.js" as="script" />
<link rel="preload" href="/assets/main.css" as="style" />
<link
  rel="preload"
  href="/assets/font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**代码演示：Modulepreload（原生 ESM 的预加载）**

```html
<!-- 预加载 ES 模块 -->
<link rel="modulepreload" href="/assets/vendor.js" />
```

**Preload vs Modulepreload：**

- **Preload**：通用资源预加载，需要指定 `as` 属性
- **Modulepreload**：专门用于预加载 ES 模块，浏览器会自动处理依赖

**关键词解释：**

- **Preload**：预加载资源，需要指定资源类型
- **Modulepreload**：预加载 ES 模块，浏览器原生支持
- **as 属性**：指定资源类型（script、style、font 等）

---

#### 3.2.3 Prefetch 空闲加载

**代码演示：Prefetch**

```html
<!-- 空闲时加载 -->
<link rel="prefetch" href="/assets/page2.js" />
```

**关键词解释：**

- **Prefetch**：空闲时加载资源

---

## 4. 资源优化

### 4.1 CDN

**重要提示：** 生产环境 CDN 只能使用私域 CDN，不要使用公共免费的 CDN。

**为什么？**

- 公共 CDN 可能不稳定
- 存在安全风险
- 无法控制版本和更新

**代码演示：配置 CDN（方式1：使用 external）**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      // 外部化依赖：不打包这些依赖
      external: ['vue', 'vue-router', 'element-plus', 'vue-echarts'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'element-plus': 'ElementPlus',
          echarts: 'echarts',
          'vue-echarts': 'VueECharts',
        },
      },
    },
  },
}
```

**代码演示：使用 rollup-plugin-external-globals**

```bash
npm install -D rollup-plugin-external-globals
```

```javascript
// vite.config.js
import externalGlobals from 'rollup-plugin-external-globals'

export default {
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router'],
      plugins: [
        externalGlobals({
          vue: 'Vue',
          'vue-router': 'VueRouter',
        }),
      ],
    },
  },
}
```

**代码演示：HTML 中引入 CDN**

```html
<!-- index.html -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/element-plus@2.3.12/dist/index.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/vue-echarts@6.6.1/dist/csp/style.min.css"
/>
<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4.2.4/dist/vue-router.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/element-plus@2.3.12/dist/index.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-echarts@6.6.1/dist/index.umd.min.js"></script>
```

**代码演示：alias 配置项加载 CDN**

**说明：** alias 除了可以用来配置别名，还可以配置 CDN（本质也是别名的引用）。

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 配置 CDN
      'lodash-es': 'https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm',
    },
  },
}
```

**使用：**

```javascript
// 代码中正常使用
import { debounce } from 'lodash-es'
// 实际会从 CDN 加载
```

**关键词解释：**

- **CDN**：内容分发网络
- **外部化**：不打包依赖，从外部引入
- **私域 CDN**：自己的 CDN 服务

---

### 4.2 Gzip 压缩

#### 4.2.1 Nginx 自带 HttpGzip 模块

**代码演示：Nginx 配置**

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**注意：** 会消耗服务器内存。

---

#### 4.2.2 客户端处理压缩

**优势：** 客户端替 nginx 处理压缩文件这一步操作，减少服务器 CPU 消耗。

**代码演示：使用 vite-plugin-compression2**

```bash
npm install -D vite-plugin-compression2
```

```javascript
// vite.config.js
import compression from 'vite-plugin-compression2'

export default {
  plugins: [
    compression({
      // 压缩算法，默认 gzip
      // algorithm: "brotliCompress",
      // 匹配文件
      include: [/\.(js)$/, /\.(css)$/],
      // 压缩超过此大小的文件,以字节为单位
      // threshold: 10240,
      // 是否删除源文件，只保留压缩文件
      // deleteOriginalAssets: true,
    }),
  ],
}
```

**常用配置说明：**

- `algorithm`：压缩算法（`gzip` 或 `brotliCompress`）
- `include`：匹配需要压缩的文件
- `threshold`：只压缩超过此大小的文件
- `deleteOriginalAssets`：是否删除源文件

**关键词解释：**

- **Gzip**：压缩算法，广泛支持
- **Brotli**：更高效的压缩算法，但浏览器支持较少
- **客户端压缩**：构建时压缩，服务器直接返回压缩文件

---

#### 4.2.3 Nginx 静态压缩

**原理：** Nginx 检查是否存在预压缩的 `.gz` 文件，如果存在则直接返回，避免实时压缩。

**代码演示：Nginx 配置**

```nginx
http {
    # 启用静态压缩模块
    gzip_static on;

    # 如果 .gz 文件不存在，回退到动态压缩
    gzip on;
}
```

**工作流程：**

```text
浏览器请求 main.js（Accept-Encoding: gzip）
  ↓
Nginx 检查 main.js.gz 是否存在
  ↓
存在 → 返回 main.js.gz（Content-Encoding: gzip）
  ↓
不存在 → 动态压缩 main.js 并返回
  ↓
浏览器解压使用
```

**优势：**

- 减少服务器 CPU 消耗
- 提升响应速度
- 与客户端压缩配合使用效果最佳

**关键词解释：**

- **静态压缩**：使用预压缩的文件
- **动态压缩**：实时压缩文件

---

### 4.3 图片压缩

**代码演示：使用 vite-plugin-imagemin**

```bash
pnpm vite-plugin-imagemin -D
```

```javascript
// vite.config.js
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 20,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
}
```

**压缩配置说明：**

- **gifsicle**：GIF 图片压缩
- **optipng**：PNG 图片压缩
- **mozjpeg**：JPEG 图片压缩
- **pngquant**：PNG 图片量化压缩
- **svgo**：SVG 图片优化

**关键词解释：**

- **图片压缩**：减小图片体积，提升加载速度
- **imagemin**：图片压缩工具集合
- **优化级别**：压缩强度（数字越大，压缩越强，但可能影响质量）

---

## 5. 性能优化最佳实践

### 5.1 代码层面

1. **使用 Tree Shaking**：只导入需要的代码
2. **代码分割**：按需加载
3. **代码压缩**：减小体积

### 5.2 网络层面

1. **使用 HTTP/2**：多路复用
2. **资源预加载**：提前加载关键资源
3. **CDN**：加速资源加载
4. **Gzip 压缩**：减小传输体积

### 5.3 资源层面

1. **图片压缩**：减小图片体积
2. **字体优化**：只加载需要的字体
3. **静态资源优化**：合理使用 public 目录

---

## 6. 性能监控

### 6.1 构建分析

**使用 rollup-plugin-visualizer 分析：**

```bash
npm run build
# 查看 stats.html
```

### 6.2 运行时监控

**使用 Lighthouse 分析：**

```bash
# Chrome DevTools
# Lighthouse 标签页
```

---

## 7. 总结

**性能优化要点：**

1. **代码优化**：Tree Shaking、压缩、分割
2. **网络优化**：HTTP/2、预加载、CDN、Gzip
3. **资源优化**：图片压缩、字体优化

**关键理念：**

> 性能优化是一个持续的过程，需要不断监控和优化

这就是 Vite 性能优化的核心思想。
