import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// 自动导入
import AutoImport from 'unplugin-auto-import/vite'
// name->setup
import vueSetupExtend from 'unplugin-vue-setup-extend-plus/vite'
// element -> autoimport
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],
      resolvers: [ElementPlusResolver()],
      dts: './types/auto-imports.d.ts'
    }),
    vueSetupExtend({
      enableAutoExpose: true
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: './types/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      //define global scss variable vue不认识mixin
      scss: {
        additionalData: `@use "@/assets/css/mixin.scss" as *;`
      }
    }
  },
  // 添加 server 配置
  server: {
    // 代理配置
    proxy: {
      // 代理所有以 /api 开头的请求
      '/api': {
        target: 'http://127.0.0.1:3000', // 后端地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀
        // 其他可选配置
        secure: false, // 如果是 https，需要设置为 false
        // 连接超时设置
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 可以在这里添加请求头等操作
            console.log(`Proxy: ${req.method} ${req.url} -> ${options.target}${req.url}`)
          })
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err)
          })
        }
      }

      // 如果需要代理多个路径，可以继续添加
      // '/minio': {
      //   target: 'http://127.0.0.1:9000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/minio/, '')
      // }
    },

    // 可选：服务器配置
    host: '0.0.0.0', // 监听所有地址
    port: 5173, // 默认端口
    open: false, // 自动打开浏览器
    cors: true, // 启用 CORS

    // 热更新配置
    hmr: {
      overlay: true // 显示错误覆盖层
    }
  },

  // 可选：构建配置
  build: {
    // 构建后目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 资源大小限制警告
    assetsInlineLimit: 4096,
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将依赖分包
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'axios-vendor': ['axios']
        }
      }
    }
  }
})
