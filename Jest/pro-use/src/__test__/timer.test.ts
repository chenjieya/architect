import { startTimer, startTimerOut } from "../utils/timer";

describe("测试setInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("测试startTimer", () => {
    const callback = jest.fn();
    const interval = 1000;

    // 替代setinterval
    const setinterval = jest.spyOn(window, "setInterval");

    // 开始执行startTimer函数
    const cancelTimer = startTimer(callback, interval)!;

    // 断言测试
    // 调用startTimer函数之后，setInterval之行了几次
    expect(setinterval).toHaveBeenCalledTimes(1);
    // 断言setInterval调用时候对应的参数
    expect(setinterval).toHaveBeenCalledWith(expect.any(Function), interval);

    jest.advanceTimersByTime(interval); // 快进 1秒
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(interval); // 快进 1秒
    expect(callback).toHaveBeenCalledTimes(2);
    expect(setinterval).toHaveBeenCalledTimes(1);

    // 取消定时器
    cancelTimer();
  });

  test("测试cancelTimer", () => {
    const callback = jest.fn();
    const interval = 1000;

    jest.spyOn(window, "setInterval");

    // 开始执行计时器
    const cancelTimer = startTimer(callback, interval)!;
    cancelTimer();

    jest.advanceTimersByTime(interval); // 快进1秒
    expect(callback).toHaveBeenCalledTimes(0);
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("测试setTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  test("测试startTimerOut", () => {
    const interval = 3000;
    const callback = jest.fn();

    const setTimeout = jest.spyOn(window, "setTimeout");

    startTimerOut(callback, interval)!;

    // 进行断言测试
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  test("测试cancelTimer", () => {
    const interval = 3000;
    const callback = jest.fn();

    const setTimeout = jest.spyOn(window, "setTimeout");

    const cancelTimer = startTimerOut(callback, interval)!;
    cancelTimer();

    jest.advanceTimersByTime(interval);
    expect(callback).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });
});
