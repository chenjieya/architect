
// const { sum, sub, mul, div } = require("./tool");


// // test("加法测试", () => {
// //   expect(sum(1, 2)).toBe(3)
// // })

// // test("减法测试", () => {
// //   expect(sub(1, 2)).toBe(-1)
// // })

// // test("乘法测试", () => {
// //   expect(mul(1, 2)).toBe(2)
// // })

// // test("除法测试", () => {
// //   expect(div(1, 2)).toBe(0.5)
// // })

// describe("加减法组合测试", () => {
//   test("加法测试", () => {
//     expect(sum(1, 2)).toBe(3)
//   })

//   test("减法测试", () => {
//     expect(sub(1, 2)).toBe(-1)
//   })
// })

// describe("乘除法组合测试", () => {
//   beforeEach(() => {
//     console.log("乘除法测试--分组开始前执行--beforeEach");
//   })

//   afterEach(() => {
//     console.log("乘除法测试--分组结束执行--beforeEach");
//   })

//   beforeAll(() => {
//     console.log("乘除法测试--分组开始前执行--beforeAll");
//   })

//   afterAll(() => {
//     console.log("乘除法测试--分组结束执行--afterAll");
//   })

//   test("乘法测试", () => {
//     expect(mul(1, 2)).toBe(2)
//   })

//   test("除法测试", () => {
//     expect(div(1, 2)).toBe(0.5)
//   })
// })


// // 修饰符
// // test("使用修饰符测试", () => {
// //   // 1+2 不等于4  成立
// //   expect(sum(1,2)).not.toBe(4)
// // })

// // 匹配器（常用匹配器 toBe toEqual）
// // toBe 比较的是地址， toEqual 比较的是值
// // test("对象深度匹配测试", () => {
// //   const obj = { name: 'Alvis', source: { css: 90, js: 100 } }
// //   // toBe比较的是地址
// //   expect(obj).not.toBe({ name: 'Alvis', source: { css: 90, js: 100 } })
// //   expect(obj).toBe(obj)

// //   expect(obj).toEqual({ name: 'Alvis', source: { css: 90, js: 100 } })
// // })


// // // 布尔值匹配器
// // test("布尔值匹配器", () => {
// //   const a = null
// //   const b = 0

// //   expect(a).toBeFalsy()
// //   expect(a).not.toBeTruthy()

// //   expect(b).toBeFalsy()
// //   expect(b).not.toBeTruthy()
// // })


// // // 无参数匹配器
// // test("无参数匹配器", () => {
// //   const a = null
// //   const b = undefined
// //   let c
// //   const d = NaN

// //   expect(a).toBeNull()
// //   expect(b).toBeUndefined()
// //   expect(c).not.toBeDefined()
// //   // expect(d).toBeNull() // 失败
// //   expect(d).toBeNaN()
// // })


// // // 数值比较匹配器
// // test("数值相关匹配器", () => {
// //   const value = 10

// //   // 是否大于
// //   expect(value).toBeGreaterThan(8)
// //   // 大于等于
// //   expect(value).toBeGreaterThanOrEqual(8)

// //   // 是否小于
// //   expect(value).toBeLessThan(12)
// //   // 小于等于
// //   expect(value).toBeLessThanOrEqual(10)

// //   // 浮点型
// //   const value1 = 0.1 + 0.2 // 0.30000000000000004
// //   // 接近于
// //   expect(value1).toBeCloseTo(0.3)

// //   // toBeCloseTo 第二个参数代表比较的是 小数点 后面几位
// //   expect(0.302).toBeCloseTo(0.3, 1)
// //   expect(0.302).not.toBeCloseTo(0.3, 5)

// // })


// // // 字符串相关匹配器
// // test("字符串相关匹配器", () => {
// //   expect("hello Jest").toMatch(/Jest/)
// //   expect("hello Jest").not.toMatch(/World/)
// // })


// // // 数组相关匹配器
// // test("数组相关匹配器", () => {
// //   const arr = [1,2,3,4,5,6]
// //   // toContain 用于判断 数组 或者 字符串 中是否包含某个元素， 比较的是严格比较，也就是判断地址和类型是否完全相等
// //   expect(arr).toContain(3)
// //   expect(arr).not.toContain("3")

// //   expect([{name: "alvis"}, {name: "alvis2"}]).not.toContain({name: "alvis2"})
// //   expect([{name: "alvis"}, {name: "alvis2"}]).toContainEqual({name: "alvis2"})

// //   expect("this is a test").toContain("test")

// //   //  Set集合
// //   expect(new Set(arr)).toContain(4)
// // })


// // // 异常相关匹配器
// // function throwErrorFn() {
// //   throw new Error("aaa this is an error bbb")
// // }

// // test("异常相关匹配器", () => {
// //   expect(() => throwErrorFn()).toThrow()
// //   // 正则
// //   expect(() => throwErrorFn()).toThrow(/an/)
// //   // 字符串，是否是错误的子集
// //   expect(() => throwErrorFn()).toThrow("this is an error")
// //   // message
// //   expect(() => throwErrorFn()).toThrow(new Error('aaa this is an error bbb'))
// //   // 错误对象是类的实例
// //   expect(() => throwErrorFn()).toThrow(Error)
// // })

// // // 非对称匹配器
// // const arr = ["chenjie"]
// // test("期望的数组不包含上面数组中的内容", () => {
// //   expect(["alvis"]).toEqual(expect.not.arrayContaining(arr))
// // })

// // const obj = { name: "chenjie" }
// // test("期望的对象不包含上面对象中的键值对", () => {
// //   expect({ name: "alvis" }).toEqual(expect.not.objectContaining(obj))
// //   // expect({ name: "chenjie" }).toEqual(expect.not.objectContaining(obj))
// //   expect({ age: 18 }).toEqual(expect.not.objectContaining(obj))
// // })


// // // 大概的源码
// // const myMatchers = {
// //   toBe() {},
// //   toEqual() {},
// //   toMatch() {},
// //   toContain() {},
// //   toThrow() {},
// //   // ...
// // }

// // function myExpect() {
// //   const expectation = {
// //     // 修饰符
// //     not: {},
// //     // 这两个先不用管
// //     resolves: { not: {} },
// //     rejects: { not: {} }
// //   }


// //   const matcherKeys = Object.keys(myMatchers)

// //   for (const name of matcherKeys) {
// //     expectation[name] = myMatchers[name]
// //     expectation.not[name] = myMatchers[name]
// //     // ....
// //   }

// //   return expectation
// // }



// // 全局生命周期-即使测试用例失败，也会执行 afterEach
// // beforeEach 会在执行每一个测试用例之前被触发
// beforeEach(()=>{
//   console.log("全局的beforeEach");
// });

// afterEach(()=>{
//   console.log("全局的afterEach");
// })

// // beforeAll 是在整个测试套件的第一个测试用例执行之前执行
// beforeAll(()=>{
//     console.log("全局一次性执行的beforeAll");
// })

// // afterAll 会在所有测试用例执行完成之后，然后再执行 afterAll
// afterAll(()=>{
//     console.log("全局一次性执行的afterAll");
// })

// // test("测试加法函数", () => {
// //   const result = sum(1, 3);
// //   expect(result).toBe(4);
// //   console.log("\x1b[31m%s\x1b[0m", "测试加法函数");
// // });

// // test("测试减法函数", () => {
// //   const result = sub(15, 10);
// //   expect(result).toBe(5);
// //   console.log("\x1b[31m%s\x1b[0m", "测试减法函数");
// // });

// // test("测试乘法函数", () => {
// //   const result = mul(2, 3);
// //   expect(result).toBe(6);
// //   console.log("\x1b[31m%s\x1b[0m", "测试乘法函数");
// // });

// // test("测试除法函数", () => {
// //   const result = div(50, 2);
// //   expect(result).toBe(25);
// //   console.log("\x1b[31m%s\x1b[0m", "测试除法函数");
// // });


// // test.only 在该测试套件里面 会让该测试用例独立执行，其他的测试用例不会被执行
// test.only("测试乘法函数", () => {
//   const result = mul(2, 3);
//   expect(result).toBe(6);
//   console.log("\x1b[31m%s\x1b[0m", "测试乘法函数 test.only");
// });


// // 源码
// // const beforeEach: THook = (fn, timeout) =>
// //   _addHook(fn, 'beforeEach', beforeEach, timeout);
// // const beforeAll: THook = (fn, timeout) =>
// //   _addHook(fn, 'beforeAll', beforeAll, timeout);
// // const afterEach: THook = (fn, timeout) =>
// //   _addHook(fn, 'afterEach', afterEach, timeout);
// // const afterAll: THook = (fn, timeout) =>
// //   _addHook(fn, 'afterAll', afterAll, timeout);


// // 主要是做了错误相关处理，然后调用了 dispatchSync 方法去调度执行对应的生命周期钩子函数
// // const _addHook = (
// //   fn: Circus.HookFn,
// //   hookType: Circus.HookType,
// //   hookFn: THook,
// //   timeout?: number,
// // ) => {
// //   const asyncError = new ErrorWithStack(undefined, hookFn);

// //   if (typeof fn !== 'function') {
// //     asyncError.message =
// //       'Invalid first argument. It must be a callback function.';

// //     throw asyncError;
// //   }

// //   dispatchSync({asyncError, fn, hookType, name: 'add_hook', timeout});
// // };

test("空实例防止报错", () => {})