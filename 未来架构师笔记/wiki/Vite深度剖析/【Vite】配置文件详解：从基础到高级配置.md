---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> Vite 的配置文件是项目的心脏，本文详细解析所有配置项的含义和使用场景。

---

## 1. 默认配置文件

### 1.1 配置文件位置

Vite 支持多种配置文件格式：

- `vite.config.js`
- `vite.config.ts`
- `vite.config.mjs`
- `vite.config.cjs`

**代码演示：创建配置文件**

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 配置项
})
```

**关键词解释：**

- **defineConfig**：提供类型提示的配置函数
- **配置文件**：定义项目构建和开发行为的文件

---

### 1.2 TypeScript 配置

**代码演示：vite.config.ts**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 配置项
})
```

**TypeScript 配置：tsconfig.json**

```json
{
  "compilerOptions": {
    // 每个文件作为独立模块编译（兼容 esbuild）
    "isolatedModules": true,
    // 跳过库类型检查
    "skipLibCheck": true,
    // 使用打包工具的模块解析策略
    "moduleResolution": "bundler",
    // 启用 CommonJS 互操作
    "esModuleInterop": true,
    // 允许默认导入
    "allowSyntheticDefaultImports": true,
    // 不生成输出文件
    "noEmit": true,
    // 允许导入 .ts 扩展名
    "allowImportingTsExtensions": true,
    // 允许导入 JSON
    "resolveJsonModule": true
  }
}
```

**详细配置说明：**

#### isolatedModules: true

**作用：** 是否将每个文件作为独立的模块进行编译，主要用于兼容 esbuild。

**为什么需要？**

esbuild 只执行没有类型信息的转译，它并不支持某些 TypeScript 特性（如 `const enum`、`namespace` 等）。启用 `isolatedModules` 可以确保每个文件都可以独立编译，避免这些不兼容的特性。

**代码演示：不兼容的特性**

```typescript
// ❌ 不兼容：const enum
const enum Direction {
  Up,
  Down,
}

// ✅ 兼容：普通 enum
enum Direction {
  Up,
  Down,
}
```

#### skipLibCheck: true

**作用：** 跳过库类型检查。

**为什么需要？**

有些第三方库不能很好的兼容 `isolatedModules`，可以使用这个属性来缓解类型检查错误。这样可以加快编译速度，只检查项目代码。

#### moduleResolution: "bundler"

**作用：** 指定使用打包工具提供的模块解析策略。

**说明：** Vite 作为打包工具，有自己的模块解析逻辑，使用 `bundler` 可以让 TypeScript 的解析策略与 Vite 保持一致。

**关键词解释：**

- **isolatedModules**：每个文件作为独立模块，兼容 esbuild
- **skipLibCheck**：跳过库类型检查，提升编译速度
- **moduleResolution**：模块解析策略，`bundler` 表示使用打包工具的解析策略
- **esModuleInterop**：CommonJS 和 ESM 互操作

---

## 2. 常识性问题

### 2.1 Node.js 环境 ESM 问题

**问题：** Node.js 默认使用 CommonJS，需要配置才能使用 ESM。

**解决方案 1：使用 .mjs 后缀**

```javascript
// vite.config.mjs
export default {
  // 配置
}
```

**解决方案 2：package.json 配置**

```json
{
  "type": "module"
}
```

**关键词解释：**

- **.mjs**：ES Module 文件扩展名
- **.cjs**：CommonJS 文件扩展名
- **type: "module"**：告诉 Node.js 使用 ESM

---

### 2.2 文件执行环境问题

**问题：** 配置文件在 Node.js 环境执行，不是浏览器环境。

**代码演示：错误用法**

```javascript
// ❌ 错误：浏览器 API 不可用
export default {
  server: {
    port: window.innerWidth > 768 ? 3000 : 3001,
  },
}
```

**代码演示：正确用法**

```javascript
// ✅ 正确：使用 Node.js API
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: process.env.PORT || 3000,
  },
})
```

---

### 2.3 路径查找问题

**问题：** Node.js 默认支持 bare import（裸导入）。

**代码演示：bare import**

```javascript
// Node.js 会自动解析
import vue from 'vue' // 从 node_modules 查找
```

**Vite 处理：**

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
    },
  },
}
```

---

### 2.4 Node.js 路径问题

**代码演示：路径获取**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      // 使用 __dirname（CommonJS）
      '@': resolve(__dirname, 'src'),
      // 使用 import.meta.url（ESM）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

**关键词解释：**

- **\_\_dirname**：当前模块所在路径（CommonJS）
- **process.cwd()**：Node.js 进程的工作目录
- **import.meta.url**：当前模块的 URL（ESM）

---

## 3. TypeScript 客户端类型

### 3.1 客户端类型声明

**问题：** 浏览器环境中的类型提示。

**解决方案：使用三斜线注释**

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

**或使用 tsconfig.json**

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

**代码演示：类型声明**

```typescript
// vite/client 提供的类型
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**关键词解释：**

- **三斜线注释**：TypeScript 的类型引用指令
- **vite/client**：Vite 提供的客户端类型定义

---

### 3.2 静态资源类型声明

**代码演示：声明静态资源类型**

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}
```

---

## 4. 智能提示

### 4.1 defineConfig

**代码演示：使用 defineConfig**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 这里有完整的类型提示
  server: {
    port: 3000,
  },
})
```

**优势：**

1. **类型提示**：IDE 自动补全
2. **类型检查**：编译时检查配置错误
3. **文档提示**：鼠标悬停显示文档

---

### 4.2 配置类型

**代码演示：UserConfig 类型**

```typescript
import type { UserConfig } from 'vite'

const config: UserConfig = {
  server: {
    port: 3000,
  },
}

export default config
```

---

## 5. 情景配置

### 5.1 ConfigEnv

**代码演示：函数式配置**

```typescript
import { defineConfig, type ConfigEnv } from 'vite'

export default defineConfig(({ command, mode, ssrBuild }: ConfigEnv) => {
  // command: 'build' | 'serve'
  // mode: string
  // ssrBuild: boolean

  if (command === 'serve') {
    // 开发环境配置
    return {
      server: {
        port: 3000,
      },
    }
  } else {
    // 生产环境配置
    return {
      build: {
        minify: 'terser',
      },
    }
  }
})
```

**关键词解释：**

- **ConfigEnv**：配置环境对象
- **command**：当前执行的命令
- **mode**：当前模式
- **ssrBuild**：是否为 SSR 构建

---

### 5.2 loadConfigFromFile

**代码演示：加载配置文件**

```typescript
// 内部实现（简化版）
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
): Promise<UserConfig | null> {
  // 加载并执行配置文件
}
```

---

## 6. 环境变量与模式

### 6.1 process.env

**代码演示：Node.js 环境变量**

```javascript
// vite.config.js
export default {
  server: {
    port: process.env.PORT || 3000,
  },
}
```

---

### 6.2 环境变量文件

**文件优先级（从低到高）：**

```text
.env                # 所有环境（基础配置）
.env.local          # 所有环境（本地，会被 git 忽略）
.env.[mode]         # 特定模式（如 .env.development）
.env.[mode].local   # 特定模式（本地，会被 git 忽略）
```

**重要规则：**

1. **指定模式的文件（如 `.env.production`）高于通用形式的优先级**
2. **`.local` 文件会被 git 忽略**，适合存放敏感信息
3. **只有以 `VITE_` 开头的变量才会暴露给客户端**

**代码演示：环境变量文件**

```bash
# .env（所有环境）
VITE_APP_TITLE=My App

# .env.development（开发环境）
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true

# .env.production（生产环境）
VITE_API_URL=https://api.example.com
VITE_DEBUG=false

# .env.local（本地，不会被提交到 git）
VITE_SECRET_KEY=your-secret-key
```

**代码演示：文件加载顺序**

```text
开发模式（vite）：
  ↓
加载 .env
  ↓
加载 .env.local
  ↓
加载 .env.development（覆盖前面的）
  ↓
加载 .env.development.local（最高优先级）
```

**关键词解释：**

- **.env**：环境变量文件
- **模式（Mode）**：不同的运行环境
- **优先级**：后面的文件会覆盖前面的同名变量

---

### 6.3 加载环境变量

**重要说明：**

> Vite 默认是不加载 .env 文件的，因为这些文件需要在执行完 Vite 配置后才能确定加载哪一个。

**代码演示：loadEnv 函数签名**

```typescript
loadEnv(mode: string, envDir: string, prefixes?: string | string[]): Record<string, string>
```

**参数说明：**

- `mode`：当前模式（如 `development`、`production`）
- `envDir`：环境变量文件目录（通常是 `process.cwd()`）
- `prefixes`：要加载的变量前缀（默认是 `VITE_`）

**代码演示：在配置文件中使用 loadEnv**

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
    },
  }
})
```

**代码演示：加载多个前缀**

```typescript
// 加载 VITE_ 和 CUSTOM_ 开头的变量
const env = loadEnv(mode, process.cwd(), ['VITE_', 'CUSTOM_'])
```

**关键词解释：**

- **loadEnv**：Vite 提供的环境变量加载函数
- **模式（Mode）**：决定加载哪个 .env 文件

---

### 6.4 模式

**代码演示：模式配置**

```javascript
// vite.config.js
export default {
  // 开发服务器 --> development 模式
  // build 命令 --> production 模式
  // 覆盖默认模式 --mode (比如 --mode test)
}
```

**代码演示：使用模式**

```bash
# 开发模式（默认）
vite

# 生产模式（默认）
vite build

# 自定义模式
vite build --mode staging
```

---

### 6.5 import.meta.env

**代码演示：客户端环境变量**

```typescript
// 客户端代码
console.log(import.meta.env.MODE) // 'development' | 'production'
console.log(import.meta.env.BASE_URL) // 部署基础路径
console.log(import.meta.env.PROD) // 是否生产环境
console.log(import.meta.env.DEV) // 是否开发环境
console.log(import.meta.env.SSR) // 是否 SSR
```

**默认暴露的变量：**

- `MODE`：应用运行的模式
- `BASE_URL`：部署应用时的基本 URL
- `PROD`：是否生产环境
- `DEV`：是否开发环境
- `SSR`：是否 SSR

**关键词解释：**

- **import.meta.env**：Vite 提供的环境变量对象
- **客户端暴露**：只有以 `VITE_` 开头的变量才会暴露给客户端

---

### 6.6 自定义前缀

**代码演示：envPrefix**

```javascript
// vite.config.js
export default {
  envPrefix: 'CUSTOM_', // 自定义前缀
  // 只有 CUSTOM_ 开头的变量才会暴露
}
```

---

### 6.7 TypeScript 提示

**代码演示：类型声明**

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: number
  readonly VITE_OPEN: boolean
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 7. 总结

**配置文件核心要点：**

1. **配置文件格式**：支持 JS/TS/MJS/CJS
2. **TypeScript 支持**：完整的类型提示
3. **环境变量**：通过 .env 文件管理
4. **模式**：不同环境使用不同配置
5. **情景配置**：根据命令和模式动态配置

**关键理念：**

> 配置文件应该清晰、类型安全、易于维护

这就是 Vite 配置设计的核心思想。
