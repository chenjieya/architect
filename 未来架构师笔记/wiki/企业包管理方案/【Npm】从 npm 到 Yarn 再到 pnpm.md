---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

在现代前端开发中，包管理器是不可或缺的工具。随着项目复杂度的增加，包管理器也在不断演进。本文将详细介绍 npm、Yarn 和 pnpm 三大主流包管理器，分析它们的优缺点及适用场景。

## 1. Yarn：速度与一致性的革新者

### 1.1 Yarn 诞生背景

Yarn 于 2016 年由 Facebook、Google、Exponent 和 Tilde 联合推出，旨在解决当时 npm 面临的几个核心问题：

#### 1.1.1 npm 的痛点

- **安装速度慢**：依赖按顺序下载，网络利用率低
- **版本不确定性**：不同时间安装可能得到不同的依赖版本
- **安全性问题**：允许包执行安装脚本，存在安全隐患
- **离线支持差**：无网络环境下无法安装依赖

#### 1.1.2 Yarn 的创新特性

```bash
# Yarn 的核心改进
1. 并行下载：显著提升安装速度
2. 确定性安装：yarn.lock 确保环境一致
3. 离线模式：本地缓存支持离线安装
4. 安全增强：默认禁用安装脚本
```

### 1.2 Yarn 基本使用

#### 1.2.1 安装与初始化

```bash
# 安装 Yarn
npm install -g yarn

# 初始化项目
yarn init
# 或快速初始化
yarn init -y
```

#### 1.2.2 常用命令对比表

| 操作         | npm 命令                        | Yarn 命令                | 说明                       |
| ------------ | ------------------------------- | ------------------------ | -------------------------- |
| 初始化项目   | `npm init`                      | `yarn init`              | 创建 package.json          |
| 安装所有依赖 | `npm install`                   | `yarn install`           | 安装 package.json 中的依赖 |
| 安装生产依赖 | `npm install <包名>`            | `yarn add <包名>`        | 添加到 dependencies        |
| 安装开发依赖 | `npm install <包名> --save-dev` | `yarn add <包名> --dev`  | 添加到 devDependencies     |
| 全局安装     | `npm install -g <包名>`         | `yarn global add <包名>` | 全局安装包                 |
| 卸载包       | `npm uninstall <包名>`          | `yarn remove <包名>`     | 移除依赖                   |
| 更新包       | `npm update <包名>`             | `yarn upgrade <包名>`    | 更新到最新版本             |
| 执行脚本     | `npm run <脚本>`                | `yarn run <脚本>`        | 运行 package.json 中的脚本 |
| 发布包       | `npm publish`                   | `yarn publish`           | 发布到注册表               |

### 1.3 yarn.lock 文件的作用

#### 1.3.1 确定性依赖管理

```json
// package.json 示例
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// yarn.lock 文件内容示例
lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
```

#### 1.3.2 与 package-lock.json 的区别

虽然 npm 5+ 也引入了锁文件，但两者有细微差别：

| 特性     | yarn.lock        | package-lock.json |
| -------- | ---------------- | ----------------- |
| 格式     | YAML             | JSON              |
| 生成策略 | 更严格，完全锁定 | 允许某些版本范围  |
| 兼容性   | 跨 yarn 版本兼容 | npm 特定格式      |
| 可读性   | 人类更易读       | 机器更易解析      |

### 1.4 Yarn 的版本演进

#### 1.4.1 Yarn 1.x (经典版)

```bash
# Yarn 1.x 特性
- Berry 架构前版本
- 基于 npm 注册表
- 主要解决 npm 的性能问题
```

#### 1.4.2 Yarn 2+ (Berry)

```bash
# Yarn 2+ 新特性
- 插件系统（Plug'n'Play）
- 零安装（Zero-Installs）
- 工作区改进（Workspaces）
- 更好的 Monorepo 支持
```

## 2. pnpm：下一代包管理器

### 2.1 pnpm 的核心优势

#### 2.1.1 革命性的存储架构

pnpm 通过巧妙的设计解决了传统包管理器的根本问题：

**三大核心优势：**

1. **极致的磁盘空间节省**：全局存储 + 硬链接
2. **彻底解决幽灵依赖**：严格的包隔离
3. **原生 Monorepo 支持**：高效的工作区管理

### 2.2 磁盘空间优化原理

使用 npm 时，如果你有 100 个项目都使用同一个依赖项，你会在磁盘上保存该依赖项的 100 份副本。而使用 pnpm，依赖项会存储在一个内容可寻址的存储中。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251231174942834.png)

#### 2.2.1 传统包管理器的问题

```bash
# 传统 npm/Yarn 安装方式（以 lodash 为例）
项目A: node_modules/lodash/      # 完整副本 1
项目B: node_modules/lodash/      # 完整副本 2
项目C: node_modules/lodash/      # 完整副本 3

# 结果：相同包被重复存储 N 次
```

#### 2.2.2 pnpm 的解决方案

```bash
# pnpm 安装方式
~/.pnpm-store/lodash@4.17.21/   # 全局唯一存储

项目A: node_modules/.pnpm/lodash@4.17.21/node_modules/lodash
       # ↑ 硬链接到全局存储

项目B: node_modules/.pnpm/lodash@4.17.21/node_modules/lodash
       # ↑ 硬链接到全局存储（不占额外空间）
```

#### 2.2.3 关键技术原理

**硬链接（Hard Links）**

是指多个文件名指向同一个物理文件数据块。这意味着，无论你通过哪个硬链接访问文件，看到的内容都是相同的。**删除一个硬链接不会影响其他硬链接，只有当所有硬链接都被删除后，文件数据才会真正从硬盘中移除**。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251231175025924.png)

```bash
# 硬链接特性
- 多个文件名指向同一个物理文件
- 删除一个链接不影响其他链接
- 所有链接被删除后文件才真正删除
- 在文件系统中表现为独立的文件
```

**符号链接（Symbolic Links）**

符号链接是一个特殊的文件，包含了指向另一个文件或目录的路径。它类似于**快捷方式**，访问符号链接时，操作系统会将其重定向到实际文件或目录。符号链接本身占用少量空间，但它指向的文件或目录仍然占据实际存储空间。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251231175050417.png)

```bash
# 符号链接特性
- 类似 Windows 的快捷方式
- 包含指向目标文件的路径
- 删除符号链接不影响原文件
- 原文件删除后符号链接失效
```

#### 2.2.4 版本差异化存储

```bash
# 不同版本的处理
~/.pnpm-store/lodash@4.17.21/   # 存储版本 4.17.21
~/.pnpm-store/lodash@3.10.1/    # 存储版本 3.10.1

# 优化：只存储版本间不同的文件
# 如果两个版本 90% 文件相同，只存储 10% 的差异
```

在 pnpm 中，硬链接解决“内容复用”，符号链接解决“依赖关系”，两者分工明确，和依赖层级没有任何对应关系。下面来做一个和 npm 安装包的对比：

两个项目 ProjectA 和 ProjectB，它们都依赖同一个库 libraryX。

**传统的 npm 安装方式**

ProjectA 和 ProjectB 都会在各自的 node_modules 文件夹中创建一个独立的 libraryX 目录，并且这些目录里**包含了相同的文件内容**。即使 libraryX 的版本完全相同，它们仍然会各自占用磁盘空间。

```bash
# 安装依赖
cd ProjectA

npm install libraryX

cd ../ProjectB
npm install libraryX

# 结果:
# ProjectA/node_modules/libraryX/ -> 这是一个完整的libraryX文件
# ProjectB/node_modules/libraryX/ -> 这是另一个完整的libraryX文件
```

这样，libraryX 的文件在磁盘上被重复存储了两次，即使它们的内容完全一样。

**pnpm 使用硬链接的方式**

当你使用 pnpm 安装 libraryX 时，pnpm 会将 libraryX 的文件存储在一个全局的内容地址存储（例如 ~/.pnpm-store）中，而不是在每个项目中都完整复制一份。

然后，pnpm 会为 ProjectA 和 ProjectB 中的 libraryX 创建硬链接。硬链接指向全局存储中的同一个物理文件，因此即使在 ProjectA 和 ProjectB 中都有 libraryX 的文件，这些文件在磁盘上只存储了一次。

```bash
# 使用 pnpm 安装依赖
cd ProjectA
pnpm install libraryX

cd ../ProjectB
pnpm install libraryX

# 结果:
# ~/.pnpm-store/libraryX/ -> 这是libraryX的实际物理文件，存储在全局内容地址存储中
# ProjectA/node_modules/libraryX/ -> 这是指向全局存储的硬链接
# ProjectB/node_modules/libraryX/ -> 这是另一个指向全局存储的硬链接
```

**符号链接的使用**

pnpm 在处理间接依赖时，会使用符号链接。

例如，假设 libraryX 本身依赖 libraryY，而 libraryY 也存储在全局内容地址存储中。此时 pnpm 会在 libraryX 中创建一个符号链接，指向全局存储中的 libraryY，而不是将 libraryY 的文件直接复制到 libraryX 中。这进一步减少了文件的重复存储。

```bash
# 符号链接示例:
# ProjectA/node_modules/libraryX/node_modules/libraryY -> 这是一个符号链接，指向全局存储中的libraryY
```

思考 🤔：如果不同的项目依赖同一个包（libraryX）的不同版本，应该怎么处理？

答案：在全局仓库下分别存储每个版本的 libraryX. 但是这里有一个优化，仅存储不同版本之间不同的文件。

### 2.3 幽灵依赖问题解决方案

#### 2.3.1 什么是幽灵依赖？

所谓幽灵依赖，是指当一个包（A）依赖于另一个包（B）时，后者会被放置在前者的 node_modules 目录中。这意味着一个包可能会意外地访问并使用另一个包的依赖，即使它没有在自己的 package.json 文件中声明这些依赖。

> 顺便说一句： 对于引入模块，是“向上逐级查找”。
> 假设文件在：
> `/project/src/index.js`
> 执行：
> `require('lodash')`
>
> 结果：
> /project/src/node_modules/lodash
> /project/node_modules/lodash
> /node_modules/lodash

```javascript
// 项目 package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// express 的 package.json
{
  "dependencies": {
    "body-parser": "^1.20.0"
  }
}

// 问题：项目可以直接使用 body-parser，但没有声明依赖
// 代码中可以直接 require('body-parser')
// 这就是幽灵依赖
```

#### 2.3.2 传统包管理器的问题

```bash
# npm/Yarn 的扁平化 node_modules
node_modules/
├── express/
└── body-parser/   # express 的依赖，但被提升到根目录

# 导致：项目可以访问未声明的依赖
```

#### 2.3.3 pnpm 的解决方案

```bash
# pnpm 的非扁平化结构
node_modules/
├── express -> .pnpm/express@4.18.0/node_modules/express
└── .pnpm/
    └── express@4.18.0/
        └── node_modules/
            ├── express
            └── body-parser   # 只在 express 的作用域内

# 结果：项目无法直接访问 body-parser
# require('body-parser') 会报错
```

### 2.4 Monorepo 原生支持

#### 2.4.1 工作区配置

```json
// pnpm-workspace.yaml
packages:
  # 所有在 packages/ 下的包
  - 'packages/**'
  # 不包括测试包
  - '!**/test/**'
  # 单独指定的包
  - 'components'
```

#### 2.4.2 依赖管理优化

```bash
# 工作区内的包引用
pnpm add @company/ui --filter @company/app
# 结果：将 @company/ui 作为 @company/app 的依赖

# 安装所有工作区依赖
pnpm install -r
```

### 2.5 pnpm 基本使用

#### 2.5.1 安装与配置

```bash
# 安装 pnpm
npm install -g pnpm

# 或使用独立脚本
curl -fsSL https://get.pnpm.io/install.sh | sh-

# 查看版本
pnpm --version

# 设置存储路径
pnpm config set store-dir ~/.pnpm-store
```

#### 2.5.2 常用命令

```bash
# 初始化项目
pnpm init

# 添加依赖
pnpm add lodash              # 生产依赖
pnpm add -D typescript       # 开发依赖
pnpm add -g pnpm             # 全局安装

# 安装所有依赖
pnpm install

# 更新依赖
pnpm update                  # 更新所有
pnpm update lodash           # 更新特定包

# 移除依赖
pnpm remove lodash

# 运行脚本
pnpm run dev
pnpm run build
```

#### 2.5.3 高级功能

```bash
# 查看存储信息
pnpm store path              # 显示存储路径
pnpm store status            # 检查修改的包
pnpm store prune            # 清理未使用的包

# 工作区命令
pnpm -r run build           # 在所有包中运行 build
pnpm --filter <包名> <命令> # 对特定包执行命令
```

### 2.6 实战演示

#### 2.6.1 创建 Vue 项目对比

```bash
# 使用 pnpm 创建两个 Vue 项目
pnpm create vue@latest my-vue-app1
pnpm create vue@latest my-vue-app2

# 检查存储情况
pnpm store path
# 输出: ~/.pnpm-store/v3

# 查看两个项目的 node_modules
ls -la my-vue-app1/node_modules/vue
ls -la my-vue-app2/node_modules/vue
# 会发现它们都是硬链接
```

#### 2.6.2 幽灵依赖测试

```javascript
// 测试项目结构
// package.json
{
  "name": "test-ghost",
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 测试文件 test.js
try {
  // 在 npm/Yarn 中能运行
  // 在 pnpm 中会报错
  require('body-parser');
  console.log('幽灵依赖存在！');
} catch (e) {
  console.log('幽灵依赖被阻止：', e.message);
}
```

## 3. 包隔离 vs 包提升

### 3.1 概念对比

pnpm 默认策略是**包隔离**，老牌的 npm 的默认策略是**包提升**。

- 包隔离：是指在项目中，每个依赖包都有自己独立的安装环境，这样可以避免不同依赖之间的冲突。这个概念尤其重要，当不同的依赖包需要相同的子依赖但不同版本时，如果没有良好的隔离机制，就可能导致依赖版本冲突，进而导致项目运行错误或行为异常。
- 包提升：是指将依赖关系中某些包提升到更高的目录层次，以减少冗余，**节省磁盘空间**。

#### 3.1.1 包隔离（pnpm 默认）

```bash
# 包隔离的特点
- 每个包在自己的作用域内
- 避免版本冲突
- 解决幽灵依赖
- 结构更复杂但更安全

# 示例：版本冲突场景
项目依赖：
- PackageA → lodash@4.x
- PackageB → lodash@3.x

# pnpm 处理：
.pnpm/lodash@4.x/node_modules/lodash
.pnpm/lodash@3.x/node_modules/lodash
```

#### 3.1.2 包提升（npm/Yarn 默认）

```bash
# 包提升的特点
- 扁平化 node_modules
- 可能节省空间（但不如 pnpm）
- 存在幽灵依赖风险
- 可能有版本冲突

# 示例：提升后的结构
node_modules/
├── lodash@4.x/    # 被提升的版本
├── PackageA/
│   └── node_modules/ # 空或只有非冲突依赖
└── PackageB/
    └── node_modules/
        └── lodash@3.x  # 降级到子目录
```

在没有包隔离的情况下，传统的包管理工具（例如 npm 早期版本）可能会尝试将 lodash 的一个版本提升到项目的 node_modules 根目录。如果 lodash@4.17.21 被安装在根目录下，那么 PackageB 依赖的 lodash@3.10.1 就会被忽略，导致 PackageB 无法正常运行。

而 pnpm 默认采用的就是包隔离策略，自然不存在上面的问题。

思考 🤔：包提升本质上是为了节省磁盘空间，pnpm 采用包隔离的话磁盘空间会有浪费么？

答案：不会，因为 pnpm 有全局的存储空间，最终不同版本的依赖都是存储在全局空间里面，本地项目通过硬链接连接到对应版本的包。

### 3.2 性能与存储对比

#### 3.2.1 磁盘空间使用

```bash
# 对比实验：安装相同的 10 个流行包

# npm/Yarn 7.x
总占用: ~200MB
重复文件: 约 30%

# pnpm
总占用: ~80MB
重复文件: 0%（硬链接）
实际磁盘占用: ~50MB
```

#### 3.2.2 安装速度对比

```bash
# 冷安装（无缓存）
npm: 120秒
yarn: 90秒
pnpm: 70秒

# 热安装（有缓存）
npm: 30秒
yarn: 20秒
pnpm: 5秒（硬链接优势）
```

### 3.3 兼容性与迁移

#### 3.3.1 从 npm/Yarn 迁移到 pnpm

```bash
# 迁移步骤
1. 备份现有 node_modules
2. 删除 node_modules 和锁文件
3. 安装 pnpm: npm install -g pnpm
4. 使用 pnpm install 重新安装
5. 更新 CI/CD 和文档

# 迁移命令示例
rm -rf node_modules package-lock.json yarn.lock
pnpm install
```

#### 3.3.2 常见兼容性问题

```json
// 问题 1：部分包依赖扁平化结构
// 解决方案：在 .npmrc 中配置
// .npmrc
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

// 问题 2：Node.js 版本兼容性
// pnpm 需要 Node.js 12.17+ 或 14+
```

## 4. 选择建议与最佳实践

### 4.1 各包管理器适用场景

#### 4.1.1 npm

```markdown
**适合场景：**

- 小型项目或原型开发
- 需要最大兼容性
- 团队成员熟悉 npm
- 无需考虑磁盘空间

**优点：**

- Node.js 原生支持
- 生态系统最完善
- 文档和社区资源最丰富

**缺点：**

- 性能相对较差
- 磁盘空间占用大
- 存在幽灵依赖问题
```

#### 4.1.2 Yarn

```markdown
**适合场景：**

- 中大型项目
- 需要稳定性和一致性
- 使用 Yarn Workspaces 的 Monorepo
- 需要良好的离线支持

**优点：**

- 安装速度快（并行下载）
- 确定性安装（yarn.lock）
- 优秀的 Workspaces 支持
- 插件生态系统

**缺点：**

- 仍有扁平化结构问题
- 存储效率不如 pnpm
- 配置相对复杂
```

#### 4.1.3 pnpm

```markdown
**适合场景：**

- 大型项目或企业应用
- 磁盘空间受限的环境
- 严格的依赖管理需求
- 复杂的 Monorepo 项目

**优点：**

- 极致的磁盘空间节省
- 彻底解决幽灵依赖
- 原生 Monorepo 支持
- 安装速度极快（热安装）

**缺点：**

- 生态系统相对较新
- 某些旧包可能有兼容性问题
- 学习曲线稍陡
```

### 4.2 迁移策略

#### 4.2.1 渐进式迁移

```bash
# 阶段 1：评估与测试
# 在开发环境试用 pnpm
pnpm install --ignore-scripts
pnpm run test

# 阶段 2：团队培训
# 分享 pnpm 的优势和使用方法
# 更新项目文档

# 阶段 3：全面迁移
# 更新 CI/CD 流水线
# 监控生产环境表现
```

#### 4.2.2 混合使用策略

```bash
# 在 package.json 中指定包管理器
{
  "packageManager": "pnpm@7.0.0",
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

### 4.3 性能优化建议

#### 4.3.1 pnpm 优化配置

```ini
# .npmrc 配置
# 设置存储路径（SSD 更佳）
store-dir=/ssd/.pnpm-store

# 网络优化
network-concurrency=16
fetch-retries=5
fetch-timeout=60000

# 缓存策略
prefer-offline=true
```

#### 4.3.2 CI/CD 优化

```yaml
# GitHub Actions 示例
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 7
      - uses: actions/setup-node@v3
        with:
          node-version: "16"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test
```

## 5. 未来趋势与总结

### 5.1 包管理器发展趋势

#### 5.1.1 当前状态

```markdown
**市场占有率：**

- npm: ~60% (Node.js 内置优势)
- Yarn: ~30% (大型项目偏爱)
- pnpm: ~10% (快速增长中)

**技术趋势：**

- 存储效率成为关键指标
- 安全性要求越来越高
- Monorepo 支持成为标配
- 开发者体验持续优化
```

#### 5.1.2 未来展望

```markdown
**可能的发展方向：**

1. **智能依赖分析**：基于使用情况的优化
2. **更好的多语言支持**：Rust、Python 等
3. **分布式缓存**：团队共享依赖缓存
4. **AI 优化**：智能依赖版本选择
```

### 5.2 总结建议

#### 5.2.1 个人开发者

```markdown
**推荐：pnpm**

- 节省磁盘空间（特别是笔记本）
- 避免依赖冲突
- 良好的开发体验
- 适合学习和实验
```

#### 5.2.2 中小团队

```markdown
**推荐：Yarn 或 pnpm**

- 根据项目复杂度选择
- 如果需要严格的依赖管理：选 pnpm
- 如果需要成熟的生态系统：选 Yarn
- 考虑团队熟悉度
```

#### 5.2.3 大型企业

```markdown
**强烈推荐：pnpm**

- 显著的存储成本节省
- 避免依赖相关的生产问题
- 优秀的 Monorepo 支持
- 长期维护成本更低
```

### 5.3 学习资源

#### 5.3.1 官方文档

- [npm 文档](https://docs.npmjs.com/)
- [Yarn 文档](https://yarnpkg.com/getting-started)
- [pnpm 文档](https://pnpm.io/zh/)

#### 5.3.2 性能对比工具

```bash
# 使用工具进行客观比较
npx @antfu/ni bench    # 安装速度测试
npx pnpm bench         # pnpm 内置基准测试
```

---

## 6. 结论

包管理器的选择应该基于项目需求、团队情况和长期维护成本。虽然 npm 作为 Node.js 的默认选择仍有其地位，但 Yarn 和 pnpm 在特定场景下提供了显著优势。对于新项目，特别是中大型项目，建议优先考虑 pnpm，它在磁盘空间、依赖管理和 Monorepo 支持方面提供了最佳的解决方案。

无论选择哪个包管理器，重要的是理解其工作原理，合理配置，并确保团队内部的一致性。随着前端生态的不断发展，包管理器将继续演进，为开发者提供更好的工具和体验。
