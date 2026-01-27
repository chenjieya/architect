import { reactive, isReactive } from '@alvis/reactivity'

describe('reactivity/reactive', () => {
  it('应该是一个对象', () => {
    const original = { a: 1 }
    const proxyObj = reactive<{ a: number; b?: number }>(original)

    expect(proxyObj).not.toBe(original)

    expect(isReactive(proxyObj)).toBe(true)
    expect(isReactive(original)).toBe(false)

    // get
    expect(proxyObj.a).toBe(1)
    // has
    expect('a' in proxyObj).toBe(true)
    expect('c' in proxyObj).toBe(false)

    // keys
    expect(Object.keys(proxyObj)).toEqual(['a'])

    // add
    proxyObj.b = 1
    expect(proxyObj.b).toBe(1)
    expect('b' in proxyObj).toBe(true)

    // delete
    delete proxyObj.b
    expect('b' in proxyObj).toBe(false)

    // set
    proxyObj.b = 12
    expect('b' in proxyObj).toBe(true)
    expect(proxyObj.b).toBe(12)
  })

  it('reactive(代理对象)', () => {
    const original = { a: 1 }
    const proxyObj1 = reactive(original)
    const proxyObj2 = reactive(proxyObj1)

    expect(isReactive(proxyObj2)).toBe(true)

    expect(proxyObj2).toBe(proxyObj1)
    expect(proxyObj2).not.toBe(original)
  })
})
