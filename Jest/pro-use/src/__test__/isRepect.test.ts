const { isRepeat } = require("../utils/tool");
test("测试数字类型重复", () => {
  expect(isRepeat([1, 2, 3, 4])).toBe(false);
  expect(isRepeat([1, 2, 1, 4])).toBe(true);
});
test("测试字符串类型重复", () => {
  expect(isRepeat(["1", "2", "3", "4"])).toBe(false);
  expect(isRepeat(["1", "2", "1", "4"])).toBe(true);
});
