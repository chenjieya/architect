import { MenuOrderEnum } from '@/router/enum'

export default {
  path: '/result',
  redirect: '/result/success',
  meta: {
    icon: 'ri:checkbox-circle-line',
    title: '结果页面',
    rank: MenuOrderEnum.Result
  },
  children: [
    {
      path: '/result/success',
      name: 'Success',
      component: () => import('@/views/result/success/Success.vue'),
      meta: {
        title: '成功页面'
      }
    },
    {
      path: '/result/fail',
      name: 'Fail',
      component: () => import('@/views/result/fail/Fail.vue'),
      meta: {
        title: '失败页面'
      }
    }
  ]
} satisfies RouteConfigImp
