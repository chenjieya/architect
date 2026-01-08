> 静态资源处理是前端开发的重要部分。本文详细讲解 Vite 如何处理各种静态资源。

---

## 1. 别名处理

### 1.1 路径别名配置

**代码演示：配置别名**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
})
```

**使用绝对路径：**

```javascript
// 使用 path.resolve 获取绝对路径
path.resolve(__dirname, 'src')
```

**代码演示：使用别名**

```javascript
// 使用别名
import Button from '@components/Button.vue'
import logo from '@assets/logo.png'

// 而不是相对路径
import Button from '../../../components/Button.vue'
import logo from '../../assets/logo.png'
```

**关键词解释：**

- **别名（Alias）**：给路径起一个简短的名字
- **路径解析**：将别名转换为实际路径

---

### 1.2 Vite 如何处理别名？

**Vite 使用两个插件处理别名：**

1. **vite:pre-alias**：bare import 路径重定向到预构建依赖的路径
   - 处理 `import vue from 'vue'` 这样的 bare import
   - 重定向到预构建依赖的路径

2. **@rollup/plugin-alias**：路径别名替换功能
   - 处理自定义别名，如 `@/components`
   - 将别名替换为实际路径

**代码演示：别名处理流程**

```text
遇到 @/components/Button.vue
  ↓
vite:pre-alias 检查是否是依赖（如 'vue'）
  ↓
不是依赖，交给 @rollup/plugin-alias
  ↓
查找别名配置
  ↓
替换为实际路径 src/components/Button.vue
```

**代码演示：bare import 处理**

```javascript
// bare import：nodejs 默认支持
import vue from 'vue' // vite:pre-alias 处理
import lodash from 'lodash-es' // vite:pre-alias 处理

// 别名导入：@rollup/plugin-alias 处理
import Button from '@components/Button.vue'
```

**关键词解释：**

- **bare import**：不包含路径的导入，如 `import vue from 'vue'`，nodejs 默认支持
- **路径重定向**：将别名路径转换为实际路径
- **vite:pre-alias**：Vite 内置插件，处理 bare import
- **@rollup/plugin-alias**：Rollup 插件，处理路径别名

---

### 1.3 TypeScript 处理

**代码演示：tsconfig.json**

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@assets/*": ["src/assets/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

**关键词解释：**

- **baseUrl**：基础路径
- **paths**：路径映射

---

## 2. 默认静态资源后缀

### 2.1 什么是静态资源？

**定义：**

> 不需要编译处理的文件，如图片、字体、视频等。

**Vite 默认支持的静态资源类型：**

#### 2.1.1 Images（图片）

```javascript
// 支持的格式
const imageFormats = [
  'apng',
  'png',
  'jpe?g',
  'jfif',
  'pjpeg',
  'pjp',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif',
]
```

**代码演示：使用图片**

```javascript
// 导入图片
import logo from './assets/logo.png'
import icon from './assets/icon.svg'

// 使用
;<img src={logo} alt="Logo" />
```

---

#### 2.1.2 Media（媒体）

```javascript
// 支持的格式
const mediaFormats = ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'aac', 'opus']
```

**代码演示：使用媒体**

```javascript
import video from './assets/video.mp4'
import audio from './assets/audio.mp3'

<video src={video} controls />
<audio src={audio} controls />
```

---

#### 2.1.3 Fonts（字体）

```javascript
// 支持的格式
const fontFormats = ['woff2?', 'eot', 'ttf', 'otf']
```

**代码演示：使用字体**

```css
@font-face {
  font-family: 'CustomFont';
  src: url('./assets/font.woff2') format('woff2');
}
```

---

#### 2.1.4 Other（其他）

```javascript
// 支持的格式
const otherFormats = ['webmanifest', 'pdf', 'txt']
```

---

### 2.2 返回解析后的 URL

**代码演示：导入静态资源**

```javascript
// 导入图片
import logo from './assets/logo.png'
console.log(logo) // /assets/logo-abc123.png

// 在 CSS 中使用
import './styles.css'
```

```css
/* styles.css */
.background {
  background-image: url('./assets/bg.jpg');
}
/* 编译后：url(/assets/bg-abc123.jpg) */
```

**代码演示：Vue SFC 模板**

```vue
<template>
  <img src="./assets/logo.png" alt="Logo" />
  <!-- 自动转换为导入 -->
</template>
```

**关键词解释：**

- **URL 解析**：将相对路径转换为绝对路径
- **哈希值**：文件内容的哈希，用于缓存

---

### 2.3 客户端 TypeScript 声明

**代码演示：类型声明**

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}
```

---

### 2.4 动态变量路径问题

**问题：** 普通的动态变量路径并不会自动转换导入。

**代码演示：错误用法**

```vue
<template>
  <img :src="imagePath" />
</template>

<script setup>
// ❌ 错误：Vite 不会处理动态路径
const imagePath = ref('../assets/logo.jpg')
</script>
```

**代码演示：正确用法**

```vue
<template>
  <img :src="imagePath" />
</template>

<script setup>
// ✅ 正确：使用 import
import logo from '@assets/logo.jpg'
const imagePath = ref(logo)
</script>
```

**关键词解释：**

- **动态路径**：运行时才能确定的路径
- **静态分析**：编译时分析代码

---

## 3. 资源 URL 处理

### 3.1 开发环境和生产环境分开处理

**代码演示：URL 处理**

```javascript
// 开发环境
import logo from './assets/logo.png'
// 返回：/src/assets/logo.png

// 生产环境
import logo from './assets/logo.png'
// 返回：/assets/logo-abc123.png
```

**详细说明：**

- **开发环境**：`/src/assets/spring.jpg` - 保持原始路径
- **生产环境**：`/assets/spring-2ee14c22.jpg` - 添加哈希值，优化缓存

**修改构建路径：**

可以通过 `build.assetsDir` 配置修改静态资源的输出目录。

**关键词解释：**

- **开发环境**：开发时的路径处理
- **生产环境**：构建后的路径处理

---

### 3.2 修改构建路径

**代码演示：配置构建路径**

```javascript
// vite.config.js
export default {
  build: {
    assetsDir: 'assets', // 静态资源目录
    // 修改输出路径
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
}
```

**配置说明：**

- `assetsDir`：静态资源目录，默认是 `assets`
- `assetFileNames`：静态资源文件命名规则

---

### 3.3 import 动态导入

**代码演示：动态导入单个资源**

```javascript
// 静态导入
import logo from '@assets/logo.jpg'
const imgPath = ref(logo)
```

**代码演示：动态导入多个资源**

```javascript
// Vue 示例
import spring from "@assets/spring.jpg";
const imgPath = ref(spring);

const handleChange = async (e: Event) => {
  const v = (e.target as HTMLButtonElement).value;
  const module = await import(`@assets/${v}.jpg`);
  console.log(module);
  imgPath.value = module.default;
};
```

**注意事项：**

- 动态导入必须使用模板字符串
- 路径必须包含部分静态信息（不能完全动态）
- 返回的模块对象包含 `default` 属性

**关键词解释：**

- **动态导入**：运行时导入模块
- **import()**：ES 模块的动态导入语法，返回 Promise
- **module.default**：动态导入的资源默认导出

---

### 3.4 动态变量处理：new URL()

**代码演示：使用 new URL()**

```javascript
// 使用 new URL() 处理动态路径
const getImageUrl = (name) => {
  return new URL(`../assets/${name}.jpg`, import.meta.url).href
}

const imageUrl = getImageUrl('logo')
```

**关键词解释：**

- **new URL()**：创建 URL 对象
- **import.meta.url**：当前模块的 URL

---

### 3.5 导入多个模块：import.meta.glob

**代码演示：使用 import.meta.glob**

```javascript
// 导入所有匹配的模块（懒加载）
const modules = import.meta.glob('./assets/*.jpg')

// 使用
for (const path in modules) {
  const module = await modules[path]()
  console.log(module.default)
}
```

**代码演示：预加载（eager）**

```javascript
// 预加载所有模块
const modules = import.meta.glob('./assets/*.jpg', { eager: true })

// 直接使用（不需要 await）
Object.values(modules).forEach((module) => {
  console.log(module.default)
})
```

**import.meta.glob 选项：**

- `eager: true`：预加载所有模块
- `eager: false`：懒加载（默认）

**关键词解释：**

- **import.meta.glob**：批量导入模块，支持 glob 模式
- **eager**：预加载所有模块，而不是懒加载
- **glob 模式**：使用通配符匹配文件

**关键词解释：**

- **import.meta.glob**：批量导入模块
- **eager**：预加载所有模块

---

### 3.6 外部静态资源地址处理（如：图片 CDN）

**使用场景：** 图片等静态资源存放在 CDN 上，需要通过环境变量配置域名。

**代码演示：环境变量设置域名**

```bash
# .env
VITE_IMG_BASE_URL=http://xxx.cdnxxx.com
```

**代码演示：TypeScript 声明**

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  // ......其他声明省略
  readonly VITE_IMG_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**代码演示：界面使用**

```javascript
// 使用 new URL 结合环境变量
const href = new URL(
  `../assets/${imgPath.value}.jpg`,
  import.meta.env.VITE_IMG_BASE_URL,
).href
```

**完整示例：**

```vue
<template>
  <img :src="imageUrl" alt="Image" />
</template>

<script setup>
import { ref, computed } from 'vue'

const imgPath = ref('logo')

const imageUrl = computed(() => {
  return new URL(
    `../assets/${imgPath.value}.jpg`,
    import.meta.env.VITE_IMG_BASE_URL,
  ).href
})
</script>
```

**关键词解释：**

- **CDN**：内容分发网络，用于加速静态资源加载
- **环境变量**：通过 .env 文件配置不同环境的 CDN 地址

---

## 4. 未被列入静态资源文件处理

### 4.1 Markdown 文件

**使用场景：** 比如 readme.md、md 文档作为静态文件处理。

**代码演示：处理 Markdown**

```typescript
// src/vite-env.d.ts
declare module '*.md' {
  const str: string
  export default str
}
```

**注意 TS 类型处理：**

```typescript
// 必须声明模块类型，否则 TypeScript 会报错
declare module '*.md' {
  const str: string
  export default str
}
```

```javascript
// 使用
import readme from './README.md'
console.log(readme) // Markdown 内容（字符串）
```

**关键词解释：**

- **模块声明**：告诉 TypeScript 如何处理特定类型的文件
- **静态文件**：不需要编译处理的文件

---

### 4.2 显式 URL 引入

**代码演示：使用 ?url**

```javascript
// 获取资源的 URL（显式 URL 引入）
import logoUrl from './assets/logo.png?url'
console.log(logoUrl) // /assets/logo-abc123.png
```

**使用场景：**

- 需要获取资源的 URL 而不是内容
- 需要将 URL 传递给其他函数

**关键词解释：**

- **?url**：显式获取资源 URL
- **查询参数**：URL 中的参数

---

### 4.3 将资源引入为字符串

**代码演示：使用 ?raw**

```javascript
// 获取资源的原始内容
import svgContent from './assets/icon.svg?raw'
console.log(svgContent) // SVG 字符串

// 动态关联 SVG 图片可用
const svgElement = document.createElement('div')
svgElement.innerHTML = svgContent
```

**使用场景：**

- **动态关联 SVG 图片**：需要动态插入 SVG 内容时
- **获取文件原始内容**：需要处理文件内容时

**代码演示：动态 SVG**

```vue
<template>
  <div v-html="svgContent"></div>
</template>

<script setup>
import { ref } from 'vue'
import iconSvg from './assets/icon.svg?raw'

const svgContent = ref(iconSvg)
</script>
```

**关键词解释：**

- **?raw**：获取资源的原始内容（未处理）
- **原始内容**：文件的原始文本内容
- **动态关联**：运行时动态使用资源内容

---

### 4.4 扩展内部列表

**作用：** 将未被列入默认静态资源列表的文件类型添加到列表中。

**代码演示：扩展静态资源列表**

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.md'], // 将 .md 文件视为静态资源
}
```

**完整示例：**

```javascript
// vite.config.js
export default {
  assetsInclude: [
    '**/*.md', // Markdown 文件
    '**/*.txt', // 文本文件
  ],
}
```

**使用场景：**

- 需要将自定义文件类型作为静态资源处理
- 需要处理特殊格式的文件

**代码演示：扩展多种文件类型**

```javascript
// vite.config.js
export default {
  assetsInclude: [
    '**/*.md', // Markdown 文件
    '**/*.txt', // 文本文件
    '**/*.xml', // XML 文件
  ],
}
```

**关键词解释：**

- **assetsInclude**：扩展静态资源列表的配置项
- **glob 模式**：使用 `**/*.md` 这样的模式匹配文件

---

## 5. public 目录

### 5.1 public 目录的作用

**定义：**

> public 目录中的资源在开发时通过 / 根路径访问，生产环境会被完整复制到目标目录的根目录下。

**代码演示：public 目录结构**

```
project/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
│       └── logo.png
└── src/
```

**代码演示：使用 public 资源**

```html
<!-- 开发环境：/favicon.ico -->
<!-- 生产环境：/favicon.ico -->
<link rel="icon" href="/favicon.ico" />

<!-- 开发环境：/images/logo.png -->
<!-- 生产环境：/images/logo.png -->
<img src="/images/logo.png" alt="Logo" />
```

**关键词解释：**

- **public 目录**：存放不需要处理的静态资源
- **根路径**：从网站根目录开始的路径

---

### 5.2 哪些文件可以放入 public？

根据思维导图，以下文件适合放入 public 目录：

1. **不会被源码引入的静态文件**
   - 不需要在代码中 import 的文件
   - 直接通过 URL 访问的文件

2. **必须保持原有文件名的文件**
   - `robots.txt`：搜索引擎爬虫规则
   - `favicon.ico`：网站图标
   - `manifest.json`：PWA 配置

3. **不想引入该资源，只是想得到其 URL**
   - 不需要处理，只需要 URL 的资源

**代码演示：使用场景**

```html
<!-- robots.txt 必须保持文件名 -->
<link rel="robots" href="/robots.txt" />

<!-- favicon 必须保持文件名 -->
<link rel="icon" href="/favicon.ico" />

<!-- manifest.json 必须保持文件名 -->
<link rel="manifest" href="/manifest.json" />
```

**关键词解释：**

- **public 目录**：存放不需要处理的静态资源
- **保持文件名**：某些文件必须使用特定文件名才能被识别

---

## 6. 单文件 or 内联？

### 6.1 两种构建方式

**所有静态资源都有两种构建方式：**

1. **单文件**：资源体积 >= 4KB
2. **内联**：资源体积 < 4KB，作为 base64 格式的字符串内联

**代码演示：配置内联阈值**

```javascript
// vite.config.js
export default {
  build: {
    assetsInlineLimit: 4096, // 4KB，默认值
  },
}
```

**代码演示：内联效果**

```javascript
// 小图片会被内联（< 4KB）
import smallIcon from './assets/icon-2kb.png'
// 编译后：data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...

// 大图片会单独打包（>= 4KB）
import largeImage from './assets/image-10kb.jpg'
// 编译后：/assets/image-10kb-abc123.jpg
```

**内联的优势：**

对于比较小的资源，适合内联到代码中，一方面对代码体积的影响很小，另一方面可以减少不必要的网络请求，优化网络性能。

**关键词解释：**

- **内联**：将资源内容嵌入到代码中
- **base64**：将二进制数据编码为文本

---

### 6.2 SVG 特殊处理

**重要规则：** svg 格式的文件不受这个阈值的影响，始终会打包成单独的文件。

**为什么 SVG 特殊处理？**

- SVG 是矢量图，通常体积较小
- SVG 可以作为代码使用（内联）
- SVG 需要保持可编辑性

**代码演示：SVG 处理**

```javascript
// SVG 始终单独打包，不受 assetsInlineLimit 影响
import svgIcon from './assets/icon.svg'
// 编译后：/assets/icon-abc123.svg（始终是单独文件）

// 即使 SVG 文件小于 4KB，也不会内联
```

**代码演示：SVG 内联（如果需要）**

```javascript
// 如果需要内联 SVG，使用 ?raw
import svgContent from './assets/icon.svg?raw'
// 获取 SVG 的原始内容，可以内联到 HTML 中
```

**关键词解释：**

- **SVG**：可缩放矢量图形
- **阈值**：assetsInlineLimit 配置的值
- **单独文件**：不内联，保持为独立文件

---

## 7. 总结

**静态资源处理要点：**

1. **路径别名**：简化导入路径
2. **默认支持**：图片、媒体、字体等
3. **动态导入**：支持运行时导入
4. **public 目录**：存放不需要处理的资源
5. **内联优化**：小资源自动内联

**关键理念：**

> 自动处理静态资源，提升开发体验

这就是 Vite 静态资源处理的核心思想。
