import asyncio
import run


def async_delay(duration: int):
    # 获取到线程
    loop = asyncio.get_event_loop()
    future = loop.create_future()

    # 加入到延时队列中，在延时队列结束的时候，设置done=True, 参数是None
    loop.call_later(duration, future.set_result, None)
    return future




def main():
    async_delay(2).add_done_callback(lambda _: print("2 seconds have passed"))

print("不影响其他代码的执行")

"""
不影响其他代码的执行
2 seconds have passed

后续当前线程会一直处于挂起的状态
"""

if __name__ == "__main__":
    run.run(main)