import asyncio

# 主入口函数，在启动的时候需要将启动一个线程，然后加入到ready队列中
# 因为func里面的内容可能会遇到线程相关的内容
def run(func) -> None:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.call_soon(func)
    loop.run_forever()
