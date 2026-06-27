import asyncio

def run(func) -> None:
    loop = asyncio.new_event_loop()
    # 绑定事件循环到当前的线程，方便以后使用asyncio.get_event_loop获取到事件循环
    asyncio.set_event_loop(loop)
    loop.call_soon(func)
    loop.run_forever()
