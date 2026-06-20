"""
4.1 一、实现一个计数器类

编写一个 `Counter` 类：

1. 初始化时指定起始值
2. 每次调用实例，计数器值加 1
3. 支持 `reset()` 方法重置为初始值
4. 支持 `get()` 方法获取当前值

```python
c = Counter(10)
print(c())      # 11
c()             # 12
print(c.get())  # 12
c.reset()
print(c.get())  # 10
```
"""


class Counter:

    def __init__(self, count):
        self.count = count
        self._count = count

    def __call__(self):
        self.count += 1
        return self.count

    def get(self):
        return self.count

    def reset(self):
        self.count = self._count


c = Counter(10)
print(c())  # 11
c()  # 12
print(c.get())  # 12
c.reset()
print(c.get())  # 10

"""
### 4.2 二、思考题

下面代码的输出是什么？为什么？

```python
class A:
    def __call__(self):
        print("A called")

class B(A):
    def __call__(self):
        print("B called")
        super().__call__()

b = B()
b()

"""


class A:
    def __call__(self):
        print("A called")


class B(A):
    def __call__(self):
        print("B called", type(self))
        super().__call__()


b = B()
b()
# B called -> A called
