import { MenuOrderEnum } from '@/router/enum'

export default {
  path: '/nested',
  redirect: '/nested/menu1/menu1-1',
  meta: {
    title: '多级菜单',
    icon: 'ep:histogram',
    rank: MenuOrderEnum.Nested
  },
  children: [
    {
      path: '/nested/menu1',
      meta: {
        title: '多级菜单',
        keepAlive: true
      },
      redirect: '/nested/menu1/menu1-1',
      children: [
        {
          path: '/nested/menu1/menu1-1',
          component: () => import('@/views/nested/menu1/menu1-1/index.vue'),
          name: 'Menu1-1',
          meta: {
            title: '菜单1-1',
            keepAlive: true
          }
        },
        {
          path: '/nested/menu1/menu1-2',
          name: '',
          redirect: '/nested/menu1/menu1-2/menu1-2-1',
          meta: {
            title: '菜单1-2',
            keepAlive: true
          },
          children: [
            {
              path: '/nested/menu1/menu1-2/menu1-2-1',
              component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1/index.vue'),
              name: 'Menu1-2-1',
              meta: {
                title: '菜单1-2-1',
                keepAlive: true
              }
            },
            {
              path: '/nested/menu1/menu1-2/menu1-2-2',
              component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2/index.vue'),
              name: 'Menu1-2-2',
              meta: {
                title: '菜单1-2-2',
                keepAlive: true
              }
            }
          ]
        },
        {
          path: '/nested/menu1/menu1-3',
          component: () => import('@/views/nested/menu1/menu1-3/index.vue'),
          name: 'Menu1-3',
          meta: {
            title: '菜单1-3',
            keepAlive: true
          }
        }
      ]
    },
    {
      path: '/nested/menu2',
      name: 'Menu2',
      component: () => import('@/views/nested/menu2/index.vue'),
      meta: {
        title: '菜单二',
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigImp
