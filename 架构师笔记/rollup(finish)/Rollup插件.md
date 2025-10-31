## 前言

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


### 2.3 @rollup/plugin-replace

`@rollup/plugin-replace` 是 Rollup 官方提供的一个 **文本替换插件**，主要用于在打包过程中将代码中的指定字符串或变量替换为其他内容。

它的典型使用场景是:
- 注入环境变量（比如 `process.env.NODE_ENV` → `"production"`）
- 在构建时删除/替换调试代码
- 动态切换配置或常量

##### 安装

```bash
pnpm add @rollup/plugin-replace --save-dev
```

##### 基本用法

```js
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'es'
  },
  plugins: [
    replace({
      preventAssignment: true, // 推荐开启，避免意外替换赋值语句
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
```

这里会把源码中所有的

```js
if (process.env.NODE_ENV === 'production') {
  console.log('生产环境');
}
```

替换成

```js
if ("production" === 'production') {
  console.log('生产环境');
}
```


##### 常用配置

**`preventAssignment`**
- 默认 `false`，建议设置为 `true`。
- 作用：避免把 `process.env.NODE_ENV = "dev"` 这样的赋值语句错误替换成 `production = "dev"`。

**`values`**
- 可以批量替换多个变量：
```js
replace({
  preventAssignment: true,
  values: {
    __VERSION__: '1.0.0',
    __API_URL__: 'https://api.example.com'
  }
})
```

**`delimiters`**
- 默认是 `['\\b', '\\b']`（单词边界），如果需要自定义占位符，可以修改：
```js
replace({
  preventAssignment: true,
  delimiters: ['{{', '}}'],
  values: {
    APP_NAME: 'MyApp'
  }
})
```

### 2.4 rollup-plugin-serve

- 在 **开发环境**下启动一个本地静态服务器，方便你调试打包后的文件。
- 可以指定端口、根目录、是否自动打开浏览器等。

##### 安装

```sh
pnpm add rollup-plugin-serve --save-dev
```

##### 基本用法

```js
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [
    serve({
      open: true,        // 启动时自动打开浏览器
      contentBase: ['dist'], // 静态文件根目录
      port: 3000         // 端口
    })
  ]
};
```


### 2.5 rollup-plugin-livereload

- 监控指定目录的文件变化，**文件修改时自动刷新浏览器**。
- 常配合 `rollup-plugin-serve` 一起使用，实现热刷新体验。

##### 安装

```sh
pnpm add rollup-plugin-livereload --save-dev
```

##### 基本用法

```js
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [
    serve({
      open: true,
      contentBase: ['dist'],
      port: 3000
    }),
    livereload({
      watch: 'src',  // 监听目录
      verbose: true   // 输出日志
    })
  ]
};
```


**骚操作**

> ✅ 一般组合使用：先启动服务器，再监听`src`目录变化，实现开发时的“自动刷新 + 实时预览”。


```json
{
	"scripts": {
		"build": "rollup -c -w"
	}
}
```

启动服务时候，`-w`可以监听文件变化，并自动进行构建。 `serve`监听的是构建之后的目录`dist`，这样更改`src`目录下文件，就会自动打包，并实时预览。

```js
  plugins: [
    serve({
      open: true,
      contentBase: ['dist'],
      port: 3000
    }),
    livereload({
      watch: 'src',  // 监听目录
      verbose: true   // 输出日志
    })
  ]
```


### 2.6 rollup-plugin-clear

`rollup-plugin-clear` 是一个用于 Rollup 构建工具的插件，它的**核心功能非常简单且专一：在每次新的构建（build）任务开始前，自动清空（删除）指定的输出目录**。

##### 安装

```sh
pnpm add -D rollup-plugin-clear
```


##### 配置

```js
// 导入插件
import clear from 'rollup-plugin-clear';

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    // 将其放在插件数组的最前面或靠前的位置是一个好习惯。
    // 这样能确保在其他插件（如写入文件的插件）执行前，目录已被清空。
    clear({
      // 核心选项：指定要清空的目录
      targets: ['dist'],
      
      // 可选选项（通常使用默认值即可）：
      watch: true,     // 在监听（watch）模式下也清空，默认为 true
      // hook: ‘buildStart’, // 指定在哪个 Rollup 钩子上执行清空操作，默认为 'buildStart'
    })
  ]
};
```


### 2.7 rollup-plugin-generate-html-template

`rollup-plugin-generate-html-template` 是一个用于 **Rollup** 的插件，它的主要功能是**自动生成一个或多个 HTML 文件，并自动将 Rollup 打包生成的 JavaScript 和 CSS 文件（chunks）注入到这些 HTML 文件中**。

它解决了手动管理 HTML 文件引用的问题。在开发过程中，尤其是使用代码分割（code splitting）时，打包输出的文件名可能包含哈希值（用于缓存破坏），手动更新 HTML 中的 `<script>` 和 `<link>` 标签会非常繁琐且容易出错。这个插件自动化了这个过程。


##### 安装

```sh
pnpm add -D rollup-plugin-generate-html-template
```

##### 基本配置

```js
// 导入插件
import generateHTML from 'rollup-plugin-generate-html-template';

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'esm',
    // 通常与哈希文件名一起使用
    entryFileNames: '[name]-[hash].js',
    chunkFileNames: '[name]-[hash].js'
  },
  plugins: [
    // ... 其他插件 (如 terser, postcss, etc.)

    // 将此插件放在最后
    generateHTML({
      // 核心选项：指定一个HTML模板
      template: 'src/template.html',

      // 输出选项：生成的HTML文件名和路径
      filename: 'index.html', // 默认也是 'index.html'
      // target: 'dist/index.html', // 另一种指定输出路径的方式

      // 注入选项：控制如何注入资源
      // attrs: ['defer'], // 给script标签添加属性，如 defer
      // links: [ { path: 'custom.css' } ] // 手动添加额外的link标签
    })
  ]
};
```


### 2.8 @rollup/plugin-alias

`@rollup/plugin-alias` 是一个 **Rollup 官方维护的插件**，它的主要功能是**在打包过程中为模块路径创建别名（alias）**。

这允许你在代码中使用简短、易记的别名来代替冗长、复杂的相对路径或绝对路径，从而大幅提高代码的可读性和可维护性。

##### 安装

```sh
pnpm add -D @rollup/plugin-alias
```

##### 基本配置

```js
// 导入插件
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from "node:url";

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    // 将此插件放在其他插件之前（如 node-resolve, commonjs 等）
    alias({
      entries: [
        // 将 `@utils` 映射到 `src/utils` 目录
        { find: '@utils', replacement: '/path/to/your/src/utils' },
        
        // 将 `@components` 映射到 `src/components` 目录
        { find: '@components', replacement: '/path/to/your/src/components' },
        
        // 你也可以映射到具体的文件
        { find: 'my-package', replacement: './src/custom-implementation.js' }
      ]
    }),
    // ... 其他插件
  ]
};
```


### 2.9 @rollup/plugin-terser

`@rollup/plugin-terser` 是一个 **Rollup 官方维护的插件**，它的主要功能是**对 Rollup 打包生成的代码进行压缩（minification）和混淆（obfuscation）**，使用 Terser 这个强大的 JavaScript 压缩工具。

👉 举个例子：

压缩前的代码：

```js
// 用户服务模块
class UserService {
  constructor() {
    this.baseUrl = 'https://api.example.com';
  }

  // 获取用户信息
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
}
```


压缩后的代码：

```js
class a{constructor(){this.baseUrl="https://api.example.com"}async getUserProfile(a){try{return await(await fetch(`${this.baseUrl}/users/${a}`)).json()}catch(a){throw console.error("获取用户信息失败:",a),a}}}
```


##### 安装

```sh
pnpm add -D @rollup/plugin-terser
```

##### 基本配置

```js
// 导入插件
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    name: 'MyApp'
  },
  plugins: [
    // ... 其他插件（如 commonjs, node-resolve, typescript 等）
    
    // 将此插件放在最后，对最终生成的代码进行压缩
    terser()
  ]
};
```


```js
terser({
  // 压缩选项
  compress: {
    drop_console: true,     // 移除所有 console.* 调用
    drop_debugger: true,    // 移除 debugger 语句
    pure_funcs: ['console.log'], // 移除特定的函数调用
    dead_code: true,        // 移除不可达的代码
    unused: true,           // 移除未使用的变量和函数
  },
  
  // 格式化选项（mangle：混淆）
  mangle: {
    properties: false,      // 是否混淆属性名（通常保持 false）
    reserved: ['$'],        // 保留不被混淆的标识符
  },
  
  // 输出格式选项
  format: {
    comments: false,        // 移除所有注释
    beautify: false,        // 是否美化输出（与压缩相反）
    preamble: '// My App v1.0.0', // 在文件开头添加的内容
  },
  
  // 其他选项
  ecma: 2020,               // 指定输出的 ECMAScript 版本
  keep_classnames: false,   // 保持类名不被混淆
  keep_fnames: false,       // 保持函数名不被混淆
  module: false,            // 是否处理 ES6 模块
  toplevel: false,          // 是否压缩顶级作用域的变量
})
```


### 2.10 rollup-plugin-visualizer

`rollup-plugin-visualizer` 是一个 **分析和可视化 Rollup 打包结果的插件**。它的主要功能是**生成一个直观的、交互式的可视化图表，帮助你分析最终打包产物（bundle）的构成**，让你清楚地看到每个模块占用了多少空间。

##### 安装

```sh
pnpm add -D rollup-plugin-visualizer
```

##### 基本配置

```js
// 导入插件
import { visualizer } from "rollup-plugin-visualizer";

export default {
  input: "src/main.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
  },
  plugins: [
    // ... 其他插件
    visualizer({
      // 基本选项
      filename: "stats.html",        // 输出文件名
      title: "Bundle Visualization", // HTML 标题
      open: true,                    // 完成后自动在浏览器打开
      
      // 模板选项
      template: "sunburst",          // 可视化图表类型
      
      // 数据选项
      gzipSize: true,               // 显示gzip后的大小
      brotliSize: false,            // 显示brotli压缩后的大小
    }),
  ],
};
```


### 2.11 @rollup/plugin-image

**将图片文件导入为 Base64 编码或 ES 模块**。

##### 安装

```sh
pnpm add @rollup/plugin-image -D
```

##### 基本配置

```js
import image from '@rollup/plugin-image';

export default {
  input: 'src/main.js',
  output: { file: 'dist/bundle.js', format: 'esm' },
  plugins: [
    image({
      // 输出格式：base64 | es
      format: 'base64',
      // 文件大小限制（小于此值转为 base64）
      limit: 8192,
      // 排除的文件
      exclude: ['**/*.svg'],
      // 包含的文件
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif']
    })
  ]
};
```



