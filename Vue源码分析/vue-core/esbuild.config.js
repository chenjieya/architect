import esbuild from 'esbuild'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const {
  positionals,
  values: { format: rawFormat, inline: inlineCode },
} = parseArgs({
  // 允许传入未定义的参数， 如果传入了会被原封不动的放到返回值 positionals中
  // 作用： 可以指定打包那个 包， 默认是vue
  allowPositionals: true,
  options: {
    // 指定打包的格式
    format: {
      type: 'string',
      short: 'f',
      default: 'global',
    },
    inline: {
      type: 'boolean',
      short: 'i',
      default: false,
    },
  },
})

const bundlerFormat = ['cjs', 'esm', 'global']

if (!bundlerFormat.includes(rawFormat)) {
  throw new Error('f参数支持cjs,esm,global')
}

// 打包格式
const format = rawFormat
const outFormat = format === 'global' ? 'iife' : format
// 需要打包的  包
const targets = positionals.length ? positionals : ['vue']

for (const target of targets) {
  // 找到需要打包的目录
  const dirDist = `./packages/${target}`
  // 找到该目录下面的package.json文件
  const pkg = require(`${dirDist}/package.json`)
  const outfile = resolve(__dirname, `${dirDist}/dist/${target}.${format}.js`)

  // 项目根目录开始的绝对路径
  const relativeOutfile = relative(process.cwd(), outfile)

  let external = []
  // 排除不需要打包的
  if (!inlineCode) {
    // dependencies，peerDeooendencies中的包是不需要打包进来的
    // 因为在开发环境中，基本是使用node进行运行的，node的查找规则可以让你直接使用这些包
    // 要是在生产环境中，也不需要打包，因为安装vue的时候，vue包的生产依赖会直接将这些包下载下来
    // 所以无论哪种情况，都不需要在源码打包中加入这些包的代码
    if (format === 'cjs' || format === 'esm') {
      external = [
        ...external,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDeooendencies || {}),
      ]
    }
  }

  const plugins = [
    {
      name: 'log-rebuild',
      setup(build) {
        build.onEnd(() => {
          console.log(`构建模块：${relativeOutfile}`)
        })
      },
    },
  ]

  esbuild
    .context({
      entryPoints: [resolve(__dirname, `${dirDist}/src/index.ts`)],
      bundle: true,
      sourcemap: true,
      outfile,
      platform: format === 'cjs' ? 'node' : 'browser',
      plugins,
      format: outFormat,
      globalName: pkg.buildOptions?.name,
      external,
    })
    .then(ctx => {
      ctx.watch()
    })
}
