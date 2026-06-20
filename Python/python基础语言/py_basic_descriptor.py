class Test:
    @property
    def radius(self):
        print("ceshi")
        return self._radius

    @radius.setter
    def radius(self, value):
        print("set")
        self._radius = value

    def __init__(self, value):
        self.radius = value


t = Test(1)


"""
编写一个类 `ImmutablePoint`，创建后不能修改坐标：

```python
p = ImmutablePoint(3, 4)
print(p.x)      # 3
print(p.y)      # 4

# p.x = 10      # AttributeError! 不能修改只读属性
```

**提示：** 使用 `@property` 但不提供 setter。
"""


class ImmutablePoint:
    @property
    def x(self):
        return self._x

    @property
    def y(self):
        return self._y

    def __init__(self, x, y):
        self._x = x
        self._y = y


p = ImmutablePoint(3, 4)
print(p.x)  # 3
print(p.y)  # 4

# p.x = 10  # AttributeError! 不能修改只读属性


"""
编写一个 `Temperature` 类，温度必须在 -273.15（绝对零度）到 1000 之间：

```python
t = Temperature(25)
print(t.celsius)      # 25
print(t.fahrenheit)   # 77.0（只读属性，自动计算）
print(t.kelvin)       # 298.15（只读属性，自动计算）

# t.celsius = -300    # ValueError! 温度不能低于绝对零度
```
"""


class Temperature:
    def __init__(self, t):
        self._t = t

    @property
    def celsius(self):
        return self._t

    @celsius.setter
    def celsius(self, val):
        if val < -273.15:
            raise ValueError("温度不能低于绝对零度")
        if val > 1000:
            raise ValueError("温度不能高于1000度")
        self._t = val

    @property
    def fahrenheit(self):
        return self._t * 9 / 5 + 32

    @property
    def kelvin(self):
        return self._t + 273.15


t = Temperature(25)
print(t.celsius)  # 25
print(t.fahrenheit)  # 77.0（只读属性，自动计算）
print(t.kelvin)  # 298.15（只读属性，自动计算）

# t.celsius = -300  # ValueError! 温度不能低于绝对零度


"""
编写一个描述符，记录某个类属性被访问和修改的次数：

```python
class AccessCounter:
    # 你的代码
    pass


class MyClass:
    value = AccessCounter(10)  # 初始值为 10


obj = MyClass()
print(obj.value)      # 10
print(obj.value)      # 10
obj.value = 20
print(obj.value)      # 20

# 查看访问和修改次数
print(AccessCounter.get_access_count())   # 3（被访问了 3 次）
print(AccessCounter.get_modify_count())   # 1（被修改了 1 次）
```
"""


class AccessCounter:
    _access_count = 0
    _modify_count = 0

    # 你的代码
    def __init__(self, val):
        self._value = val

    def __get__(self, instance, owner):
        AccessCounter._access_count += 1
        return self._value

    def __set__(self, instance, value):
        AccessCounter._modify_count += 1
        self._value = value

    @classmethod
    def get_access_count(cls):
        return cls._access_count

    @classmethod
    def get_modify_count(cls):
        return cls._modify_count


class MyClass:
    value = AccessCounter(10)  # 初始值为 10


obj = MyClass()
print(obj.value)  # 10
print(obj.value)  # 10
obj.value = 20
print(obj.value)  # 20

# 查看访问和修改次数
print(AccessCounter.get_access_count())  # 3（被访问了 3 次）
print(AccessCounter.get_modify_count())  # 1（被修改了 1 次）


# 下面代码输出了什么？为什么？
class Descriptor:
    def __get__(self, instance, owner):
        print(f"__get__ called, instance={instance}, owner={owner}")
        return 42

    def __set__(self, instance, value):
        print(f"__set__ called, instance={instance}, value={value}")


class A:
    x = Descriptor()


a = A()
print(a.x)  # 先打印a和A class，然后返回输出 42
a.x = 100  # 打印a 100
a.__dict__["x"] = "instance"  # a.__dict__他会绕过属性描述符的拦截
# 优先级规则：数据描述符 > 实例 __dict__ > 非数据描述符
print(a.x)  # 42 机油get又有set他是数据类型描述类，先访问属性描述符类属性 -> a.__dict__
print(a.__dict__)  # {'x': 'instance'}
