---
author: ai
ai_editable: true
summary: 从搜索路径与包身份理解直接运行、-m、绝对和相对导入，再串起命名空间包、src 布局与 uv 安装。
refs:
  pages:
    - 模块化
    - 构建发布
    - 项目管理工具
  raw: []
updated_by: ai
updated: 2026-10-19
---

[[模块化]] 介绍了模块、包和导入语法。本文接着解释：为什么代码不变，只换一条启动命令，导入就可能从成功变成失败？为什么文件放在 `src/app` 中，代码却写 `from app.utils import ...`？

## 1. 先分清三个问题

| 问题                 | 决定因素                                                  | 例子                               |
| :------------------- | :-------------------------------------------------------- | :--------------------------------- |
| 启动哪个 Python？    | 终端的命令解析、环境变量 `PATH`                           | 全局 Python 或 `.venv` 中的 Python |
| 去哪里找模块？       | 模块查找机制，路径查找时使用 `sys.path` 或包的 `__path__` | 从 `project` 下找 `app`            |
| 当前模块属于哪个包？ | 导入或启动时建立的包上下文                                | `app.main` 属于 `app` 包           |

**能找到一个文件，不等于运行中的这个文件已经具有包身份。** `sys.path` 提供搜索位置，不能代替相对导入需要的包上下文。

下文使用普通 Python 启动方式，不手工修改搜索路径，没有同名包冲突，也不使用 `-I`、`-P` 等改变路径行为的选项。

---

## 2. 用同一个项目观察两种启动方式

准备以下结构，`app/__init__.py` 可以为空：

```text
project/
├── main.py
└── app/
    ├── __init__.py
    ├── main.py
    └── utils.py
```

两个 `main.py` 用来对比根目录入口与包内入口。公共函数放在 `app/utils.py`：

```python
# app/utils.py
def say_hello() -> str:
    return "你好"
```

先在包内的 `app/main.py` 中写：

```python
# app/main.py
from .utils import say_hello

if __name__ == "__main__":
    print(say_hello())
```

### 2.1 按文件路径启动

在 `project` 目录执行：

```powershell
python app/main.py
```

这条命令让 Python 打开指定文件。入口定位本身不经过 `sys.path` 搜索；与此同时，Python 默认把**脚本所在目录** `project/app` 加入 `sys.path` 开头，供后续导入使用。

但是，它不会仅凭文件位于 `app` 目录、旁边有 `__init__.py`，就自动建立入口的 `app` 包身份。因此 `.utils` 不知道“当前包”是谁，会报：

```text
ImportError: attempted relative import with no known parent package
```

这里的 `.` 表示**当前包**，不是文件路径中的“当前目录”。

### 2.2 按模块名启动

仍在 `project` 目录执行：

```powershell
python -m app.main
```

此时 Python 默认把**执行命令时的工作目录** `project` 加入 `sys.path` 开头，再按模块名查找：先找 `app` 包，再找其中的 `main` 模块，并将它作为程序入口执行。

入口保留了属于 `app` 的包上下文，所以 `.utils` 能解析成 `app.utils`，输出 `你好`。`-m` 后写模块名 `app.main`，不要写文件路径或加 `.py`。

| 对比项                         | `python app/main.py` | `python -m app.main`                     |
| :----------------------------- | :------------------- | :--------------------------------------- |
| 入口如何定位                   | 按文件路径           | 按模块名                                 |
| 默认加入 `sys.path` 开头的位置 | `project/app`        | `project`                                |
| 入口是否具有 `app` 包上下文    | 默认没有             | 有                                       |
| 入口的 `__name__`              | `"__main__"`         | `"__main__"`                             |
| 入口的 `__spec__`              | 通常为 `None`        | 包含 `app.main` 的模块规格，父包为 `app` |
| 本例中的 `.utils`              | 报错                 | 成功                                     |

**`-m` 并不意味着入口的 `__name__` 变成 `"app.main"`。** 两种方式都会执行入口里的 `if __name__ == "__main__":` 分支。

以上启动行为可对照 [Python 命令行说明](https://docs.python.org/zh-cn/3/using/cmdline.html#cmdoption-m) 与 [主模块的特殊处理](https://docs.python.org/zh-cn/3/reference/import.html#special-considerations-for-main)。

### 2.3 搜索路径不等于工作目录

两条命令都不会自动切换程序的当前工作目录。在 `project` 下启动，`open("data.txt")` 默认仍从 `project` 找文件。

可以分别观察：

```python
import os
import sys

print("工作目录：", os.getcwd())
print("搜索路径首项：", sys.path[0])
print("入口名称：", __name__)
print("模块规格：", __spec__)
print("父包：", __spec__.parent if __spec__ is not None else None)
```

这些打印应放在入口失败的导入语句之前，否则程序报错后不会执行到它们。

---

## 3. 为什么直接运行时，绝对导入仍然可以成功

现在给根目录的 `main.py` 写入：

```python
# project/main.py
from app.utils import say_hello

print(say_hello())
```

在 `project` 目录执行：

```powershell
python main.py
```

可以输出 `你好`。原因是：`project` 加入了搜索路径，而 `from app.utils ...` 从顶层名字 `app` 开始查找，不需要知道 `main.py` 自己属于哪个包。

同一文件若改成：

```python
from .app.utils import say_hello
```

就会失败。它要求先确定“我所属的包”，再在这个包里面找 `app.utils`；而直接运行的根目录入口没有已知的父包。

| 导入方式                           | 需要什么信息               | 本例结果 |
| :--------------------------------- | :------------------------- | :------- |
| `from app.utils import say_hello`  | 顶层包 `app` 能被查找到    | 成功     |
| `from .app.utils import say_hello` | 入口先有父包，再从该包查找 | 失败     |

**不要把“入口没有包身份”说成“入口里的代码不能导入包”。** 入口内部的绝对导入仍使用正常的模块查找机制。相对导入则需要额外的包上下文，详见 [Python 相对导入说明](https://docs.python.org/zh-cn/3/reference/import.html#package-relative-imports)。

同理，在 `app/main.py` 中写 `import utils`，然后执行 `python app/main.py`，通常能从搜索首项 `project/app` 找到 `utils.py`。但此时模块名是顶层的 `utils`，而不是 `app.utils`；不要依赖这种写法来混用包内、包外两套启动方式。

---

## 4. 搜索起点下面的目录，何时成为包

### 4.1 顶层包相对于搜索位置而言

对于这个路径关系：

```text
project/          ← 在 sys.path 中，是搜索起点
└── app/          ← 从搜索起点下面匹配 app
    └── utils.py  ← 再匹配 utils
```

`from app.utils import say_hello` 中，`app` 是顶层包，`app.utils` 是模块。`project` 不因为出现在 `sys.path` 中就自动成为导入名的一部分。

Python 不会自动识别“项目根目录”，也不会递归扫描所有子目录替你寻找任意模块。它按照给定名称逐层查找。若搜索起点换成 `project/app`，便可以直接找到 `utils`，但仅靠这个搜索项找不到顶层名字 `app`。

### 4.2 没有 `__init__.py` 也可能导入成功

在上面的示例中，如果不放置 `app/__init__.py`，根目录 `main.py` 的绝对导入仍然可以成功：`app` 可以成为**命名空间包**。

| 类型       | 典型目录形态                       | 初始化行为                             |
| :--------- | :--------------------------------- | :------------------------------------- |
| 普通包     | 有 `__init__.py`                   | 首次导入包时执行该文件                 |
| 命名空间包 | 没有 `__init__.py`，按查找规则形成 | 没有该初始化文件，可由多个位置共同组成 |

需要保留一个边界：没有 `__init__.py` 的同名目录只是命名空间包的候选部分。如果后续搜索位置找到了同名普通包或模块，默认路径查找器会采用那个具体结果，而不是立即采用前面的候选目录。

**所以不能把规则理解为“所有文件夹自动都是已经加载的包”。** 只有发生导入查找时，才按规则确定结果。[官方命名空间包说明](https://docs.python.org/zh-cn/3/reference/import.html#namespace-packages)、[PEP 420 的查找规则](https://peps.python.org/pep-0420/#specification)。

---

## 5. 完整过程：先找 Python，再找入口，再处理导入

### 5.1 PowerShell 如何查找 `python`

输入不带路径的 `python` 时，PowerShell 对已加载命令的优先级是：别名 → 函数 → Cmdlet → 外部程序。通常没有同名覆盖，因此会从环境变量 `PATH` 列出的目录中寻找可执行程序。

假设虚拟环境的 `Scripts` 目录位于全局 Python 目录之前，便可能优先找到虚拟环境中的 `python.exe`。PowerShell 默认不会只因为当前目录有同名程序就执行它；运行当前目录的程序要明确写 `./python.exe` 或让该目录位于 `PATH` 中。

```powershell
# 当前 python 命令解析到哪里
Get-Command python

# 查看同名候选项
Get-Command python -All

# 实际启动的解释器是谁
python -c "import sys; print(sys.executable)"

# 明确指定项目虚拟环境中的解释器
.\.venv\Scripts\python.exe -m app.main
```

`PATH` 决定终端如何找命令，`PYTHONPATH` 则为 Python 补充模块搜索目录，两者不是同一个变量。参见 [PowerShell 命令优先级](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_command_precedence)。

### 5.2 Python 的导入查找顺序

对代码中的一次导入，普通环境下可以按以下步骤理解：

1. **检查 `sys.modules`**：按完整模块名查询已加载缓存；命中正常模块对象时通常直接复用。
2. **调用 `sys.meta_path` 中的查找器**：默认主要依次处理内置模块、冻结模块、基于路径的模块。内置模块直接编入解释器；冻结模块的代码预先固化；路径查找才需要到目录、压缩包等位置寻找。
3. **路径查找区分层级**：顶层名字查 `sys.path`，子模块查父包的 `__path__`。
4. **找到后加载和初始化**：普通包执行 `__init__.py`，Python 源码模块执行顶层代码；不会因为导入包，就自动执行所有子文件。

以 `import app.utils` 为例，需要先建立 `app` 包，再在它的搜索位置中找 `utils`。自定义查找器可以改变行为，上述说明针对默认机制。缓存也意味着“路径变了”不一定使已经导入的同名模块重新加载。[Python 导入查找机制](https://docs.python.org/zh-cn/3/reference/import.html#searching)。

### 5.3 `sys.path` 一般由哪些位置组成

| 大致顺序 | 路径来源                                              |
| :------- | :---------------------------------------------------- |
| 1        | 直接运行时的脚本目录；`-m` 启动时的工作目录           |
| 2        | `PYTHONPATH` 中配置的目录                             |
| 3        | 当前解释器的标准库、扩展模块等路径                    |
| 4        | `site` 初始化加入的路径，如第三方包的 `site-packages` |

这不是不可改变的固定列表：虚拟环境、启动选项、`.pth` 文件和代码都可能影响实际结果。因此，“自己的模块 → 标准库 → 第三方库”只是常见路径布局的近似说法，不是 Python 按代码类别强制排序。

```python
import sys

for path in sys.path:
    print(path)
```

当前路径中的 `json.py` 可能遮蔽标准库 `json`，而 `sys` 这样的内置模块不会简单地按同一规则被本地 `sys.py` 抢先。具体顺序参见 [模块搜索路径初始化](https://docs.python.org/zh-cn/3/library/sys_path_init.html)。

---

## 6. 为什么放在 `src/app`，却从 `app` 开始导入

### 6.1 将同一个包移到 `src` 下

现在把前面的 `app` 整体移动到 `src` 中，根目录 `main.py` 的绝对导入保持不变：

```text
project/
├── main.py
├── pyproject.toml
└── src/
    └── app/
        ├── __init__.py
        ├── main.py
        └── utils.py
```

如果只是移动目录，尚未安装项目，也未补充路径，在 `project` 下执行 `python main.py` 或 `python -m app.main`，通常都会找不到 `app`。

原因并没有变化：默认搜索起点是 `project`，它下面直接可见的是 `src`，不是 `app`。**`src` 这个名字没有自动跳过一层的语言特性。**

### 6.2 安装使 `app` 成为环境可导入的包

`src` 布局通常通过安装项目暴露包。在完成构建配置后：

```powershell
# 普通安装：将构建好的包安装到当前解释器环境
python -m pip install .

# 或者，可编辑安装：开发时继续使用源码目录中的代码
python -m pip install -e .
```

这是两种安装方式，按场景选择，不要求先后都执行。普通安装通常让 `app` 出现在环境的 `site-packages` 下；可编辑安装则使环境能够定位到源码中的 `app`。

可编辑安装可能使用 `.pth` 增加路径，也可能由构建后端生成导入映射。**不应保证“安装后一定把 `src` 直接加入 `sys.path`”。** 实现可以不同，但对使用者而言都能 `import app`。

通常修改纯 Python 源码后，新启动的进程会使用修改后的内容；已经运行的进程不会自动刷新 `sys.modules` 缓存。修改项目元数据、入口命令或某些包结构后，也可能需要重新安装。

参见 [src 布局说明](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/)、[pip 本地项目安装](https://pip.pypa.io/en/stable/topics/local-project-installs/)。更完整的构建与发布流程见 [[构建发布]]。

---

## 7. 使用 setuptools 配置，再用 uv 安装和运行

### 7.1 完整的基础配置

对于上一节的目录，`pyproject.toml` 可以写成：

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.10"

[build-system]
requires = ["setuptools>=64"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]
```

| 配置                              | 谁读取、负责什么                                                                   |
| :-------------------------------- | :--------------------------------------------------------------------------------- |
| `[project]`                       | 声明项目名称、版本和 Python 要求；发行项目名 `my-project` 不要求等于导入包名 `app` |
| `[build-system]`                  | 指定构建后端及构建依赖；这里明确选择 setuptools                                    |
| `[tool.setuptools.packages.find]` | setuptools 从 `src` 下面发现包，不将 `src` 算进包名                                |

构建依赖 `setuptools` 用于构建过程，不需要为了这个例子把它重复写成应用运行依赖。此配置仅适用于 setuptools；Hatchling、`uv_build` 等后端有各自的配置方式。[setuptools 包发现说明](https://setuptools.pypa.io/en/latest/userguide/package_discovery.html)。

### 7.2 `uv sync` 做了什么

在 `project` 下执行：

```powershell
uv sync
```

按默认项目配置，uv 创建或使用 `.venv`，同步依赖，并将具有构建系统的当前项目以可编辑方式安装进去。此时，`app` 对这个环境中的 Python 可见。

**只配置 `where = ["src"]` 并不等于完成安装。** 默认情况下，若未声明 `[build-system]`，uv 不安装当前项目本身，只同步依赖。例外是显式设置 `[tool.uv] package = true` 强制打包；反过来，`package = false` 或 `--no-install-project` 会阻止本次安装项目，`--no-editable` 则改用非可编辑安装。

上面的完整配置不需要额外设置 `package = true`。参见 [uv 构建系统与项目打包](https://docs.astral.sh/uv/concepts/projects/config/#build-systems)、[uv 同步行为](https://docs.astral.sh/uv/concepts/projects/sync/)。

### 7.3 运行时要使用同一个环境

```powershell
# 包内入口：保留 app 包上下文
uv run python -m app.main

# 根目录入口：内部使用 from app.utils import say_hello
uv run python main.py

# 确认使用哪个解释器、实际导入哪份代码
uv run python -c "import sys, app; print(sys.executable); print(app.__file__)"
```

这里的 `app` 有 `__init__.py`，所以可以用 `app.__file__` 定位；若是命名空间包，应查看 `app.__path__`。

`uv sync` 不会自动激活当前终端。`uv run` 会为这次命令使用项目环境，也会默认检查、按需同步环境；它不要求先手工激活。直接输入裸 `python` 则可能仍然使用全局解释器。uv 的更多用法见 [[项目管理工具]]。

还有一个容易遗漏的区别：**安装解决“能不能找到 `app`”，`-m` 解决包内入口的包上下文。** 即使安装成功，执行 `uv run python src/app/main.py` 仍是按文件启动，本例的 `.utils` 依然缺少父包而报错。

---

## 8. 遇到导入错误时，按三个问题排查

1. **是不是运行错了 Python？** 查看 `sys.executable`。项目装在 `.venv`，全局解释器不一定能看到它。
2. **搜索起点是否正确？** 查 `sys.path`；顶层名字需要从搜索位置下面找到，不能指望 Python 递归寻找项目根目录。使用 `src` 布局时确认项目已安装。
3. **相对导入是否有包上下文？** 如果报没有已知父包，检查是否直接运行了包内文件；应结合项目环境，用 `python -m app.main` 这样的模块方式启动。

可以用下面的表检查理解：

| 操作与前提                                           | 预期结果                   | 原因                                                 |
| :--------------------------------------------------- | :------------------------- | :--------------------------------------------------- |
| 初始布局，根目录运行 `python main.py`                | 成功                       | 根入口用绝对导入，`project` 下可以找到 `app`         |
| 初始布局，运行 `python app/main.py`                  | 相对导入报错               | 包内入口没有建立父包上下文                           |
| 初始布局，运行 `python -m app.main`                  | 成功                       | 模块启动保留 `app` 包上下文                          |
| 初始布局不放置 `app/__init__.py`，保持无同名冲突     | 上面的两种成功方式仍可成功 | `app` 可以作为命名空间包                             |
| 移动为 `src` 布局，未安装也未配置路径                | 找不到顶层 `app`           | `project` 下没有直接可见的 `app`                     |
| 完整配置后 `uv sync`，再 `uv run python -m app.main` | 成功                       | 项目已安装，且入口具有包上下文                       |
| 已安装，但 `uv run python src/app/main.py`           | 相对导入报错               | 可导入的包存在，不代表按文件运行的入口自动获得包身份 |

理解这些结果后，就可以把 [[模块化]] 中的语法和真实项目的启动方式对应起来。
