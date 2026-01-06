import { sub } from "../src/index";

test("测试减法函数sub", () => {
  expect(sub(1, 2)).toBe(-1);
  expect(sub(2, 1)).toBe(1);
  expect(sub(1, 1)).toBe(0);
});
