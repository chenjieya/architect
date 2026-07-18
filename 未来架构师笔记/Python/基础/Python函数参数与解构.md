## 1. 函数参数

### 1.1 参数分类总览

| 参数类型       | 语法            | 示例              |
| -------------- | --------------- | ----------------- |
| 位置参数       | `arg`           | `def f(a, b)`     |
| 默认参数       | `arg=val`       | `def f(a=1)`      |
| 位置仅限参数   | `arg` 在 `/` 前 | `def f(a, b, /)`  |
| 关键字仅限参数 | `arg` 在 `*` 后 | `def f(*, a, b)`  |
| 可变位置参数   | `*args`         | `def f(*args)`    |
| 可变关键字参数 | `**kwargs`      | `def f(**kwargs)` |
| 关键字参数     | `key=val`       | `f(a=1)`          |

### 1.2 基本参数类型

#### 1.2.1 位置参数 (Positional Arguments)

按顺序传入，一一对应：

```python
def add(a, b):
    return a + b

add(1, 2)  # a=1, b=2
```

#### 1.2.2 默认参数 (Default Arguments)

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"

greet("Alice")              # "Hello, Alice"
greet("Bob", "Hi")          # "Hi, Bob"
greet("Bob", greeting="Hi") # 同上，关键字传参
```

> ⚠️ **重要：默认参数只会在定义时计算一次。** 永远不要用可变对象（list、dict）做默认值：
>
> ```python
> def bad(lst=[]):     # ❌ 所有调用共享同一个 list
>     lst.append(1)
>     return lst
>
> def good(lst=None):  # ✅ 每次调用创建新 list
>     if lst is None:
>         lst = []
>     lst.append(1)
>     return lst
> ```

#### 1.2.3 关键字参数 (Keyword Arguments)

通过名称传参，顺序可以任意：

```python
def info(name, age, city):
    pass

info(age=25, name="Alice", city="Beijing")  # ✅ 顺序无所谓
```

### 1.3 参数分隔符：`/` 和 `*`

这两个符号用于**严格限制参数的传递方式**。

#### 1.3.1 `/` — 位置仅限参数 (Positional-Only)

`/` **之前**的所有参数只能用位置传入，不能用关键字：

```python
def div(a, b, /):
    return a / b

div(10, 2)       # ✅ 5.0
div(a=10, b=2)   # ❌ TypeError: got some positional-only arguments passed as keyword arguments
```

内置函数大量使用此模式，例如 `pow(x, y, /)`、`len(obj, /)`。

#### 1.3.2 `*` — 关键字仅限参数 (Keyword-Only)

`*` **之后**的所有参数只能用关键字传入：

```python
def f(a, b, *, c, d):
    print(a, b, c, d)

f(1, 2, c=3, d=4)   # ✅
f(1, 2, 3, 4)        # ❌ TypeError: takes 2 positional arguments but 4 were given
```

#### 1.3.3 组合使用

```python
def f(pos_only, /, pos_or_kwd, *, kwd_only):
    pass

f(1, 2, kwd_only=3)           # ✅ 完整形式
f(1, pos_or_kwd=2, kwd_only=3) # ✅
f(pos_only=1, pos_or_kwd=2, kwd_only=3) # ❌ pos_only 不能是关键字
```

### 1.4 可变参数：`*args` 和 `**kwargs`

#### 1.4.1 `*args` — 收集多余的位置参数

将所有额外位置参数打包成**元组**：

```python
def sum_all(*args):
    print(args)      # (1, 2, 3, 4, 5)
    return sum(args)

sum_all(1, 2, 3, 4, 5)  # 15
```

#### 1.4.2 `**kwargs` — 收集多余的的关键字参数

将所有额外关键字参数打包成**字典**：

```python
def print_config(**kwargs):
    for k, v in kwargs.items():
        print(f"{k} = {v}")

print_config(host="localhost", port=8080, debug=True)
```

#### 1.4.3 `*args` + `**kwargs` — 万能传参

常用于装饰器、包装函数、父类调用：

```python
def wrapper(*args, **kwargs):
    # 做点什么...
    return target_func(*args, **kwargs)
```

### 1.5 参数顺序规则

```
def f(pos_only, /, pos_or_kwd, *args, kwd_only, **kwargs):
```

**严格顺序：** `位置参数` → `/` → `位置或关键字参数` → `*` → `关键字仅限参数` → `**kwargs`

简化记忆版：

```
def f(普通参数, *args, 默认参数, **kwargs):
```

普通情况下这是最常见的顺序：普通参数在前，`*args` 收集多余位置，默认参数紧随其后，最后 `**kwargs` 收尾。

---

## 2. 解构 (Unpacking / Destructuring)

### 2.1 基础解构

```python
a, b = (1, 2)     # a=1, b=2
a, b = [1, 2]     # a=1, b=2
a, b = "ab"       # a='a', b='b'
```

### 2.2 `*` 解构赋值 — 收集剩余元素

```python
first, *rest = [1, 2, 3, 4]
# first=1, rest=[2, 3, 4]

*head, last = [1, 2, 3, 4]
# head=[1, 2, 3], last=4

first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2, 3, 4], last=5
```

### 2.3 `*` 解构可迭代对象

在列表、元组、集合、函数调用中展开可迭代对象：

```python
nums = [1, 2, 3]
new = [*nums, 4, 5]           # [1, 2, 3, 4, 5]

def f(a, b, c): ...
f(*[1, 2, 3])  # 等价于 f(1, 2, 3)
```

### 2.4 `**` 解构字典

```python
d1 = {"a": 1, "b": 2}
d2 = {"c": 3, **d1}   # {"c": 3, "a": 1, "b": 2}

def f(a, b): ...
f(**{"a": 1, "b": 2})  # 等价于 f(a=1, b=2)
```

字典合并的经典写法：

```python
config = {"host": "localhost", "port": 8080}
override = {"port": 9090}
merged = {**config, **override}  # port 被覆盖为 9090
```

### 2.5 嵌套解构

```python
data = {"name": "Alice", "info": (25, "Beijing")}
name, (age, city) = data["name"], data["info"]
# name="Alice", age=25, city="Beijing"

# 更简洁：直接解构嵌套结构
(name, (age, city)) = ("Alice", (25, "Beijing"))
```

### 2.6 函数参数中的解构（PEP 3113 已废弃）

Python 2 可以这样，Python 3 已移除：

```python
# Python 2 写法（已废弃）
def f((a, b)): ...   # ❌ Python 3 会报错

# Python 3 正确写法
def f(pair):
    a, b = pair
```

### 2.7 带默认值的解构

使用 `match-case`（Python 3.10+）或第三方库 `more_itertools`：

```python
# 手动实现
first, *rest = items or [default]
```

---

## 3. 调用时的 `*` 与 `**`

函数调用中的 `*` 和 `**` 是**解构操作符**，与函数定义中的 `*args`/`**kwargs` 互为逆操作：

| 位置               | 含义                     | 示例              |
| ------------------ | ------------------------ | ----------------- |
| 定义时 `*args`     | 打包多余位置参数为元组   | `def f(*args)`    |
| 调用时 `*iterable` | 解构可迭代对象为位置参数 | `f(*[1,2,3])`     |
| 定义时 `**kwargs`  | 打包多余关键字参数为字典 | `def f(**kwargs)` |
| 调用时 `**dict`    | 解构字典为关键字参数     | `f(**{"a":1})`    |

---

## 4. 类型注解中的 `|` 与 `Optional`

### 4.1 `|` 联合类型运算符 (Python 3.10+)

```python
def f(x: int | str | None):  # x 可以是 int、str 或 None
    pass
```

等价于 `Optional[int]` 或 `Union[int, str, None]`。

### 4.2 函数参数中的典型用法

```python
from typing import Optional

def connect(host: str = "localhost", port: int = 8080, timeout: int | None = None):
    pass
```

---

## 5. 完整示例：综合运用

```python
def register(
    # 位置仅限参数
    username: str,
    password: str,
    /,
    # 位置或关键字参数（带默认值）
    email: str = "",
    age: int = 0,
    # * 分隔：之后只允许关键字参数
    *,
    # 关键字仅限参数
    role: str = "user",
    # 可变关键字参数
    **extra: str,
) -> dict:
    return {
        "username": username,
        "password": password,
        "email": email,
        "age": age,
        "role": role,
        **extra,
    }

# 调用
user = register(
    "alice", "123456",      # 位置参数
    email="a@b.com",         # 关键字参数（在 / 之后、* 之前，可位置可关键字）
    role="admin",            # 关键字仅限参数（在 * 之后）
    nickname="Alice",        # **extra 收集
    phone="13800138000",     # **extra 收集
)
```

---

## 6. 速查表

```
┌─────────────────────────────────────────────────┐
│             函数定义参数顺序                      │
│                                                  │
│  def f(                                          │
│      [位置仅限], /, [位置或关键字], *[args],      │
│      [关键字仅限], **[kwargs]                     │
│  )                                               │
│                                                  │
│  示例：                                          │
│  def f(a, /, b, *args, c, **kwargs): pass       │
│      a: 只能位置传入                              │
│      b: 可位置可关键字                            │
│      args: 收集多余位置参数                       │
│      c: 只能关键字传入                            │
│      kwargs: 收集多余关键字参数                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│             调用传参方式                          │
│                                                  │
│  f(1, 2)             # 位置参数                  │
│  f(a=1, b=2)         # 关键字参数                │
│  f(*iterable)        # 解构可迭代对象为位置参数    │
│  f(**mapping)        # 解构字典为关键字参数        │
│  f(1, 2, *, c=3)     # * 之后必须关键字           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│             赋值解构                              │
│                                                  │
│  a, b = iterable       # 一一对应解构             │
│  *rest, a = iterable   # * 收集剩余               │
│  a, *rest, b = it      # 头 + 中间 + 尾          │
│  [*a, *b]              # 合并列表                 │
│  {**d1, **d2}          # 合并字典                 │
└─────────────────────────────────────────────────┘
```
