import { type Target, reactive } from './reactive'
import { track, trigger } from './dep'
import { isObject, hasChanged } from '@alvis/shared'
import { ReactiveFlags, TrackOpTypes, TriggerOpTypes } from './constants'

export const ITERATE_KEY: unique symbol = Symbol('')

class BaseReactiveHandler implements ProxyHandler<Target> {
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 收集依赖
    track(target, TrackOpTypes.GET, key)

    const value = Reflect.get(target, key, receiver)

    // 对象嵌套问题
    if (isObject(value)) {
      return reactive(value)
    }

    return value
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  set(
    target: Record<string | symbol, unknown>,
    key: string | symbol,
    value: unknown,
    revicer: object,
  ) {
    // 是新增，还是赋值
    const hasKey = target.hasOwnProperty(key)

    if (!hasKey) {
      // 新增属性
      // 更新依赖
      trigger(target, TriggerOpTypes.ADD, key)
    } else {
      // 赋值
      // 新和旧值是否相等
      const oldValue = target[key]
      const newValue = value

      if (!hasChanged(oldValue, newValue)) {
        return true
      }
      // 更新依赖
      trigger(target, TriggerOpTypes.SET, key)
    }

    return Reflect.set(target, key, value, revicer)
  }
  has(target: Record<string | symbol, unknown>, key: string | symbol) {
    // 收集依赖
    track(target, TrackOpTypes.HAS, key)

    return Reflect.has(target, key)
  }
  ownKeys(target: Record<string | symbol, unknown>) {
    // 收集依赖
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
  deleteProperty(
    target: Record<string | symbol, unknown>,
    key: string | symbol,
  ) {
    // 触发依赖更新
    trigger(target, TriggerOpTypes.DELETE, key)
    return Reflect.deleteProperty(target, key)
  }
}

export const mutableHandlers: ProxyHandler<object> =
  new MutableReactiveHandler()
