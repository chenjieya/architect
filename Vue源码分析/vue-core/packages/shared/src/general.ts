/**
 * 判断当前值 是不是一个对象
 */
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

/**
 * 比较两个值是否发生改变
 */
export function hasChanged(value: any, oldValue: any): boolean {
  return !Object.is(value, oldValue)
}
