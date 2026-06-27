import asyncio

# 创建事件循环
loop = asyncio.new_event_loop()


def task1():
    print("任务1")


def task2():
    print("任务2")


def task3():
    print("任务3")

# 将task1加入到ready队列
loop.call_soon(task1)
print("task1 over")
loop.call_soon(task2)
print("task2 over")
loop.call_soon(task3)
print("task3 over")

loop.run_forever()
print("已结束")

"""
task1 over
task2 over
task3 over
任务1
任务2
任务3
...卡死
"""