/**
 * 触发依赖更新
 */
export function trigger(target: object, key: string | Symbol) {
  console.log(`更新依赖： 属性${key}被设置了`)
}

/**
 * 收集依赖
 */
export function track(target: object, key: string | Symbol) {
  console.log(`收集依赖： 属性${key}被读取了`)
}
