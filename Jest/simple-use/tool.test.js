
const { sum, sub, mul, div } = require("./tool");


// test("加法测试", () => {
//   expect(sum(1, 2)).toBe(3)
// })

// test("减法测试", () => {
//   expect(sub(1, 2)).toBe(-1)
// })

// test("乘法测试", () => {
//   expect(mul(1, 2)).toBe(2)
// })

// test("除法测试", () => {
//   expect(div(1, 2)).toBe(0.5)
// })

// describe("加减法组合测试", () => {
//   test("加法测试", () => {
//     expect(sum(1, 2)).toBe(3)
//   })

//   test("减法测试", () => {
//     expect(sub(1, 2)).toBe(-1)
//   })
// })

// describe("乘除法组合测试", () => {
//   test("乘法测试", () => {
//     expect(mul(1, 2)).toBe(2)
//   })

//   test("除法测试", () => {
//     expect(div(1, 2)).toBe(0.5)
//   })
// })


// 修饰符
test("使用修饰符测试", () => {
  // 1+2 不等于4  成立
  expect(sum(1,2)).not.toBe(4)
})