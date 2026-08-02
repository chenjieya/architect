---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

在企业开发中，搭建私有 npm 服务器对于代码安全性和开发效率至关重要。Verdaccio 是目前最流行的 npm 私有仓库解决方案之一。

## 1. 为什么需要私有 npm 服务器？

### 1.1 企业开发痛点

#### 1.1.1 代码安全与私密性

- 保护企业内部代码资产
- 防止商业机密泄露
- 符合企业安全合规要求

#### 1.1.2 性能与效率

- 局域网内高速下载
- 减少对外网依赖
- 提升 CI/CD 构建速度

#### 1.1.3 管理与维护

- 精细化权限控制
- 统一依赖管理
- 审计与追踪能力

#### 1.1.4 成本考虑

- 避免 npm 私有包付费（$7/用户/月）
- 控制第三方服务依赖
- 自主可控的架构

## 2. Verdaccio 简介

### 2.1 什么是 Verdaccio？

Verdaccio 是一个轻量级的私有 npm 代理注册表，具有以下核心特点：

- **轻量级**：基于 Node.js，无需外部数据库
- **易配置**：简单的 YAML 配置文件
- **缓存代理**：支持上游 npm 代理和本地缓存
- **权限控制**：细粒度的用户和包访问控制
- **插件化**：可扩展的插件架构

### 2.2 安装与启动

#### 2.2.1 全局安装

```bash
# 安装 Verdaccio
npm install -g verdaccio

# 检查安装是否成功
verdaccio --version

# 查看帮助信息
verdaccio -h
```

#### 2.2.2 启动服务器

```bash
# 直接启动（前台运行）
verdaccio

# 后台运行（Linux/Mac）
verdaccio &

# 指定配置文件启动
verdaccio --config ./config.yaml


# 后端运行切换到前端
jobs  # 查看后台作业
# 如果有 Verdaccio
[1]+  Running    verdaccio &

# 1. 切换到前台然后 Ctrl+C
fg %1  # %1 是作业号
Ctrl + C
```

启动成功后，默认访问地址：http://localhost:4873

## 3. Verdaccio 配置详解

### 3.1 YAML 配置文件基础

Verdaccio 使用 YAML（YAML Ain't Markup Language）格式的配置文件：

**基本语法规则：**

- 使用缩进表示层级（通常 2 个空格）
- 键值对使用冒号分隔
- 列表使用短横线表示
- 注释使用 `#` 符号

**示例：**

```yaml
# 用户配置示例
user:
  name: admin
  permissions:
    - read
    - write
    - publish
  packages:
    - "@company/*"
    - "private-*"
```

### 3.2 核心配置项

#### 3.2.1 storage（存储配置）

```yaml
# 包存储路径
storage: ./storage

# 完整存储配置示例
storage:
  # 存储目录
  storage: ./storage
  # 监听文件系统变化
  watch: true
  # 包搜索选项
  packages:
    # 扫描嵌套目录深度
    depth: 3
    # 排除的包模式
    exclude: ['**/.git/**', '**/node_modules/**']
```

#### 3.2.2 web（Web 界面配置）

```yaml
# Web界面配置
web:
  # 页面标题
  title: "公司私有 NPM 仓库"
  # 启用/禁用Web界面
  enable: true
  # HTML语言
  lang: zh-CN
  # 是否显示扫描二维码
  showSearch: true
  # 是否显示包下载统计
  showStats: true
  # 主题颜色
  primary_color: "#4b4b4b"
  # 登录页背景图
  loginBackground: "./login-background.jpg"
```

#### 3.2.3 auth（身份验证配置）

```yaml
# 认证配置
auth:
  # 使用 htpasswd 文件存储用户信息（默认）
  htpasswd:
    file: ./htpasswd
    # 最大用户数，-1 表示不限制
    max_users: -1
    # 密码加密算法
    algorithm: bcrypt
    # 密码盐值长度
    rounds: 10
# 多种认证方式示例
# auth:
#   # LDAP 认证
#   ldap:
#     type: ldap
#     client_options:
#       url: 'ldap://ldap.example.com'
#       # ... LDAP 配置
#   # JWT 认证
#   jwt:
#     sign:
#       expiresIn: 7d
#       algorithm: HS256
```

#### 3.2.4 uplinks（上游代理配置）

我现在搭建了私服，我通过私服下载某一些包的时候，私服可能不存在这些包。然后就回去查找私服的上游代理。下载完成之后会自动缓存到私服中。

```yaml
# 上游代理配置
uplinks:
  # npm 官方源
  npmjs:
    url: https://registry.npmjs.org/
    # 代理超时时间（毫秒）
    timeout: 10000
    # 最大失败次数
    max_fails: 3
    # 失败后等待时间（毫秒）
    fail_timeout: 60000
    # 最大请求数
    maxage: 2m
    # 代理头信息
    agent_options:
      keepAlive: true
      maxSockets: 40
      maxFreeSockets: 10

  # 淘宝镜像源
  taobao:
    url: https://registry.npmmirror.com/
    timeout: 10000

  # 公司其他仓库
  company-other:
    url: http://other-registry.company.com/
    auth:
      type: bearer
      token: "your-token-here"
```

#### 3.2.5 packages（包权限控制）

```yaml
# 包权限配置
packages:
  # 1. 公司作用域包 - 严格权限
  "@company/*":
    # 访问权限
    access:
      - admin-team
      - dev-team
      - ci-user
    # 发布权限
    publish:
      - admin-team
      - release-manager
    # 撤销权限
    unpublish:
      - admin-team
    # 代理设置（不存在时从上游获取）
    proxy: npmjs
    # 存储配置
    storage: "private-storage"

  # 2. 部门作用域包
  "@department/*":
    access: $authenticated # 所有认证用户
    publish: $authenticated
    proxy: npmjs

  # 3. 公开包 - 宽松权限
  "public-*":
    access: $all # 所有人（包括匿名）
    publish: $authenticated
    proxy: npmjs

  # 4. 默认规则（匹配所有其他包）
  "**":
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs taobao # 多个上游源（按顺序尝试）
```

**权限关键词说明：**

- `$all`：所有用户（包括匿名）
- `$anonymous`：仅匿名用户
- `$authenticated`：已认证用户
- `具体用户名`：指定用户或用户组

#### 3.2.6 server（服务器配置）

```yaml
# 服务器配置
server:
  # 监听地址和端口
  keepAliveTimeout: 60
  # 具体监听配置
  listen:
    # 绑定所有网卡
    - 0.0.0.0:4873
    # 或指定IP
    # - 192.168.1.100:4873
    # 或Unix Socket
    # - /tmp/verdaccio.sock

  # HTTPS配置
  # https:
  #   key: ./ssl/key.pem
  #   cert: ./ssl/cert.pem
  #   ca: ./ssl/ca.pem

  # 性能调优
  max_body_size: "100mb" # 最大请求体大小
  compress: true # 启用压缩
  rateLimit:
    windowMs: 60000 # 时间窗口（毫秒）
    max: 1000 # 最大请求数
```

#### 3.2.7 middlewares（中间件配置）

```yaml
# 中间件配置
middlewares:
  # 审计日志
  audit:
    enabled: true
    # 日志格式
    format: json
    # 日志级别
    level: info

  # 限流
  rateLimit:
    enabled: true
    windowMs: 60000
    max: 1000

  # CORS配置
  cors:
    enabled: true
    # 允许的源
    origin:
      - http://localhost:3000
      - https://company.com
    # 允许的HTTP方法
    methods: ["GET", "POST", "PUT", "DELETE"]
    # 允许的请求头
    headers: ["Authorization", "Content-Type"]
```

#### 3.2.8 logs（日志配置）

```yaml
# 日志配置
logs:
  # 输出类型
  - type: stdout
    format: pretty
    level: http

  # 文件日志
  - type: file
    path: ./logs/verdaccio.log
    format: json
    level: info
    # 日志轮转
    options:
      maxSize: "10m"
      maxFiles: "7d"

  # 错误日志单独文件
  - type: file
    path: ./logs/error.log
    format: json
    level: error
```

### 3.3 完整配置示例

```yaml
# Verdaccio 配置文件
# 存储路径
storage: ./storage

# Web界面
web:
  title: "公司私有 NPM 仓库"
  enable: true

# 认证
auth:
  htpasswd:
    file: ./htpasswd
    max_users: 1000

# 上游代理
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 10000
  taobao:
    url: https://registry.npmmirror.com/

# 包权限
packages:
  "@company/core/*":
    access: $authenticated
    publish: admin-team
    proxy: npmjs

  "@company/*":
    access: $authenticated
    publish: $authenticated
    proxy: npmjs

  "**":
    access: $all
    publish: $authenticated
    proxy: npmjs taobao

# 服务器
server:
  keepAliveTimeout: 60
  listen:
    - 0.0.0.0:4873

# 日志
logs:
  - type: stdout
    format: pretty
    level: info
```

## 4. 用户管理与权限

### 4.1 用户管理命令

#### 4.1.1 添加用户

```bash
# 在Verdaccio运行状态下
npm adduser --registry http://localhost:4873

# 或使用Web界面注册
# 访问 http://localhost:4873
```

#### 4.1.2 登录用户

```bash
npm login --registry http://localhost:4873
```

#### 4.1.3 查看当前用户

```bash
npm whoami --registry http://localhost:4873
```

### 4.2 权限管理实践

#### 4.2.1 用户组管理

```yaml
# 在配置文件中定义用户组
packages:
  "@company/core/*":
    access:
      - admin-group
      - developer-group
      - ci-bot
    publish:
      - admin-group
      - release-manager
# 在实际使用中，需要配合插件实现用户组功能
```

#### 4.2.2 基于令牌的认证

```yaml
# 生成访问令牌
auth:
  tokens:
    # JWT令牌配置
    jwt:
      sign:
        algorithm: HS256
        expiresIn: 30d
      verify:
        # 验证选项
```

## 5. 镜像管理工具 nrm

### 5.1 nrm 安装与问题解决

#### 5.1.1 标准安装

```bash
# 安装 nrm
npm install -g nrm

# 如果遇到 ES Module 错误，同时安装 open 包
npm install -g nrm open@8.4.2
```

#### 5.1.2 兼容性解决方案

如果仍然遇到问题，可以尝试：

**方案 1：使用新版 Node.js**

```bash
# 升级到 Node.js 16+ 或 18+
nvm install 18
nvm use 18
```

**方案 2：使用替代工具**

```bash
# 使用 npm 自带的 registry 管理
npm config set registry <url>

# 或使用其他工具
npm install -g yrm  # yarn registry manager
```

### 5.2 nrm 常用命令

#### 5.2.1 基础命令

```bash
# 列出所有可用镜像
nrm ls

# 切换镜像源
nrm use npm          # 切换到官方源
nrm use taobao       # 切换到淘宝源
nrm use verdaccio    # 切换到私有源

# 测试镜像速度
nrm test

# 测试特定镜像
nrm test npm
nrm test taobao
```

#### 5.2.2 镜像管理

```bash
# 添加私有镜像
nrm add company-registry http://npm.company.com

# 删除镜像
nrm del company-registry

# 重命名镜像
#（需要手动修改 ~/.nrmrc 文件）

# 查看当前使用的镜像
nrm current
```

#### 5.2.3 配置示例

```bash
# 1. 查看所有镜像源
$ nrm ls

* npm -------- https://registry.npmjs.org/
  yarn ------- https://registry.yarnpkg.com/
  cnpm ------- https://r.cnpmjs.org/
  taobao ----- https://registry.npmmirror.com/
  nj --------- https://registry.nodejitsu.com/
  npmMirror -- https://skimdb.npmjs.com/registry/
  edunpm ----- http://registry.enpmjs.org/
  verdaccio -- http://localhost:4873/

# 2. 添加公司私有源
$ nrm add company http://npm.internal.company.com:4873

# 3. 切换到私有源
$ nrm use company
```

## 6. 生产环境部署建议

### 6.1 Docker 部署

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

RUN npm install -g verdaccio

RUN mkdir -p /verdaccio/storage \
    && mkdir -p /verdaccio/conf

COPY config.yaml /verdaccio/conf/config.yaml

EXPOSE 4873

CMD ["verdaccio", "--config", "/verdaccio/conf/config.yaml", "--listen", "0.0.0.0:4873"]
```

### 6.2 使用 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动 Verdaccio
pm2 start verdaccio --name "npm-registry"

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs npm-registry
```

### 6.3 反向代理配置（Nginx）

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name npm.company.com;

    location / {
        proxy_pass http://localhost:4873;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 文件上传大小限制
        client_max_body_size 100M;
    }

    # 启用 SSL
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
}
```

## 7. 最佳实践与注意事项

### 7.1 安全建议

1. **启用 HTTPS**：生产环境必须使用 HTTPS
2. **定期备份**：备份 storage 目录和配置文件
3. **监控日志**：设置日志轮转和监控告警
4. **访问控制**：严格控制发布权限
5. **定期更新**：保持 Verdaccio 版本更新

### 7.2 性能优化

1. **SSD 存储**：使用 SSD 提高 I/O 性能
2. **内存缓存**：合理配置内存缓存大小
3. **网络优化**：配置合理的超时和重试机制
4. **负载均衡**：高并发场景考虑集群部署

### 7.3 故障排查

```bash
# 常见问题排查命令

# 1. 检查服务状态
curl http://localhost:4873

# 2. 查看日志
tail -f storage/verdaccio.log

# 3. 检查端口占用
lsof -i :4873

# 4. 测试包发布
npm publish --registry http://localhost:4873 --verbose

# 5. 清理缓存
rm -rf ./storage/*
```

### 7.4 迁移指南

```bash
# 从公共仓库同步常用包
# 可以使用 sync-thru-cache 等工具同步

# 从现有私有仓库迁移
# 1. 备份原有仓库
# 2. 配置 Verdaccio 上游指向原仓库
# 3. 逐步迁移用户和权限
```

通过以上完整指南，您可以成功搭建和管理企业级 npm 私有服务器，提升开发效率并保障代码安全。
