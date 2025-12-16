import { createRouter, createWebHistory } from 'vue-router'
import remaining from './modules/remaining'

/** 动态导入静态路由模块 */
const modules: Record<string, any> = import.meta.glob(
  ['./modules/**/*.ts', '!./modules/**/remaining.ts'],
  {
    eager: true
  }
)

/** 原始静态路由-未作任何处理 */
const routes = []
Object.keys(modules).forEach((key) => routes.push(modules[key].default))

const router = createRouter({
  history: createWebHistory(),
  routes: [...remaining]
})

export default router
