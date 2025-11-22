import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: HomeView
    },
    {
      name: 'about',
      path: '/about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      name: 'basic',
      path: '/basic',
      component: () => import('@/views/BasicView.vue')
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/LoginView.vue')
    }
  ],
})

export default router
