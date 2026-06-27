import run
from async_delay import async_delay
from async_request import async_request
import asyncio


# 协程
async def test():
    print("main begins")
    resp1 = await async_request(
        "localhost", 5500, "/python异步编程/coroutine/index.html"
    )
    print("resp1", resp1[:9])
    await async_delay(1)
    print("delayed")
    resp2 = await async_request(
        "localhost", 5500, "/python异步编程/coroutine/index.html"
    )
    print("resp2", resp2[:9])
    return "ok"


def coro_func() -> asyncio.Future:
    # 内部会自己掉用asyncio.get_event_loop()
    fut = asyncio.Future()

    coro = test()

    # 开始启动协程
    r = coro.send(None)

    def callback_done(f: asyncio.Future):
        try:
            # 继续下一次的执行
            f = coro.send(f.result())
            f.add_done_callback(callback_done)
        except StopIteration as e:
            fut.set_result(e.value)

    r.add_done_callback(callback_done)

    return fut


def main():
    # 协程执行完毕
    fut = coro_func()

    def callback(f: asyncio.Future):
        # 停止事件循环
        asyncio.get_event_loop().stop()
        print(f.result())

    fut.add_done_callback(callback)
    return fut


if __name__ == "__main__":
    run.run(main)
    print("over")
