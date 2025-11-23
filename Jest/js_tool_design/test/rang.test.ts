import { rang } from '../src/packages/rang'

describe("测试rang数组新的方法", () => {

  test("测试rang方法参数正常的情况", () => {
    expect(rang(1, 6)).toEqual([1, 2, 3, 4, 5])
    expect(rang(1, 6, 2)).toEqual([1, 3, 5])
    expect(rang(6, 1)).toEqual([6, 5, 4, 3, 2])
    expect(rang(6, 1, -2)).toEqual([6, 4, 2])
  })


  test("测试rang方法参数异常的情况", () => {

    // 空参
    expect(rang()).toEqual([])

    // 只传入一个参数的情况下
    expect(rang(2)).toEqual([2, 1])  
    expect(rang(-2)).toEqual([-2, -1])  


    // 参数类型错误的情况下
    expect(rang('a' as never as number, 'b'as never as number, 'c'as never as number)).toEqual([])


    // 第三个参数相反的情况下
    expect(rang(1, 6, -2)).toEqual([1, 3, 5])
    expect(rang(6, 1, 2)).toEqual([6, 4, 2])
  })


})