/**
 * 判断当前值 是不是一个对象
 */
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}
