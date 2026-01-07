> 很多人以为 HMR 是“自动刷新页面”，  
> 但真正的 HMR，是**在运行时替换模块本身**。

这一篇，我们**从文件变更开始，一步一步拆到浏览器运行时**。

---

## 1. 先给结论：Vite 的 HMR 不是功能，是架构必然结果

一句话定性：

> **Vite 的 HMR 不是额外设计的，而是 ESM + 模块边界清晰的自然产物。**

---

## 2. HMR 的起点：文件是如何被监听的？

### 2.1 Vite 使用的文件监听机制

Vite 在 dev 阶段使用：

- `chokidar`
- 基于系统级文件事件（fs events）

```ts
import chokidar from 'chokidar'

chokidar.watch(root).on('change', (file) => {
  handleFileChange(file)
})
```

📌 **不是轮询，而是事件驱动**

---

### 2.2 文件变化后，Vite 做了什么？

```text
文件变更
  ↓
找到对应模块
  ↓
分析影响范围
  ↓
通知浏览器
```

---

## 3. 模块关系图：HMR 的“导航地图”

### 3.1 Vite 内部维护了什么？

Vite 在 Dev 阶段维护一个：

> **模块依赖图（Module Graph）**

每个模块记录：

- `importers`（谁依赖我）
- `imports`（我依赖谁）

```ts
interface ModuleNode {
  id: string
  importers: Set<ModuleNode>
  imports: Set<ModuleNode>
}
```

📌 **这是 HMR 能精确传播的关键**

---

### 3.2 为什么比 Webpack 更精确？

因为：

- Webpack 的模块边界被 bundle 混淆
- Vite 的模块边界 == 文件

---

## 4. HMR 更新是如何“传播”的？

### 4.1 文件变化示例

```text
App.vue
  ↓
import Hello.vue
```

当 `Hello.vue` 变化：

```text
Hello.vue
  ↓
通知 App.vue
```

但：

- 不影响 main.ts
- 不影响无关模块

---

### 4.2 更新边界的判断逻辑

```ts
if (module.accepted) {
  // 局部更新
} else {
  // 冒泡到父模块
}
```

📌 **这就是“热更新边界”**

---

## 5. import.meta.hot：HMR 的入口 API

### 5.1 import.meta.hot 是从哪来的？

Vite 在模块返回前，会自动注入：

```js
import.meta.hot = createHotContext(...)
```

---

### 5.2 最基础的用法

```ts
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

含义：

> **“这个模块可以被安全替换”**

---

### 5.3 带回调的 accept

```ts
import.meta.hot.accept((newModule) => {
  console.log('模块更新了', newModule)
})
```

📌 你可以拿到“新模块实例”。

---

## 6. Vue / React 为什么能“保留状态”？

### 6.1 关键点：框架级 HMR 支持

以 Vue 为例：

- 组件是函数
- render 可替换
- state 存在于组件实例

---

### 6.2 Vue 的 HMR 实现思路（简化）

```ts
import.meta.hot.accept((mod) => {
  updateComponentRender(mod.default)
})
```

👉 **替换 render，不销毁实例**

---

### 6.3 React Fast Refresh 的本质

- 标记组件边界
- 保留 hooks state
- 仅替换函数实现

📌 **这不是 Vite 做的，而是 Vite 提供了“可能性”**

---

## 7. HMR 失败时，Vite 做了什么？

### 7.1 常见失败场景

- 模块未 accept
- 依赖链断裂
- 语法错误

---

### 7.2 Vite 的兜底策略

```text
HMR 失败
  ↓
Fallback to full reload
```

📌 **可靠性优先于“强行热更新”**

---

## 8. CSS HMR：为什么它几乎 100% 成功？

### 8.1 CSS 的天然优势

- 无执行上下文
- 无状态
- 可直接替换

---

### 8.2 Vite 的处理方式

```text
<link rel="stylesheet" href="style.css">
```

变化时：

```text
替换 link 标签
```

📌 不需要 import.meta.hot。

---

## 9. HMR 性能为什么几乎不随项目变大而下降？

因为：

- 文件级更新
- 精准传播
- 无 bundle 重算

👉 **复杂度 ≈ O(受影响模块数)**

---

## 10. 开发者最容易踩的 HMR 坑

### ❌ 在模块顶层写副作用

```ts
store.reset()
```

### ❌ 使用非幂等逻辑

```ts
eventBus.on(...)
```

### ❌ 忽略 dispose

```ts
import.meta.hot.dispose(() => {
  cleanup()
})
```

---

## 11. 你现在应该真正理解的事情

1. **HMR 的基础是模块图**
2. **accept 决定更新边界**
3. **状态保留是框架能力，不是 Vite 魔法**
4. **失败回退是设计选择**
