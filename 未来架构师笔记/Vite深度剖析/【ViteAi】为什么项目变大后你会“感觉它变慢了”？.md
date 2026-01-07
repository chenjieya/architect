> 很多人在小项目里爱上 Vite，  
> 却在大型项目中开始怀疑它。
>
> **问题不在 Vite，而在“使用方式是否还适配架构假设”。**

---

## 1. 先给结论：Vite 快是有前提条件的

一句话定性：

> **Vite 的快，建立在“模块边界清晰 + 依赖稳定 + 插件克制”的前提下。**

一旦越界，就会“体感变慢”。

---

## 2. 大型项目中最常见的性能瓶颈分布

在真实项目中，性能问题通常集中在：

| 模块           | 占比     |
| -------------- | -------- |
| 依赖预构建     | ⭐⭐⭐   |
| 插件 transform | ⭐⭐⭐⭐ |
| HMR 传播范围   | ⭐⭐⭐   |
| 文件监听       | ⭐⭐     |
| SSR 模块加载   | ⭐⭐     |

---

## 3. 依赖预构建：启动慢的第一嫌疑人

### 3.1 症状

- 冷启动 > 20s
- 每次启动都在 optimizeDeps
- `.vite` 目录巨大

---

### 3.2 根因分析

```text
依赖数量多
+ 动态 import
+ monorepo 软链接
```

---

### 3.3 优化策略（非常有效）

#### 明确 include / exclude

```ts
optimizeDeps: {
  include: ['vue', 'lodash-es'],
  exclude: ['@my-scope/local-lib']
}
```

#### 锁定 entries

```ts
optimizeDeps: {
  entries: ['src/main.ts']
}
```

📌 **减少扫描范围，收益立竿见影**

---

## 4. 插件 transform：最容易被忽视的性能杀手

### 4.1 问题代码示例（反模式）

```ts
transform(code, id) {
  // 所有文件都处理
  return heavyTransform(code)
}
```

---

### 4.2 正确姿势

```ts
transform(code, id) {
  if (!id.endsWith('.vue')) return
  return lightTransform(code)
}
```

📌 **transform 次数 × 文件数 = 性能成本**

---

### 4.3 插件顺序也影响性能

```ts
plugins: [
  heavyPlugin(), // ❌ 放前面
  vuePlugin(),
]
```

应调整为：

```ts
plugins: [
  vuePlugin(),
  heavyPlugin(), // ✅
]
```

---

## 5. HMR 传播范围失控的问题

### 5.1 症状

- 改一个文件
- 整个页面刷新

---

### 5.2 根因

- 模块没有 accept
- 副作用写在顶层
- store / 单例污染

---

### 5.3 修复策略

```ts
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

并配合：

```ts
import.meta.hot.dispose(() => {
  cleanup()
})
```

---

## 6. 文件监听与系统瓶颈

### 6.1 Mac / Linux / Windows 差异

- Mac：fsevents（快）
- Linux：inotify（有限）
- Windows：性能波动大

---

### 6.2 调优方式

```ts
server: {
  watch: {
    ignored: ['**/node_modules/**', '**/.git/**']
  }
}
```

---

## 7. 缓存策略：你有没有在“自废武功”？

### 7.1 常见误区

- 每次启动都 `rm -rf node_modules/.vite`
- CI / Docker 未缓存

---

### 7.2 正确做法

```text
缓存 node_modules/.vite
缓存 esbuild
```

📌 **缓存是 Vite 性能的一半**

---

## 8. SSR 项目中的性能注意点

### 8.1 症状

- SSR dev 明显慢
- 每次请求都卡

---

### 8.2 关键优化点

```ts
ssr: {
  noExternal: ['only-when-needed']
}
```

避免：

- 全量 noExternal
- SSR 中重复创建全局对象

---

## 9. Monorepo 场景的专项建议

### 9.1 典型

- workspace 包被当成源码
- HMR 失控
- optimizeDeps 反复运行

---

### 9.2 推荐配置

```ts
resolve: {
  preserveSymlinks: true
}
```

```ts
optimizeDeps: {
  include: ['@scope/shared']
}
```

---

## 10. 如何判断“是不是 Vite 的问题”？

你可以自检：

1. ❓ transform 是否过度？
2. ❓ 是否滥用插件？
3. ❓ optimizeDeps 是否精确？
4. ❓ HMR 边界是否清晰？

如果都 OK，**才考虑工具限制**。

---

## 11. 这一篇你必须真正掌握的结论

1. **Vite 的性能假设是“模块粒度小而清晰”**
2. **插件是性能的放大器，也是放大镜**
3. **缓存不是锦上添花，而是必需品**
4. **大型项目必须“约束使用方式”**
