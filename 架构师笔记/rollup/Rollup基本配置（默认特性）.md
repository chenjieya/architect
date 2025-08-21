
> 本文将带你了解 Rollup 自带的原生功能，即无需额外插件就能使用的基础特性。通过这些内容，我们可以认识最“纯粹”的 Rollup，弄清楚它在默认情况下具备哪些能力。

## 1. 安装Rollup

### 1.1 安装命令

```sh
pnpm add rollup -D
```

这里的 `-D` 表示开发依赖（devDependencies），因为 Rollup 只在构建时需要，不会进入生产环境。

如果你使用 npm 或 yarn，也可以参考 [官方文档](https://cn.rollupjs.org/tutorial/#installing-rollup-locally) 的安装方式。

### 1.2 执行打包命令

安装完成后，可以直接运行 Rollup：

```sh
pnpx rollup -c
```

- `pnpx` 会在当前项目的依赖中找到 `rollup` 并执行。
- `-c` 表示使用配置文件（默认是 `rollup.config.js`）。

### 1.3 配置 npm 脚本

通常我们会在 `package.json` 里写一个构建脚本，方便团队成员直接运行：

```js
{
	"scripts": {
		"build": "rollup --config"
	}
}
```

这样只需要执行：

```sh
pnpm run build
```

就可以完成打包。


## 2. “纯粹”的 Rollup

### 2.1 入口（Input）

在没有配置文件时，Rollup 默认会以 `src/index.js` 或 `index.js` 作为入口文件。  
当然，也可以在配置文件 `rollup.config.js` 中指定入口：

```js
// rollup.config.js
export default {
  input: 'src/main.js' // 指定打包入口
}
```

### 2.2 出口（Output）

Rollup 的出口配置决定了最终打包产物的位置和格式。  
最常见的配置是：

```js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js', // 输出的文件路径
    format: 'es'            // 输出格式
  }
}
```

**常见的输出格式**
- **es**：ES Module（现代浏览器 / bundler 支持）
- **cjs**：CommonJS（Node.js 环境使用）
- **iife**：立即执行函数（适合直接在浏览器用 `<script>` 引入）
- **umd**：兼容 CommonJS + AMD + 浏览器全局变量

### 2.3 多出口配置

一个库通常需要输出多种格式，Rollup 可以很方便地同时导出多个 bundle：

```js
export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary' // umd 必须指定全局变量名
    }
  ]
}
```

### 2.4 Watch 模式（开发调试）

Rollup 内置了 **监听模式**，可以在文件变化时自动重新构建：

命令行方式：

```sh
pnpx rollup -c --watch
```

或者在 `package.json` 里写：

```js
{
  "scripts": {
    "dev": "rollup -c --watch"
  }
}
```

这样每次修改源码后，Rollup 会自动重新打包，方便开发调试。

### 2.5 多入口配置

有时一个库会有多个入口文件，比如：

```txt
src/
 ├─ index.js
 ├─ core.js
 └─ utils.js
```

可以这样配置：
```js
export default {
  input: {
    index: 'src/index.js',
    core: 'src/core.js',
    utils: 'src/utils.js'
  },
  output: {
    dir: 'dist',
    format: 'es'
  }
}

```

**产物**
- 每个入口文件（index、core、utils）都会打成一个 bundle。
- 如果公共依赖存在，不会重复打进两个 bundle，而是抽离成一个 **共享 chunk**。参考下面的[[#2.7.2 默认代码分割]]
- Rollup 自动在 `index.js` 、 `core.js`和`utils.js` 入口文件中加上对 **共享 chunk** 的引用。

### 2.6 多个入口分别构建，输出不同的产物

```js

import { defineConfig } from 'rollup'
/**
 * @type {import('rollup').RollupOptions}
 */
const buildIndexOptions = {
  input: 'src/index.js',
  output: {
    dir: 'dist/umd/',
    format: 'umd',
    name: 'bundle'
  }
}

/**
 * @type {import('rollup').RollupOptions}
 */
const buildMainOptions = {
  input: 'src/core.js',
  output: {
    dir: 'dist/esm/',
    format: 'esm',
  }
}
export default [buildIndexOptions, buildMainOptions];
```


### 2.7 动态导入与默认代码分割

#### 2.7.1 动态导入

在 **ESM（ES Module）** 规范里，除了静态的 `import`，还支持 **动态导入**：

```js
// 静态导入：编译阶段就确定
import { add } from './math.js'

// 动态导入：运行时才加载
button.addEventListener('click', async () => {
  const { sub } = await import('./math.js')
  console.log(sub(10, 5))
})
```

**特点**
- **静态导入**：打包时 Rollup 会直接把依赖合并进主 bundle。
- **动态导入**：Rollup 会单独生成一个文件，在运行时按需加载。


#### 2.7.2 默认代码分割

在支持 **动态导入** 的情况下，Rollup 会自动启用 **代码分割**：
- 把公用的依赖抽离出来。
- 避免多个 bundle 重复打包相同模块。

👉 举个例子：
假设有两个入口文件：
```js
// pageA.js
import { utils } from './utils.js'
console.log('Page A', utils())

// pageB.js
import { utils } from './utils.js'
console.log('Page B', utils())
```

如果我们用多入口配置：

```js
export default {
  input: {
    pageA: 'src/pageA.js',
    pageB: 'src/pageB.js'
  },
  output: {
    dir: 'dist',
    format: 'es'
  }
}
```

Rollup 会生成：

```php
dist/
 ├─ pageA.js
 ├─ pageB.js
 └─ utils-xxxxx.js   // 公共依赖被单独抽出来
```

**好处**
- **避免重复**：公共模块只打包一次。
- **按需加载**：只加载需要的部分。

#### 2.7.3 manualChunks自定义代码分割

`manualChunks`用于自定义代码分割，将特定模块或依赖打包到独立的 chunk（**默认是不打包外部依赖的，如果手动配置打包外部依赖，需要删除[[#2.9.1 external]]**）：

```js
output: {
  dir: 'dist',
  format: 'es',
  manualChunks: {
    vendor: ['react', 'react-dom']
  }
  // 或者写成函数
  manualChunks(id) {
	  if(id.includes('vue')) {
		  return 'vue'
	  }
  }
}
```

- 可以把第三方库单独打包(前提是需要第三方插件@rollup/plugin-node-resolve，让rollup可以打包三方库)也可以自定义内部依赖分包
- 提高浏览器缓存利用率

### 2.8 Tree-shaking

- 自动删除未使用的导出代码。
- 基于 **ESM 静态导入/导出** 特性，比 CommonJS 更高效。

👉 举个例子：

```js
// utils.js
export function used() { console.log('used') }
export function unused() { console.log('unused') }

// main.js
import { used } from './utils.js'
used()
```

打包结果中，`unused` 会被自动去掉。

除了可以使用 ES 模块之外，Rollup 还可以静态分析你导入的代码，并将排除任何实际上没有使用的内容，从下面的引入和最后的打包结果就可以看到，没有使用到的内容直接被删除了。

> 注意，**摇树优化的核心思想是在编译阶段通过静态分析确定代码的使用情况，而不是在运行时**。

所以摇树优化一般是建立在**ES6 模块化语法**基础之上的，ESM的导入导出是静态的。

CommonJS 模块的导入和导出是动态的，无法在编译阶段静态确定代码的使用情况。一般情况下，摇树优化工具无法在 CommonJS 模块中进行精确的摇树，因为无法静态分析模块间的导入和导出关系。

然而，一些构建工具（如 Webpack）会尝试通过静态分析和启发式方法对 CommonJS 模块进行近似的摇树优化。它们会尽可能地识别出那些可以在编译阶段确定未被使用的代码，并进行剔除。但这种处理方式可能不如对 ES6 模块的优化效果好，且有一定的限制。

**摇树优化的原理：**

1. 静态分析：对 JavaScript 代码进行静态分析，识别出模块的导入和导出关系。
2. 标记未使用代码：标记出在导入和导出关系上没有被使用的代码。这些代码可能是模块的导出函数、变量、类等。
3. 剔除未使用代码：根据标记结果，构建工具会将未被使用的代码从最终的打包结果中剔除，只保留被使用的部分。

由于是静态分析，所以我们在写代码的时候，需要注意自己的写法，简单来说，尽量的使用最小导入，比如你可以比较一下我们这里导入代码之后，打包的区别：

1. 命名导出：
```js
// utils.js
export const foo = () => {};
export const bar = () => {};
```
导入时只取需要的函数：
```js
import { foo } from './utils';
foo();
```

- Rollup 可以完全 tree-shake `bar`，不会打包进最终 bundle。
- ✅ **Tree-shaking 最友好**，推荐使用。


2. 默认导出
```js
// utils.js
export default {
  foo: () => {},
  bar: () => {},
};
```
导入时：
```js
import utils from './utils';
utils.foo();
```

- **问题**：
    - Rollup 看到 `utils` 被整体使用，它就无法确定里面的 `bar` 是否会被使用。
    - **结果**：整个对象会被打包，Tree-shaking 失效。
- 💡 结论：默认导出一个包含多个属性的对象时，Tree-shaking 效果不好。


#### 2.8.1 Tree-shaking实践建议

1. **尽量使用命名导出**，尤其是库函数或者工具函数。
2. **避免默认导出对象包含多个方法**，会破坏 Tree-shaking。
3. **不要在导出时做动态计算**：
```js
// ❌
export const func = someCondition ? foo : bar;
```

4. **导入时只按需导入**：
```js
// ❌ 整个导入
import utils from './utils';

// ✅ 按需导入
import { foo } from './utils';
```


### 2.9 外部依赖与打包控制

在 Rollup 打包中，有时我们并不希望所有依赖都被打包进最终产物(默认不会将外部依赖打包到产物里面)。尤其是大型库或 Node.js 内置模块，如果强制打包，不仅会增加体积，还可能引入不必要的重复代码。Rollup 提供了几种机制来灵活管理这些依赖：
#### 2.9.1 external

通过 `external` 配置，可以明确告诉 Rollup 哪些模块是外部依赖，不需要打包。 如果不配置，rollup会在控制台抛出警告：

```js
export default {
  input: 'src/index.js',
  output: { file: 'dist/bundle.js', format: 'cjs' },
  external: ['react', 'vue'] // 这些不会打包进 bundle
}
```

- 减小打包体积
- 保持 Node.js 内置模块或全局库使用方式
- 注意 ESM 输出时需保证外部依赖存在，否则运行时报错

#### 2.9.2 globals（UMD/IIFE 外部依赖全局变量映射）

当你打包 UMD 或 IIFE 格式时，Rollup 会把模块转换为一个全局可访问的变量（例如 `window.MyLib`）。但是，如果你的库依赖了外部库（比如 `react` 或 `lodash`），你并不希望把它们打包进最终文件，而是通过全局变量来使用。

**使用场景**：

- 你的库是一个前端组件库，需要依赖 `React`，但用户在浏览器中已经通过 `<script>` 引入了 `React`。
- 如果不配置 `globals`，UMD 打包会报错，因为 Rollup 不知道全局变量名对应哪个外部模块。

👉 举个例子：

```js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/my-lib.umd.js',
    format: 'umd',
    name: 'MyLib',
    globals: {
      react: 'React',  // 外部模块 react 对应全局变量 React
      'react-dom': 'ReactDOM'
    }
  },
  external: ['react', 'react-dom']  // 告诉 Rollup 这些不打包
}
```

**解析**：
- `external` 表示哪些模块不打包
- `globals` 映射外部模块到浏览器全局变量
- 打包后，你的 UMD 文件就可以直接在浏览器中使用，不会把 React 和 ReactDOM 打包进来

**Key&Value解析**
**key**：必须是你在 `import` 或 `external` 中指定的 **模块名**。
- 也就是你在代码里写的 `import React from 'react'` 里的 `'react'`。
- 它不是随便起的名字，必须和模块名匹配，否则 Rollup 找不到对应关系。

**value**：是这个外部模块在 **全局环境中** 暴露出来的变量名。
- 例如你在浏览器通过 `<script src="https://unpkg.com/react/umd/react.development.js"></script>` 引入 React，它会在全局变量 `window.React` 上暴露。
- 这时候 `globals` 的 value 就写 `'React'`。

#### 2.9.3 paths（模块路径重写）

`paths` 配置用于 **修改 Rollup 在打包时解析模块的路径**，常用于以下场景：

- 从 CDN 加载库，而不是打包本地模块
- 替换模块路径，避免重复打包或引入特定版本

```js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/my-lib.esm.js',
    format: 'esm',
    name: 'MyLib',
    globals: {
      react: 'React',  // 外部模块 react 对应全局变量 React
      'react-dom': 'ReactDOM'
    }
  },
  external: ['react', 'react-dom'],  // 告诉 Rollup 这些不打包
  paths: {
    "react": "https://cdn.jsdelivr.net/npm/react@18.2.0/+esm",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm",
  }
}
```

打包后，Rollup 会把 `import react from 'react'` 替换为从指定 URL 加载的模块，而不是本地打包。


示例 2：模块路径重定向

```js
external: ['my-lib'],
paths: {
  'my-lib': './custom-lib/my-lib.js'
}
```

- Rollup 会把 `import { foo } from 'my-lib'` 定向到 `./custom-lib/my-lib.js`
- 适用于替换模块或做兼容处理

**注意**：
- `paths` 只对 **外部依赖（external）** 生效
- 必须和 `external` 配合使用，否则 Rollup 会尝试打包模块，而不是替换路径

## 3. 总结

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202508211455760.png)

Rollup 是一个“纯粹”的打包工具，它以 ES 模块为基础，通过静态分析实现高效的 Tree-shaking 和代码分割。使用 Rollup 时，只需通过配置入口、出口和格式，就能完成多入口打包、多格式输出以及按需加载的功能。动态导入进一步增强了代码分割能力，使公共模块只打包一次，避免重复，同时支持按需加载，提高性能。在 Tree-shaking 方面，Rollup 对命名导出的支持最佳，可以准确剔除未使用的代码，而默认导出对象或动态计算导出则可能导致 Tree-shaking 失效。因此，在日常开发中，应尽量使用命名导出、按需导入，并避免默认导出包含多个方法或动态计算的导出内容，以充分发挥 Rollup 的优化能力。总的来说，理解和合理使用 Rollup 的原生功能，可以让打包产物更轻量、模块更清晰，也让项目维护和性能优化变得更加高效。
