---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

发布自己的包到 npm 是 Node.js 开发者必备的技能。下面将详细介绍从准备到发布的完整流程。

## 1. 准备工作

### 1.1 注册 npm 账号

#### 1.1.1 账号注册

1. 访问 npm 官网：https://www.npmjs.com/
2. 点击 "Sign Up" 注册新账号
3. **重要**：务必设置并验证邮箱，后续发布需要邮箱验证

#### 1.1.2 切换镜像源

由于我们要向官方 npm 仓库发布包，需要确保使用正确的镜像源：

```bash
# 切换到 npm 官方镜像源
npm config set registry=https://registry.npmjs.org/

# 如果需要恢复淘宝镜像（仅限国内下载使用）
npm config set registry=https://registry.npmmirror.com/
```

### 1.2 账号管理命令

#### 1.2.1 登录与登出

```bash
# 登录 npm 账号
npm login
# 按照提示输入用户名、密码、邮箱和一次性验证码

# 查看当前登录用户
npm whoami

# 退出登录
npm logout
```

#### 1.2.2 账号信息管理

```bash
# 查看个人资料
npm profile get

# 修改密码
npm profile set password

# 设置双因素认证
npm profile enable-2fa
```

## 2. 配置 package.json

### 2.1 发布文件管理

#### 2.1.1 黑名单方式 (.npmignore)

在项目根目录创建 `.npmignore` 文件，指定不需要发布的文件：

```bash
# .npmignore
# 源代码目录（通常经过编译）
src/
# 测试文件
test/
tests/
__tests__/
# 配置文件
*.config.js
webpack.config.js
# 开发工具配置
.editorconfig
.eslintrc
.prettierrc
# 文档
docs/
# 示例
examples/
# 临时文件和构建产物
dist/
*.log
*.tmp
```

#### 2.1.2 白名单方式 (files 字段)

**推荐使用**：在 package.json 中明确指定要发布的文件：

```json
{
  "name": "your-package-name",
  "version": "1.0.0",
  "files": [
    "dist/",          # 构建产物
    "lib/",           # 编译后的代码
    "README.md",      # 说明文档
    "LICENSE",        # 许可证
    "types/",         # TypeScript 类型声明
    "package.json"    # 配置文件
  ]
}
```

**白名单优势：**

- 明确控制发布内容
- 避免忘记添加忽略规则
- 提高发布的可预测性

### 2.2 模块系统配置

#### 2.2.1 type 字段

控制 Node.js 的默认模块系统：

```json
{
  "type": "commonjs",  # 默认使用 CommonJS (require/exports)
  # 或
  "type": "module"     # 默认使用 ESM (import/export)
}
```

**注意：**

- `type: "commonjs"`：文件使用 `.cjs` 扩展名表示 ESM
- `type: "module"`：文件使用 `.mjs` 扩展名表示 CommonJS

#### 2.2.2 exports 字段（高级配置）

提供更精细的模块导出控制：

```json
{
  "exports": {
    # 条件导出
    ".": {
      "import": "./dist/index.esm.js",     # ESM 导入
      "require": "./dist/index.cjs.js",    # CommonJS 导入
      "default": "./dist/index.cjs.js"     # 默认回退
    },
    # 子路径导出
    "./utils": {
      "import": "./dist/utils.esm.js",
      "require": "./dist/utils.cjs.js"
    },
    # 类型声明
    "./package.json": "./package.json"
  }
}
```

### 2.3 完整 package.json 示例

```json
{
  "name": "your-package-name",
  "version": "1.0.0",
  "description": "包的详细描述",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test",
    "preversion": "npm test",
    "version": "npm run build"
  },
  "keywords": ["keyword1", "keyword2"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme",
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "rollup": "^3.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "jest": "^29.0.0"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

## 3. 打包与发布

### 3.1 项目结构示例

```
your-package/
├── src/
│   ├── index.js      # 主入口文件
│   ├── sum.js        # 功能模块
│   └── sub.js        # 功能模块
├── dist/             # 构建输出目录
├── tests/            # 测试文件
├── rollup.config.js  # Rollup 配置
├── .npmignore        # 发布忽略文件
└── package.json      # 配置文件
```

### 3.2 Rollup 配置示例

```javascript
// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "auto",
    },
    {
      file: "dist/index.esm.js",
      format: "es",
      exports: "auto",
    },
  ],
  plugins: [
    resolve(),
    terser(), // 代码压缩
  ],
  external: ["lodash"], // 外部依赖，不打包
};
```

### 3.3 发布流程

#### 3.3.1 检查与测试

```bash
# 1. 检查 package.json 配置
cat package.json

# 2. 运行测试
npm test

# 3. 构建包
npm run build

# 4. 检查构建结果
ls dist/
```

#### 3.3.2 版本管理

```bash
# 查看当前版本
npm version

# 更新版本号（遵循语义化版本）
npm version patch    # 修订号 +1 (1.0.0 → 1.0.1)
npm version minor    # 次版本号 +1 (1.0.0 → 1.1.0)
npm version major    # 主版本号 +1 (1.0.0 → 2.0.0)

# 或直接指定版本
npm version 1.2.3
```

#### 3.3.3 发布包

```bash
# 1. 登录（如果未登录）
npm login

# 2. 发布包
npm publish

# 3. 发布带标签的版本（如 beta 版）
npm publish --tag beta

# 4. 查看已发布的包
npm view your-package-name

# 5. 删除已发布的包（24小时内）
npm unpublish your-package-name@1.0.0
```

### 3.4 发布后的维护

#### 3.4.1 更新包

```bash
# 1. 修改代码并测试
# 2. 更新版本号
npm version patch

# 3. 发布新版本
npm publish
```

#### 3.4.2 设置包访问权限

```bash
# 设置为公开包（默认）
npm publish --access public

# 设置为私有包（需要付费账号）
npm publish --access private

# 添加协作者
npm owner add username your-package-name

# 查看包的所有者
npm owner ls your-package-name
```

#### 3.4.3 废弃版本

```bash
# 标记某个版本为废弃
npm deprecate your-package-name@1.0.0 "这个版本有安全问题，请升级到1.1.0"
```

## 4. 最佳实践与注意事项

### 4.1 命名规范

- 包名全局唯一
- 使用小写字母和连字符
- 避免使用已有知名包名
- 检查包名是否可用：`npm search your-package-name`

### 4.2 版本管理

1. 遵循语义化版本规范
2. 重大变更使用主版本号
3. 新功能使用次版本号
4. Bug 修复使用修订号
5. 预发布版本使用标签：`1.0.0-beta.1`

### 4.3 发布前检查清单

- [ ] 确保 `name` 字段正确且唯一
- [ ] 更新 `version` 字段
- [ ] 填写完整的 `description`
- [ ] 设置正确的 `main` 和 `module` 入口
- [ ] 配置 `files` 白名单
- [ ] 更新 `README.md` 文档
- [ ] 添加 `LICENSE` 文件
- [ ] 运行测试并通过
- [ ] 构建生产版本
- [ ] 切换为 npm 官方镜像源

### 4.4 常见问题解决

#### 4.4.1 发布失败：403 Forbidden

```bash
# 检查是否已登录
npm whoami

# 检查包名是否已被占用
npm view your-package-name

# 检查镜像源是否正确
npm config get registry
```

#### 4.4.2 需要邮箱验证

```bash
# 检查邮箱是否已验证
npm profile get

# 重新发送验证邮件
npm profile enable-2fa
```

#### 4.4.3 版本冲突

```bash
# 检查远程版本
npm view your-package-name versions

# 更新本地版本号
npm version patch
```

通过以上完整指南，你可以成功地将自己的包发布到 npm，并与全球开发者共享你的成果。记住，好的 npm 包不仅要有优秀的功能，还要有清晰的文档、良好的版本管理和持续的维护。
