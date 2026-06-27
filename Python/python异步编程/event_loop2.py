import asyncio

loop = asyncio.new_event_loop()


def delayed():
    print(1)
    # 加入到延时队列
    loop.call_later(0, lambda: print(2))
    # 加入到ready队列
    loop.call_soon(lambda: print(3))


def soon():
    print(4)
    # 先加入到ready队列
    loop.call_soon(lambda: print(5))

# 将delayed加入到延时队列
loop.call_later(0, delayed)
# 将soon加入到ready队列
loop.call_soon(soon)


loop.run_forever()
print("done")

"""
4
1
5
3
2
"""