
**Rollup** 是一个基于 JavaScript ES 模块（ESM, `import/export`）的打包工具。它的目标是生成更小、更快、更高效的 JavaScript 包，尤其适合 **库（library）和框架** 的构建。相比于 Webpack 这类“全能型”工具，Rollup 更加“纯粹”，强调按需打包和 Tree-shaking（摇树优化）。

## 1. 核心特点

### 1.1 原生支持ES模块

Rollup 是最早专注于 ES 模块的打包工具。相比 Webpack 需要大量配置，Rollup 的打包结果更“干净”。

### 1.2 更强的 Tree-shaking

Rollup 在消除无用代码（Tree-shaking）方面通常比 Webpack 更彻底，因为它直接基于 ESM 静态分析，而不是依赖 CommonJS 的动态特性。

👉 举个例子：

```js
// utils.js
export function a() {}
export function b() {}
export function c() {}

// main.js
import { a } from './utils.js'
a()
```

Rollup 打包时只会输出 `a()`，不会把 `b` 和 `c` 带进来。

### 1.3 输出更干净、更小

默认输出是一个 “原生 ES 模块” 或 “IIFE / UMD 格式”，特别适合发布 npm 库。

### 1.4 插件系统灵活

Rollup 有一套简洁的插件系统（比如处理 Babel、TypeScript、JSON 等），而不像 Webpack 那样臃肿。

### 1.5 适合库开发

- Vue 3、React、D3 等很多知名库都用 Rollup 来打包。
- 生成的包小，兼容性好，可以同时输出 **ESM、CJS、UMD** 等多种格式。


## 2. 应用场景

- **类库/工具包开发**  
    如果你在开发 npm 包，Rollup 是最佳选择，可以同时输出 ESM、CJS、UMD 格式，满足不同消费场景。
    
- **现代前端框架内部打包**  
    Vue、Svelte、React 等框架本身就是用 Rollup 构建的。
    
- **与 Vite 配合**  
    Rollup 负责生产环境的打包优化，保证性能和产物质量。

## 3. 最小配置示例

```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/index.js', // 入口文件
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs' // CommonJS 格式
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'es'  // ES Module 格式
    }
  ],
  plugins: [resolve(), commonjs()]
}

```

## 4. 总结

Rollup 不是万能的，但它在 **库开发** 和 **生产构建优化** 上拥有无可替代的优势。随着 ESM 的普及以及 Vite 的兴起，Rollup 已经不再是小众选择，而是逐渐成为前端生态的 **核心基石**。
如果你是库的开发者，或者希望深入理解 Vite 背后的打包逻辑，那么 Rollup 绝对值得学习和使用。