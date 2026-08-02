---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
本项目采用 Monorepo 架构进行管理，前端基于 Vue3 开发，后端使用 NestJS 实现。主要功能包括：

- [ ] 扫码登录
- [ ] 聊天室基础聊天（支持文字、文件与图片）
- [ ] 聊天室高级通讯（语音通话、视频通话、屏幕共享）
- [ ] AI集成

```js
monorepo
│
├─ apps
│  ├─ chat-room-web    # 网页端
│  └─ chat-room-serve  # 服务端
│
├─ packages
│
│  ├─ database   # 数据库链接
│  │   ├─ mysql
│  │   └─ redis
│  ├─ auth    # JWT授权认证
│  ├─ utils   # 辅助工具
│  ├─ api-contracts   # ts api相关 request response
│  ├─ config    # 配置文件
│  └─ types     # 共享ts 枚举 接口之类的
│
└─ pnpm-workspace.yaml
```

根目录下面的共享文件：

```shell
# 格式化相关
prettier

 # 测试相关
jest
ts-jest
@types/jest

 # 代码检查相关
eslint
@eslint/js
globals
typescript-eslint
@vue/eslint-config-typescript
eslint-plugin-vue
eslint-config-prettier
eslint-plugin-prettier

# 提交代码相关
"@commitlint/cli"
"@commitlint/config-conventional"
"lint-staged"
"husky"

# ts相关
typescript
ts-node
@types/node
```

packages包下面的共享文件：

```shell
esbuild
rollup
ts-node
```

特殊的`pnpm-workspace.yaml`文件

pnpm 支持 monorepo 模式的工作机制叫做 workspace(工作空间)。

它要求在代码仓的根目录下存有 pnpm-workspace.yaml 文件指定哪些目录作为独立的工作空间，这个工作空间可以理解为一个子模块或者 npm 包。本项目中的配置如下：

```yam
packsges
  - packsges/*
  - apps/*
```

## 1. 初始化项目

```npm
pnpm init
```

分别为项目创建对应的`package.json`文件

```shell
cd xxxx
pnpm init
```

检查ts继承是否生效：

`pnpm exec tsc --showConfig`

## 2. 配置ts的时候，导致nest项目中ts查找不到模块

## 3. git hooks

## 4. 网络请求的二次封装

## 5. 测试框架的引入(还未进行操作)

## 6. 网络请求的打包发布

## 7. NestJS认识中间件，守卫，拦截器，管道。

## 8. NestJS网络请求返回统一的格式
