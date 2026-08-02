---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> CSS 工程化是现代前端开发的重要部分。本文详细讲解 Vite 中各种 CSS 处理方案。

---

## 1. 原生 CSS 的问题

### 1.1 开发体验欠佳

**问题：**

- 没有变量、嵌套、函数等高级特性
- 代码重复，难以维护
- 缺乏模块化支持

**代码演示：原生 CSS 的问题**

```css
/* 原生 CSS：代码重复 */
.button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}

.primary-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
}
```

---

### 1.2 样式污染问题

**问题：** 全局样式，容易造成样式冲突。

**代码演示：样式污染**

```css
/* 全局样式 */
.title {
  color: red;
}

/* 另一个组件也使用了 .title，造成冲突 */
```

---

### 1.3 浏览器兼容问题

**问题：** 需要手动添加浏览器前缀。

**代码演示：浏览器兼容**

```css
/* 需要手动添加前缀 */
.button {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
```

---

### 1.4 代码体积问题

**问题：** 未使用的样式无法自动移除。

---

## 2. CSS 预处理器

### 2.1 什么是 CSS 预处理器？

**定义：**

> 像编程语言一样开发 CSS，解决原生 CSS 的开发体验问题。

**主流预处理器：**

- **Sass/SCSS**：最流行
- **Less**：语法简单
- **Stylus**：语法灵活

**关键词解释：**

- **预处理器**：在 CSS 编译前进行处理的工具
- **Sass/SCSS**：Sass 的两种语法格式

---

### 2.2 Sass/SCSS

**代码演示：安装 Sass**

```bash
npm install -D sass
```

**代码演示：使用 SCSS**

```scss
// variables.scss
$primary-color: #007bff;
$secondary-color: #6c757d;

// mixins.scss
@mixin button($bg-color) {
  padding: 10px 20px;
  background-color: $bg-color;
  color: white;
  border: none;
  border-radius: 4px;

  &:hover {
    opacity: 0.8;
  }
}

// button.scss
@import "./variables";
@import "./mixins";

.button {
  @include button($primary-color);
}

.primary-button {
  @include button($primary-color);
  font-weight: bold;
}
```

**代码演示：Vite 配置**

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        // 全局变量：每个 SCSS 文件都会自动导入
        additionalData: `@import "./src/styles/variables.scss";`,
        // 或使用函数形式
        // additionalData: (content, loaderContext) => {
        //   return `@import "./src/styles/variables.scss";\n${content}`;
        // },
      },
    },
  },
};
```

**配置说明：**

1. **按需安装对应的预处理器**：`npm install -D sass`
2. **按需配置对应的预处理器**：在 `css.preprocessorOptions` 中配置

**关键词解释：**

- **additionalData**：在每个文件开头自动注入的内容
- **全局变量**：所有文件都可以使用的变量

**关键词解释：**

- **变量（Variables）**：存储可复用的值
- **Mixins**：可复用的样式块
- **嵌套（Nesting）**：CSS 选择器嵌套

---

### 2.3 Less

**代码演示：安装 Less**

```bash
npm install -D less
```

**代码演示：使用 Less**

```less
// variables.less
@primary-color: #007bff;
@secondary-color: #6c757d;

// button.less
.button {
  padding: 10px 20px;
  background-color: @primary-color;
  color: white;

  &:hover {
    opacity: 0.8;
  }
}
```

---

### 2.4 Stylus

**代码演示：安装 Stylus**

```bash
npm install -D stylus
```

**代码演示：使用 Stylus**

```stylus
// variables.styl
primary-color = #007bff
secondary-color = #6c757d

// button.styl
.button
  padding 10px 20px
  background-color primary-color
  color white

  &:hover
    opacity 0.8
```

---

## 3. CSS Modules

### 3.1 什么是 CSS Modules？

**定义：**

> 将 CSS 类名处理成哈希值，避免同名情况下样式污染的问题。

**代码演示：CSS Modules**

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}
```

```javascript
// Button.jsx
import styles from "./Button.module.css";

function Button() {
  return <button className={styles.button}>Click me</button>;
}

// 编译后的类名：Button_button_abc123
```

**关键词解释：**

- **CSS Modules**：CSS 模块化方案
- **哈希值**：自动生成的唯一类名

---

### 3.2 Vite 配置

**代码演示：CSS Modules 配置**

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      // 类名生成规则
      generateScopedName: "[name]__[local]___[hash:base64:5]",
      // 或使用函数
      generateScopedName: (name, filename, css) => {
        // 自定义生成逻辑
        return `${name}_${hash}`;
      },
    },
  },
};
```

---

## 4. CSS 后处理器 PostCSS

### 4.1 什么是 PostCSS？

**定义：**

> 解析和处理 CSS 代码，功能丰富，插件众多。兼容、转换、压缩等功能均能实现。

**PostCSS 的能力：**

由于有 CSS 代码的 AST（抽象语法树）解析能力，其实 PostCSS 可以实现：

- **CSS 预处理器语法**：如 Sass、Less 的功能
- **CSS Modules**：模块化 CSS
- **浏览器兼容**：自动添加前缀
- **代码转换**：将现代 CSS 转换为兼容代码
- **代码压缩**：减小 CSS 体积

**关键词解释：**

- **PostCSS**：CSS 后处理器，基于 AST 的 CSS 处理工具
- **AST（抽象语法树）**：代码的结构化表示，便于分析和转换

---

### 4.2 常用插件

#### 4.2.1 autoprefixer

**功能：** 自动添加浏览器前缀。

**代码演示：使用 autoprefixer**

```bash
npm install -D postcss autoprefixer
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 versions"],
    }),
  ],
};
```

```css
/* 输入 */
.button {
  transform: rotate(45deg);
}

/* 输出 */
.button {
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}
```

---

#### 4.2.2 postcss-pxtorem

**功能：** 将 px 转换为 rem。

**代码演示：使用 postcss-pxtorem**

```bash
npm install -D postcss-pxtorem
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("postcss-pxtorem")({
      rootValue: 16, // 根字体大小
      propList: ["*"], // 所有属性都转换
    }),
  ],
};
```

---

#### 4.2.3 postcss-preset-env

**功能：** 使用未来的 CSS 特性。

**代码演示：使用 postcss-preset-env**

```bash
npm install -D postcss-preset-env
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("postcss-preset-env")({
      // 包含 autoprefixer
      browsers: "last 2 versions",
      // 使用 can i use 数据
      stage: 2,
    }),
  ],
};
```

**关键词解释：**

- **browserslist**：指定目标浏览器
- **can i use**：浏览器兼容性数据库

---

#### 4.2.4 cssnano

**功能：** CSS 压缩。

**代码演示：使用 cssnano**

```bash
npm install -D cssnano
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("cssnano")({
      preset: "default",
    }),
  ],
};
```

---

### 4.3 Vite 配置

**代码演示：PostCSS 配置**

```javascript
// vite.config.js
export default {
  css: {
    postcss: {
      plugins: [require("autoprefixer")(), require("postcss-preset-env")()],
    },
  },
};
```

**或使用独立配置文件：**

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    "postcss-preset-env": {
      browsers: "last 2 versions",
    },
  },
};
```

**关键词解释：**

- **独立配置文件**：postcss.config.js
- **热更新支持**：Vite 支持 PostCSS 热更新

---

## 5. CSS in JS 方案

### 5.1 关注点分离 vs 关注点混合

**传统观点：关注点分离**

- HTML：结构
- CSS：样式
- JS：逻辑

**现代观点：关注点混合**

- React 强制把 HTML、CSS、JavaScript 写在一起
- 有利于组件隔离
- 每个组件包含所有需要的代码

**关键词解释：**

- **关注点分离**：将不同关注点分开
- **关注点混合**：将相关关注点放在一起

---

### 5.2 主流方案

#### 5.2.1 styled-components

**代码演示：使用 styled-components**

```bash
npm install -D styled-components
npm install -D babel-plugin-styled-components
```

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-styled-components"],
      },
    }),
  ],
});
```

```javascript
// Button.jsx
import styled from "styled-components";

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

export default Button;
```

**配置说明：**

- `styled-components`：CSS in JS 库
- `babel-plugin-styled-components`：Babel 插件，用于优化 styled-components
- 和预处理器的区别无非就是不再需要重新学一套 API，CSS in JS 的库其实就是在操作 JS。解决了开发体验和全局样式污染的问题

---

#### 5.2.2 emotion

**代码演示：使用 emotion**

```bash
npm install @emotion/react @emotion/styled
```

```javascript
// Button.jsx
import styled from "@emotion/styled";

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
`;
```

**Vite 配置：**

针对不同的 CSS in JS 库按需配置插件 plugins。

**关键词解释：**

- **emotion**：另一个流行的 CSS in JS 库
- **styled API**：使用模板字符串定义样式

---

## 6. CSS 原子化框架

### 6.1 什么是原子化 CSS？

**定义：**

> 主要解决 CSS 开发体验问题，通过工具类快速构建 UI。

**关键词解释：**

- **原子化 CSS**：将样式拆分成小的工具类
- **工具类**：单一功能的 CSS 类

---

### 6.2 Tailwind CSS

**代码演示：安装 Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**代码演示：tailwind.config.js**

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**代码演示：tailwind.config.js**

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**代码演示：Vite 配置中的 PostCSS 配置**

```javascript
// vite.config.js
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import presetEnv from "postcss-preset-env";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        // 也可以是 autoprefixer
        // autoprefixer()
        presetEnv({
          browsers: "last 2 versions",
        }),
        tailwindcss(),
      ],
    },
  },
});
```

**或使用独立的 postcss.config.js：**

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**代码演示：引入指令**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**关闭 Unknown at rule @tailwind 警告：**

在 VSCode 设置中：

- 设置 → CSS › Lint: Unknown At Rules → ignore

**VSCode 插件配置：**

1. **安装插件**：Tailwind CSS IntelliSense
2. **打开字符串用户设置（User.JSON）提示**：

```json
{
  "editor.quickSuggestions": {
    "strings": "on"
  }
}
```

**代码演示：使用 Tailwind**

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>
```

**关键词解释：**

- **Tailwind CSS**：流行的原子化 CSS 框架
- **工具类**：如 `px-4`、`py-2` 等
- **content 配置**：指定 Tailwind 扫描的文件，用于 Tree Shaking
- **IntelliSense**：代码智能提示

---

### 6.3 Windi CSS

**代码演示：安装 Windi CSS**

```bash
npm install -D windicss vite-plugin-windicss
```

```javascript
// vite.config.js
import WindiCSS from "vite-plugin-windicss";

export default {
  plugins: [WindiCSS()],
};
```

**Windi CSS 特点：**

- 与 Tailwind CSS API 兼容
- 按需生成，性能更好
- 支持属性化模式

**关键词解释：**

- **Windi CSS**：Tailwind CSS 的替代品，性能更好

---

## 7. 总结

**CSS 工程化方案对比：**

| 方案        | 特点           | 适用场景   |
| ----------- | -------------- | ---------- |
| 预处理器    | 增强 CSS 功能  | 传统项目   |
| CSS Modules | 避免样式污染   | 组件化项目 |
| PostCSS     | 兼容和转换     | 所有项目   |
| CSS in JS   | 样式与逻辑结合 | React 项目 |
| 原子化框架  | 快速开发       | 现代项目   |

**关键理念：**

> 选择合适的 CSS 方案，提升开发体验和代码质量

这就是 Vite CSS 工程化的核心思想。
