import asyncio
from async_delay import async_delay
from event_loop_coroutine1 import gather


class Event:
    # 你的代码
    def __init__(self) -> None:
        self.loop = asyncio.get_event_loop()
        self.fut = asyncio.Future()

    def wait(self) -> asyncio.Future:
        # 暂停协程
        return self.fut

    def set(self) -> asyncio.Future:
        # 恢复携程，将携程设置成完成状态，会自动加入到ready队列
        self.fut.set_result(None)
        return self.fut


async def test():
    event = Event()

    async def waiter():
        print("waiter: 开始等待")
        await event.wait()
        print("waiter: 被唤醒")

    async def setter():
        print("setter: 1秒后设置事件")
        await async_delay(1)
        event.set()
        print("setter: 事件已设置")

    await gather(waiter(), setter())


asyncio.run(test())

# 预期结果：
"""
waiter: 开始等待
setter: 1秒后设置事件
setter: 事件已设置
waiter: 被唤醒
"""
