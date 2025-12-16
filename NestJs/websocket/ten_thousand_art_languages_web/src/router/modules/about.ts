import { MenuOrderEnum } from '@/router/enum'
const Layout = () => import('@/layout/Layout.vue')

export default {
  path: '/about',
  meta: {
    icon: 'ri:file-info-line',
    title: '关于',
    rank: MenuOrderEnum.About
  },
  children: [
    {
      path: '',
      name: 'About',
      component: () => import('@/views/about/About.vue'),
      meta: {
        title: '关于',
        showCurrentMenu: true
      }
    }
  ]
} satisfies RouteConfigImp
