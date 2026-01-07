> 在 Vite 之前，SSR 几乎等同于：  
> **配置地狱 + 心智负担 + 构建噩梦**
>
> Vite 的出现，第一次让 SSR 回归到“模块系统本身”。

---

## 1. 先给结论：Vite 并不是 SSR 框架，而是 SSR 的“基础设施”

一句话定性：

> **Vite 负责“让模块在 Node 和浏览器中同时成立”，而不是负责渲染。**

---

## 2. 为什么 SSR 在 Vite 出现之前这么痛苦？

### 2.1 传统 SSR 的核心矛盾

```text
同一份代码
  ↓
既要在 Node 跑
  ↓
又要在浏览器跑
```

问题：

- Node 不认识 ESM（曾经）
- 浏览器不认识 CJS
- 构建产物完全不同

---

### 2.2 Webpack SSR 的复杂度来源

- 两套配置（client / server）
- loader 行为不一致
- module resolution 差异

👉 **不是逻辑复杂，是工具不统一**

---

## 3. Vite SSR 的设计前提（非常关键）

Vite SSR 能成立，依赖三个前提：

1. **ESM 是第一公民**
2. **Node 也支持 ESM**
3. **Dev Server 可复用模块编译能力**

📌 **这是时代红利，不是巧合**

---

## 4. Vite SSR 的基本工作模型

### 4.1 核心思想

> **Node 端不打包，直接运行源码**

是的，和 dev server 一样。

---

### 4.2 一个最小 SSR 结构

```text
src/
├── entry-client.ts
├── entry-server.ts
└── App.vue
```

---

### 4.3 Node 端加载方式（关键）

```ts
// server.js
const appModule = await vite.ssrLoadModule('/src/entry-server.ts')
```

📌 **这是 SSR 的核心 API**

---

## 5. ssrLoadModule 做了什么？

### 5.1 表面看是 import

```ts
await import('/src/entry-server.ts')
```

但实际是：

```text
读取源码
  ↓
走 Vite 插件 pipeline
  ↓
转译成 Node 可执行代码
  ↓
返回模块实例
```

👉 **Node 端也复用了 Vite 的 transform 能力**

---

### 5.2 和浏览器请求的区别

| 维度     | 浏览器  | Node SSR      |
| -------- | ------- | ------------- |
| 加载方式 | HTTP    | ssrLoadModule |
| 目标环境 | browser | node          |
| 打包     | 否      | 否            |

---

## 6. SSR 中的依赖处理（最容易踩坑）

### 6.1 问题来源

```ts
import someLib from 'some-lib'
```

这个库：

- 使用 CJS
- 使用 Node API
- 或同时面向浏览器

---

### 6.2 ssr.external / noExternal

```ts
export default {
  ssr: {
    noExternal: ['some-lib'],
  },
}
```

含义：

> **告诉 Vite：这个依赖不要走 Node 原生 import，而是走 Vite 转译**

---

### 6.3 什么时候用 external？

```ts
ssr: {
  external: ['fs', 'path']
}
```

👉 Node 原生模块，必须 external。

---

## 7. SSR 构建阶段发生了什么？

### 7.1 SSR Build 的目标

```text
浏览器 bundle + Node 可执行产物
```

---

### 7.2 构建输出结构

```text
dist/
├── client/
│   └── assets/*
└── server/
    └── entry-server.js
```

---

### 7.3 server bundle 的特点

- 面向 Node
- 不需要 polyfill DOM
- 保留 ESM / CJS 语义

---

## 8. SSR + HMR：为什么在 Vite 中成立？

在开发阶段：

- 浏览器：正常 HMR
- Node：重新 ssrLoadModule

```text
文件变更
  ↓
清除 Node 模块缓存
  ↓
重新执行 render
```

📌 **开发体验几乎和 SPA 一致**

---

## 9. Vite SSR 的边界与限制（必须知道）

### ❌ 不自动处理：

- 数据获取策略
- 路由匹配
- hydration 逻辑

### ⚠️ 注意：

- 全局副作用
- 单例污染
- Node / Browser API 边界

---

## 10. 真实框架是如何基于 Vite SSR 的？

| 框架      | 使用方式       |
| --------- | -------------- |
| Nuxt 3    | 深度集成       |
| SvelteKit | 原生 Vite      |
| Astro     | Islands + Vite |
| Remix     | Build + Dev    |

👉 **Vite 是“地基”，不是房子**

---

## 11. 这一篇你必须真正掌握的本质

1. **Vite SSR 是“源码级运行”**
2. **Node 和 Browser 复用了同一套 transform**
3. **ssrLoadModule 是核心能力**
4. **external / noExternal 是 SSR 稳定性的关键**
