关于 babel 里面的 APIs 主要位于 @babel/core 这个依赖里面，你可以在官网左下角的 Tooling Packages 分类下找到这个依赖包。

这里顺便介绍一下每一种依赖包的作用：

- _@babel/parser_: 是 _Babel_ 的解析器，用于将源代码转换为 _AST_。

- _@babel/core_: _Babel_ 的核心包，它提供了 _Babel_ 的核心编译功能。这个包是使用 _Babel_ 必须安装的。

- _@babel/generator_: 是 _Babel_ 的代码生成器，它接收一个 _AST_ 并将其转换为代码和源码映射（_sourcemap_）。

- _@babel/code-frame_: 提供了一种用于生成 _Babel_ 错误消息的方法，可以在代码帧中高亮显示错误。

- _@babel/runtime_: 提供了 _Babel_ 运行时所需要的辅助函数和 _polyfills_，以避免在每个文件中都重复这些代码。

- _@babel/template_: 提供了一种编写带有占位符的 _Babel AST_ 模板的方法。

- _@babel/traverse_: 是 _Babel_ 的 _AST_ 遍历器，它包含了一些用于处理 _AST_ 的工具。

- _@babel/types_: 提供了一种用于 _AST_ 节点的 _Lodash-esque_ 实用程序库。

在第一节课的时候，我们安装了三个依赖：core、cli、preset，但是我们使用 babel 进行编译的时候发现最终是生成了编译后的代码的，而从 AST 生成编译后代码是 generator 的工作，实际上当你安装 core 的时候，就会间接的安装 generator、traverse 等需要用到的依赖包。

通过对官方 API 的观察，我们发现 babel/core 的 API 主要分为三大类：

- transformXXX
- parseXXX
- loadXXX

## 1. transformXXX

这一组方法一看就是做和编译相关的操作，之所以有这么多，其实就是同步或者异步、编译代码或者文件的区别，每个方法的具体含义如下：

- _transform(code: string, options: Object)_: 这是一个异步函数，用于将源代码字符串转换为 _Babel_ 的结果对象。结果对象包含了转换后的代码，源码映射，以及 _AST_。

- _transformSync(code: string, options: Object)_: 这个函数和 _transform_ 函数功能相同，但它是同步执行的。

- _transformAsync(code: string, options: Object)_: 这个函数和 _transform_ 函数功能相同，它返回一个 _Promise_，这个 _Promise_ 会在转换完成后解析为结果对象。

- _transformFile(filename: string, options: Object, callback: Function)_: 这个函数会读取并转换指定的文件。转换完成后，会调用提供的回调函数，并将结果对象传递给回调函数。

- _transformFileSync(filename: string, options: Object)_: 这个函数和 _transformFile_ 函数功能相同，但它是同步执行的。

- _transformFileAsync(filename: string, options: Object)_: 这个函数和 _transformFile_ 函数功能相同，它返回一个 _Promise_，这个 _Promise_ 会在转换完成后解析为结果对象。

- _transformFromAst(ast: Object, code: string, options: Object)_: 这个函数接受一个 _AST_ 对象，然后将这个 _AST_ 转换为 _Babel_ 的结果对象。这个函数可以用于在已经有 _AST_ 的情况下避免重新解析代码。

- _transformFromAstSync(ast: Object, code: string, options: Object)_: 这个函数和 _transformFromAst_ 函数功能相同，但它是同步执行的。

- _transformFromAstAsync(ast: Object, code: string, options: Object)_: 这个函数和 _transformFromAst_ 函数功能相同，它返回一个 _Promise_，这个 _Promise_ 会在转换完成后解析为结果对象。

上面这些方法中，只要搞懂一个，其他的也就搞懂了。

## 2. parseXXX

该系列方法主要负责将源码转为抽象语法树（AST），之后就不管了。

- _parse(code: string, options: Object)_: 这是一个异步函数，用于解析源代码字符串并返回一个 _AST_。你可以通过选项对象来配置解析过程，例如是否包含注释，是否包含 _location_ 信息等。

- _parseSync(code: string, options: Object)_: 这个函数和 _parse_ 函数功能相同，但它是同步执行的。

- _parseAsync(code: string, options: Object)_: 这个函数和 _parse_ 函数功能相同，它返回一个 _Promise_，这个 _Promise_ 会在解析完成后解析为 _AST_。

## 3. loadXXX

这一系列方法主要是做配置文件的加载工作的

- _loadOptions(options: Object)_: 这个函数接受一个选项对象，然后返回一个完整的、已解析的 _Babel_ 配置对象。这个配置对象包括了所有的预设，插件，和其他配置选项。如果提供的选项对象中没有指定配置，那么这个函数会尝试从 ._babelrc_ 文件或 _babel.config.js_ 文件中加载配置。

例如：

```js
const babel = require('@babel/core')

const options = {
  filename: './src/myFile.js',
}
const config = babel.loadOptions(options)
console.log(config)
```

在这个例子中，我们首先导入了 _@babel/core_，然后定义了一个选项对象。这个对象中，_filename_ 属性指定了我们正在处理的文件的路径。然后我们使用 _@babel/core_ 的 _loadOptions_ 方法来加载 _Babel_ 的配置。

_loadOptions_ 方法返回一个配置对象，这个对象包括了所有的预设，插件，和其他配置选项。在这个例子中，我们将这个配置对象打印到控制台。

- _loadPartialConfig(options: Object)_: 这个函数和 _loadOptions_ 函数类似，但是返回的配置对象可能是部分的，也就是说，它可能没有包括所有的预设和插件。这个函数主要用于在构建工具中，当你需要对 _Babel_ 配置进行更精细的控制时。
