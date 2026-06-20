"""
5.1 实现单例元类

编写一个元类 `SingletonMeta`，使得任何使用该元类的类都自动成为单例模式：

```python
class SingletonMeta(type):
    # 你的代码
    pass

class Database(metaclass=SingletonMeta):
    def __init__(self, host):
        self.host = host

db1 = Database("localhost")
db2 = Database("remote")
print(db1 is db2)  # 应该输出 True
print(db1.host)    # 应该输出 localhost
```
"""


class SingletonMeta(type):

    _instances = dict()

    def __call__(self, *args, **kwds):

        # print(self.__name__, "self.__name__")
        obj = self._instances.get(self.__name__)
        if obj is None:
            self._instances[self.__name__] = super().__call__(*args, **kwds)

        return self._instances[self.__name__]


class Database(metaclass=SingletonMeta):
    def __init__(self, host):
        self.host = host


db1 = Database("localhost")
db2 = Database("remote")
print(db1 is db2)  # 应该输出 True
print(db1.host)  # 应该输出 localhost


"""
编写一个元类 `PluginMeta`，使得任何继承自 `Plugin` 的子类都会被自动注册到 `PluginMeta.registry` 字典中（键为类名，值为类本身）：

```python
class PluginMeta(type):
    # 你的代码
    pass

class Plugin(metaclass=PluginMeta):
    pass

class ImagePlugin(Plugin):
    pass

class TextPlugin(Plugin):
    pass

print(PluginMeta.registry)
# 应该输出类似：{'ImagePlugin': <class '__main__.ImagePlugin'>, 'TextPlugin': <class '__main__.TextPlugin'>}
```
"""


class PluginMeta(type):
    # 你的代码
    registry = {}

    def __new__(cls, name, bases, namespace, /, **kwds):
        cls.registry[name] = super().__new__(cls, name, bases, namespace, **kwds)
        return cls.registry[name]


class Plugin(metaclass=PluginMeta):
    pass


class ImagePlugin(Plugin):
    pass


class TextPlugin(Plugin):
    pass


# {'Plugin': <class '__main__.Plugin'>, 'ImagePlugin': <class '__main__.ImagePlugin'>, 'TextPlugin': <class '__main__.TextPlugin'>}
print(PluginMeta.registry)


"""
编写一个元类 `LogMeta`，自动为类中每个非私有方法（即不以 `_` 开头的方法）添加执行日志。调用方法时，先打印 `[LOG] 调用 {方法名}`，再执行原方法：

```python
class LogMeta(type):
    # 你的代码
    pass

class Calculator(metaclass=LogMeta):
    def add(self, a, b):
        return a + b

    def sub(self, a, b):
        return a - b

calc = Calculator()
print(calc.add(3, 5))
print(calc.sub(10, 4))

# 应该输出：
# [LOG] 调用 add
# 8
# [LOG] 调用 sub
# 6
```
"""


class LogMeta(type):

    @staticmethod
    def log_func(func):
        def wrap(*args, **kwargs):
            print(f"[LOG] 调用 {func.__name__}")
            return func(*args, **kwargs)

        return wrap

    def __new__(mcs, name, bases, namespace, /, **kwds):

        for key, value in namespace.items():
            if not key.startswith("_") and callable(value):
                namespace[key] = mcs.log_func(value)
            pass

        return super().__new__(mcs, name, bases, namespace, **kwds)


class Calculator(metaclass=LogMeta):
    def add(self, a, b):
        return a + b

    def sub(self, a, b):
        return a - b


calc = Calculator()
print(calc.add(3, 5))
print(calc.sub(10, 4))

# 应该输出：
# [LOG] 调用 add
# 8
# [LOG] 调用 sub
# 6
