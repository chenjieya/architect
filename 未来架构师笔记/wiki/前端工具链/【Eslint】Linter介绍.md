---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. _linter_ 发展史

首先和大家来聊一聊关于 _linter_ 的发展史。

### 1.1 静态代码分析

早在 _1978_ 年，_Stephen C. Johnson_ 在 _Debug_ 自己的 _C_ 语言项目时，突然想到为什么不做一个工具来提示自己写的代码哪里有问题呢？ 这个工具也被称为 _Linter_。

_Linter_ 本意指的是衣服上多出来的小球、绒毛和纤维等，如果你刚把晾晒好的衣服收下来就会发现这些小玩意。以前如果想把这些多出来的“残渣”去掉，最简单的方法就是找一个单面胶粘一下再撕开，后来有的人发明了这个神器，一滚就能清除掉：
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135250059.png)

这就是 _Linter_ 的由来，不过区别是神器重点在 “清除”，而 _Linter_ 重点在 “上报错误”。

_Linter_ 想要提示错误，那首先就得阅读代码，这也是为什么 _Linter_ 也被称为静态代码分析的工具。阅读完之后，再加上我们人为自定义好的一些规则，那么 _Linter_ 就拥有了提示错误的能力了。

### 1.2 _JSLint_

在 _2002_ 年，*Douglas Crockfor*d 就为 _JavaScript_ 写了第一个 _Linter_ 工具：_JSLint_。
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135310015.png)

你现在也可以在[这个网站](https://www.jslint.com/)上粘贴你的 _JavaScript_ 代码来检查有没有问题。

_JSLint_ 的优点就是 <u>开箱即用，不需要配置太多的东西，相当于拎包入住</u>。但优点也是缺点，就是 <u>规则太严格，完全不可扩展和自定义配置，连配置文件都没有</u>。

### 1.3 _JSHint_

在 _JSLint_ 的基础上，在 _2010_ 年的时候 _Anton Kovalyov_ 跟其它人就 _fork_ 了一份 _JSLint_ 然后改造成了 _JSHint_。

你可以在[这个网站](https://jshint.com/)访问到 _JSHint_
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135349054.png)

这个工具与 _JSLint_ 的思路正好相反，它的默认规则非常松散，自由度非常高。但是也同样带来了问题：你需要非常了解这些规则才能配出一个好用的规则表。因为规则太不严格，过于自由，所以单纯靠默认的规则跟没有配置 _Linter_ 一样。

### 1.4 _JSCS_

前面的 _JSLint_ 和 _JSHint_ 主要功能都是检查代码质量问题的，_JSCS_ (_JavaScript Coding Style_) 则是一个代码风格检查器。

它有超过 _90_ 条规则，你也能自己创建规则，不过这些规则主要是和代码风格、代码格式化有关，它不会报任何和 _JS_ 代码质量相关的错误。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135411331.png)

尽管 _JSCS_ 在其活跃时期非常受欢迎，但它已于 _2016_ 年被宣布停止维护，并建议用户迁移到 _ESLint_。_ESLint_ 是一个更强大、更灵活的工具，它不仅可以检查代码风格，还可以发现潜在的错误和代码质量问题。另一个流行的代码格式化工具是 _Prettier_，它专注于自动格式化代码，而不提供任何代码质量检查。

虽然 _JSCS_ 不再被维护，但它的一些功能和理念已经被 _ESLint_ 和 _Prettier_ 等现代工具所采纳。如果你正在寻找一个代码风格检查器和格式化器，建议使用 _ESLint_ 和 _Prettier_ 来替代 JSCS。这两个工具可以很好地协同工作，_ESLint_ 负责检查代码质量，而 _Prettier_ 负责自动格式化。

### 1.5 _ESLint_

接下来就是我们的主角 _ESLint_ 了。
_2013_ 年，一个叫 _JSChecker_ 的小项目被改名成我们如今非常熟悉的 _ESLint_。

_ES6_ 上线了之后，_JSHint_ 受不了直接投降了，因为它不支持这些 _ES6_ 新语法。而 _ESLint_ 正好异军突起，马上用 _Esprima_ （一个高性能的 _ECMAScript parser_）支持所有 _ES6_ 新语法，并对新语法做好了校验。

除了基础的 _ES6_ 代码质量校验，_ESLint_ 还支持代码风格的规则。开发者不仅可以自定义项目要用哪些规则，也能直接无脑使用社区上制定的规则（比如 _eslint-config-airbnb_）。
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135439155.png)

这一波操作也让 _ESLint_ 成为现在 _JavaScript_ 的一个标准的 _Linter_ 了。然而，关于 _Linter_ 的故事还没结束。

_2012_ 年微软公布了第一版的 _TypeScript_，随之而来的还有一个叫 _TSLint_ 的 _Linter_。

在那段时间里，_TSLint_ 是 _TypeScript_ 的标准 _Linter_ 工具，_ESLint_ 则为 _JavaScript_ 标准 _Linter_。它们各有自身特色：_ESLint_ 有 _TSLint_ 所没有的一些语法特性支持，而 _TSLint_ 可以对代码进行静态分析和类型检查。

可是，一份代码还要两个 _Linter_ 并行检查属实有点让人不爽。_TSLint_ 也经常和 _ESLint_ 的人探讨应该用哪个作为主力 _Linter_。_TS_ 的社区也有很多声音希望优先满足 _JSer_ 的需求，毕竟 _TS_ 是 _JS_ 的超集嘛，还是以 _ESLint_ 为主。
最终，在 _2019_ 年 _TSLint_ 宣告不再维护，以后就是 _ESLint_ 的天下了。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251228135500290.png)

## 2. _ESLint_ 核心概念

接下来我们来了解一下 _ESLint_ 的核心概念，这个部分很重要，因为我们后期的学习就是围绕着这几个方面展开的。

_ESLint_ 的核心概念包括以下几点：

1. 规则 (_Rules_)：规则是 _ESLint_ 的核心，它们是独立的脚本，用于检查代码中的特定问题。_ESLint_ 有许多内置规则，这些规则可以覆盖各种编码风格和潜在错误。规则是可配置的，每个规则可以被启用或禁用，并可以设置为警告或错误级别。
2. 配置 (_Configuration_)：_ESLint_ 允许通过配置文件自定义规则的启用和设置。配置文件可以是 ._eslintrc_.* 格式的文件或 *package.json* 文件里的 *eslintConfig* 字段。配置可以继承其他配置，这使得可以轻松地共享和组合规则集。共享配置通常是一个 *npm\* 包，可以被多个项目使用。
3. 插件 (_Plugins_)：插件是可扩展 _ESLint_ 功能的方式，它们包含一组自定义规则和/或处理器（见下文）。这使得 _ESLint_ 可以适应不同的编码风格和技术栈。插件可以通过 _npm_ 安装并在配置文件中引用。
4. 处理器 (_Processors_)：处理器是一个可选的插件特性，它可以对非 _JavaScript_ 文件进行预处理，以便 _ESLint_ 可以检查这些文件中嵌入的 _JavaScript_ 代码。例如，_HTML_ 文件中的 \<_script_> 标签或 _Markdown_ 文件中的代码块。
5. 命令行接口 (_CLI_)：_ESLint_ 提供了一个命令行接口，用于在终端中执行 _linting_ 操作。_CLI_ 允许用户指定一个或多个文件、目录或 _glob_ 模式以进行检查。_CLI_ 还支持许多选项，这些选项可以覆盖配置文件中的设置，如禁用特定规则、规定输出格式等。

## 3. ESLint 快速上手

首先创建一个 eslint-demo 的项目，使用 pnpm init 进行格式化，安装 eslint

```bash
pnpm add eslint -D
```

接下来在项目根目录下面创建一个 src/index.js，代码如下：

```js
const hello = "world";
console.log(hello);
function sayHello(name) {
  console.log("Hello, " + name + "!");
}
sayHello("world");
```

上面随便写了一些代码，接下来在项目根目录下面创建一个 eslint 的配置文件 .eslintrc，里面会书写一些配置信息：

```js
{
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 12,
		"sourceType": "module"
	},
	"rules": {
		"indent": ["error", 2],
		"quotes": ["error", "single"],
		"semi": ["error", "always"]
	}
}
```

- env：主要是定义预设的全局变量
  - browser：这份配置适用于浏览器环境，预定义了诸如 window、document 之类的浏览器才会有的全局变量
  - es2021: 表示我们使用的是 ES 2021 的标准，肯定会预定义一些新版本的全局变量，Promise、Symbol 这些全局变量是支持的
- extends：这里我们所设置的值为 eslint:recommended，这其实是 ESLint 团队推荐的一组核心规则，你可以将其视为最佳实践
- parserOptions：和解析器相关的配置，`parserOptions` 用来告诉 ESLint 的 parser, 你这段源码应该被当作“哪一版 ECMAScript + 哪种模块系统”来解析成 AST 抽象语法树
  - ecmaVersion：使用的 ECMAScript 的版本，12 也就是 2021
  - sourceType：模块类型，这里设置为 module，表示我们使用的 ESM 模块规则，支持 import 和 export 语法
- rules：定义代码风格，功能类似于 prettier
  - indent：缩进，我们这里设置的是两个空格，如果不符合要求，会报 error 类型的错误
  - quotes：引号的设置，这里我们设置的是单引号，如果不符合要求，会报 error 类型的错误
  - semi：每一条语句添加分号，如果不符合要求，会报 error 类型的错误

最后修改 package.json，添加如下的 script 脚本命令：

```js
"scripts": {
// ...
"lint": "eslint ."
},
```

上面的脚本命令表示对当前项目所有的 js 文件进行 lint 检查。

使用 ESlint 进行代码检查的时候，是支持自动修复的，但是并非所有的错误都能够自动修复，只能够修复一部分。

要自动进行修复，只需要添加命令行参数 --fix 即可

```js
"scripts": {
// ...
"lint": "eslint --fix ."
},
```
