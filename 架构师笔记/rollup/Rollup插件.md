
```sh
# react预设
pnpm add @babel/preset-react -D

# @rollup/plugin-babel相关
pnpm add @rollup/plugin-babel @babel/core @babel/preset-env -D

# @babel/runtime相关
pnpm add @babel/plugin-transform-runtime @babel/runtime @babel/runtime-corejs3 -D

# rollup常规插件
pnpm add @rollup/plugin-node-resolve @rollup/plugin-commonjs -D

# typescript相关
pnpm add typescript tslib @rollup/plugin-typescript -D

# html文件模板
pnpm add rollup-plugin-generate-html-template -D

# 替换字符串
pnpm add @rollup/plugin-replace -D 

# 开发服务器与live server
pnpm add rollup-plugin-serve rollup-plugin-livereload -D

# clear插件
pnpm add rollup-plugin-clear -D

# scss
pnpm add rollup-plugin-scss sass -D 

# postcss
pnpm add postcss rollup-plugin-postcss -D

# 图片处理
pnpm add @rollup/plugin-image -D

# nodejs typescript类型
pnpm add @types/node -D

# 别名插件
pnpm add @rollup/plugin-alias -D 

# terser
pnpm add @rollup/plugin-terser -D

# visualizer
pnpm add rollup-plugin-visualizer -D
```



## 1. Bable相关

### 1.1 @rollup/plugin-babel、@babel/core

这是 Rollup 官方维护的 Babel 插件，用于集成 Babel 到 Rollup 构建流程中。

##### 安装

```sh
pnpm add @rollup/plugin-babel @babel/core --save-dev
```

##### 基本配置

```js
// rollup.config.js
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    babel({
      babelHelpers: 'bundled', // 或 'runtime', 'inline', 'external'
      exclude: 'node_modules/**', // 排除 node_modules
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // 要处理的文件扩展名
    })
  ]
};
```

##### 配置详解
- `babelHelpers` 是 @rollup/plugin-babel 中最重要的配置选项之一，它决定了 Babel 生成的辅助函数如何处理。通俗来说就是公用得辅助函数，在转换你代码的时候，该公用文件的来源方式。
    - `'bundled'`: 将辅助函数内联到每个文件中（默认）
    - `'runtime'`: 使用 @babel/runtime 避免重复（需要额外安装）
    - `'inline'`: 将辅助函数内联到每个文件中，babel会尝试优化
    - `'external'`: 使用外部辅助函数库
- **exclude**: 排除不需要转换的文件，通常设置为 `node_modules/**`
- **extensions**: 指定要处理的文件扩展名

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202508211628451.png)



### 1.2 @babel/preset-env、@babel/plugin-transform-runtime

`@babel/preset-env` 是一个智能的 Babel 预设，它根据你指定的目标环境（浏览器、Node.js 版本等）自动确定需要转换的 JavaScript 特性和需要添加的 polyfill(浏览器兼容性代码解决)。
##### 安装

```sh
pnpm add @babel/preset-env --save-dev
```

##### 配置

需要在项目根目录创建 `.babelrc` 文件或 `babel.config.js`：

1. 根据 `targets` 配置决定需要转换哪些 ES6+ 特性

```js
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions'], // 针对使用率 >1% 的浏览器
          node: 'current' // 针对当前 Node.js 版本
        }
      }
    ]
  ]
};
```

`target`选项：

```js
targets: {
  // 浏览器版本
  browsers: [
    '> 1%',         // 全球使用率 >1%
    'last 2 versions', // 每个浏览器的最后2个版本
    'not ie <= 8'   // 排除 IE8 及以下
  ],
  // Node.js 版本
  node: '14.0.0',   // 特定版本
  // 或
  node: 'current'   // 当前运行版本
}
```


2. 根据 `useBuiltIns` 选项智能添加 polyfill(**Polyfill** 是一段代码（通常是 JavaScript），用于在现代浏览器中**模拟**那些旧版本浏览器不支持的较新的 JavaScript 特性或 Web API。)

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
	    modules：false, 
        useBuiltIns: 'usage', // 按需引入 polyfill
        corejs: 3 // 使用 core-js 版本 3  polyfill的库
      }
    ]
  ]
};
```

👉 举个例子modules：
**没有 `modules: false`**：

```js
// 源代码
import { util } from './utils';
export const name = 'hello';

// Babel 转换为 CommonJS
const _utils = require('./utils');
exports.name = 'hello';
```

**有 `modules: false`**：

```js
// 源代码  
import { util } from './utils';
export const name = 'hello';

// Babel 保持 ES6 语法不变
import { util } from './utils';
export const name = 'hello';
```

**好处：**
1. **Tree-shaking**：Rollup 可以分析 ES6 模块的导入导出，进行更好的 tree-shaking
2. **代码优化**：Rollup 可以生成更高效的模块代码
3. **格式控制**：Rollup 可以输出多种格式（ESM、CJS、UMD 等）


👉 举个例子Polyfill：

**没有 polyfill**（在 IE11 中）：

```js
// 这段代码在 IE11 中会报错
const array = [1, 2, 3];
const hasTwo = array.includes(2); // includes() 方法在 IE11 不存在
console.log(hasTwo);
```

**有 polyfill**：

```js
// 先引入 polyfill
import 'core-js/features/array/includes';

// 现在可以在所有浏览器中运行
const array = [1, 2, 3];
const hasTwo = array.includes(2);
console.log(hasTwo);
```

> Polyfill 的两种主要类型: 1. 语法 Polyfill, 将Es6+语法转换成适合的api。2. 添加新的 JavaScript API，常用的库有：`core-js`、`regenerator-runtime`、`whatwg-fetch`


##### @babel/plugin-transform-runtime

`@babel/plugin-transform-runtime` 是一个 Babel 插件，主要解决两个核心问题：

1. **消除辅助函数重复**：避免在每个文件中重复插入 Babel 生成的辅助函数
2. **提供沙箱化的 polyfill**：以模块化的方式提供 polyfill，避免污染全局环境

### 1.3 为什么Vue、React等需要一些自己的babel呢？

因为Vue、React等这些框架中有自己的语法糖，比如说vue的`template`模板等。需要自己的babel去转换成对应的js代码。



## 2. Rollup常规插件

### 2.1 @rollup/plugin-node-resolve

`@rollup/plugin-node-resolve` 是 Rollup 构建工具的一个重要插件，它允许 Rollup 在 `node_modules` 中查找和捆绑第三方模块。

Rollup 默认只处理相对路径和绝对路径的导入：

```js
// Rollup 默认能处理
import './local-module.js';
import '/absolute/path/module.js';

// Rollup 默认不能处理（需要 plugin-node-resolve）
import 'lodash';
import 'react';
```

##### 安装

```sh
pnpm add @rollup/plugin-node-resolve --save-dev
```

##### 配置

```js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [nodeResolve()]
};
```


##### 常规配置

```js
nodeResolve({
  // 解析哪些扩展名的文件（默认: ['.mjs', '.js', '.json', '.node']）
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  
  // 是否将模块的依赖项也捆绑进来（默认: true）
  resolveOnly: [/^@my-org\//],
  
  // 是否优先使用模块字段（如module、jsnext:main）
  preferBuiltins: true,
  
  // 浏览器字段处理（默认: true）
  browser: true,
  
  // 自定义模块目录（默认: ['node_modules']）
  moduleDirectories: ['node_modules', 'vendor']
})
```


### 2.2 @rollup/plugin-commonjs

很多 npm 包仍然是 CommonJS 格式， 这个插件将 **CommonJS 模块转换为 ES6 模块**，让 Rollup 能够处理 CommonJS 格式的包。

```js
// CommonJS 语法（Rollup 不能直接处理）
const lodash = require('lodash');
module.exports = function() {};

// 需要转换为 ES6 语法
import lodash from 'lodash';
export default function() {};
```
##### 安装

```sh
pnpm add @rollup/plugin-commonjs --save-dev
```

##### 配置

```js
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    commonjs()
  ]
};
```

##### 常用配置

```js
commonjs({
  // 主要选项
  include: 'node_modules/**',          // 要转换的文件
  exclude: ['node_modules/foo/**'],    // 排除的文件
  extensions: ['.js', '.cjs'],         // 文件扩展名
  
  // 高级选项
  ignoreGlobal: false,                 // 是否忽略全局变量
  sourceMap: true,                     // 是否生成 sourcemap
  ignore: ['conditional-runtime-dependency'] // 忽略的模块
})
```

