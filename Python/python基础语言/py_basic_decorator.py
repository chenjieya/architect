"""
```python
import time

def timer(func):
    # 你的代码
    pass

@timer
def slow_function():
    time.sleep(1)
    return "Done"

slow_function()
# 输出：slow_function 执行时间: 1.0012 秒
```
"""

import time


def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        func(*args, **kwargs)
        val = time.time() - start

        print(f"{func.__name__}执行时间: {val:.4}秒")

    return wrapper


@timer
def slow_function():
    time.sleep(1)
    return "Done"


slow_function()
# 输出：slow_function 执行时间: 1.0012 秒


"""
实现wraps装饰器，用于不改变函数的名称和注释
"""


def wraps(orgin_func):
    def wrap_desctor(func):

        def func_wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        func_wrapper.__name__ = orgin_func.__name__
        func_wrapper.__doc__ = orgin_func.__doc__
        return func_wrapper

    return wrap_desctor


def my_decorator(func):
    @wraps(func)
    def wrapper():
        print("函数执行前")
        func()
        print("函数执行后")

    return wrapper


@my_decorator
def say_hello():
    """打招呼"""
    print("Hello!")


say_hello()
# 输出：
# 函数执行前
# Hello!
# 函数执行后
print("name", say_hello.__name__)
print("doc", say_hello.__doc__)


# 实现repeat装饰器
def repeat(n):
    def wrapper_decator(func):
        def func_wrapper(*args, **kwargs):
            i = n
            while i > 0:
                func(*args, **kwargs)
                i -= 1

        return func_wrapper

    return wrapper_decator


@repeat(3)
def say_hello(s):
    print(s)


say_hello(1)  # 输出: 1 1 1


"""
编写一个装饰器 `cache`，缓存函数的计算结果。当使用相同的参数调用函数时，直接返回缓存的结果：

```python
def cache(func):
    # 你的代码
    pass

@cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(35))  # 应该快速返回结果
```

**提示：** 使用字典存储参数到结果的映射。
"""


def cache(func):
    _cache = {}

    def wrapper(*args, **kwargs):
        key = (args, tuple(kwargs.items()))
        if key not in _cache:
            _cache[key] = func(*args, **kwargs)
        return _cache[key]

    return wrapper


@cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


print(fibonacci(35))  # 应该快速返回结果


"""
编写一个类装饰器 `to_dict`，自动为类生成 `to_dict` 方法，该方法可以将对象转换为字典

```python
def to_dict(cls):
    # 你的代码
    pass

@to_dict
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p.to_dict())  # 应该输出: {"x":3, "y":4}
"""


def to_dict(cls):
    cls.to_dict = lambda self: self.__dict__
    return cls


@to_dict
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y


p = Point(3, 4)
print(p.to_dict())  # 应该输出: {"x":3, "y":4}
