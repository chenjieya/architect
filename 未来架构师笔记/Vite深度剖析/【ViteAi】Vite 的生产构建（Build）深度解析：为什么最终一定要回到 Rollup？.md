> 很多人以为：  
> “Vite 很快，所以 build 也一定很快。”
>
> 实际上，**Vite 对 build 的态度，和对 dev 完全相反**。

---

## 1. 先给结论：Vite 不是打包器，而是“构建协调者”

一句话定性：

> **Vite 的生产构建，本质上是一次高度定制的 Rollup 构建。**

Vite 自己并不重新发明 build。

---

## 2. 为什么 dev 和 build 必须是两套逻辑？

### 2.1 开发阶段的目标

| 目标     | 原因         |
| -------- | ------------ |
| 快启动   | 提升体验     |
| 精准 HMR | 提高效率     |
| 可调试   | 保留源码结构 |

---

### 2.2 生产阶段的目标

| 目标   | 原因         |
| ------ | ------------ |
| 体积小 | 下载快       |
| 请求少 | 首屏快       |
| 兼容性 | 用户环境复杂 |

👉 **这两组目标天然冲突**

---

## 3. Vite build 的整体流程（全景）

```text
vite build
  ↓
解析配置
  ↓
创建 Rollup 配置
  ↓
执行 Rollup 构建
  ↓
输出 dist
```

📌 **关键：Vite 只是“生成 + 管理” Rollup 配置**

---

## 4. Vite 是如何“包裹”Rollup 的？

### 4.1 用户写的是 Vite 配置

```ts
// vite.config.ts
export default {
  plugins: [],
  build: {
    sourcemap: true,
  },
}
```

---

### 4.2 Vite 转换为 Rollup 配置

```ts
const rollupOptions = {
  input: 'index.html',
  plugins: vitePlugins,
  output: {
    dir: 'dist',
  },
}
```

👉 **你很少需要直接写 Rollup，但它一直在那**

---

## 5. 为什么 production 一定要打包？

### 5.1 不打包会发生什么？

```text
index.html
  ↓
100+ 模块请求
```

问题：

- 网络 RTT 成本
- HTTP 队头阻塞
- 移动端灾难

---

### 5.2 Bundle 的真正价值

- 合并请求
- Tree Shaking
- 代码分割
- 压缩

📌 **这是浏览器运行时无法完成的**

---

## 6. Rollup 在 Vite build 中的关键能力

### 6.1 Tree Shaking（核心）

```ts
// util.ts
export function used() {}
export function unused() {}
```

```ts
import { used } from './util'
```

最终产物：

```js
function used() {}
```

👉 `unused` 被完全移除。

---

### 6.2 Code Splitting（代码分割）

```ts
import('./pages/admin')
```

输出：

```text
admin.[hash].js
```

---

### 6.3 manualChunks（控制拆包）

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router']
      }
    }
  }
}
```

📌 **这是生产性能调优的关键入口**

---

## 7. Vite build 中的插件执行顺序

### 7.1 重要认知

> **Vite 插件在 build 阶段，本质上是 Rollup 插件**

---

### 7.2 Hook 执行顺序对比

| Hook           | Dev | Build |
| -------------- | --- | ----- |
| resolveId      | ✅  | ✅    |
| load           | ✅  | ✅    |
| transform      | ✅  | ✅    |
| generateBundle | ❌  | ✅    |

📌 **generateBundle 只存在于 build**

---

## 8. esbuild 在 build 阶段还做了什么？

### 8.1 转译目标变化

```ts
build: {
  target: 'es2015'
}
```

esbuild 负责：

- 语法降级
- polyfill 注入（有限）

---

### 8.2 压缩（可选）

```ts
build: {
  minify: 'esbuild'
}
```

或：

```ts
minify: 'terser'
```

📌 **Vite 把“选择权”交给你**

---

## 9. index.html 在 build 中的特殊地位

### 9.1 index.html 是“入口模块”

```html
<script type="module" src="/src/main.ts"></script>
```

Vite 会：

- 解析
- 注入 hash
- 注入 preload

---

### 9.2 构建后的 index.html

```html
<script type="module" src="/assets/main.abc123.js"></script>
```

📌 **HTML 也是构建产物的一部分**

---

## 10. 常见 build 误区

### ❌ 误区 1：build 慢就是 Vite 慢

👉 实际是 Rollup 在做深度优化

### ❌ 误区 2：dev 正常，build 一定正常

👉 build 更严格、更真实

### ❌ 误区 3：忽略 manualChunks

👉 生产性能瓶颈来源之一

---

## 11. 这一篇你必须真正理解的结论

1. **Vite dev 和 build 是两套系统**
2. **生产构建的主角是 Rollup**
3. **Vite 的价值在于“桥接与简化”**
4. **最终性能，取决于 build 配置质量**
