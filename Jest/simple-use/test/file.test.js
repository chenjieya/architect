const { sum, sub, mul, div } = require('../tool')


jest.mock('../tool', () => {
  const originalModule = jest.requireActual('../tool');
  return {
    ...originalModule,
    sum: jest.fn((a, b) => a + b + 10),
    sub: jest.fn((a, b) => a - b - 10)
  }
})

test("测试文件示例", () => {
  expect(sum(1, 2)).toBe(13)
  expect(sub(10, 2)).toBe(-2)
  expect(mul(2, 3)).toBe(6)
  expect(div(6, 2)).toBe(3)
})