## 1. 概述

Node.js 的 `path` 模块是处理文件路径的核心工具，提供了一系列方法来处理文件和目录路径。它帮助开发者编写跨平台的路径处理代码，正确处理不同操作系统（Windows、Linux、macOS）的路径差异。

```javascript
const path = require('path') // CommonJS
// 或
import path from 'path' // ES6 Module
```

## 2. basename() - 获取路径中的文件名

### 2.1 功能描述

`path.basename()` 方法返回一个路径的最后一部分，类似于 Unix 的 `basename` 命令。它可以移除可选的扩展名。他不会去校验输入的路径是否存在

### 2.2 语法

```javascript
path.basename(path[, ext])
```

- `path`: 要处理的路径字符串
- `ext` (可选): 要移除的文件扩展名

### 2.3 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.basename('/foo/bar/baz/asdf/quux.html'))
// 输出: 'quux.html'

console.log(path.basename('/foo/bar/baz/asdf/quux.html', '.html'))
// 输出: 'quux' - 移除了扩展名

console.log(path.basename('/foo/bar/baz/asdf/quux.tar.gz', '.tar.gz'))
// 输出: 'quux' - 可以移除复合扩展名

// 处理目录路径
console.log(path.basename('/foo/bar/baz/'))
// 输出: 'baz' - 注意：尾部斜杠不影响结果

console.log(path.basename('/foo/bar/baz'))
// 输出: 'baz'

// 处理相对路径
console.log(path.basename('./src/components/Button.jsx'))
// 输出: 'Button.jsx'

console.log(path.basename('./src/components/Button.jsx', '.jsx'))
// 输出: 'Button'

// Windows 路径
console.log(path.basename('C:\\temp\\myfile.html'))
// 输出: 'myfile.html'

// 特殊情况
console.log(path.basename('file.txt', '.txt'))
// 输出: 'file'

console.log(path.basename('file.txt', '.md'))
// 输出: 'file.txt' - 扩展名不匹配时不移除

console.log(path.basename(''))
// 输出: '' - 空字符串返回空字符串

console.log(path.basename('.'))
// 输出: '.' - 当前目录返回点
```

### 2.4 使用场景

```javascript
// 1. 提取文件名（不含扩展名）
function getFileNameWithoutExtension(filePath) {
  const ext = path.extname(filePath)
  return path.basename(filePath, ext)
}

const filePath = '/docs/api/user.service.ts'
console.log(getFileNameWithoutExtension(filePath))
// 输出: 'user.service'

// 2. 批量处理文件扩展名
const files = ['/src/app.js', '/src/style.css', '/src/index.html']

files.forEach((file) => {
  const baseName = path.basename(file, path.extname(file))
  console.log(`处理文件: ${baseName}`)
})

// 3. 检查文件类型
function isJavaScriptFile(filePath) {
  const ext = path.extname(filePath)
  const fileName = path.basename(filePath, ext)
  return ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx'
}

// 4. 构建新的文件名
function createBackupFileName(originalPath) {
  const timestamp = new Date().getTime()
  const ext = path.extname(originalPath)
  const baseName = path.basename(originalPath, ext)
  const dir = path.dirname(originalPath)

  return path.join(dir, `${baseName}_backup_${timestamp}${ext}`)
}

console.log(createBackupFileName('/data/config.json'))
// 输出: '/data/config_backup_1635678901234.json'
```

## 3. delimiter - 路径定界符

### 3.1 功能描述

`path.delimiter` 属性返回特定平台的分隔符，用于分隔多个路径（如 PATH 环境变量）。

### 3.2 不同平台的值

```javascript
console.log(path.delimiter)
// Windows: ';'
// POSIX (Linux/macOS): ':'
```

### 3.3 使用场景

```javascript
const path = require('path')

// 1. 解析 PATH 环境变量
const PATH = process.env.PATH || ''
const pathDirs = PATH.split(path.delimiter)

console.log('PATH 包含的目录:')
pathDirs.forEach((dir, index) => {
  console.log(`${index + 1}. ${dir}`)
})

// 2. 构建跨平台的环境变量
function addToPath(originalPath, newPath) {
  const paths = originalPath.split(path.delimiter)

  // 避免重复添加
  if (!paths.includes(newPath)) {
    paths.push(newPath)
  }

  return paths.join(path.delimiter)
}

// 3. 检查可执行文件是否在 PATH 中
function isInPath(executable) {
  const pathDirs = process.env.PATH.split(path.delimiter)

  return pathDirs.some((dir) => {
    const fullPath = path.join(dir, executable)
    try {
      require('fs').accessSync(fullPath, require('fs').constants.X_OK)
      return true
    } catch {
      return false
    }
  })
}

// 4. 跨平台路径列表处理
function parsePathList(pathList) {
  if (typeof pathList === 'string') {
    return pathList.split(path.delimiter).filter(Boolean)
  }
  return pathList || []
}

function joinPathList(paths) {
  return Array.isArray(paths) ? paths.join(path.delimiter) : paths
}

// 示例使用
const myPaths = ['/usr/local/bin', '/usr/bin', '/opt/homebrew/bin']

const pathString = joinPathList(myPaths)
console.log('路径字符串:', pathString)
// Linux/macOS: '/usr/local/bin:/usr/bin:/opt/homebrew/bin'

const parsedPaths = parsePathList(pathString)
console.log('解析后的路径数组:', parsedPaths)
```

## 4. dirname() - 获取目录名

### 4.1 功能描述

`path.dirname()` 方法返回一个路径的目录部分，类似于 Unix 的 `dirname` 命令。不会去校验路径是否存在。如果最后一位没有后缀名，则当作是默认文件。

### 4.2 语法

```javascript
path.dirname(path)
```

### 4.3 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.dirname('/foo/bar/baz/asdf/quux'))
// 输出: '/foo/bar/baz/asdf'

console.log(path.dirname('/foo/bar/baz/asdf/quux.html'))
// 输出: '/foo/bar/baz/asdf'

// 处理相对路径
console.log(path.dirname('./src/components/Button.jsx'))
// 输出: './src/components'

console.log(path.dirname('src/components/Button.jsx'))
// 输出: 'src/components'

// 处理目录路径
console.log(path.dirname('/foo/bar/baz/'))
// 输出: '/foo/bar'

console.log(path.dirname('/foo/bar/baz'))
// 输出: '/foo/bar'

// Windows 路径
console.log(path.dirname('C:\\temp\\myfile.html'))
// 输出: 'C:\\temp'

// 边界情况
console.log(path.dirname('/foo'))
// 输出: '/'

console.log(path.dirname('/'))
// 输出: '/'

console.log(path.dirname('foo'))
// 输出: '.'

console.log(path.dirname('.'))
// 输出: '.'

console.log(path.dirname('..'))
// 输出: '.'

console.log(path.dirname(''))
// 输出: '.'
```

### 4.4 使用场景

```javascript
// 1. 获取项目根目录
function getProjectRoot(currentFile) {
  let currentDir = path.dirname(currentFile)

  // 向上查找直到找到 package.json
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json')
    if (require('fs').existsSync(packageJsonPath)) {
      return currentDir
    }
    currentDir = path.dirname(currentDir)
  }

  throw new Error('找不到 package.json 文件')
}

// 2. 确保目录存在
const fs = require('fs')

function writeFileWithDir(filePath, content) {
  const dir = path.dirname(filePath)

  // 如果目录不存在，递归创建
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, content)
}

// 3. 配置文件路径解析
class ConfigManager {
  constructor(configFile) {
    this.configFile = configFile
    this.configDir = path.dirname(configFile)
  }

  resolveRelativePath(relativePath) {
    return path.resolve(this.configDir, relativePath)
  }

  getLogPath() {
    return path.join(this.configDir, 'logs', 'app.log')
  }
}

// 4. 模块导入辅助
function resolveModulePath(importingFile, moduleSpecifier) {
  const importingDir = path.dirname(importingFile)

  if (moduleSpecifier.startsWith('.')) {
    // 相对路径导入
    return path.resolve(importingDir, moduleSpecifier)
  } else {
    // 模块导入，需要从 node_modules 查找
    // 这里简化处理，实际可能需要复杂的解析
    return require.resolve(moduleSpecifier, { paths: [importingDir] })
  }
}
```

## 5. extname() - 获取文件扩展名

### 5.1 功能描述

`path.extname()` 方法返回路径中文件的扩展名，从最后一个`.`开始到字符串结束。如果没有`.`，或者第一个字符是`.`，则返回空字符串。

### 5.2 语法

```javascript
path.extname(path)
```

### 5.3 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.extname('index.html'))
// 输出: '.html'

console.log(path.extname('index.coffee.md'))
// 输出: '.md' - 只返回最后一个扩展名

console.log(path.extname('index.'))
// 输出: '.' - 只有点号，返回点号

console.log(path.extname('index'))
// 输出: '' - 没有扩展名

// 处理路径
console.log(path.extname('/foo/bar/baz/asdf/quux.html'))
// 输出: '.html'

console.log(path.extname('/foo/bar/baz/asdf/quux'))
// 输出: ''

// 特殊字符处理
console.log(path.extname('.index'))
// 输出: '' - 第一个字符是点号

console.log(path.extname('.index.md'))
// 输出: '.md'

console.log(path.extname('file.with.multiple.dots.txt'))
// 输出: '.txt'

// Windows 路径
console.log(path.extname('C:\\temp\\myfile.html'))
// 输出: '.html'

// 相对路径
console.log(path.extname('./src/app.js'))
// 输出: '.js'
```

### 5.4 使用场景

```javascript
// 1. 根据扩展名处理文件
function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
      return compileJavaScript(filePath)
    case '.css':
    case '.scss':
    case '.less':
      return compileStyle(filePath)
    case '.jpg':
    case '.png':
    case '.gif':
      return optimizeImage(filePath)
    case '.md':
      return renderMarkdown(filePath)
    default:
      return processUnknownFile(filePath)
  }
}

// 2. 验证文件类型
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']

function isValidFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

// 3. 智能重命名保持扩展名
function createVersionedFileName(originalPath, version) {
  const dir = path.dirname(originalPath)
  const baseName = path.basename(originalPath, path.extname(originalPath))
  const ext = path.extname(originalPath)

  return path.join(dir, `${baseName}.v${version}${ext}`)
}

// 4. 分类文件
function categorizeFiles(files) {
  const categories = {}

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase() || '无扩展名'

    if (!categories[ext]) {
      categories[ext] = []
    }

    categories[ext].push(file)
  })

  return categories
}

// 5. MIME 类型映射
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  }

  return mimeTypes[ext] || 'application/octet-stream'
}
```

## 6. join() - 拼接路径

### 6.1 功能描述

`path.join()` 方法使用平台特定的分隔符将所有给定的路径片段连接起来，并规范化生成的路径。

### 6.2 语法

```javascript
path.join([...paths])
```

### 6.3 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'))
// 输出: '/foo/bar/baz/asdf' - 注意 '..' 被解析了

// 处理相对路径
console.log(path.join('foo', 'bar', 'baz'))
// 输出: 'foo/bar/baz'

console.log(path.join('foo', './bar', '../baz'))
// 输出: 'foo/baz' - './' 和 '../' 被正确解析

// 处理绝对路径
console.log(path.join('/foo', 'bar', '/baz'))
// 输出: '/baz' - 注意：遇到绝对路径会重置

// 空参数处理
console.log(path.join())
// 输出: '.' - 返回当前目录

console.log(path.join('foo', '', 'bar'))
// 输出: 'foo/bar' - 空字符串被忽略

console.log(path.join('foo', '.', 'bar'))
// 输出: 'foo/bar' - 当前目录被简化

// Windows 路径
console.log(path.join('C:', 'foo', 'bar'))
// 输出: 'C:\\foo\\bar'

// 跨平台安全拼接
const userDir = 'docs'
const fileName = 'api.md'
console.log(path.join(process.cwd(), userDir, fileName))
// 输出类似: '/home/user/project/docs/api.md'
```

### 6.4 使用场景

```javascript
// 1. 构建跨平台的项目路径
class ProjectPaths {
  constructor(projectRoot) {
    this.root = projectRoot
  }

  get srcPath() {
    return path.join(this.root, 'src')
  }

  get distPath() {
    return path.join(this.root, 'dist')
  }

  getConfigPath(configName) {
    return path.join(this.root, 'config', `${configName}.json`)
  }

  resolveModule(modulePath) {
    return path.join(this.srcPath, 'modules', modulePath)
  }
}

// 2. 安全的文件路径构建
function buildSafePath(baseDir, ...parts) {
  // 过滤掉可能的安全问题（如目录遍历）
  const safeParts = parts.filter((part) => {
    return !part.includes('..') && !path.isAbsolute(part)
  })

  return path.join(baseDir, ...safeParts)
}

// 3. 多环境配置路径
function getConfigPath(env = process.env.NODE_ENV || 'development') {
  const configDir = path.join(__dirname, 'config')

  return {
    default: path.join(configDir, 'default.json'),
    envSpecific: path.join(configDir, `${env}.json`),
    local: path.join(configDir, 'local.json'),
    secrets: path.join(configDir, 'secrets', `${env}.json`),
  }
}

// 4. 模板文件路径解析
class TemplateResolver {
  constructor(templateDirs) {
    this.templateDirs = templateDirs
  }

  resolve(templateName) {
    for (const dir of this.templateDirs) {
      const possiblePaths = [
        path.join(dir, templateName),
        path.join(dir, `${templateName}.hbs`),
        path.join(dir, `${templateName}.ejs`),
        path.join(dir, 'templates', templateName),
      ]

      for (const possiblePath of possiblePaths) {
        if (require('fs').existsSync(possiblePath)) {
          return possiblePath
        }
      }
    }

    throw new Error(`找不到模板: ${templateName}`)
  }
}

// 5. 日志文件路径生成
function generateLogPath(baseDir, options = {}) {
  const { prefix = 'app', date = new Date(), ext = '.log' } = options

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return path.join(
    baseDir,
    'logs',
    String(year),
    month,
    `${prefix}_${year}${month}${day}${ext}`,
  )
}
```

## 7. normalize() - 规范化路径

### 7.1 功能描述

`path.normalize()` 方法规范化给定的路径，解析 `..` 和 `.` 片段，并处理重复的路径分隔符。

### 7.2 语法

```javascript
path.normalize(path)
```

### 7.3 示例详解

```javascript
const path = require('path')

// 解析 . 和 ..
console.log(path.normalize('/foo/bar//baz/asdf/quux/..'))
// 输出: '/foo/bar/baz/asdf'

console.log(path.normalize('/foo/./bar/../baz'))
// 输出: '/foo/baz'

// 处理重复分隔符
console.log(path.normalize('/foo///bar//baz'))
// 输出: '/foo/bar/baz'

console.log(path.normalize('foo//bar///baz////'))
// 输出: 'foo/bar/baz/'

// Windows 路径
console.log(path.normalize('C:\\temp\\\\foo\\bar\\..\\'))
// 输出: 'C:\\temp\\foo\\'

// 相对路径
console.log(path.normalize('./foo/../bar'))
// 输出: 'bar'

console.log(path.normalize('../foo/./bar/../baz'))
// 输出: '../foo/baz'

// 特殊情况
console.log(path.normalize(''))
// 输出: '.'

console.log(path.normalize('.'))
// 输出: '.'

console.log(path.normalize('..'))
// 输出: '..'

console.log(path.normalize('/..'))
// 输出: '/'

console.log(path.normalize('/../..'))
// 输出: '/'
```

### 7.4 使用场景

```javascript
// 1. 清理用户输入的路径
function sanitizeUserPath(userInput) {
  if (!userInput || typeof userInput !== 'string') {
    return '.'
  }

  // 规范化路径
  let normalized = path.normalize(userInput)

  // 防止目录遍历攻击
  const resolved = path.resolve('.', normalized)
  const currentDir = process.cwd()

  // 确保路径不会逃逸当前目录
  if (!resolved.startsWith(currentDir)) {
    throw new Error('非法路径: 试图访问当前目录之外的文件')
  }

  return normalized
}

// 2. 路径比较
function arePathsEqual(path1, path2) {
  return path.normalize(path1) === path.normalize(path2)
}

// 3. 路径规范化缓存
class PathNormalizer {
  constructor() {
    this.cache = new Map()
  }

  normalize(pathStr) {
    if (this.cache.has(pathStr)) {
      return this.cache.get(pathStr)
    }

    const normalized = path.normalize(pathStr)
    this.cache.set(pathStr, normalized)

    return normalized
  }

  clear() {
    this.cache.clear()
  }
}

// 4. 配置文件路径处理
function processConfigPaths(config) {
  const processed = { ...config }

  // 规范化所有路径配置项
  Object.keys(processed).forEach((key) => {
    if (key.includes('Path') || key.includes('Dir') || key.includes('File')) {
      const value = processed[key]
      if (typeof value === 'string') {
        processed[key] = path.normalize(value)
      }
    }
  })

  return processed
}

// 5. 相对路径转换辅助
class PathHelper {
  static toRelative(from, to) {
    const normalizedFrom = path.normalize(from)
    const normalizedTo = path.normalize(to)

    return path.relative(normalizedFrom, normalizedTo)
  }

  static toAbsolute(base, relativePath) {
    const normalizedBase = path.normalize(base)
    const normalizedRelative = path.normalize(relativePath)

    return path.resolve(normalizedBase, normalizedRelative)
  }
}
```

## 8. relative() - 计算相对路径

### 8.1 功能描述

`path.relative()` 方法根据当前工作目录返回从 `from` 到 `to` 的相对路径。

### 8.1 语法

```javascript
path.relative(from, to)
```

### 8.2 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb'))
// 输出: '../../impl/bbb'

// 相同目录
console.log(path.relative('/var/www/app', '/var/www/app/index.html'))
// 输出: 'index.html'

// 子目录
console.log(path.relative('/var/www', '/var/www/app/public'))
// 输出: 'app/public'

// 父目录
console.log(path.relative('/var/www/app/public', '/var/www'))
// 输出: '../..'

// 相对路径
console.log(path.relative('src/utils', 'src/components/Button.jsx'))
// 输出: '../components/Button.jsx'

// Windows 路径
console.log(path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb'))
// 输出: '..\\..\\impl\\bbb'

// 边界情况
console.log(path.relative('/same/path', '/same/path'))
// 输出: '' - 相同路径返回空字符串

console.log(path.relative('', 'foo/bar'))
// 输出: 'foo/bar'

console.log(path.relative('foo/bar', ''))
// 输出: '../..'
```

### 8.3 使用场景

```javascript
// 1. 创建相对于项目根目录的路径
function getProjectRelativePath(absolutePath) {
  const projectRoot = process.cwd()
  return path.relative(projectRoot, absolutePath)
}

// 2. 模块导入路径转换
class ImportPathResolver {
  static toRelativeImport(fromFile, toFile) {
    const relativePath = path.relative(path.dirname(fromFile), toFile)

    // 确保以 ./ 或 ../ 开头
    if (!relativePath.startsWith('.')) {
      return `./${relativePath}`
    }

    return relativePath
  }

  static toAbsolutePath(baseFile, importPath) {
    if (importPath.startsWith('.')) {
      // 相对导入
      return path.resolve(path.dirname(baseFile), importPath)
    } else {
      // 模块导入
      return require.resolve(importPath, { paths: [path.dirname(baseFile)] })
    }
  }
}

// 3. 构建导航路径
class NavigationBuilder {
  constructor(currentPath) {
    this.currentPath = currentPath
  }

  getNavigationItems(targets) {
    return targets.map((target) => {
      const relativePath = path.relative(this.currentPath, target.path)

      return {
        name: target.name,
        path: relativePath,
        depth: this.calculateDepth(relativePath),
      }
    })
  }

  calculateDepth(relativePath) {
    if (relativePath === '') return 0

    const parts = relativePath.split(path.sep)
    // 计算需要向上导航的次数
    return parts.filter((part) => part === '..').length
  }
}

// 4. 文件依赖关系分析
class DependencyAnalyzer {
  constructor(entryFile) {
    this.entryFile = entryFile
    this.dependencies = new Map()
  }

  addDependency(dependentFile, dependencyFile) {
    const key = path.relative(process.cwd(), dependentFile)
    const value = path.relative(path.dirname(dependentFile), dependencyFile)

    if (!this.dependencies.has(key)) {
      this.dependencies.set(key, new Set())
    }

    this.dependencies.get(key).add(value)
  }

  generateDotGraph() {
    let dot = 'digraph Dependencies {\n'

    for (const [file, deps] of this.dependencies) {
      for (const dep of deps) {
        dot += `  "${file}" -> "${dep}";\n`
      }
    }

    dot += '}'
    return dot
  }
}

// 5. 构建工具中的路径映射
class PathMapper {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir
    this.distDir = distDir
  }

  mapToDist(srcPath) {
    const relativeToSrc = path.relative(this.srcDir, srcPath)
    return path.join(this.distDir, relativeToSrc)
  }

  mapToSrc(distPath) {
    const relativeToDist = path.relative(this.distDir, distPath)
    return path.join(this.srcDir, relativeToDist)
  }
}
```

## 9. resolve() - 解析绝对路径

### 9.1 功能描述

`path.resolve()` 方法将路径序列解析为绝对路径。给定的路径序列从右向左处理，每个后续的 path 会被追加到前面，直到构建出绝对路径。

### 9.2 语法

```javascript
path.resolve([...paths])
```

### 9.3 示例详解

```javascript
const path = require('path')

// 基本用法
console.log(path.resolve('/foo/bar', './baz'))
// 输出: '/foo/bar/baz'

console.log(path.resolve('/foo/bar', '/tmp/file/'))
// 输出: '/tmp/file' - 绝对路径重置

// 处理相对路径
console.log(path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif'))
// 如果当前目录是 /home/myself/node，输出:
// '/home/myself/node/wwwroot/static_files/gif/image.gif'

// 多个参数
console.log(path.resolve('src', 'components', 'Button.jsx'))
// 输出类似: '/current/working/directory/src/components/Button.jsx'

// 使用 ..
console.log(path.resolve('/foo', 'bar', '..', 'baz'))
// 输出: '/foo/baz'

// Windows 路径
console.log(path.resolve('C:\\foo', 'bar', 'baz'))
// 输出: 'C:\\foo\\bar\\baz'

// 空参数
console.log(path.resolve())
// 输出: 当前工作目录的绝对路径

// 混合路径
console.log(path.resolve('..', 'foo', 'bar'))
// 输出: 上一级目录中的 foo/bar 的绝对路径
```

### 9.4 使用场景

```javascript
// 1. 项目根目录解析
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')

// 2. 配置文件解析器
class ConfigResolver {
  constructor(baseDir) {
    this.baseDir = baseDir
  }

  resolveConfigPath(configName) {
    // 查找优先级：
    // 1. 本地覆盖配置
    // 2. 环境特定配置
    // 3. 默认配置

    const paths = [
      path.resolve(this.baseDir, 'config', 'local', `${configName}.json`),
      path.resolve(
        this.baseDir,
        'config',
        process.env.NODE_ENV || 'development',
        `${configName}.json`,
      ),
      path.resolve(this.baseDir, 'config', 'default', `${configName}.json`),
      path.resolve(this.baseDir, 'config', `${configName}.json`),
    ]

    for (const configPath of paths) {
      if (require('fs').existsSync(configPath)) {
        return configPath
      }
    }

    throw new Error(`找不到配置文件: ${configName}`)
  }
}

// 3. 模块加载器
class ModuleLoader {
  constructor(basePaths = []) {
    this.basePaths = [...basePaths, process.cwd(), __dirname]
  }

  resolve(moduleSpecifier) {
    if (moduleSpecifier.startsWith('.')) {
      // 相对路径
      return path.resolve(process.cwd(), moduleSpecifier)
    }

    // 尝试在每个基础路径中查找
    for (const basePath of this.basePaths) {
      try {
        const modulePath = path.resolve(
          basePath,
          'node_modules',
          moduleSpecifier,
        )
        if (require('fs').existsSync(modulePath)) {
          return modulePath
        }
      } catch (error) {
        // 继续尝试下一个路径
      }
    }

    throw new Error(`无法解析模块: ${moduleSpecifier}`)
  }
}

// 4. 静态文件服务器路径处理
class StaticFileServer {
  constructor(publicDir) {
    this.publicDir = path.resolve(publicDir)
  }

  serveFile(requestPath) {
    // 解析请求路径
    const requestedPath = path.resolve(requestPath)

    // 防止目录遍历攻击
    if (!requestedPath.startsWith(this.publicDir)) {
      throw new Error('禁止访问: 试图访问公共目录之外的文件')
    }

    // 确保文件存在
    if (!require('fs').existsSync(requestedPath)) {
      throw new Error('文件不存在')
    }

    // 检查是否是目录
    const stat = require('fs').statSync(requestedPath)
    if (stat.isDirectory()) {
      // 尝试返回 index.html
      const indexPath = path.join(requestedPath, 'index.html')
      if (require('fs').existsSync(indexPath)) {
        return indexPath
      }
      throw new Error('目录访问被禁止')
    }

    return requestedPath
  }
}

// 5. 构建工具路径配置
class BuildConfig {
  constructor() {
    this.root = path.resolve(__dirname, '..')
    this.src = path.resolve(this.root, 'src')
    this.dist = path.resolve(this.root, 'dist')
    this.public = path.resolve(this.root, 'public')
    this.nodeModules = path.resolve(this.root, 'node_modules')
  }

  getAliases() {
    return {
      '@': this.src,
      '@components': path.resolve(this.src, 'components'),
      '@utils': path.resolve(this.src, 'utils'),
      '@styles': path.resolve(this.src, 'styles'),
      '@assets': path.resolve(this.src, 'assets'),
    }
  }

  resolveAlias(importPath) {
    const aliases = this.getAliases()

    for (const [alias, aliasPath] of Object.entries(aliases)) {
      if (importPath.startsWith(alias)) {
        return importPath.replace(alias, aliasPath)
      }
    }

    return importPath
  }
}
```

## 10. 综合示例：完整的路径工具库

```javascript
const path = require('path');
const fs = require('fs');

class PathUtils {
  /**
   * 安全地解析路径，防止目录遍历攻击
   */
  static safeResolve(baseDir, ...paths) {
    const resolvedPath = path.resolve(baseDir, ...paths);
    const normalizedBase = path.normalize(baseDir);

    // 确保解析的路径不会逃逸基础目录
    if (!resolvedPath.startsWith(normalizedBase)) {
      throw new Error(`安全违规: 路径 "${resolvedPath}" 试图逃逸基础目录 "${normalizedBase}"`);
    }

    return resolvedPath;
  }

  /**
   * 获取相对于项目根目录的路径
   */
  static getProjectRelative(absolutePath) {
    const projectRoot = process.cwd();
    return path.relative(projectRoot, absolutePath);
  }

  /**
   * 规范化并清理路径
   */
  static cleanPath(pathStr) {
    if (!pathStr) return '.';

    // 规范化路径
    let cleaned = path.normalize(pathStr);

    // 移除末尾的路径分隔符（除非是根目录）
    if (cleaned.length > 1 && cleaned.endsWith(path.sep)) {
      cleaned = cleaned.slice(0, -1);
    }

    return cleaned;
  }

  /**
   * 确保目录存在
   */
  static ensureDir(dirPath) {
    const normalizedPath = this.cleanPath(dirPath);

    if (!fs.existsSync(normalizedPath)) {
      fs.mkdirSync(normalizedPath, { recursive: true });
    }

    return normalizedPath;
  }

  /**
   * 路径信息对象
   */
  static parsePathInfo(filePath) {
    const cleaned = this.cleanPath(filePath);

    return {
      absolute: path.isAbsolute(cleaned) ? cleaned : path.resolve(cleaned),
      relative: this.getProjectRelative(cleaned),
      dirname: path.dirname(cleaned),
      basename: path.basename(cleaned),
      filename: path.basename(cleaned, path.extname(cleaned)),
      extname: path.extname(cleaned),
      isAbsolute: path.isAbsolute(cleaned),
      exists: fs.existsSync(cleaned)
    };
  }

  /**
   * 查找文件（支持多个可能的位置）
   */
  static findFile(filename, searchPaths = []) {
    const defaultPaths = [
      process.cwd(),
      __dirname,
      path.dirname(process.argv[1])
    ];

    const allPaths = [...searchPaths, ...defaultPaths];

    for (const searchPath of allPaths) {
      const possiblePaths = [
        path.join(searchPath, filename),
        path.resolve(searchPath, filename)
      ];

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          return possiblePath;
        }
      }
    }

    return null;
  }

  /**
   * 创建备份文件名
   */
  static createBackupName(originalPath, suffix = 'backup') {
    const info = this.parsePathInfo(originalPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return path.join(
      info.dirname,
      `${info.filename}_${suffix}_${timestamp}${info.extname}`
    );
  }

  /**
   * 构建跨平台路径（用于显示）
   */
  static toDisplayPath(filePath) {
    const normalized = this.cleanPath(filePath);

    // 如果是 Windows 路径，统一使用正斜杠显示
    if (path.sep === '\\') {
      return normalized.replace(/\\/g, '/');
    }

    return normalized;
  }
}

// 使用示例
async function exampleUsage() {
  // 1. 安全路径解析
  try {
    const safePath = PathUtils.safeResolve('/safe/dir', 'subdir', 'file.txt');
    console.log('安全路径:', safePath);
  } catch (error) {
    console.error('路径安全错误:', error.message);
  }

  // 2. 获取路径信息
  const info = PathUtils.parsePathInfo('./src/components/Button.jsx');
  console.log('路径信息:', info);

  // 3. 查找配置文件
  const configPath = PathUtils.findFile('package.json', [
    PathUtils.cleanPath('../../')
  ]);

  if (configPath) {
    console.log('找到配置文件:', configPath);
  }

  // 4. 创建备份
  const backupPath = PathUtils.createBackupName('/data/important.doc', '自动备份');
  console.log
```
