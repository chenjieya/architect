对于组件库这样的复杂项目，首先肯定将其拆分为多个子包的必要性。我们先举一个普通的模块划分思路。

- **components 包**，作为组件库的主要代码，实现各个 UI 组件的核心逻辑。
- **shared 包**，主要存放各种杂七杂八的工具方法。
- **plugins 包**，可以实现组件库的周边插件(比如构建工具插件等)。
- **theme 包**，实现组件库的主题样式定制方案。
- **cli 包**，实现组件库模板脚手架的命令行工具。
- **docs 包**，组件库的示例 demo 与使用文档。
- **playground 包**，组件库的在线编辑、演示应用。

将这些不同的模块拆分出来是非常必要的。因为组件库项目作为前端基础设施，往往期望得到长期的迭代与维护，通过这种方式可以不断积累工程能力，使得后续开发周边产品时能够有现成的轮子使用。模块划分的越清晰，复用时的灵活性、可操作性就越强，每个模块产物的体积也会越轻量。

很自然的思路，就是每一个模块建立一个代码仓进行管理，这就是传统的 mutirepo 思路。在这种分散管理的模式下，每一个包都有其独立的版本号、配置、发布流程。

但是我们要注意到，这些子包之间往往是互相依赖的，先假设有以下依赖关系：

```
docs --> components --> shared
```

假如我更新了 shared 包中的工具方法，我当然希望依赖 shared 的 components 包也能立即适应更新，并即刻反馈在 docs 包的 demo 示例中。但是很可惜，在传统的 mutirepo 模式下，我们必须先发布 shared 包，再更新 components 包中的依赖版本，接下来执行 components 包的发布，最后升级 docs 项目中的依赖，才能够查看到更新后的效果，这个过程在顺序上不能出现失误，否则只能废弃这个版本号重新发布。更难受的是，如果我们的修改不到位，再次微调仍然要走一遍发布流程。

另一方面，这些包虽然功能不同，但是它们的项目配置、构建流程、发布流程是不是也有很多相似之处。分散在多个代码仓中，对于许多相似的配置，免不了一顿复制粘贴，一旦我有整体性修改 CI 流程的需求，是不是也要分别修改多个仓，再分别验证其正确性？

**monorepo 正是解决了这两个多仓模式下的最大痛点，才在现今的前端工程化中成为主流方案**——在一个代码仓中，任意一个模块发生修改，另一个模块能够立即反馈而不用走繁琐的发布和依赖更新流程；各个模块之间也能够充分复用配置、CI 流程的脚本；各个包的版本和互相之间的依赖关系得到集中管理。

## 1. monorepo 适用案例

下面列举几个 monorepo 的适用案例。你会发现几乎所有场景都能适应 monorepo 的思路。

### 1.1 核心库与周边适配器

**例子**：

- 前端框架 Vue
- 富文本编辑器 CKEditor
- 原子化样式方案 UnoCSS

```
├── packages
|   ├── core
|   ├── adapterA
|   ├── adapterB
|   ├── pluginA
|   ├── pluginB
|   ├── ...
├── package.json
```

### 1.2 UI 组件库

**例子**：

- element-plus
- TinyVue
- Varlet

```
├── packages
|   ├── Button
|   ├── Input
|   ├── Checkbox
|   ├── Card
|   ├── Dialog
|   ├── ...
├── package.json
```

### 1.3 常规 Web 应用

即使是传统 Web 应用，采用 monorepo 模式也有利于代码的复用，促使团队成员以组件化的思想进行开发，不断抽离公共模块，产生技术沉淀。

```
├── packages
|   ├── portal    # 门户网站
|   ├── mis       # 管理后台
|   ├── mobile    # 移动端网站
|   ├── docs      # 开发文档
|   ├── shared    # 公共库
|   ├── api       # API 层
|   ├── ...       # 监控埋码、Nodejs 服务、更多公共模块...
├── package.json
```

## 2. 包管理基础 package.json

monorepo 的重点在与单仓多包管理，这自然地引出了包管理这一概念。包管理是处理模块之间依赖关系的核心，在当今的开源模式下，几乎没有任何的项目在开发过程中不需要引用他人发布的公共模块，缺少成熟的包管理机制，我们就只能通过源码拷贝的方式去复用他人的产出。

在开始下一步思考和行动前，我建议大家先对“什么是包”建立概念——即对包的配置文件 package.json 有一定了解，否则可能难以理解后续操作的意义。

一个包或者子模块不一定发布到 npm 仓库，但一定有 package.json 文件。package.json 所在的目录就代表了一个模块/包，这个 json 文件定义了模块的各种配置，例如基本信息、依赖关系、构建配置等等。所有包管理器(npm/yarn/pnpm)以及绝大多数构建工具都会依赖于这个配置文件的信息。

package.json 中的字段并没有一个绝对统一的标准，除了官方约定的部分标准字段外，很多字段其实是特定的工具约定的，所以我们分析配置的时候，要明确一个关键点，即这个字段到底由谁读取。

参考：

1. [[【Npm】npm回顾]]
2. [[【Npm】npm进阶指令]]
3. [[【Npm】包描述文件]]
4. [[【Npm】发布npm包]]

## 3. pnpm 包管理

### 3.1 选型理由

monorepo 的单仓分模块的要求，使得仓库内的模块不仅要处理与外部模块的关系，还要处理内部之间相互的依赖关系。因此我们需要选择一个强大的包管理工具帮助处理这些任务。

目前前端包管理的根基是 npm，在其基础上衍生出了 yarn、pnpm。在 2022 年以后，我们推荐使用 pnpm 来管理项目依赖。pnpm 覆盖了 npm、yarn 的大部分能力，且多个维度的体验都有大幅度提升。

**pnpm 是一款快速、高效使用磁盘空间的包管理器。**

它具有以下优势：

1. **速度快**：多数场景下，安装速度是 npm/yarn 的 2 - 3 倍。
2. **基于内容寻址**：硬链接节约磁盘空间，不会重复安装同一个包，对于同一个包的不同版本采取增量写入新文件的策略。
3. **依赖访问安全性强**：优化了 node_modules 的扁平结构，提供了限制依赖的非法访问(幽灵依赖)的手段。
4. **支持 monorepo**：自身能力就对 monorepo 工程模式提供了有力的支持。在轻量场景下，无需集成 lerna、Turborepo 等工具。

### 3.2 workspace 模式

pnpm 支持 monorepo 模式的工作机制叫做 workspace(工作空间)。

它要求在代码仓的根目录下存有 pnpm-workspace.yaml 文件指定哪些目录作为独立的工作空间，这个工作空间可以理解为一个子模块或者 npm 包。

例如以下的 pnpm-workspace.yaml 文件定义：a 目录、b 目录、c 目录下的所有子目录，都会各自被视为独立的模块。

```yaml
packages:
  - a
  - b
  - c/*
```

```
📦my-project
 ┣ 📂a
 ┃ ┗ 📜package.json
 ┣ 📂b
 ┃ ┗ 📜package.json
 ┣ 📂c
 ┃ ┣ 📂c-1
 ┃ ┃ ┗ 📜package.json
 ┃ ┣ 📂c-2
 ┃ ┃ ┗ 📜package.json
 ┃ ┗ 📂c-3
 ┃   ┗ 📜package.json
 ┣ 📜package.json
 ┣ 📜pnpm-workspace.yaml
```

需要注意的是，pnpm 并不是通过目录名称，而是通过目录下 package.json 文件的 name 字段来识别仓库内的包与模块的。

### 3.3 中枢管理操作

在 workspace 模式下，代码仓根目录通常不会作为一个子模块或者 npm 包，而是**主要作为一个管理中枢，执行一些全局操作，安装一些共有的依赖。** 下面介绍一些常用的中枢管理操作。

- 创建一个 package.json 文件。

```bash
pnpm init
```

- 设置用户的全局 .npmrc 配置

```bash
pnpm config set <key> <value>
```

- 根据当前目录 package.json 中的依赖声明安装全部依赖，在 workspace 模式下会一并处理所有子模块的依赖安装。

```bash
pnpm install
```

- 安装项目公共开发依赖，声明在根目录的 package.json - devDependencies 中。-w 选项代表在 monorepo 模式下的根目录进行操作。每个子包都能访问根目录的依赖，适合把 TypeScript、Vite、eslint 等公共开发依赖装在这里。

```bash
pnpm install -wD xxx
```

- 卸载公共依赖，在根目录的 package.json - devDependencies 中删去对应声明

```bash
pnpm uninstall -w xxx
```

- 执行根目录的 package.json 中的脚本

```bash
pnpm run xxx
```

### 3.4 子包管理操作

在 workspace 模式下，pnpm 主要通过 --filter 选项过滤子模块，实现对各个工作空间进行精细化操作的目的。

#### 3.4.1 为指定模块安装外部依赖。

下面的例子指为 a 包安装 lodash 外部依赖。同样的道理，-S 和 -D 选项分别可以将依赖安装为正式依赖(dependencies)或者开发依赖(devDependencies)。

```bash
# 为 a 包安装 lodash
pnpm --filter a i -S lodash
pnpm --filter a i -D lodash
```

#### 3.4.2 指定内部模块之间的互相依赖。

指定模块之间的互相依赖。下面的例子演示了为 a 包安装内部依赖 b。

```bash
# 指定 a 模块依赖于 b 模块
pnpm --filter a i -S b
```

pnpm workspace 对内部依赖关系的表示不同于外部，它自己约定了一套 Workspace 协议 (workspace:)。下面给出一个内部模块 a 依赖同是内部模块 b 的例子。

```json
{
  "name": "a",
  // ...
  "dependencies": {
    "b": "workspace:^"
  }
}
```

在实际发布 npm 包时，workspace:^ 会被替换成内部模块 b 的对应版本号(对应 package.json 中的 version 字段)。替换规律如下所示：

```json
{
  "dependencies": {
    "a": "workspace:*", // 固定版本依赖，被转换成 x.x.x
    "b": "workspace:~", // minor 版本依赖，将被转换成 ~x.x.x
    "c": "workspace:^" // major 版本依赖，将被转换成 ^x.x.x
  }
}
```

#### 3.4.3 过滤的高级用法

用 --filter 过滤出目标工作空间集合后，不仅支持 install 安装依赖，run(执行脚本)、publish(发布包) 等绝大多数包管理操作都能够执行。

```bash
# 发布所有包名为 @a/ 开头的包
pnpm --filter @a/* publish
```

当 --filter 筛选出多个包时，默认情况下，它会首先分析多个包之间的内部依赖关系，按照依赖关系拓扑排序的顺序对这些包执行指令，即按依赖树从叶到根的顺序。例如下图所示的依赖关系中，执行顺序为 C -> D -> B -> A。

```
A --> B --> C
      B --> D
```

--filter 的还有更多超乎我们想象的能力，它支持依赖关系筛选，甚至支持根据 git 提交记录进行筛选。

```bash
# 为 a 以及 a 的所有依赖项执行测试脚本
pnpm --filter a... run test
# 为 b 以及依赖 b 的所有包执行测试脚本
pnpm --filter ...b run test

# 找出自 origin/master 提交以来所有变更涉及的包
# 为这些包以及依赖它们的所有包执行构建脚本
# README.md 的变更不会触发此机制
pnpm --filter="...{packages/**}[origin/master]" --changed-files-ignore-pattern="**/README.md" run build

# 找出自上次 commit 以来所有变更涉及的包
pnpm --filter "...[HEAD~1]" run build
```

更多 pnpm 使用方面的细节还需自行查阅官方文档：[pnpm 官方文档](链接)。

## 4. 子模块划分

分析了那么多选型理由，积累了那么多前置知识，接下来马上就要投入实战环节了。但是在此之前，还要先确定自己的组件库要按什么样的规则划分模块。

我们将按照 element-plus 的思路将组件库拆分为多个模块，但更近一步的是，我们要尝试对 UI 组件的 components 包进一步拆分到单个组件的粒度，将每一个 UI 组件都作为一个独立的模块发包。

为什么要这么做呢？这来源于一个实际的需求：很多项目不希望全量引入组件库。这个需求主要有以下两方面的考虑：

1. **项目仅仅使用组件库的个别组件，不希望全量引入，增大产物体积(其实按需引入、摇树机制可以规避)。**
2. **组件库的维护者往往会做整体更新，但是项目维护者却只希望最小限度变更。例如项目方面需要 Button 组件修复一个问题，仅仅希望升级这个 Button 组件，而不要升级其他无关组件，以免带来更多的风险。**

我们为这个示例组件库起名为 alvis-ui。在我们的组件库正式投入开发前，我们先确定以下模块划分思路。这个思路可能会随着后续需求的增加不断地调整。

```
alvis-ui
├── docs          # 组件库文档 demo 模块
├── packages      # 组件库的各个实现模块放在 packages 目录下
|   ├── button    # 按钮组件
|   ├── input     # 输入框组件
|   ├── form      # 表单组件
|   ├── theme     # 组件库的样式与主题
|   ├── ...       # 更多 UI 组件
|   ├── ui        # 归纳各个 UI 组件的入口，即组件库的主包
|   ├── shared    # 其他工具方法
├── package.json
```

## 5. 初始化 monorepo 工程

事不宜迟，我们开始进入实战环节吧！

我们默认各位已经装好了开发环境，Node.js 与 npm 都可以正常工作，首先通过 `npm i -g pnpm` 安装好 pnpm，后续包管理相关的命令一律使用 pnpm 执行。

接下来创建我们的工程吧！

```bash
mkdir alvis-ui
cd alvis-ui
pnpm init
```

在项目根目录中生成了 packages.json 文件，但是根目录并不是任何一个模块，它将作为整个组件库 monorepo 项目的管理中枢。我们把对这个 package.json 中 name 以外的字段都删去，后续我们要根据自己的需要自定义。

```diff
{
  "name": "alvis-ui",
- "version": "1.0.0",
- "description": "",
- "main": "index.js",
- "scripts": {
-   "test": "echo \"Error: no test specified\" && exit 1"
- },
- "keywords": [],
- "author": "",
- "license": "ISC"
}
```

之后，我们在根目录下创建 pnpm-workspace.yaml 文件，这个文件的存在本身，会让 pnpm 要使用 monorepo 的模式管理这个项目，他的内容告诉 pnpm 哪些目录将被划分为独立的模块，这些所谓的独立模块被包管理器叫做 workspace(工作空间)。我们在这个文件中写入以下内容。

```yaml
packages:
  # 根目录下的 docs 是一个独立的文档应用，应该被划分为一个模块
  - docs
  # packages 目录下的每一个目录都作为一个独立的模块
  - packages/*
```

那么我们开始实际建立这些工作空间，并将根目录下的 package.json 文件复制到每个工作空间中。为了方便演示，暂时只建立 UI 组件 button(按钮)、input(输入框) 以及公共方法模块 shared。这里展示出完成操作后的目录树：

```
📦alvis-ui
 ┣ 📂docs
 ┃ ┗ 📜package.json
 ┣ 📂packages
 ┃ ┣ 📂button
 ┃ ┃ ┗ 📜package.json
 ┃ ┣ 📂input
 ┃ ┃ ┗ 📜package.json
 ┃ ┗ 📂shared
 ┃   ┗ 📜package.json
 ┣ 📜package.json
 ┣ 📜pnpm-workspace.yaml
 ┗ 📜README.md
```

### 5.1 设置 package.json

接下来，我们要明确每一个模块的属性，设置它们的 package.json 文件。

**注意**：下面例子中的注释只是为了方便讲解，实操请务必删除注释，带有注释的 package.json 会在执行命令时报错。

#### 5.1.1 根目录的 package.json

```json
// alvis-ui/package.json
{
  "name": "alvis-ui",
  "private": true,
  "scripts": {
    // 定义脚本
    "hello": "echo 'hello world'"
  },
  "devDependencies": {
    // 定义各个模块的公共开发依赖
  }
}
```

- `private: true`：根目录在 monorepo 模式下只是一个管理中枢，它不会被发布为 npm 包。
- `devDependencies`：所有模块都会有一些公共的开发依赖，例如构建工具、TypeScript、Vue、代码规范等，将公共开发依赖安装在根目录可以大幅减少子模块的依赖声明。

#### 5.1.2 组件包的 package.json

这里只举一个组件的例子，其他组件包的配置除了 name 以外大体相同。

```json
// alvis-ui/packages/button/package.json
{
  // 标识信息
  "name": "@openxui/button",
  "version": "0.0.0",

  // 基本信息
  "description": "",
  "keywords": ["vue", "ui", "component library"],
  "author": "OpenX",
  "license": "MIT",
  "homepage": "https://github.com/gkn1234/alvis-ui/blob/master/README.md",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/gkn1234/alvis-ui.git"
  },
  "bugs": {
    "url": "https://github.com/gkn1234/alvis-ui/issues"
  },

  // 定义脚本，由于还没有集成实际的构建流程，这里先以打印命令代替
  "scripts": {
    "build": "echo build",
    "test": "echo test"
  },

  // 入口信息，由于没有实际产物，先设置为空字符串
  "main": "",
  "module": "",
  "types": "",
  "exports": {
    ".": {
      "require": "",
      "module": "",
      "types": ""
    }
  },

  // 发布信息
  "files": ["dist", "README.md"],
  // "publishConfig": {},

  // 依赖信息
  "peerDependencies": {
    "vue": ">=3.0.0"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

- `name`：组件统一发布到 @openxui 坐标下，有坐标限制了命名空间，组件的名称可以尽可能简单。
- `files`：我们规定每个包的产物目录为 dist，此外还要一并发布 README.md 文档。
- `publishConfig`：如果我们需要发布到私有 npm 仓，请取消 publishConfig 的注释并根据实际情况填写。
- `peerDependencies`: 既然是使用 vue3 的组件库，我们需要正确声明主框架的版本。这里不将 vue 放入 dependencies 是因为用户项目同样也直接依赖 vue 框架，这样可能造成依赖版本不同的风险。这就是为什么周边库、插件总是要把主框架声明为 peerDependencies 的原因，我们的组件库也不例外。
- `dependencies`：项目的运行依赖都安装在这里。一般不容易或是不介意出现版本冲突的依赖都放在这里。比如 lodash 这样的工具方法库，即使版本冲突出现多实例的现象，也不会出现问题。
- `devDependencies`：大部分开发依赖都会被定义在根目录下，这里只会声明特有的、本模块专属的开发依赖。比如某个特定的 Vite 插件。

#### 5.1.3 项目文档的 package.json

```json
// alvis-ui/docs/package.json
{
  "name": "@openxui/docs",
  "private": true,
  "scripts": {
    // 定义脚本，由于还没有集成实际的构建流程，这里先以打印命令代替
    "dev": "echo dev",
    "build": "echo build"
  },
  "dependencies": {
    // 安装文档特有依赖
  },
  "devDependencies": {
    // 安装文档特有依赖
  }
}
```

- `private: true`：项目文档的 packages.json 与根目录类似，它同样不需要被发布到 npm 仓库。
- `dependencies 和 devDependencies`：由于不涉及发包，因此依赖声明无需仔细考量，安装到那个里面效果都是一样的。不过还是建议大家还是按照“实际的含义”来决定安装类型。
