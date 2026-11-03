---
author: ai
ai_editable: true
summary: 定位 nest 的品牌、项目入口与第三方配置，说明 Vite 构建、PWA 缓存及现有 Docker 和 CI 行为。
refs:
  pages:
    - '【nest】00-项目定位与阅读地图'
    - '【nest】01-现有架构与运行链路'
    - '【nest】03-改造边界与演进方向'
  raw: []
updated_by: ai
updated: 2026-11-03
source_commit: 869cf47e9a41eac0839828f39cbc0a535d5c3a5b
---

## 1. nest：配置构建与部署

> 文档内容遵循 [md-output 规范](C:/Users/admin/.codex/skills/md-output/SKILL.md)；标题层级与编号以知识库 AGENTS.md 及其格式化脚本为准。

[TOC]

---

### 1.1 修订记录

| 编号 | 版本 |  修订人  | 修订内容                             | 日期       |
| :--: | :--- | :------: | :----------------------------------- | :--------- |
| 001  | 1.0  | jie.chen | 整理配置入口、构建发布方式及核验边界 | 2026-11-03 |

---

### 1.2 配置入口

| 配置                                                            | 主要消费位置                      | 说明                               |
| :-------------------------------------------------------------- | :-------------------------------- | :--------------------------------- |
| `VITE_SITE_NAME`                                                | `index.html`、`vite.config.js`    | 浏览器标题、PWA name 与 short_name |
| `VITE_SITE_DES`、`VITE_SITE_KEYWORDS`                           | HTML 元信息，描述也用于 PWA       | 简介与关键词                       |
| `VITE_SITE_AUTHOR`、`VITE_SITE_URL`                             | HTML、Footer、Message、Main/Right | 作者、链接及当前大字标识来源       |
| `VITE_SITE_LOGO`、`VITE_SITE_MAIN_LOGO`、`VITE_SITE_APPLE_LOGO` | HTML、Message                     | 浏览器、主页、Apple 图标           |
| `VITE_DESC_*`                                                   | `Message.vue`                     | 默认简介与打开扩展面板后的文案     |
| `VITE_WEATHER_KEY`                                              | `Weather.vue`                     | 决定高德分支还是备用接口分支       |
| `VITE_SITE_START`、`VITE_SITE_ICP`                              | Footer、TimeCapsule               | 建站时间与备案展示                 |
| `VITE_SONG_API/SERVER/TYPE/ID`                                  | Func、Music、API                  | 音乐服务、来源、查询类型、歌单 ID  |
| `siteLinks.json`                                                | `Links.vue`                       | 项目卡片数据                       |
| `socialLinks.json`                                              | `SocialLinks.vue`                 | 社交入口数据                       |

`.env.example` 是模板，`.env` 被 Git 忽略；当前检查时项目根目录没有 `.env`。`VITE_*` 被用于客户端产物，不能作为服务端私密配置存放处。文档不记录任何真实密钥。

设置页只维护访客浏览器中的偏好，不修改上述环境变量或 JSON。详细状态边界见 [[【nest】01-现有架构与运行链路]]。

#### 1.2.1 项目入口数据契约

当前仅有 3 个字段，下面是格式示例，域名不是用户真实项目：

```json
{
  "icon": "Blog",
  "name": "项目示例",
  "link": "https://example.com/"
}
```

`icon` 不是图片路径，而是 `Links.vue` 的 `siteIcon` 映射键。新增图标要同步组件中的 import 与映射。每 6 条形成一页，当前没有分类、搜索、项目介绍、稳定 ID 或内容校验机制；数组为空时整个列表隐藏。

#### 1.2.2 品牌名与域名的区别

浏览器标题读取 `VITE_SITE_NAME`，但桌面 `Message.vue` 与移动端 `Main/Right.vue` 的大字标识来自 `VITE_SITE_URL.split('.')`，只显示前两段。

因此，把 `VITE_SITE_NAME` 改成 `nest` 不会同步改变大字标识；把域名改成单独的 `nest` 又可能显示 `.undefined`。后续应为品牌文本建立明确来源，域名只承担地址职责。详见 [[【nest】03-改造边界与演进方向]]。

---

### 1.3 开发与构建

现有仓库提供 `pnpm-lock.yaml`（lockfileVersion 为 9.0），README 使用 pnpm，但 `package.json` 没有 `packageManager` 或 `engines`。下面是基于现有脚本的操作参考，本次未执行安装或构建；具体 Node、pnpm 组合仍需在实施时固定和验证。

```powershell
Set-Location -LiteralPath 'C:\Users\admin\Desktop\code\token\home'

# 仅首次创建，保留已有配置
if (-not (Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}

# 编辑 .env 和 src/assets 中的 JSON 后执行
pnpm install --frozen-lockfile
pnpm dev
```

`dev` 实际执行 `vite --host`，配置端口为 3000，`open: true` 会尝试打开浏览器。

```powershell
pnpm build
pnpm preview
```

`build` 执行 `vite build`，输出到默认 `dist/`；`preview` 用于检查构建产物。`vite.config.js` 使用 Terser，并配置移除 `console.log` 调用；这不等同于所有 console 输出都被移除。压缩插件同时生成压缩资源，实际是否以压缩版本传输还取决于静态服务配置。

现有 `pnpm lint` 带 `--fix`，会修改源码；`pnpm format` 也会写入 `src/`。若只做只读检查，可在安装依赖后执行：

```powershell
pnpm exec eslint src --ext .js,.vue
```

仓库没有声明单元测试、E2E、类型检查脚本，也没有业务 TypeScript 检查链路。文档整理阶段不应把未执行的检查标成通过。

---

### 1.4 现有发布方式

#### 1.4.1 静态托管

可把 `dist/` 的内容交给静态文件服务器。应用没有业务 API 服务进程，天气、音乐和一言由浏览器直接访问外部服务。

当前图标、壁纸、字体路径及 PWA `start_url` 大量使用 `/` 开头的根路径，Vite 未设置部署子路径 `base`。不能假设直接放到 `/nest/` 子目录就可正常访问；需要同时检查构建 base、public 资源引用与 PWA 配置。

#### 1.4.2 Docker

`Dockerfile` 是双阶段构建：

1. `node:18` 中通过 `npm install` 安装依赖，复制配置模板后执行 `npm run build`。
2. `node:18-alpine` 中复制 `dist`，全局安装 `http-server`。
3. 通过 `http-server dist -p 12445` 提供静态访问。

`docker-compose.yml` 将宿主机 12445 映射到容器 12445。可从源码根目录执行以下现有配置命令，但本次未构建镜像或启动容器：

```powershell
docker compose up -d --build
```

Docker 中的 Node 仅用于构建和静态文件服务，不代表存在 NestJS 或其他业务后端。源码记录的 `node:18` 是现状，不是本文对运行时版本的选型结论。

#### 1.4.3 GitHub Actions

`.github/workflows/build.yml` 在 `dev` 或 `master` 分支 push 时触发，在 `windows-latest` 上使用 Node 18.x、`npm install` 与 `npm run build`，最后上传名为 `Home` 的 `dist` artifact。

该工作流实现了构建和产物上传，没有配置把产物发布到用户服务器、绑定域名或执行健康检查的步骤。后续是否采用 GitHub Actions 发布，需要另行确定实际托管方式。

#### 1.4.4 构建一致性

本地 README 使用 pnpm 且存在 pnpm 锁文件，但 Docker 与 CI 使用 npm。仓库没有 `package-lock.json`；这两条 npm 安装路径不使用现有 pnpm 锁文件，依赖解析可能与本地不同。后续应统一包管理器、版本和锁文件执行方式。

---

### 1.5 PWA 与缓存

`VitePWA` 配置 `registerType: autoUpdate`，Workbox 开启 `skipWaiting`、`clientsClaim`，运行时缓存规则为：

| 匹配资源                 | 策略       | 缓存名         |
| :----------------------- | :--------- | :------------- |
| JS、CSS、woff/woff2、ttf | CacheFirst | `js-css-cache` |
| 常见图片后缀             | CacheFirst | `image-cache`  |

Manifest 的 name、short_name、description 来自环境变量，图标列表在配置中写死为 `/images/icon/*.png`。`main.js` 监听 `controllerchange`，提示“站点已更新，刷新后生效”。

自动更新服务工作线程不等于立即替换当前页面全部资源，也不等于第三方接口离线可用。固定路径图标和壁纸在更名后需要检查旧缓存是否仍生效；未配置接口响应的专门离线回退逻辑。

---

### 1.6 后续实施时的验证范围

1. 固定工具版本，验证锁文件安装、生产构建和只读 lint。
2. 同时检查桌面和移动端品牌、卡片跳转、设置面板。
3. 检查无歌单、空项目列表、第三方请求失败、背景图片失败场景。
4. 检查浏览器标题、PWA 名称、所有图标及旧缓存更新。
5. 按真实部署根路径或子路径验证静态资源，不用开发服务成功替代生产验收。

本文描述配置事实与验证路径，不包含上线结果。后续工作边界见 [[【nest】03-改造边界与演进方向]]。
