const { forEach } = require("./tool");
// // console.log(jest);

// test("基本演示", () => {
//   // 空的模拟函数
//   const mockFn = jest.fn()

//   // 设置这个模拟函数的返回值是 42
//   mockFn.mockReturnValue(42)

//   expect(mockFn()).toBe(42)
// })

// test("内置实现", () => {
//   const mock = jest.fn((x) => x + 100)
//   expect(mock(1)).toBe(101)
// })

// test("模拟函数", () => {
//   const mockFn = jest.fn();

//   mockFn.mockReturnValue(30).mockReturnValueOnce(10).mockReturnValueOnce(20)

//   // 第一次调用，返回 10
//   expect(mockFn()).toBe(10);
//   // 第二次调用，返回 20
//   expect(mockFn()).toBe(20);
//   // 后续调用，返回 30
//   expect(mockFn()).toBe(30);
//   expect(mockFn()).toBe(30);

//   mockFn.mockReturnValue(40)
//   expect(mockFn()).toBe(40);
// })

const params = [10, 20, 30];
test("模拟 forEach", () => {
  //  创建模拟函数
  const mockFn = jest.fn((x) => x + 100);

  // 调用forEach函数，传入模拟函数
  forEach(params, mockFn);

  // 验证模拟函数的参数长度
  expect(mockFn.mock.calls).toHaveLength(params.length);
  expect(mockFn.mock.calls.length).toBe(params.length);

  // 验证每次调用模拟函数 模拟函数接收到的参数
  expect(mockFn.mock.calls[0][0]).toBe(10);
  expect(mockFn.mock.calls[1][0]).toBe(20);
  expect(mockFn.mock.calls[2][0]).toBe(30);

  // 验证每次调用模拟函数时，模拟函数的返回值，是否符合预期
  expect(mockFn.mock.results[0].value).toBe(110);
  expect(mockFn.mock.results[1].value).toBe(120);
  expect(mockFn.mock.results[2].value).toBe(130);

  // 模拟函数是否被调用过
  expect(mockFn).toHaveBeenCalled();

  // 校验模拟函数每次调用的参数
  expect(mockFn).toHaveBeenNthCalledWith(1, 10, 0);
  expect(mockFn).toHaveBeenNthCalledWith(2, 20, 1);
  expect(mockFn).toHaveBeenNthCalledWith(3, 30, 2);
});

// // 模拟异步函数
// const fetchFn = jest.fn()
// const fetchData = {id: 1, name: 'Alvis'}

// fetchFn.mockImplementation(() => Promise.resolve(fetchData))

// test("模拟网络请求成功函数", async() => {
//   const data = await fetchFn()
//   expect(data).toEqual(fetchData)
// })

// test("模拟网络请求先失败后成功", async() => {
//   fetchFn.mockImplementationOnce(() => Promise.reject(new Error("网络错误")))
//   // 第一次调用，模拟网络请求失败
//   await expect(fetchFn()).rejects.toThrow("网络错误")
//   // 第二次调用，模拟网络请求成功
//   await expect(fetchFn()).resolves.toEqual(fetchData)
// })

test("空实例防止报错", () => {});
