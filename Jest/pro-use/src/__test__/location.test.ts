import tools from "../utils/locations";

test("测试地址栏api", () => {
  // window.location.href = "https://www.baidu.com/s?wd=123";
  // window.location.assign("https://www.baidu.com/s?wd=123");
  // expect(tools.getSearchObj()).toEqual({ wd: "123" });
  // expect(window.location.search).toBe("?wd=123");
});

// test("测试地址栏api多个参数", () => {
//   window.location.assign("https://www.baidu.com/s?wd=123&b=2");
//   expect(tools.getSearchObj()).toEqual({ wd: "123", b: "2" });
//   expect(window.location.search).toBe("?wd=123&b=2");
// });

// test("测试地址栏0个参数", () => {
//   window.location.assign("https://www.baidu.com/s");
//   expect(tools.getSearchObj()).toEqual({});
//   expect(window.location.search).toBe("");
// });
