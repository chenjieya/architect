（optimizeDeps）深度解析：它解决了什么，又制造了什么问题？

> 你是否遇到过这些问题？
>
> - 第一次启动 Vite 非常慢
> - 控制台疯狂输出 `Optimizing dependencies...`
> - 某些依赖在 Dev 正常，Build 却报错
>
> 这些，几乎都和 **optimizeDeps** 有关。

---

## 1. 先给结论：依赖预构建是 Vite 唯一一次“主动打包”

一句话定性：

> **Vite 在开发阶段只做一件“反自己理念的事”：预打包 node_modules。**

这是一个非常重要的工程妥协。

---

## 2. 为什么 node_modules 不能直接走 ESM？

### 2.1 理论上：可以

```ts
import _ from 'lodash'
```

浏览器如果真的去加载：

```text
node_modules/lodash/*
```

会发生什么？

---

### 2.2 实际问题 1：请求数量爆炸

```text
lodash → 600+ 文件
```

浏览器：

```text
GET /node_modules/lodash/array.js
GET /node_modules/lodash/object.js
...
```

👉 **性能灾难**

---

### 2.3 实际问题 2：模块格式不统一

很多依赖：

- 仍是 CommonJS
- 混合 ESM + CJS
- 使用 Node 特有 API

浏览器根本无法直接执行。

---

## 3. optimizeDeps 的真实职责

### 3.1 它到底做了什么？

在 **首次启动 dev server** 时：

```text
扫描源码 import
  ↓
收集第三方依赖
  ↓
使用 esbuild 预构建
  ↓
输出到 node_modules/.vite
```

📌 **只针对第三方依赖，不动业务代码**

---

### 3.2 输出结果长什么样？

```text
node_modules/.vite/
├── vue.js
├── lodash.js
└── _metadata.json
```

---

## 4. 依赖是如何被“收集”的？

### 4.1 静态分析 import

```ts
import { createApp } from 'vue'
import _ from 'lodash'
```

Vite 会分析：

```text
vue
lodash
```

---

### 4.2 动态 import 的问题

```ts
const name = 'lodash'
import(name)
```

⚠️ **Vite 无法提前分析**

👉 这类依赖可能需要手动配置。

---

## 5. optimizeDeps 的核心配置项（非常重要）

### 5.1 include：强制预构建

```ts
// vite.config.ts
export default {
  optimizeDeps: {
    include: ['lodash-es', 'dayjs'],
  },
}
```

适用场景：

- 动态 import
- monorepo 中的软链接依赖
- 使用 CJS 的 ESM 包

---

### 5.2 exclude：排除预构建

```ts
optimizeDeps: {
  exclude: ['some-esm-lib']
}
```

适用场景：

- 原生 ESM、体积小
- 会被频繁热更新的依赖

---

### 5.3 entries：扫描入口控制

```ts
optimizeDeps: {
  entries: ['src/main.ts']
}
```

📌 控制扫描范围，**避免误扫**

---

## 6. esbuild 在预构建阶段做了什么？

### 6.1 实际调用模型

```ts
esbuild.build({
  entryPoints: ['vue'],
  bundle: true,
  format: 'esm',
  outdir: 'node_modules/.vite',
})
```

📌 注意：

- **这里是 bundle**
- 但只针对第三方依赖

---

### 6.2 为什么不用 Rollup？

因为：

- 预构建追求的是 **速度**
- 不需要极致 Tree Shaking
- esbuild 更快

---

## 7. 预构建缓存与失效机制

### 7.1 什么时候会重新预构建？

- `package.json` 变更
- lock 文件变化
- optimizeDeps 配置变化

---

### 7.2 强制重新构建

```bash
rm -rf node_modules/.vite
```

或：

```bash
vite --force
```

---

## 8. monorepo 中的 optimizeDeps（高频踩坑）

### 8.1 问题表现

- 本地 package 被当成源码
- 却又含有 CJS
- Dev 阶段报错

---

### 8.2 解决方案

```ts
optimizeDeps: {
  include: ['@my-scope/shared']
}
```

📌 明确告诉 Vite：  
**“它是依赖，不是源码”**

---

## 9. optimizeDeps 与 SSR 的关系（重要）

在 SSR 模式下：

- Node 环境
- ESM / CJS 边界更复杂

```ts
ssr: {
  noExternal: ['some-cjs-lib']
}
```

📌 SSR 场景，预构建策略必须更谨慎。

---

## 10. 常见问题 & 误区

### ❌ 误区 1：预构建越多越好

👉 实际上会增加启动成本

### ❌ 误区 2：报错就乱加 include

👉 会掩盖真正的模块问题

### ❌ 误区 3：把业务代码放进 optimizeDeps

👉 反模式

---

## 11. 这一篇你必须掌握的本质

1. **optimizeDeps 是 Vite 唯一的“主动打包”**
2. **它解决的是 node_modules 的工程问题**
3. **include / exclude 是性能与稳定性的调节阀**
4. **monorepo & SSR 必须显式控制**
