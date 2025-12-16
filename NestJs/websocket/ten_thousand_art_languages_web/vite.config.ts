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
  }
})
