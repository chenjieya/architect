首先需要注意，当前的这个节点，配置文件系统处于一个更新期，存在两套配置文件系统，旧的配置文件系统适用于 v9.0.0 之前的版本，而新的配置文件系统适用于 v9.0.0之后的版本，但是目前就讲课的这个节点，还处于 v8.x.x 的大版本。

## 1. 配置文件格式

在 ESLint 中，支持如下格式的配置文件：

- JavaScript：使用 .eslintrc.js 并且导出一个包含你配置的对象
- JavaScript（ESM）：在 v9.0.0 之前 ESLint 是不支持 ESM 风格模块化的，假设我们的源码使用的 ESM 模块化风格，并且我们在 pacakge.json 中明确配置了 type: module，这个时候就需要将 ESLint 的配置文件命名为 .eslintrc.cjs（也就是说要使用 CommonJS 风格来命令 ESLint 的配置文件）
- YAML：使用 .eslintrc.yaml 或者 .eslintrc.yml
- JSON：使用 .eslintrc.json 来配置 ESLint
- package.json：在 pacakge.json 中，可以创建一个名为 eslintConfig 的属性，然后对 ESLint 进行配置

如果在项目的<u>同一目录</u>下存在多种格式的配置文件，那么这些配置文件之间是有一个优先级顺序的。顺序如下：

1. `.eslintrc.js`
2. `.eslintrc.cjs`
3. `.eslintrc.yaml`
4. `.eslintrc.yml`
5. `.eslintrc.json`
6. `package.json`

在早期的时候（v7.0.0之前），ESLint 支持使用 .eslintrc 文件来作为 ESLint 的配置文件，但是从 v7.0.0 开始，官方就已经明确废弃掉这种用法，从 v7.0.0 之后，就建议使用上述的格式来作为 ESLint 的配置文件。但是为了兼容性，之前的 .eslintrc 格式的配置文件依然能够使用，但是还是建议最好使用官方推荐的格式来进行配置。

## 2. 使用配置文件

想让我们的配置文件生效，有两种方式：

- 在项目中创建上述的配置文件，ESLint 在做检查的时候会自动寻找配置文件并应用里面的配置
- 在 CLI 命令中通过 --config 选项来手动指定配置文件的位置

```js
eslint -c myconfig.json myfiletotest.js
```

## 3. 配置文件的层叠

在 ESLint 中支持配置文件的层叠，这是一种管理项目中多个配置文件的方式，这种特性允许你在项目中根据不同的部分应用不同的规则。

例如我们在 src/.eslintrc.js 中，有如下的配置：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    semi: ['error', 'always'],
  },
}
```

那么现在，我们就存在两份 ESLint 的配置，此时 ESLint 会在当前目录下查找配置文件，然后会一层一层往上寻找，将找到的所有的配置文件进行一个规则合并。

如果子目录下配置文件的规则和父目录下的配置文件规则发生重合，那么子目录下的配置文件规则会覆盖父目录下配置文件的同名规则。

如果我们需要就应用当前目录的配置文件，不要再往上找了，那么可以在当前的配置文件中添加一个 root:true，添加了此配置项后，表示就应用当前目录下找到的配置文件，停止继续往上搜索。

目前我们知道，要对 ESLint 进行配置有多种方式：

- 配置文件方式
- 行内注释方式
- CLI 命令行

那么有这么几种方式，优先级如何呢？优先级顺序从高到低如下：

- 行内注释配置方式
- CLI 命令行配置方式
- 配置文件的方式（虽然它的优先级是最低的，但却是用得最多的）
- 从 ESLint v8.0.0 开始，已经不再支持个人配置文件（你把你的配置文件是写在项目之外的，放在你的主目录 ～ 下面的），也就是说，如果你的电脑主目录下存在配置文件，ESLint 不会去搜索到那儿，会自动忽略那里的配置文件。

## 4. 扩展配置文件

这里所谓的扩展，实际上更准确的来讲，叫做继承。

```js
{
	"extends": "eslint:recommended",
}
```

在上面的配置中，extends 对应的值为 eslint:recommended，表示采用 ESLint 团队推荐的规则规范。

在继承了 eslint:recommended 规则规范的基础上， 是可以进行额外的配置。

```js
{
	"extends": "eslint:recommended",
	"rules" : {
		"no-console": "warn"
	}
}
```

但是在进行原有配置规则的扩张的时候，有一个细节上面的问题：

```js
{
	"extends": "eslint:recommended", // "eqeqeq": ["error", "allow-null"]
	"rules" : {
		"eqeqeq": "warn"
	}
}
```

在上面的扩展中，我们修改了 eqeqeq 这条规则的重要性，从 error 修改为了 warn，当你修改规则重要性的时候，原本的配置选项会保留，也就是说，上面关于 eqeqeq 这条规则，最终会变为

```js
"eqeqeq": ["warn", "allow-null"]
```

但是如果你更改的是配置选项，那么则是完全覆盖。

```js
{
	"extends": "eslint:recommended", // "quotes": ["error", "single", "avoid-escape"]
	"rules" : {
		"quotes": ["error", "double"]
	}
}
```

在上面的例子中，我们修改了 quotes 规则的配置选项，改为了 double，那么新的配置选项会对旧的（"single", "avoid-escape"）进行完全覆盖。

另外关于 extends 对应的值还可以是一个数组：

```js
{
	"extends": [
		"./node_modules/coding-standard/eslintDefaults.js",
		"./node_modules/coding-standard/.eslintrc-es6",
		"./node_modules/coding-standard/.eslintrc-jsx"
	],
	"rules": {
		"quotes": "warn"
	}
}
```

## 5. 局部重写

有些时候，我们需要对配置进行更加精确的控制，例如都是在同一个目录下，不同的文件使用不同的配置，这种情况下就可以使用局部重写（overrides）

```js
{
	"rules": {
		"quotes": ["error", "double"]
	},
	"overrides": [
		{
			"files": ["bin/*.js", "lib/*.js"],
			"excludedFiles": "*.test.js",
			"rules": {
			"quotes": ["error", "single"]
		}
	]
}
```

例如，假设我们有如下的项目结构：

```js
any-project/
├── .eslintrc.js
├── lib/
│ ├── util.js
│ └── other.js
└── src/
├── index.js
└── main.js
```

在 .eslintrc.js 配置文件中，我们书写了如下的配置代码：

```js
{
	"rules": {
		"quotes": ["error", "double"]
	},
	"overrides": [
		{
			"files": ["lib/*.js"],
			"rules": {
			"quotes": ["error", "single"]
		}
	]
}
```

在上面的配置文件中，我们使用了局部重写，src 目录下面的所有 js 文件使用双引号，lib 目录下面所有的 js 文件使用单引号。

overrides 对应的值是一个数组，那么这意味着可以有多个配置项，当多个配置项之间匹配上了相同的文件，那么以后面的配置项为准。

```js
{
	"rules": {
		"quotes": ["error", "double"]
	},
	"overrides": [
		{
			"files": ["**/*.js"],
			"rules": {
			"quotes": ["error", "single"]
		},
		{
			"files": ["lib/*.js"],
			"rules": {
			"quotes": ["error", "double"]
		}
	]
}
```

overrides 是支持嵌套，例如：

```js
{
	"rules": {
		"quotes": ["error", "double"]
	},
	"overrides": [
		{
			"files": ["lib/*.js"],
			"rules": {
			"quotes": ["error", "single"]
			%% 在lib下面去找 %%
			"overrides": [
				{
					"files": ["util.js"],
					"rules": {
					"quotes": ["error", "double"]
				},
			]
		},
	]
}
```

## 7. 配置文件的书写

从 v9.0.0 开始，官方推荐的配置文件格式为 eslint.config.js，并且支持 ESM 模块化风格，可以通过 export default 来导出配置内容

```js
export default [
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error',
    },
  },
]
```

之所以导出的是一个数组，是因为为了支持项目中不同的文件或者文件类型定义不同的规则。

例如，你的项目里面既有 JS 代码，也有 TS 代码，你可能想要针对不同的代码类型配置不同的 ESLint 检查规则，这里就可以这样写：

```js
module.exports = [
  {
    files: ['*.js'],
    rules: {
      'no-var': 'error',
    },
  },
  {
    files: ['*.ts'],
    rules: {
      '@typescript-eslint/no-var': 'error',
    },
  },
]
```

如果你在 package.json 里面没有指定 type: module，那么就代表你使用的是 CommonJS 规范，那么 ESLint 配置文件在做模块导出的时候，也需要使用 CommonJS 模块规范

```js
module.exports = [
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error',
    },
  },
]
```

## 8. 配置对象的选项

具体的配置选项如下：

- _files_： 一个含有 _glob_ 模式的数组，指示应用配置对象的文件。如果未指定，配置对象应用于所有由任何其他配置对象匹配的文件。
- _ignores_： 一个含有 _glob_ 模式的数组，指示配置对象不应用于的文件。如果未指定，配置对象应用于所有由 _files_ 匹配的文件。
- _languageOptions_： 一个包含与 _JavaScript_ 的 _lint_ 设置有关的设置对象。
  - _ecmaVersion_： 支持的 _ECMAScript_ 版本。可能是任何年份（例如，_2022_）或版本（例如，_5_）。设置为 "_latest_" 表示最近支持的版本。（默认："_latest_"）
  - _sourceType_： _JavaScript_ 源码的类型。可能的值为 "_script_" 表示传统脚本文件，"_module_" 表示 _ECMAScript_ 模块（_ESM_），以及 "_commonjs_" 表示 _CommonJS_ 文件。（默认情况下 "_module_" 对应 ._js_ 和 ._mjs_ 文件，"_commonjs_" 对应 ._cjs_ 文件）
  - _globals_： 一个对象，指定在 _linting_ 过程中应添加到全局作用域的额外对象。
  - _parser_： 包含 _parse_( ) 方法或 _parseForESLint_( ) 方法的对象。（默认值为 _espree_）
  - _parserOptions_： 一个对象，指定直接传递给 _parser_ 上的 _parse_( ) 或 _parseForESLint_( ) 方法的额外选项。可用的选项依赖于解析器。
- _linterOptions_： 包含与 _linting_ 相关配置的对象。
  - _noInlineConfig_： 布尔值，指示是否允许内联配置。
  - _reportUnusedDisableDirectives_： 布尔值，控制是否报告未使用的 _eslint-disable_ 指令
- _processor_： 包含 _preprocess_( ) 和 _postprocess_( ) 方法的对象，或者指示插件内部处理器名称的字符串（例如，"_pluginName/processorName_"）。
- _plugins_： 包含插件名称到插件对象的名称-值映射的对象。当指定了 _files_ 时，这些插件仅对匹配的文件可用。
- _rules_： 包含具体配置规则的对象。当指定了 _files_ 或 _ignores_ 时，这些规则配置仅对匹配的文件可用。
- _settings_： 一个包含键值对信息的对象，这些信息应对所有规则都可用。

整体来讲，上面的配置项不算多，而且很多配置项我们在前面是已经接触过的。

下面是一些之前没有接触过的配置项：

globals：该配置项位于 languageOptions 配置项下面，用于配置一些全局的设定：

```js
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        var1: 'writable',
        var2: 'readonly',
      },
    },
  },
]
```

在上面的配置中，我们指定了 var1 这个变量是可写的，但是 var2 这个变量是只读的。
假设你有如下的代码

```js
var1 = 100
var2 = 200 // 报错
```

parsers：配置解析器。解析器的作用是负责将源码解析为抽象语法树。ESLint 默认使用的解析器为 Espree，但是你可以指定其他的 parser，parser 需要是一个对象，该对象里面包含了 parse 或者 parseForESLint 方法。

```js
import babelParser from '@babel/eslint-parser'
export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      parser: babelParser,
    },
  },
]
```

在上面的配置中，我们就指定了其他的 parser 来解析源码。

processor：这个是处理器，主要用于处理 ESLint 默认不能够处理的文件类型。举个例子，假设有一个 markdown 类型的文件，里面有一些 JS 代码，默认这些 JS 代码是不能够被 ESLint 处理的，通过添加额外的处理器，让 ESLint 能够对这些格式的文件进行 lint 检查

```js
import markdown from 'eslint-plugin-markdown'
export default [
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
    },
    processor: 'markdown/markdown',
    settings: {
      sharedData: 'Hello',
    },
  },
]
```
