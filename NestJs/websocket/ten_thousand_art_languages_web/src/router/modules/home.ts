import { MenuOrderEnum } from '@/router/enum'
const Layout = () => import('@/layout/Layout.vue')

export default {
  path: '/welcome',
  component: Layout,
  meta: {
    icon: 'ep:home-filled',
    title: '首页',
    rank: MenuOrderEnum.Welcome
  },
  children: [
    {
      path: '',
      name: 'Welcome',
      component: () => import('@/views/welcome/index.vue'),
      meta: {
        title: '首页',
        showCurrentMenu: true
      }
    }
  ]
} satisfies RouteConfigImp
