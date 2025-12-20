import './assets/css/main.css'
import '@/assets/css/custom-element-ui.scss'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import 'default-passive-events'

import { createApp } from 'vue'
import pinia from '@/stores/index'

import App from './App.vue'
import router from './router'

import vDrag from './directives/v-drag'

import autoExpose from 'unplugin-vue-setup-extend-plus/dist/client/index'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(pinia)
app.directive('drag', vDrag)
app.use(autoExpose)
app.use(router)

app.mount('#app')
