import { sum } from "../src/index";

test("测试加法函数sum", () => {
  expect(sum(1, 2)).toBe(3);
  expect(sum(2, 1)).toBe(3);
  expect(sum(1, 1)).toBe(2);
});
