## 1. 概述

Node.js 的 `os` 模块提供了与操作系统相关的实用方法和属性。无需安装，直接通过 `require('os')` 引入即可使用。本博客将详细解析其中最常用的几个 API。

## 2. EOL - 操作系统特定的行末标志

### 2.1 功能描述

`os.EOL` 返回当前操作系统的行结束符标记。

### 2.2 不同系统的返回值

```javascript
const os = require('os')

console.log(os.EOL)
// Windows: '\r\n'
// POSIX (Linux/macOS): '\n'
```

### 2.3 使用场景

```javascript
const fs = require('fs')
const os = require('os')

// 跨平台文件写入，自动使用正确的换行符
const content = ['第一行', '第二行', '第三行'].join(os.EOL)
fs.writeFileSync('output.txt', content)

// 字符串分割
const text = 'Hello\nWorld\r\nTest'
const lines = text.split(os.EOL)
console.log(lines) // 根据实际EOL分割
```

### 2.4 注意事项

- 不要硬编码 `\n` 或 `\r\n`，使用 `os.EOL` 确保跨平台兼容性
- 处理外部文件时，注意文件可能使用不同的换行符

## 3. arch() - 操作系统CPU架构

### 3.1 功能描述

返回操作系统的 CPU 架构。

### 3.2 常见返回值

```javascript
console.log(os.arch())
// 可能的值:
// 'x64'     - 64位x86架构
// 'arm'     - ARM架构(32位)
// 'arm64'   - ARM64架构
// 'ia32'    - 32位x86架构
// 'mips'    - MIPS架构
// 'mipsel'  - 小端MIPS
// 'ppc'     - PowerPC
// 'ppc64'   - 64位PowerPC
// 's390'    - IBM System/390
// 's390x'   - IBM System/390x
```

### 3.3 使用场景

```javascript
const os = require('os')

// 根据架构选择不同的二进制文件
function getBinaryPath() {
  const arch = os.arch()

  switch (arch) {
    case 'x64':
      return './bin/x64/app'
    case 'arm64':
      return './bin/arm64/app'
    case 'arm':
      return './bin/arm/app'
    default:
      throw new Error(`不支持的架构: ${arch}`)
  }
}

// 检查是否64位系统
function is64bit() {
  return os.arch().includes('64')
}

console.log(`当前架构: ${os.arch()}`)
console.log(`是否64位: ${is64bit()}`)
```

## 4. cpus() - CPU核心信息

### 4.1 功能描述

返回一个包含每个逻辑 CPU 核心信息的对象数组。

### 4.2 数据结构

```javascript
const cpus = os.cpus()
console.log(cpus[0])
// 输出类似:
// {
//   model: 'Intel(R) Core(TM) i7-7700HQ CPU @ 2.80GHz',
//   speed: 2800,  // MHz
//   times: {
//     user: 252020,    // 用户模式运行时间(毫秒)
//     nice: 0,         // 低优先级用户模式运行时间
//     sys: 30340,      // 系统模式运行时间
//     idle: 107035687, // 空闲时间
//     irq: 0           // 中断请求时间
//   }
// }
```

### 4.3 使用场景

```javascript
const os = require('os')

// 1. 获取CPU核心数
const cpuCount = os.cpus().length
console.log(`CPU核心数: ${cpuCount}`)

// 2. 计算CPU使用率
function getCPUUsage() {
  const cpus = os.cpus()
  const usage = []

  cpus.forEach((cpu, index) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
    const idle = cpu.times.idle
    const used = total - idle
    const percent = (used / total) * 100

    usage.push({
      core: index,
      model: cpu.model,
      usage: percent.toFixed(2) + '%',
      speed: cpu.speed + 'MHz',
    })
  })

  return usage
}

// 3. 负载均衡时确定工作线程数
const workerCount = Math.max(1, os.cpus().length - 1) // 保留一个核心给系统

// 4. 获取CPU型号信息
const cpuModels = new Set(os.cpus().map((cpu) => cpu.model))
console.log('CPU型号:', Array.from(cpuModels))
```

## 5. freemem() 和 totalmem() - 内存信息

### 5.1 功能描述

- `os.freemem()`: 返回系统空闲内存的字节数
- `os.totalmem()`: 返回系统总内存的字节数

### 5.2 使用示例

```javascript
const os = require('os')

// 字节转换为可读格式
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }

  return `${bytes.toFixed(2)} ${units[i]}`
}

// 获取内存信息
const freeMemory = os.freemem()
const totalMemory = os.totalmem()
const usedMemory = totalMemory - freeMemory
const memoryUsage = (usedMemory / totalMemory) * 100

console.log(`总内存: ${formatBytes(totalMemory)}`)
console.log(`空闲内存: ${formatBytes(freeMemory)}`)
console.log(`已用内存: ${formatBytes(usedMemory)}`)
console.log(`内存使用率: ${memoryUsage.toFixed(2)}%`)

// 内存监控
function monitorMemory(threshold = 0.9) {
  const usage = 1 - os.freemem() / os.totalmem()

  if (usage > threshold) {
    console.warn(`内存使用率过高: ${(usage * 100).toFixed(2)}%`)
    // 执行清理操作或报警
  }

  return usage
}

// 检查是否有足够内存执行操作
function hasEnoughMemory(requiredBytes) {
  return os.freemem() > requiredBytes * 1.5 // 保留50%余量
}
```

## 6. homedir() - 用户主目录

### 6.1 功能描述

返回当前用户的主目录路径。

### 6.2 使用场景

```javascript
const os = require('os')
const path = require('path')

// 获取主目录
const homeDir = os.homedir()
console.log(`用户主目录: ${homeDir}`)
// Windows: 'C:\Users\用户名'
// Linux/macOS: '/home/用户名' 或 '/Users/用户名'

// 访问用户配置文件
const configPaths = {
  windows: path.join(homeDir, 'AppData', 'Roaming', 'myapp'),
  linux: path.join(homeDir, '.config', 'myapp'),
  macos: path.join(homeDir, 'Library', 'Application Support', 'myapp'),
}

// 跨平台配置文件路径
function getConfigPath() {
  const platform = os.platform()
  const home = os.homedir()

  switch (platform) {
    case 'win32':
      return path.join(home, 'AppData', 'Roaming', 'myapp')
    case 'darwin': // macOS
      return path.join(home, 'Library', 'Application Support', 'myapp')
    default: // Linux和其他Unix系统
      return path.join(home, '.config', 'myapp')
  }
}

// 安全存储用户数据
const userDataDir = path.join(os.homedir(), '.myapp-data')
```

## 7. hostname() - 操作系统主机名

### 7.1 功能描述

返回操作系统的主机名。

### 7.2 使用场景

```javascript
const os = require('os')

// 获取主机名
const hostname = os.homedir()
console.log(`主机名: ${hostname}`)

// 应用标识
const appInstanceId = `${hostname}-${process.pid}-${Date.now()}`
console.log(`应用实例ID: ${appInstanceId}`)

// 网络服务标识
const serverInfo = {
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch(),
  version: process.version,
}

// 集群环境中的节点标识
function getNodeIdentifier() {
  return {
    host: os.hostname(),
    ip: Object.values(os.networkInterfaces())
      .flat()
      .find((nic) => nic.family === 'IPv4' && !nic.internal)?.address,
    pid: process.pid,
  }
}

// 日志记录
console.log(`[${new Date().toISOString()}] [${hostname}] 应用启动`)
```

## 8. tmpdir() - 临时目录

### 8.1 功能描述

返回操作系统默认的临时文件目录。

### 8.2 不同系统的临时目录

```javascript
const tmpDir = os.tmpdir()
console.log(`临时目录: ${tmpDir}`)
// Windows: 'C:\Users\用户名\AppData\Local\Temp'
// Linux: '/tmp'
// macOS: '/var/folders/.../T/'
```

### 8.3 使用场景

```javascript
const os = require('os')
const fs = require('fs')
const path = require('path')

// 创建临时文件
function createTempFile(content, extension = '.tmp') {
  const tempDir = os.tmpdir()
  const tempFile = path.join(tempDir, `temp-${Date.now()}${extension}`)

  fs.writeFileSync(tempFile, content)
  console.log(`临时文件创建于: ${tempFile}`)

  return tempFile
}

// 临时目录清理
const tempDir = os.tmpdir()
const maxAge = 24 * 60 * 60 * 1000 // 24小时

function cleanupOldTempFiles() {
  fs.readdir(tempDir, (err, files) => {
    if (err) return

    files.forEach((file) => {
      if (file.startsWith('myapp-')) {
        const filePath = path.join(tempDir, file)
        fs.stat(filePath, (err, stats) => {
          if (!err && Date.now() - stats.mtimeMs > maxAge) {
            fs.unlink(filePath, (err) => {
              if (!err) console.log(`清理文件: ${file}`)
            })
          }
        })
      }
    })
  })
}

// 安全临时文件路径
function getSecureTempPath(prefix = '') {
  const crypto = require('crypto')
  const randomName = crypto.randomBytes(16).toString('hex')
  return path.join(os.tmpdir(), `${prefix}${randomName}`)
}
```

## 9. 综合示例：系统信息监控工具

```javascript
const os = require('os')
const path = require('path')

class SystemMonitor {
  constructor() {
    this.updateInterval = 5000 // 5秒更新一次
    this.monitoring = false
  }

  getSystemInfo() {
    return {
      // 基本信息
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),

      // CPU信息
      cpus: {
        count: os.cpus().length,
        models: [...new Set(os.cpus().map((cpu) => cpu.model))],
        usage: this.getCPUUsage(),
      },

      // 内存信息
      memory: {
        total: this.formatBytes(os.totalmem()),
        free: this.formatBytes(os.freemem()),
        used: this.formatBytes(os.totalmem() - os.freemem()),
        usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%',
      },

      // 系统运行时间
      uptime: this.formatUptime(os.uptime()),

      // 用户信息
      userInfo: os.userInfo(),

      // 网络信息
      network: Object.keys(os.networkInterfaces()).length + '个网络接口',

      // 路径信息
      paths: {
        home: os.homedir(),
        temp: os.tmpdir(),
        current: process.cwd(),
      },

      timestamp: new Date().toISOString(),
    }
  }

  getCPUUsage() {
    const cpus = os.cpus()
    return cpus.map((cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b)
      const idle = cpu.times.idle
      return (((total - idle) / total) * 100).toFixed(2) + '%'
    })
  }

  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024
      i++
    }
    return `${bytes.toFixed(2)} ${units[i]}`
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}天 ${hours}小时 ${minutes}分钟`
  }

  startMonitoring() {
    this.monitoring = true
    console.log('开始监控系统状态...\n')

    const monitor = () => {
      if (!this.monitoring) return

      const info = this.getSystemInfo()
      console.clear()
      console.log('=== 系统监控 ===')
      console.log(
        `主机: ${info.hostname} | 平台: ${info.platform} | 架构: ${info.arch}`,
      )
      console.log(`运行时间: ${info.uptime}`)
      console.log(
        `\nCPU: ${info.cpus.count}核心 | 使用率: ${info.cpus.usage.join(', ')}`,
      )
      console.log(
        `内存: ${info.memory.used} / ${info.memory.total} (${info.memory.usage})`,
      )
      console.log(`\n用户: ${info.userInfo.username}`)
      console.log(`主目录: ${info.paths.home}`)
      console.log(`临时目录: ${info.paths.temp}`)
      console.log(`\n更新时间: ${info.timestamp}`)
      console.log('按 Ctrl+C 停止监控')

      setTimeout(monitor, this.updateInterval)
    }

    monitor()
  }

  stopMonitoring() {
    this.monitoring = false
    console.log('\n监控已停止')
  }
}

// 使用示例
const monitor = new SystemMonitor()
monitor.startMonitoring()

// 10秒后停止监控
setTimeout(() => monitor.stopMonitoring(), 10000)
```

## 10. 总结

Node.js 的 `os` 模块提供了丰富的系统级API，可以帮助我们：

1. **跨平台开发**：使用 `os.EOL`、`os.homedir()`、`os.tmpdir()` 确保应用在不同操作系统上行为一致
2. **资源监控**：通过 `os.cpus()`、`os.freemem()`、`os.totalmem()` 监控系统资源使用情况
3. **系统识别**：使用 `os.arch()`、`os.hostname()`、`os.platform()` 识别运行环境
4. **路径处理**：正确处理用户目录和临时目录
5. **性能优化**：根据CPU核心数优化线程/进程数量

掌握这些API可以帮助开发者编写更健壮、更高效的Node.js应用程序，特别是在需要与操作系统交互或进行系统监控的场景中。
