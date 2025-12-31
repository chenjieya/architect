关于 babel 中如何创建自定义插件，官方是有一个 handbook：[https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)

- AST
- Babel处理代码流程
- 遍历

## 1. AST

开发者所书写的源码文件里面的代码，最终会被表现为一颗树结构

```js
function square(n) {
  return n * n
}
```

最终上面的代码，就会被转为如下的树结构：

```
- FunctionDeclaration:
  - id:
    - Identifier:
      - name: square
  - params [1]
    - Identifier
      - name: n
  - body:
    - BlockStatement
      - body [1]
        - ReturnStatement
          - argument
            - BinaryExpression
              - operator: *
              - left
                - Identifier
                  - name: n
              - right
                - Identifier
                  - name: n
```

上面的树结构如果使用 JS 来表示，结构如下：

```js
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```

你可以在 https://astexplorer.net/ 看到一段源码转换为的 AST

在上面的 JS 对象中，我们会发现每一层有一些相同的结构：

```js
{
	type: "FunctionDeclaration",
	id: {...},
	params: [...],
	body: {...}
}
```

```js
{
	type: "Identifier",
	name: ...
}
```

```js
{
	type: "BinaryExpression",
	operator: ...,
	left: {...},
	right: {...}
}
```

每一个拥有 type 属性的对象，我们可以将其称之为一个节点，那么一颗 AST 树实际上就是由成百上千个节点构成的。不同的节点有不同的类型，通过 type 来表示当前节点的类型。

除了 type 以外，还会有一些额外的属性，这些属性就提供了该节点额外的一些信息。

```js
{
  type: ...,
  start: 0,
  end: 38,
  loc: {
    start: {
      line: 1,
      column: 0
    },
    end: {
      line: 3,
      column: 1
    }
  },
  ...
}
```

## 2. Babel处理代码流程

Babel 对代码进行处理的时候，核心的流程就分为三步：

- 解析（parse）
- 转换（transform）
- 生成（generate）

### 2.1 解析（parse）

将接收到的源代码转为抽象语法树，这个步骤又分为两个小阶段：

- 词法分析
- 语法分析

所谓词法分析，就是将源码转为 token

```js
let i = 'Hello'
```

```
let、i、=、 "Hello"
```

转为 token 时，每一个 token 会包含一些额外的信息：

```js
n * n
```

会形成如下的 token：

```js
[
	{ type: { ... }, value: "n", start: 0, end: 1, loc: { ... } },
	{ type: { ... }, value: "*", start: 2, end: 3, loc: { ... } },
	{ type: { ... }, value: "n", start: 4, end: 5, loc: { ... } },
]
```

每一个 token 里面专门有一个 type 属性来描述这个 token：

```js
{
  type: {
    label: 'name',
    keyword: undefined,
    beforeExpr: false,
    startsExpr: true,
    rightAssociative: false,
    isLoop: false,
    isAssign: false,
    prefix: false,
    postfix: false,
    binop: null,
    updateContext: null
  },
  ...
}
```

形成一个一个 token 之后，接下来就会进入到语法分析阶段，该阶段就是将所得到的 token 转为 AST 树结构，便于后续的操作。

### 2.2 转换（transform）

目前我们已经得到了一颗 AST 树结构，接下来对这棵树进行一个遍历操作，在遍历的时候，就可以对树里面的节点进行一些添加、删除、更新等操作，这个其实就是 babel 转换代码的核心。

例如我们的一些插件，就是在转换阶段介入并进行工作的。

### 2.3 生成（generate）

经历过转换之后，你现在得到的树结构已经和之前不一样，接下来我们要做的事情，就是将这颗 AST 重新转为代码（字符串）

## 3. 遍历

在对 AST 进行遍历的时候，采用的是深度优先遍历，例如：

```js
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```

1. 于是我们从 _FunctionDeclaration_ 开始并且我们知道它的内部属性（即：_id，params，body_），所以我们依次访问每一个属性及它们的子节点。
2. 接着我们来到 _id_，它是一个 _Identifier_。_Identifier_ 没有任何子节点属性，所以我们继续。
3. 之后是 _params_，由于它是一个数组节点所以我们访问其中的每一个，它们都是 _Identifier_ 类型的单一节点，然后我们继续。
4. 此时我们来到了 _body_，这是一个 _BlockStatement_ 并且也有一个 _body_ 节点，而且也是一个数组节点，我们继续访问其中的每一个。
5. 这里唯一的一个属性是 _ReturnStatement_ 节点，它有一个 _argument_，我们访问 _argument_ 就找到了 \*BinaryExpression\*\*（二元表达式）。
6. _BinaryExpression_ 有一个 _operator_，一个 _left_，和一个 _right_。_Operator_ 不是一个节点，它只是一个值因此我们不用继续向内遍历，我们只需要访问 _left_ 和 _right_。

### 3.1 访问者

所谓访问者其实就是一个对象，该对象上面会有一些特殊的方法，这些特殊的方法会在你到达特定的节点的时候触发。

```js
const MyVisitor = {
  Identifier() {
    console.log('Called!')
  },
}
```

该访问者对象会在遍历这颗树的时候，当遇见 Identifier 节点的时候就会被调用。

例如上面的那颗 AST 树，我们只表示 type，表示出来的形式如下：

```js
;-FunctionDeclaration -
  Identifier(id) -
  Identifier(params[0]) -
  BlockStatement(body) -
  ReturnStatement(body) -
  BinaryExpression(argument) -
  Identifier(left) -
  Identifier(right)
```

因此在遍历上面这颗树的时候，Identifier 方法就会被调用四次。

有些时候我们可以针对特定的节点定义进入时要调用的方法，退出时要调用的方法

```js
const MyVisitor = {
  Identifier: {
    enter() {
      console.log('Entered!')
    },
    exit() {
      console.log('Exited!')
    },
  },
}
```

这里还是以上面的抽象语法树为例，整体的进入节点和退出节点的流程如下：

```js
进入 FunctionDeclaration
    进入 Identifier (id)
        走到尽头
    退出 Identifier (id)
    进入 Identifier (params[0])
        走到尽头
    退出 Identifier (params[0])
    进入 BlockStatement (body)
        进入 ReturnStatement (body)
            进入 BinaryExpression (argument)
                进入 Identifier (left)
                    走到尽头
                退出 Identifier (left)
                进入 Identifier (right)
                    走到尽头
                退出 Identifier (right)
            退出 BinaryExpression (argument)
        退出 ReturnStatement (body)
    退出 BlockStatement (body)
退出 FunctionDeclaration
```

现在你可能比较好奇的是访问者对象除了 Identifier 方法，还能够有哪些方法？

一般来讲，不同的节点类型就有节点 type 所对应的方法，例如：

- _Identifier(path, state)_: 这个方法在遍历到标识符节点时会被调用。
- _FunctionDeclaration(path, state)_: 这个方法在遍历到函数声明节点时会被调用。

至于节点究竟有哪些类型，可以参阅 estree：https://github.com/estree/estree/blob/master/es5.md

### 3.2 路径

AST 是由一个一个的节点组成的，但是这些节点之间并非孤立的，而是彼此之间有一些联系的。因此有一个 path 对象，该对象主要就是记录节点和节点之间的一些关系。path 对象里面不仅仅包含了节点本身的信息，还包含了节点和父节点、子节点、兄弟节点之间的关系。

这样做的好处在于我们使用了一个相对简单的对象来表示节点之间复杂关系，不需要在每个节点里面来保存节点之间关系的信息。

在实际编写插件的时候，我们经常就会利用 path 对象来获取节点的相关信息：

```js
const babel = require('@babel/core')
const traverse = require('@babel/traverse').default

const code = `function square(n) {
  return n * n;
}`

const ast = babel.parse(code)

// traverse 接收两个参数
// 第一个参数就是抽象语法树
// 第二个参数就是访问者对象
traverse(ast, {
  enter(path) {
    console.log(path.node.type)
  },
})
```

### 3.3 状态

在遍历和修改抽象语法树的时候，应该尽量避免全局状态的问题

例如，现在我们有一个需求，重命名一个函数的参数。

```js
let paramName // 存储函数参数名

const MyVisitor = {
  FunctionDeclaration(path) {
    const param = path.node.params[0] // 同 path 对象拿到当前节点的参数
    paramName = param.name // 将参数的名称存储到 paramName 里面（全局变量）
    param.name = 'x'
  },

  Identifier(path) {
    // 之后，进入到每一个 Identifier 类型的节点的时候
    // 判断当前节点的名称是否等于 paramName（之前的函数参数名称）
    if (path.node.name === paramName) {
      // 进行修改
      path.node.name = 'x'
    }
  },
}
```

上面的代码看上去没有什么问题，但是上面的代码可能在某些情况下不能够正常的工作。

例如在我们要转换的源码文件中就存在 paramName 这个变量，那么这段代码就会出现问题

为了解决这样的问题，我们需要避免全局状态，我们可以在一个访问者对象里面再定义一个访问者对象专门拿来存储状态。

```js
const updateParamNameVisitor = {
  Identifier(path) {
    if (path.node.name === this.paramName) {
      path.node.name = 'x'
    }
  },
}

const MyVisitor = {
  FunctionDeclaration(path) {
    const param = path.node.params[0]
    const paramName = param.name
    param.name = 'x'

    path.traverse(updateParamNameVisitor, { paramName })
  },
}

path.traverse(MyVisitor)
```

## 4. 自定义插件

要自定义 babel 的插件，实际上有一个固定的格式：

```js
module.exports = function (babel) {
  // 该函数会自动传入 babel 对象
  // types 也是一个对象，该对象上面有很多的方法，方便我们对 AST 的节点进行操作
  const { types } = babel
  return {
    name: '插件的名字',
    visitor: {
      // ...
      // 这里书写不同类别的方法，不同的方法会被进入不同类别的节点触发
    },
  }
}
```

### 4.1 示例一

创建一个自定义插件，该插件能够把 ES6 里面的 \*\* 转换为 Math.pow

在编写自定义插件的时候，会使用到 types 对象的一些方法：

- t.callExpression(callee, arguments)：这个函数用于**创建一个**表示<u>函数调用</u>的 _AST_ 节点。_callee_ 参数是一个表示被调用的函数的表达式节点，_arguments_ 参数是一个数组，包含了所有的参数表达式节点。

- _t.memberExpression(object, property, computed = false)_：这个函数用于**创建一个**表示<u>属性访问</u>的 **_AST_ 节点**。_object_ 参数是一个表示对象的表达式节点，_property_ 参数是一个表示属性名的标识符或表达式节点。_computed_ 参数是一个布尔值，表示属性名是否是动态计算的。

- _t.identifier( )_: 创建 AST 节点，只不过**创建**的是 identifier 类型的 **AST 节点**。

插件的核心，其实就是创建一些新的 AST 节点，去替换旧的 AST 节点。

插件的代码如下：

```js
// 该插件负责将 ** --> Math.pow
// 例如 2 ** 3 ---> Math.pow(2, 3)

module.exports = function (babel) {
  const { types: t } = babel

  return {
    name: 'transform-to-mathpow',
    visitor: {
      // 当你遍历 AST 节点的时候
      // 遍历到二元表达式的时候会自动执行该方法
      BinaryExpression(path) {
        // 二元表达式比较多
        // 5 + 3
        // 1 / 2
        // 检查当前的节点的运算符是否是 **
        // 如果不是，直接返回
        if (path.node.operator !== '**') {
          return
        }
        // 说明当前是 ** 我们要做一个替换操作
        // 首先需要生成新的 AST 节点，因为替换使用新的 AST 节点来替换的旧的 AST 节点

        // t.identifier("Math") // ---> Math
        // t.identifier("pow") // ---> pow

        // pow 需要作为 Math 的一个属性
        // Math.pow
        // t.memberExpress(t.identifier("Math"), t.identifier("pow"));

        const mathpowAstNode = t.callExpression(
          t.memberExpression(t.identifier('Math'), t.identifier('pow')),
          [path.node.left, path.node.right],
        )

        // 用新的 AST 节点替换旧的 AST 节点
        path.replaceWith(mathpowAstNode)
      },
    },
  }
}
```

在上面的代码中，我们就创建了一个自定义的插件，该插件首先对外暴露一个函数，该函数需要返回一个对象，对象里面就有访问器对象，访问器对象里面会有一些特定的方法，这些方法会在进入到特定的节点的时候被调用。

插件内部做的核心的事情：创建新的 AST 节点，然后去替换旧的 AST 节点。

### 4.2 示例二

编写一个自定义插件，该插件能够将箭头函数转为普通的函数。

```js
// a => {...}
// function(a){...}
module.exports = function (babel) {
  const { types: t } = babel

  return {
    name: 'transform-arrow-to-function',
    visitor: {
      // 当你的节点类型为箭头函数表达式的时候
      // 执行特定的方法
      ArrowFunctionExpression(path) {
        let body // 存储函数体

        if (path.node.body.type !== 'BlockStatement') {
          // 进入此 if，说明箭头函数是一个表达式，需要将 body 部分转为返回语句
          // a => b
          // function(a){return b}
          body = t.blockStatement([t.returnStatement(path.node.body)])
        } else {
          // 可以直接使用箭头函数的方法体
          body = path.node.body
        }
        // 该方法创建一个普通函数表达式的 AST 节点（  function(){} ）
        const functionExpression = t.functionExpression(
          null, // 函数名
          path.node.params, // 函数参数，和箭头函数的参数是一致的
          body, // 函数方法体
          false, // 不是一个生成器函数
          path.node.async, // 是否是异步函数，和箭头函数是一致的
        )

        path.replaceWith(functionExpression)
      },
    },
  }
}
```
