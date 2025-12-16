import HomeView from '@/views/HomeView.vue'
const Layout = () => import('@/layout/Layout.vue')

export default [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/login/Login.vue'),
  //   meta: {
  //     title: '登录',
  //     showCurrentMenu: false,
  //     rank: 101
  //   }
  // },
  {
    path: '/redirect',
    component: Layout,
    meta: {
      title: '加载中...',
      showCurrentMenu: false,
      rank: 102
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/layout/Redirect.vue')
      }
    ]
  },
  {
    path: '/empty',
    name: 'Empty',
    component: () => import('@/views/empty/Empty.vue'),
    meta: {
      title: '无Layout页面',
      showCurrentMenu: false,
      rank: 103
    }
  }
] satisfies Array<RouteConfigImp>
