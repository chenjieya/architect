import { isObject } from '@alvis/shared'
import { mutableHandlers } from './baseHandlers'
import { ReactiveFlags } from './constants'

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.RAW]?: any
}

const proxyMap = new WeakMap<Target, any>()

/**
 * 响应式函数
 */
export function reactive<T extends object>(target: T): T
export function reactive(target: object) {
  // 1. 边界校验，检查是否是一个对象
  if (!isObject(target)) {
    // 不是一个对象则，原路返回
    console.warn('reactive函数接受的参数应该是一个对象')
    return target
  }

  // 2.检查原对象是否被代理过，如果代理过则直接返回
  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }

  // 3.检查参数是否是响应式对象，如果是响应式对象则返回响应式对象
  // 如果target是代理对象，target[ReactiveFlags.IS_REACTIVE]他会去访问下面声明的代理
  if (target[ReactiveFlags.IS_REACTIVE]) {
    // 条件要是为true就说明被代理过了
    return target
  }

  const proxy = new Proxy(target, mutableHandlers)

  proxyMap.set(target, proxy)

  return proxy
}
