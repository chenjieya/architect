import asyncio
from async_delay import async_delay
from typing import Coroutine


def gather(*aws: Coroutine) -> asyncio.Future:
    fut = asyncio.Future()

    finish_count = 0
    count = len(aws)
    result = [None] * count

    def done_callback(f: asyncio.Future, i: int):
        nonlocal finish_count
        finish_count += 1
        result[i] = f.result()
        if finish_count == count:
            fut.set_result(result)

    for index, item in enumerate(aws):
        task = asyncio.create_task(item)
        task.add_done_callback(lambda f, i=index: done_callback(f, i))

    return fut


async def coro(name: str, duration: int):
    await async_delay(duration)
    return f"{name} 完成"


async def main():
    results = await gather(
        coro("A", 2),
        coro("B", 1),
        coro("C", 3),
    )
    print(results)  # 预期: ['A 完成', 'B 完成', 'C 完成']


asyncio.run(main())
