/** 全局声明路由声明 */
import { RouteComponent } from 'vue-router'

declare global {
  // 自定义路由meta类型
  interface CustomRouteMetaImp {
    /** 菜单名称-需要支持国际化 */
    title: string
    /** 菜单前面图标 */
    icon?: string
    /** 是否在菜单中展示-默认true */
    showCurrentMenu?: boolean
    /** 是否显示父级菜单 */
    showParentMenu?: boolean
    /** 是否缓存(开启true、关闭false) */
    keepAlive?: boolean
    /** 是否全屏 */
    fullScreen?: boolean
    /** 激活指定菜单 */
    activePath?: string
  }

  // 子路由
  interface ChildRouteConfigImp {
    /** 子路由meta */
    meta?: CustomRouteMetaImp
    children?: ChildRouteConfigImp[]
    /** 路由名称 */
    name?: string
    /** 路由路径 */
    path: string
    /** 重定向地址 */
    redirect?: string
    /** 路由匹配组件 */
    component?: RouteComponent
  }

  // 完整路由表
  interface RouteConfigImp extends ChildRouteConfigImp {
    meta?: {
      title: string
      icon?: string
      showCurrentMenu?: boolean
      /** 顶级路由排序-值越高越靠后 */
      rank?: number
    }
  }

  declare module 'vue-router' {
    interface RouteMeta extends CustomRouteMetaImp {}
  }
}
