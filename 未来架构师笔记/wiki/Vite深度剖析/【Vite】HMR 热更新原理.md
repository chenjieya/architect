---
author: ai
ai_editable: true
summary: 'Vite 的 HMR（Hot Module Replacement，热模块替换）不是简单的“文件变了就刷新页面”。它的核心是：在应用仍然运行的情况下，找到能接住变更的模…'
refs:
  pages:
    - '【Vite】从工程痛点到架构革新'
    - '【Vite】框架集成：Vue 3 与 React 18 的完整指南'
    - '【Vite】命令详解：从开发到生产的完整流程'
    - '【Vite】Vite Vs. Webpack：定位、场景与插件机制的差异'
  raw:
    - path: 'raw/Hot Module Replacement is Easy.md'
      sha256: dd8130168dfdb7aa813f05ce9f7042f0cc994f3ac70df2cb8744cf9cb25af55c
updated_by: ai
updated: 2026-08-03
---

Vite 的 HMR（Hot Module Replacement，热模块替换）不是简单的“文件变了就刷新页面”。它的核心是：在应用仍然运行的情况下，找到能接住变更的模块边界，只重新加载受影响的模块，并把新模块交给运行时回调完成替换。

这篇笔记根据 `raw/Hot Module Replacement is Easy.md` 整理，重点关注 Vite 中 HMR 的生命周期 API、模块图传播、客户端执行流程，以及什么时候会退化成整页刷新。

相关笔记：[[【Vite】从工程痛点到架构革新]]、[[【Vite】Vite Vs. Webpack：定位、场景与插件机制的差异]]、[[【Vite】框架集成：Vue 3 与 React 18 的完整指南]]、[[【Vite】命令详解：从开发到生产的完整流程]]。

## 1. HMR 解决的问题

普通开发服务器在文件变化后通常只能刷新页面。这样虽然能看到新代码，但页面状态会丢失，例如表单输入、弹窗状态、组件内部状态都要重新走一遍。

HMR 的目标更细：

1. 文件变化后，不必刷新整个页面。
2. 只替换发生变化的模块，或替换能安全接收该变化的上层模块。
3. 保留尽可能多的运行时状态。
4. 当无法安全替换时，再退回整页刷新。

Vite 的开发环境基于浏览器原生 ESM。浏览器按需请求模块，Vite dev server 负责转换模块、维护模块图、监听文件变化，并通过 WebSocket 把 HMR 消息推给浏览器里的 `/@vite/client`。

## 2. HMR 生命周期 API

HMR 能不能工作，取决于模块是否声明了“我能处理这次更新”。在 Vite 中，模块通过 `import.meta.hot` 暴露 HMR API。

![HMR 生命周期图](https://bjornlu.com/_app/immutable/assets/hmr-lifecycle.n6wrbbAe.png)

_图示说明：模块接收更新时，会经历接受、清理、移除或失效等不同阶段。_

### 2.1 `accept()`：声明 HMR 边界

`import.meta.hot.accept()` 表示当前模块愿意接收某类更新。调用了 `accept()` 的模块通常叫 accepted module，它会形成一个 HMR boundary（HMR 边界）。

![HMR 边界示意图](https://bjornlu.com/_app/immutable/assets/hmr-boundary.Cw_4UlKc.png)

_图示说明：accepted module 是边界根节点，边界内的依赖变化可以尝试向它传播。_

`accept()` 常见有两种签名：

```javascript
// 1. 自接受：当前模块自己变了，自己处理
import.meta.hot.accept((newModule) => {
  // 用 newModule 替换旧模块导出的运行时引用
})

// 2. 接受指定依赖：依赖变了，当前模块处理
import.meta.hot.accept(['./stuff.js'], ([newModule]) => {
  // 重新渲染依赖结果
})
```

第一种叫 self-accepted module。这个区别很重要：如果模块自己变更，但它不是自接受模块，Vite 不能直接让它处理自己的更新，只能继续向上找能接住变更的 importer。

### 2.2 `dispose()`：替换前清理旧副作用

`dispose()` 在旧模块被新模块替换前执行，用来清理旧模块产生的副作用。

常见清理对象包括：

- 事件监听器
- 定时器
- WebSocket 连接
- 全局状态
- 第三方库实例

```javascript
const timer = setInterval(() => {
  console.log('tick')
}, 1000)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(timer)
  })
}
```

如果缺少 `dispose()`，热更新看起来可能成功，但旧监听器、旧定时器或旧实例还留在内存里，后续会出现重复执行、状态污染和内存泄漏。

### 2.3 `prune()`：模块彻底不用时清理

`prune()` 用于模块从运行时里彻底移除的场景，例如文件被删除，或者某个模块不再被任何其他模块导入。

它和 `dispose()` 的区别是：

| API         | 触发场景             | 语义                   |
| :---------- | :------------------- | :--------------------- |
| `dispose()` | 模块要被替换或移除   | 每次替换前清理旧副作用 |
| `prune()`   | 模块不再被运行时使用 | 最终移除时做收尾清理   |

Vite 的 CSS HMR 就会用到这类能力：CSS 模块更新时替换 style 或 link，CSS 模块不再被引用时移除对应样式。

### 2.4 `invalidate()`：主动放弃本轮热替换

`invalidate()` 不是生命周期钩子，而是一个动作。它通常在 `accept()` 回调里调用，表示模块运行到一半发现自己无法安全处理这次更新。

```javascript
export let data = [1, 2, 3]

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (!('data' in newModule)) {
      import.meta.hot.invalidate()
      return
    }

    data = newModule.data
  })
}
```

调用 `invalidate()` 后，客户端会通知 Vite dev server 重新从该模块的 importer 开始做 HMR 传播。也就是说，本模块放弃处理，看看上层有没有模块能接住；如果一直找不到，就整页刷新。

## 3. 从文件保存到 HMR 消息

一次 HMR 不是客户端单独完成的。Vite dev server 先在服务端侧完成文件定位、模块失效和传播判断，再把最终结果推给客户端。

![HMR 起始流程](https://bjornlu.com/_app/immutable/assets/hmr-start-flow.Co39Dn9R.png)

_图示说明：文件变化后，Vite 会经历监听、模块处理、失效、传播和客户端更新几个阶段。_

### 3.1 文件监听

开发者保存文件后，文件监听器检测到变更，把变更文件路径交给 Vite dev server。

这里要区分两个概念：

| 概念 | 含义                                        |
| :--- | :------------------------------------------ |
| 文件 | 磁盘上的真实文件，如 `App.vue`、`style.css` |
| 模块 | 浏览器或 Vite 运行时看到的 ESM 模块         |

一个文件可能对应多个模块。例如 Vue SFC 可能拆成组件 JS 模块、样式模块、模板相关模块。HMR 处理的最终对象是模块，而不仅是文件。

### 3.2 `handleHotUpdate()` 插件钩子

Vite 找到变更文件关联的模块后，会调用插件的 `handleHotUpdate()` 钩子。插件可以过滤、扩展或改写本次需要热更新的模块集合。

典型例子是 Vue 插件：如果 `.vue` 文件只改了样式，插件可以只返回 CSS 模块，避免组件 JS 重新执行。

```javascript
function vuePlugin() {
  return {
    name: 'vue',
    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.vue')) {
        const oldContent = cache.get(ctx.file)
        const newContent = await ctx.read()

        if (isOnlyStyleChanged(oldContent, newContent)) {
          return ctx.modules.filter((mod) => mod.url.endsWith('.css'))
        }
      }
    },
  }
}
```

插件也可以补充额外模块。例如全局 CSS 发生变化时，同时让某个虚拟模块重新转换。

```javascript
function globalCssPlugin() {
  return {
    name: 'global-css',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.css')) {
        const mod = ctx.server.moduleGraph.getModuleById('virtual:global-css')
        return mod ? ctx.modules.concat(mod) : ctx.modules
      }
    },
  }
}
```

### 3.3 模块失效

确定最终模块集合后，Vite 会让这些模块以及相关 importer 的转换结果失效。失效的核心动作包括：

1. 删除旧的 transform 缓存。
2. 给模块记录本次更新时间戳。
3. 后续客户端重新 `import()` 时，通过时间戳请求新版本模块。

客户端常见请求形态类似：

```javascript
await import('/src/App.vue?t=1720000000000')
```

时间戳的作用是绕开浏览器缓存，确保拿到最新转换结果。

## 4. HMR 传播：为什么有时会整页刷新

HMR propagation（HMR 传播）是理解 Vite HMR 的关键。它的任务是：从变更模块出发，沿 importer 向上找 HMR 边界。

传播结果只有两类：

| 结果       | 条件                                  | 客户端行为              |
| :--------- | :------------------------------------ | :---------------------- |
| 局部热更新 | 所有变更路径都能找到可接受的 HMR 边界 | 发送 `update` 消息      |
| 整页刷新   | 任意一条变更路径找不到可接受边界      | 发送 `full-reload` 消息 |

### 4.1 变更发生在普通依赖模块

假设 `stuff.js` 被 `app.jsx` 导入，且 `app.jsx` 调用了 `accept(["./stuff.js"], cb)`。当 `stuff.js` 更新时，Vite 向上找到 `app.jsx`，确认它能接受 `stuff.js` 的变化，于是停止传播，通知客户端让 `app.jsx` 的回调处理新 `stuff.js`。

如果 `app.jsx` 只是普通模块，没有接受 `stuff.js` 的变化，传播会继续向上。如果一直到入口 `index.html` 都没有边界，就会整页刷新。

### 4.2 变更发生在 accepted module 自身

如果变化发生在 `app.jsx` 自己，Vite 还要判断它是不是 self-accepted module。

- 是自接受模块：可以直接通知客户端更新 `app.jsx`。
- 不是自接受模块：不能由自己接自己，继续向上找 importer。

很多框架插件会自动帮组件插入自接受逻辑。例如 Vue SFC 和 React Fast Refresh 的相关插件会在满足条件时注册 HMR 回调。

### 4.3 多条 importer 路径必须都能接住

一个模块可能被多个模块导入。只要其中一条 importer 路径找不到 HMR 边界，Vite 就不能保证局部替换安全，最终会退回整页刷新。

例如 `utils.js` 同时被 `app.jsx` 和 `other.js` 导入：

1. `app.jsx` 能接受 `utils.js` 的变化。
2. `other.js` 不能接受变化，继续向上也找不到边界。
3. 由于存在无法接住的路径，本次更新整页刷新。

这也是“某个组件明明支持 HMR，但改了一个公共工具函数却刷新页面”的常见原因。

### 4.4 多 HMR 边界场景

![多 HMR 边界传播](https://bjornlu.com/_app/immutable/assets/hmr-propagation-advanced.B0CnTinl.png)

_图示说明：一个变更模块可能同时影响多个 HMR 边界，Vite 会分别判断这些边界是否能接住变化。_

多边界场景下，Vite 可能通知多个 accepted module 执行更新。重点不是“最近的一个边界”，而是“所有受影响路径是否都有可接受边界”。这让公共依赖的热更新更严格，也更符合运行时安全。

## 5. HMR 客户端 `/@vite/client`

浏览器页面里会注入一个特殊脚本：`/@vite/client`。它就是 Vite 的 HMR client。

![HMR 客户端](https://bjornlu.com/_app/immutable/assets/hmr-client.CHFVdTf3.png)

_图示说明：HMR client 负责连接 dev server、接收消息、注册运行时 API，并调用模块的 HMR 回调。_

### 5.1 客户端职责

`/@vite/client` 主要做四件事：

1. 通过 WebSocket 连接 Vite dev server。
2. 接收服务端发送的 HMR payload。
3. 在运行时提供 `import.meta.hot` 相关 API。
4. 根据 payload 触发 `accept()`、`dispose()`、`prune()` 等回调。

简化后的消息处理逻辑如下：

```javascript
const ws = new WebSocket('ws://localhost:5173')

ws.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data)

  switch (payload.type) {
    case 'full-reload':
      location.reload()
      break
    case 'update':
      for (const update of payload.updates) {
        handleUpdate(update)
      }
      break
    case 'prune':
      handlePrune(payload.paths)
      break
  }
})
```

### 5.2 `createHotContext()` 如何关联模块

Vite 会在 import analysis 阶段给模块注入 HMR 上下文。

```javascript
import { createHotContext } from '/@vite/client'

import.meta.hot = createHotContext('/src/app.jsx')
```

这里的 `/src/app.jsx` 可以理解为 owner path。客户端会用它把某个模块注册的回调存进运行时 Map：

| Map                            | 记录内容                   |
| :----------------------------- | :------------------------- |
| owner path -> accept callbacks | 哪个模块能接受哪些依赖变化 |
| owner path -> dispose callback | 模块替换前如何清理         |
| owner path -> prune callback   | 模块彻底移除时如何清理     |
| owner path -> data             | HMR 过程中跨回调共享的数据 |

### 5.3 JS update 如何执行

Vite 的 JS update payload 通常包含：

```typescript
interface Update {
  type: 'js-update' | 'css-update'
  path: string
  acceptedPath: string
  timestamp: number
}
```

字段含义：

| 字段           | 含义                                  |
| :------------- | :------------------------------------ |
| `path`         | 接受更新的模块，也就是 HMR 边界根节点 |
| `acceptedPath` | 实际发生变化并被接受的模块路径        |
| `timestamp`    | 更新时间戳，用于请求新版本模块        |

执行流程可以简化为：

```typescript
async function handleUpdate(update: Update) {
  const acceptCallbacks = ownerPathToAcceptCallbacks.get(update.path)

  ownerPathToDisposeCallbacks.get(update.path)?.()

  const newModule = await import(`${update.acceptedPath}?t=${update.timestamp}`)

  for (const cb of acceptCallbacks) {
    if (cb.deps.includes(update.acceptedPath)) {
      cb.fn(newModule)
    }
  }
}
```

这里有两个关键点：

1. 先执行 `dispose()`，再拉取新模块。
2. 用 `acceptedPath` 匹配依赖级 `accept()` 回调，避免调用不相关的回调。

### 5.4 CSS update 的特殊处理

CSS update 通常不需要执行复杂模块回调。Vite 可以直接替换页面中的样式节点或 link 地址，让浏览器加载新 CSS。

这也是为什么改 CSS 往往比改 JS 更稳定：CSS 本身没有 JS 模块状态，也不需要处理组件运行时边界。

## 6. 常见失效原因

### 6.1 模块没有声明 HMR 边界

如果模块没有调用 `import.meta.hot.accept()`，Vite 无法知道它是否能安全替换，只能向上继续传播。最终找不到边界就整页刷新。

### 6.2 不是自接受模块

模块自己变化时，只有 self-accepted module 才能直接接住自己的变化。否则必须由上层 importer 接受。

### 6.3 公共依赖影响范围太大

公共工具、全局状态模块、常量模块经常被很多地方导入。只要某条路径没有边界，整次更新就会退回刷新。

### 6.4 框架热更新规则不满足

框架插件会帮组件注册 HMR，但通常有自己的约束。例如 React Fast Refresh 要求模块导出形态稳定，混合导出普通常量和组件时可能导致 HMR invalidate。

这类问题通常不是 Vite WebSocket 失效，而是框架插件判断“这次不能安全保留状态”。

### 6.5 运行时主动 `invalidate()`

模块在 `accept()` 回调里发现导出结构变化、状态迁移失败或其他不兼容情况时，可以主动调用 `invalidate()`。这会让 Vite 重新向上寻找边界，可能继续局部更新，也可能整页刷新。

## 7. 和 Webpack HMR 的差异

Vite 与 Webpack 的一个重要差异是传播位置。

| 工具    | HMR 传播主要发生位置 | 特点                                             |
| :------ | :------------------- | :----------------------------------------------- |
| Vite    | dev server 服务端    | 服务端掌握模块图，能基于 importers 做传播判断    |
| Webpack | 客户端运行时         | HMR API 使用更动态，但客户端需要维护更多模块关系 |

Vite 需要在服务端静态分析 `import.meta.hot.accept()` 的使用情况，用来判断模块是否形成 HMR 边界。好处是模块图、importer、转换缓存这些信息本来就在 dev server 中，传播判断更集中。

## 8. SSR 中的 HMR

从 Vite 6 开始，SSR HMR 的思路和浏览器侧 HMR 更接近，只是执行环境不再是浏览器和 `/@vite/client`，而是服务端的 `ModuleRunner` 负责加载和更新模块。

Vite 5 及以前，SSR 代码通常没有真正的 HMR 支持，服务端代码变化更常见的结果是整页刷新，让服务端重新执行 SSR 入口并返回新 HTML。

## 9. 总结

Vite HMR 可以按这条主线理解：

```text
保存文件
  ↓
文件监听器通知 Vite dev server
  ↓
根据文件找到关联模块
  ↓
插件 handleHotUpdate() 修正模块集合
  ↓
失效模块转换缓存并记录时间戳
  ↓
沿 importer 向上寻找 HMR 边界
  ↓
能接住：发送 update，客户端 import 新模块并触发 accept 回调
  ↓
接不住：发送 full-reload，浏览器刷新页面
```

关键结论：

1. HMR 的本质是模块图中的边界传播，不是单纯刷新文件。
2. `accept()` 定义边界，`dispose()` 负责清理，`prune()` 负责最终移除，`invalidate()` 负责主动放弃。
3. Vite 在服务端做传播判断，客户端负责执行更新回调。
4. 只要任意受影响路径无法找到可接受边界，就会整页刷新。
5. 框架插件的 HMR 规则决定了组件是否能保留状态。

## 10. 参考资料

- `raw/Hot Module Replacement is Easy.md`
- [Hot Module Replacement is Easy](https://bjornlu.com/blog/hot-module-replacement-is-easy)
- [Vite HMR API](https://vite.dev/guide/api-hmr.html)
