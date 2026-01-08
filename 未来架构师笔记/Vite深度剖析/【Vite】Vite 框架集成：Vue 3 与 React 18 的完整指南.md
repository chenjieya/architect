> Vite 对主流框架提供了开箱即用的支持。本文详细讲解如何集成 Vue 3 和 React 18。

---

## 1. Vue 3 集成

### 1.1 安装依赖

**代码演示：安装 Vue 3**

```bash
npm install vue
npm install -D @vitejs/plugin-vue vue-tsc
```

**package.json：**

```json
{
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vue-tsc": "^1.8.22"
  }
}
```

**关键词解释：**

- **@vitejs/plugin-vue**：Vue 3 的 Vite 插件
- **vue-tsc**：Vue 的 TypeScript 类型检查工具

---

### 1.2 配置插件

**代码演示：vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

**插件功能：**

1. **单文件组件支持**：编译 `.vue` 文件
2. **热重载**：修改组件后自动更新
3. **生产优化**：生产环境代码优化

---

### 1.3 TypeScript 支持

**代码演示：vue-tsc 配置**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build -w",
    // -w 为监听打包，测试用
    "preview": "vite preview"
  }
}
```

**说明：**

- `vue-tsc`：Vue 的 TypeScript 类型检查工具
- `-w`：watch 模式，监听文件变化（测试用）

**代码演示：Vue 组件**

```vue
<!-- src/App.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Hello Vue 3')

const handleClick = () => {
  title.value = 'Clicked!'
}
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
```

**关键词解释：**

- **单文件组件（SFC）**：Vue 的组件文件格式
- **script setup**：Vue 3 的语法糖，简化组件编写
- **scoped**：样式作用域，只影响当前组件

---

## 2. React 18 集成

### 2.1 安装依赖

**代码演示：安装 React 18**

```bash
npm install react react-dom
npm install -D @vitejs/plugin-react @types/react @types/react-dom
```

**package.json：**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

**关键词解释：**

- **@vitejs/plugin-react**：React 的 Vite 插件
- **@types/react**：React 的 TypeScript 类型定义

---

### 2.2 配置插件

**代码演示：vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**插件功能：**

1. **热重载**：修改组件后自动更新
2. **生产优化**：生产环境代码优化

---

### 2.3 React 组件示例

**代码演示：React 组件**

```tsx
// src/App.tsx
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello React 18</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  )
}

export default App
```

---

### 2.4 HMR Invalidate

**问题：** 导出的 React 组件应该符合规范，否则可能导致 HMR 失效。

**代码演示：正确的导出方式**

```tsx
// ✅ 正确：默认导出组件（函数声明）
export default function App() {
  return <div>App</div>;
}

// ✅ 正确：命名导出组件（函数声明）
export function App() {
  return <div>App</div>;
}

// ✅ 正确：箭头函数（但需要直接导出）
export const App = () => <div>App</div>;

// ❌ 错误：导出常量（可能导致 HMR 失效）
const App = () => <div>App</div>;
export { App };
```

**为什么会导致 HMR 失效？**

React Fast Refresh 需要能够识别组件，如果组件导出不符合规范，可能无法正确更新。

**关键词解释：**

- **HMR Invalidate**：热更新失效，需要刷新页面
- **导出规范**：组件应该使用函数声明或箭头函数直接导出
- **Fast Refresh**：React 的快速刷新机制

---

### 2.5 加入 ESLint

**代码演示：安装 ESLint**

```bash
pnpm add eslint eslint-plugin-react-hooks eslint-plugin-react-refresh @typescript-eslint/eslint-plugin @typescript-eslint/parser -D
```

**代码演示：.eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
```

**代码演示：package.json**

```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

**ESLint 规则说明：**

- `react-refresh/only-export-components`：确保只导出组件，避免 HMR 失效
- `allowConstantExport: true`：允许导出常量

**关键词解释：**

- **ESLint**：JavaScript/TypeScript 代码检查工具
- **react-refresh**：React 热更新的 ESLint 插件
- **react-hooks**：React Hooks 的 ESLint 规则

---

## 3. Vite 模板

### 3.1 使用模板创建项目

**代码演示：创建 Vue 项目**

```bash
npm create vite@latest my-vue-app -- --template vue
npm create vite@latest my-vue-app -- --template vue-ts
```

**代码演示：创建 React 项目**

```bash
npm create vite@latest my-react-app -- --template react
npm create vite@latest my-react-app -- --template react-ts
```

**可用模板：**

- `vanilla`：纯 JavaScript
- `vanilla-ts`：TypeScript
- `vue`：Vue 3
- `vue-ts`：Vue 3 + TypeScript
- `react`：React
- `react-ts`：React + TypeScript
- `preact`：Preact
- `preact-ts`：Preact + TypeScript
- `lit`：Lit
- `lit-ts`：Lit + TypeScript
- `svelte`：Svelte
- `svelte-ts`：Svelte + TypeScript

**模板位置：**

Vite 的模板存放在 [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) 仓库中，每个模板都包含：
- 预配置的 `vite.config.js`
- 示例代码
- 必要的依赖

**关键词解释：**

- **模板（Template）**：预配置的项目结构
- **create-vite**：Vite 的脚手架工具，提供多种项目模板

---

## 4. 框架特性对比

### 4.1 Vue 3 特性

| 特性             | 说明            |
| ---------------- | --------------- |
| 单文件组件       | `.vue` 文件支持 |
| Composition API  | 组合式 API      |
| `<script setup>` | 语法糖          |
| 热重载           | 组件级热更新    |

**代码演示：Composition API**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

---

### 4.2 React 18 特性

| 特性         | 说明          |
| ------------ | ------------- |
| JSX/TSX      | 支持 JSX 语法 |
| Hooks        | React Hooks   |
| 热重载       | 组件级热更新  |
| Fast Refresh | 快速刷新      |

**代码演示：React Hooks**

```tsx
import { useState, useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Count changed:', count)
  }, [count])

  return <div>{count}</div>
}
```

---

## 5. 项目结构

### 5.1 Vue 3 项目结构

```
vue-project/
├── index.html
├── src/
│   ├── main.js          # 入口文件
│   ├── App.vue          # 根组件
│   ├── components/      # 组件
│   ├── views/           # 页面
│   ├── router/          # 路由
│   ├── store/           # 状态管理
│   └── assets/          # 静态资源
├── vite.config.js
└── package.json
```

---

### 5.2 React 18 项目结构

```
react-project/
├── index.html
├── src/
│   ├── main.tsx         # 入口文件
│   ├── App.tsx          # 根组件
│   ├── components/      # 组件
│   ├── pages/           # 页面
│   ├── hooks/           # 自定义 Hooks
│   ├── utils/           # 工具函数
│   └── assets/         # 静态资源
├── vite.config.ts
└── package.json
```

---

## 6. 最佳实践

### 6.1 Vue 3 最佳实践

**代码演示：组件组织**

```vue
<!-- components/Button.vue -->
<template>
  <button :class="buttonClass" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
})

const buttonClass = computed(() => `btn btn-${props.variant}`)

defineEmits(['click'])
</script>
```

---

### 6.2 React 18 最佳实践

**代码演示：组件组织**

```tsx
// components/Button.tsx
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  )
}
```

---

## 7. 总结

**框架集成要点：**

1. **Vue 3**：
   - 安装 `@vitejs/plugin-vue`
   - 配置插件
   - 支持单文件组件和热重载

2. **React 18**：
   - 安装 `@vitejs/plugin-react`
   - 配置插件
   - 注意组件导出规范

3. **模板**：使用 `create-vite` 快速创建项目

**关键理念：**

> Vite 为每个框架提供了最佳的开箱即用体验

这就是 Vite 框架集成的核心思想。
