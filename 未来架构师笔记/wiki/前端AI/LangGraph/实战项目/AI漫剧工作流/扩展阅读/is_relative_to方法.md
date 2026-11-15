---
author: mixed
ai_editable: true
summary: 'AI 漫剧项目扩展阅读：Path.is_relative_to 的用途与注意事项。'
refs:
  pages:
    - 01 目录
    - 11 角色与场景参考图
  raw: []
updated_by: ai
updated: 2026-11-14
---

假设程序需要判断一张图片是否放在指定目录中：

```text
workspace/
├── images/
│   └── cat.png
└── notes/
    └── ideas.txt
```

`cat.png` 位于 `images` 目录下，而 `ideas.txt` 不在。面对这样的路径关系，Python 的 `pathlib` 提供了一个方便的方法：`is_relative_to()`。

## 1. 判断路径是否位于另一个路径下

先看一段可以直接运行的代码：

```python
from pathlib import Path

root = Path("workspace/images")
image = Path("workspace/images/cat.png")
notes = Path("workspace/notes/ideas.txt")

print(image.is_relative_to(root))  # True
print(notes.is_relative_to(root))  # False
```

`image.is_relative_to(root)` 的意思是：判断 `image` 是否相对于 `root`，也就是 `image` 是否在 `root` 之下。判断成立返回 `True`，否则返回 `False`。

这里的判断方向不要弄反：**调用方法的对象是待判断的路径，括号里是参照路径**。

```python
待判断路径.is_relative_to(参照路径)
```

参照路径也可以是字符串：

```python
print(image.is_relative_to("workspace/images"))  # True
```

## 2. 路径相同时也是 True

如果两个路径相同，结果同样是 `True`：

```python
from pathlib import Path

root = Path("workspace/images")

print(root.is_relative_to(root))  # True
print((root / "animals" / "cat.png").is_relative_to(root))  # True
```

因此，它判断的是“**自身或后代**”的关系，并不只包括下一级目录。如果只想接受严格位于目录内的路径，可以额外排除相同路径：

```python
candidate = Path("workspace/images/cat.png")

print(candidate != root and candidate.is_relative_to(root))  # True
```

## 3. 它检查的是路径关系，不是文件是否存在

`is_relative_to()` 不会访问文件系统检查文件是否存在。即使没有创建下面的文件，只要路径形式符合关系，结果仍然是 `True`：

```python
from pathlib import Path

root = Path("workspace/images")
missing = root / "not_created.png"

print(missing.is_relative_to(root))  # True
```

如果还需要确认文件存在，要另外检查：

```python
print(missing.exists())  # 取决于文件是否存在
print(missing.is_file())  # 取决于它是否是一个实际文件
```

`is_relative_to()` 回答的是路径关系；`exists()` 和 `is_file()` 回答的是文件系统中的实际情况。

## 4. 为什么有时要先调用 resolve()？

`is_relative_to()` 按路径的组成部分判断，**不会自行解析 `..` 或符号链接**。例如，下面先判断路径字面上的关系：

```python
from pathlib import Path

root = Path("workspace/images")
candidate = Path("workspace/images/../notes/ideas.txt")

print(candidate.is_relative_to(root))  # True
```

路径看起来以 `workspace/images` 开头，但 `..` 表示返回上一级。实际解析后，目标路径指向 `workspace/notes/ideas.txt`，已经不在 `images` 下。

可以先对两个路径调用 `resolve()`，再判断：

```python
from pathlib import Path

root = Path("workspace/images").resolve()
candidate = Path("workspace/images/../notes/ideas.txt").resolve()

print(candidate.is_relative_to(root))  # False
```

`resolve()` 会将路径变成绝对路径，处理 `..`，并解析遇到的符号链接。默认情况下，即使路径末尾尚不存在，也会尽可能解析；如果使用 `resolve(strict=True)`，路径不存在时会抛出异常。

> [!note] 判断路径边界
> 当路径可能包含 `..` 或符号链接时，先解析再比较更符合对实际位置的理解。不过，如果其他进程能在检查后修改目录或符号链接，检查与后续文件操作之间仍可能发生变化；有安全边界要求时还需要结合具体系统和操作方式设计。

## 5. 与字符串前缀判断有什么区别？

不要简单地用字符串的 `startswith()` 判断目录关系：

```python
from pathlib import Path

print("workspace/images_backup/cat.png".startswith("workspace/images"))
# True

print(Path("workspace/images_backup/cat.png").is_relative_to("workspace/images"))
# False
```

虽然 `images_backup` 的文字以 `images` 开头，但它们是两个不同的目录名。`is_relative_to()` 根据路径组成部分判断，因此这里返回 `False`。

## 6. 练习

假设有以下代码，先自己判断每行结果，再运行验证：

```python
from pathlib import Path

root = Path("data")
print(Path("data/report.txt").is_relative_to(root))
print(Path("data-old/report.txt").is_relative_to(root))
print(root.is_relative_to(root))
```

> 参考答案
>
> ```text
> True
> False
> True
> ```
>
> 第一条是 `data` 下的路径；第二条的目录名是 `data-old`，不是 `data`；第三条与参照路径相同，也符合关系。

## 7. 写在最后

`is_relative_to()` 用来判断一个路径是否等于或位于另一个路径之下，返回 `True` 或 `False`。它不检查文件是否存在，也不自行解析 `..` 和符号链接。需要按解析后的路径判断时，可以先对双方调用 `resolve()`。

该方法从 Python 3.9 开始提供。更多细节可以参考 [Python 官方 pathlib 文档](https://docs.python.org/3/library/pathlib.html#pathlib.PurePath.is_relative_to)。

## 8. 相关章节

- [[01 目录]]：返回项目目录
- [[11 角色与场景参考图]]
