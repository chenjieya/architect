import fetchApi from "../utils/fetchData";
// @ts-ignore
import "jest-fetch-mock";

describe("测试fetchData", () => {
  test("测试fetchData数据是否正常返回", async () => {
    const result = await fetchApi.fetchData(1);
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("completed");
  });

  test("测试fetch不报错", async () => {
    await expect(fetchApi.fetchData(1)).resolves.not.toThrow();
  });

  // test("测试fetch报错", async () => {
  //   await expect(fetchApi.fetchData(1)).rejects.toThrow();
  // });
});
