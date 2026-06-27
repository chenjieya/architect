import asyncio

loop = asyncio.new_event_loop()


def first():
    print(1)


def second():
    print(2)
    loop.call_soon(lambda: print(3))
    loop.stop()


def third():
    print(4)


loop.call_soon(first)
loop.call_soon(second)
loop.call_soon(third)

loop.run_forever()
print("循环已停止")

"""
1
2
4
循环已停止

_run_once函数运行完成之后，才会进行终于队列
def run_forever(self):
    while True:
        self._run_once()
        if self._stopping:
            break
            
_run_once其实就是调度中心，保证ready队列的执行。记住一件事情，每次都是将ready队列复制出来执行的。
上面虽然在second函数中终止了事件循环，但是该队列的_run_once还没有执行结束，所以4也会打印出来
"""