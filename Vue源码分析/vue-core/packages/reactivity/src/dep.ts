import { TrackOpTypes, TriggerOpTypes } from './constants'

/**
 * 触发依赖更新
 */
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key: string | Symbol,
) {
  console.log(`更新依赖： 【${type}】属性${String(key)}被修改了`)
}

/**
 * 收集依赖
 */
export function track(
  target: object,
  type: TrackOpTypes,
  key: string | Symbol,
) {
  console.log(`收集依赖： 【${type}】属性${String(key)}被读取了`)
}
