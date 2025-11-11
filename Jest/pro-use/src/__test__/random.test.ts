const { randomNum } = require("../utils/tool");

test("randomNum生成0-9的随机整数", () => {
  const result = randomNum();
  console.log(result, "res");
  expect(result).toHaveLength(4);
  expect(new Set(result).size).toBe(4);

  result.forEach((item: number) => {
    expect(item).toBeGreaterThanOrEqual(0);
    expect(item).toBeLessThanOrEqual(9);
  });
});
