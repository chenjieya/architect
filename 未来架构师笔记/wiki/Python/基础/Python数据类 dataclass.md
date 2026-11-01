---
author: ai
ai_editable: true
summary: '用 @dataclass 自动生成构造、打印、比较方法，讲清字段默认值、frozen/order/slots、继承坑，以及它与 Pydantic BaseModel 的区别。'
refs:
  pages:
    - Python类和对象
    - 类型标注
    - 装饰器
    - Web服务框架
  raw: []
updated_by: ai
updated: 2026-11-01
---

## 1. 概述

`@dataclass` 是 Python 标准库 `dataclasses`（3.7 起内置）提供的装饰器。它只做一件事：**读取你写在类里的字段注解，自动生成构造函数、打印格式、相等比较这些样板代码。**

一句话记忆：**它是"专门用来装数据"的类的语法糖**，不是校验框架，也不是 ORM。

先看最直观的差别。同样是描述一个点：

```python
# 手写版：一堆样板代码
class Point:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)


# dataclass 版：只写字段
from dataclasses import dataclass


@dataclass
class Point:
    x: int
    y: int
```

两版行为一致：

```python
p = Point(1, 2)
print(p)              # Point(x=1, y=2)
print(p == Point(1, 2))  # True
```

## 2. 为什么需要它

普通类适合"既有数据又有复杂行为"的对象。但工程里还有大量**纯数据容器**：坐标、配置项、接口返回结构、消息对象。它们的共同点是字段多、行为少，手写会带来三个问题：

1. 构造函数要一个一个赋值，字段一多就容易漏；
2. `print` 出来是 `<Point object at 0x...>`，调试时看不出内容；
3. 两个内容相同的对象用 ` == ` 比较默认是 `False`，因为默认比较的是内存地址。

`@dataclass` 把这三件事一次性解决，让你只保留"有哪些字段"这一份信息（单一数据源）。字段增删只改一处，其余方法自动跟着变。

## 3. 它自动生成了什么

默认情况下，`@dataclass` 会生成三个方法：

| 方法       | 作用                                   | 说明                                 |
| ---------- | -------------------------------------- | ------------------------------------ |
| `__init__` | 按字段顺序接收参数并赋值               | 字段声明顺序就是参数顺序             |
| `__repr__` | 打印成 `Point(x=1, y=2)` 这种形式      | 调试友好                             |
| `__eq__`   | 逐字段比较，同类型且各字段都相等才相等 | 与其他类型比较返回 `False`，不会硬比 |

它**不会**生成这些：

- `__str__`：`print` 时显示的是 `__repr__` 的结果（因为 `object.__str__` 会回退到 `__repr__`）；
- 默认的 `__hash__`：`@dataclass` 默认 `eq=True, frozen=False`，此时 `__hash__` 被设为 `None`，实例**不可哈希**，不能放进 `set` 或当 `dict` 的键；
- 任何类型校验：注解只当字段清单用，传错类型不会报错（后面单独讲）；
- 序列化 / JSON 转换：需要自己用 `asdict()` 或交给 Pydantic 之类的库。

另外，如果你在类里**自己定义了** `__init__`、`__repr__`、`__eq__` 中的某一个，`@dataclass` 不会覆盖它，会保留你的版本。这条规则很实用：想定制某一部分时，直接重写即可。

## 4. 字段默认值：最容易踩的坑

给字段写默认值很自然：

```python
@dataclass
class User:
    name: str
    age: int = 0
    active: bool = True
```

但**列表、字典、集合这类可变对象不能直接当默认值**：

```python
@dataclass
class Bad:
    items: list = []   # ValueError: mutable default <class 'list'> for field items is not allowed
```

原因和 Python 函数默认参数一样：默认值只在定义时创建一次，所有实例会共享同一个列表，一个实例 `append`，另一个实例也会"莫名其妙"多出元素。

正确写法是用 `field()` 配 `default_factory`，每次创建实例时现造一个新的：

```python
from dataclasses import dataclass, field


@dataclass
class Good:
    items: list = field(default_factory=list)   # 每个实例拿到独立的空列表
    meta: dict = field(default_factory=dict)
```

`field()` 的常用参数：

```python
@dataclass
class Order:
    id: int
    price: float = 0.0
    note: str = field(default="", repr=False)      # 打印时不显示
    checksum: str = field(init=False, default="")  # 不进构造函数，之后再赋值
    internal: int = field(default=0, compare=False) # 不参与 == 比较
```

## 5. 常用开关：frozen / order / slots / kw_only

这些参数写在装饰器里，按需开启：

```python
@dataclass(frozen=True)   # 不可变：实例创建后不能改字段，赋值抛 FrozenInstanceError
@dataclass(order=True)    # 可比较大小：生成 < > <= >=，按字段声明顺序逐项比较
@dataclass(slots=True)    # 3.10+：生成 __slots__，省内存、防止手滑加新属性
@dataclass(kw_only=True)  # 3.10+：字段只能用关键字传参，避免位置参数传错
```

几个要点：

- `frozen=True` 同时让实例变成可哈希（前提是 `eq=True`，默认就是），可以放进 `set`。但注意它只冻结"字段指向哪个对象"，字段里的列表照样能 `append`，这是浅层不可变。
- `frozen=True` 时想在初始化阶段改值，要用 `object.__setattr__(self, ...)`，常规写法会报错。
- `order=True` 要求 `eq=True`（默认满足）。被标记 `compare=False` 的字段不参与排序。
- `slots=True` 会把类重建一遍，能省内存、访问也略快；但和某些复杂继承、类变量默认值搭配时可能有坑，简单数据类可以放心用。

## 6. 初始化之后再做点事：`__post_init__`

有时字段需要校验，或者某个字段要由其他字段推导出来。`@dataclass` 生成的 `__init__` 末尾会自动调用 `__post_init__`，你可以在这里补逻辑：

```python
from dataclasses import dataclass, field


@dataclass
class User:
    name: str
    age: int
    name_upper: str = field(init=False)   # 由 name 推导，不进构造函数

    def __post_init__(self):
        if self.age < 0:
            raise ValueError("年龄不能为负数")
        self.name_upper = self.name.upper()


u = User("alice", 18)
print(u)   # User(name='alice', age=18, name_upper='ALICE')
```

`__post_init__` 是 dataclass 用户最常写的扩展点：**校验放这里，派生字段也放这里。**

## 7. 继承时最容易踩的坑

dataclass 可以继承 dataclass，字段会合并。但有一个硬性顺序规则：**有默认值的字段不能排在无默认值的字段前面**。

```python
@dataclass
class Base:
    name: str = "unknown"


@dataclass
class Child(Base):
    age: int          # TypeError: non-default argument 'age' follows default argument


# 两种修法
@dataclass
class Child(Base):
    age: int = 0      # 给子类字段也加默认值


@dataclass(kw_only=True)
class Child(Base):    # 3.10+：让字段只能按关键字传，顺序就不重要了
    age: int
```

另外，`@dataclass` 只把 **dataclass 父类**的字段合并进来；普通父类里写的类级注解不会自动变成字段。所以别把"带注解的普通类"当 dataclass 父类用，容易误以为字段被继承了。

## 8. 重要澄清：它不校验类型

这是初学者最大的误会。注解对 dataclass 来说只是"字段声明"，运行时完全不检查：

```python
p = Point(1, "2")   # 不报错！
print(p)            # Point(x=1, y='2')
print(p.x + p.y)    # TypeError，直到真正做加法时才炸
```

类型检查工具（如 mypy、Pyright）能在**写代码时**提示这个错误，但程序运行时不会拦。如果需要在运行时校验，有两条路：

1. 自己写 `__post_init__` 手写判断；
2. 换用 Pydantic 的 `BaseModel`，它会在创建对象时做校验和类型转换。

## 9. dataclass 与 Pydantic BaseModel 怎么选

两者都能"声明字段、自动生成构造"，但定位不同：

| 维度           | `@dataclass`                     | Pydantic `BaseModel`                       |
| -------------- | -------------------------------- | ------------------------------------------ |
| 运行时类型校验 | 无                               | 有，还能把 `"123"` 转成 `123`              |
| 错误提示       | 不校验，错误推迟到使用时         | 创建时就抛 `ValidationError`，指明哪个字段 |
| JSON / Schema  | 需自己处理                       | 内置序列化与 JSON Schema                   |
| 依赖与性能     | 标准库、零依赖、快               | 依赖 pydantic，较重、较慢                  |
| 典型场景       | 内部数据结构、配置载体、领域对象 | API 请求/响应、配置文件、外部不可信输入    |

选择建议：

- 数据来源**可信**、追求轻量和性能（比如程序内部传参、算法中间结果）→ 用 `dataclass`；
- 数据来自**外部**（HTTP 请求、用户输入、配置文件），需要校验、转换、生成文档 → 用 `BaseModel`。

两者也不是对立的：常见的分层做法是"入口用 Pydantic 校验，校验通过后转成 dataclass 在内部流转"。

## 10. 常用工具函数

`dataclasses` 模块还提供了几个配套函数，省去手写循环：

```python
from dataclasses import asdict, astuple, replace, fields

p = Point(1, 2)

asdict(p)          # {'x': 1, 'y': 2}，转成普通字典（递归处理嵌套 dataclass）
astuple(p)         # (1, 2)，转成元组
replace(p, y=9)    # Point(x=1, y=9)，复制一份并改指定字段（原对象不变）
[f.name for f in fields(p)]   # ['x', 'y']，查看字段清单，写通用逻辑时有用
```

注意 `asdict()` 是**深拷贝**：嵌套的 dataclass、列表、字典都会被递归复制，数据量大时有性能成本。

## 11. 小结

- `@dataclass` 解决的是"纯数据类的样板代码"：自动生成 `__init__`、`__repr__`、`__eq__`；
- 字段用注解声明，但**注解不等于校验**，传错类型运行时不会报错；
- 可变默认值必须用 `field(default_factory=...)`；
- `frozen` 管不可变与可哈希，`order` 管大小比较，`slots` 省内存，`kw_only` 强制关键字传参；
- 初始化后的校验和派生字段放 `__post_init__`；
- 继承时注意"有默认值字段不能排在无默认值字段前面"；
- 外部数据要校验就用 Pydantic `BaseModel`，内部可信数据用 dataclass 更轻快。

## 12. 相关页面

- [[Python类和对象]]：类、`__init__`、继承与 `super()` 的基础
- [[装饰器]]：`@dataclass` 本质上就是一个装饰器
- [[类型标注]]：字段注解的完整语法
- [[Web服务框架]]：Pydantic `BaseModel` 的用法与 FastAPI 集成
