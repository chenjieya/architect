---
author: mixed
ai_editable: true
summary: ndarray 是 NumPy 的多维数组：同质化、连续内存、向量化运算。核心四概念——shape（各维大小）、dtype（数据类型，Embedding 用 float32）、strides（维上前进字节数，转置零拷贝）、axis（沿哪个维度操作）。
refs:
  pages: []
  raw:
    - path: raw/operations-datascience/3. numpy-核心概念/课件.ipynb
      sha256: 818269f68948d2aa8cb03c6151d64d4923ce8f65f829c563a363bf9bc0ca4009
updated_by: ai
updated: 2026-08-08
---

## 1. ndarray —— 多维数组

`ndarray`（N-dimensional array）是 NumPy 的核心数据结构，表示一个**多维数组**。NumPy 是 Python 科学计算的基石库，几乎所有数据科学生态（Pandas、PyTorch 等）都建立在 NumPy 之上，底层用 C/C++ 编写，处理大规模数据性能极高。

与 Python 原生列表的关键区别：

- **同质化**：所有元素必须是相同类型（dtype）
- **连续内存**：数据存储在连续内存块中，访问效率高
- **向量化运算**：无需循环即可对整个数组执行运算

```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr)            # [[1 2 3] [4 5 6]]
print(type(arr))      # <class 'numpy.ndarray'>
print(arr.shape)      # (2, 3)  形状
print(arr.ndim)       # 2       维度数
print(arr.dtype)      # int64   数据类型
```

理解 NumPy 的关键在于 **shape、dtype、strides、axis** 四个概念，它们决定数组的形状、存储方式和运算规则。

## 2. shape（形状）

`shape` 是一个元组，描述数组在每个维度上的大小。

- 1D 数组：`(n,)`
- 2D 数组：`(m, n)`——类似矩阵
- 3D 数组：`(a, m, n)`——类似多个矩阵堆叠

```python
np.array([1, 2, 3, 4]).shape          # (4,)         1D
np.array([[1, 2], [3, 4]]).shape      # (2, 2)       2D
np.array([[[1],[2],[3]],[[4],[5],[6]]]).shape  # (2, 3, 1)  3D
```

**场景**：训练「渡一大模型」，每个 Embedding 向量维度 768，共 1000 个向量 → `shape=(1000, 768)`、`ndim=2`、`size=768000`。

## 3. dtype（数据类型）

dtype 指定数组中每个元素的类型（ndarray 同质，所以一个 dtype 描述全部元素）。

常见 dtype：

- `float64` / `float32`：浮点数（Embedding 常用 float32 节省内存）
- `int64` / `int32` / `int8`：整数
- `bool`：布尔值
- `object`：Python 对象（尽量避免，会失去向量化优势）

dtype 本质是把 **C 的类型系统**暴露给了 Python：

| NumPy dtype | C 类型    | 大小   |
| ----------- | --------- | ------ |
| `int64`     | `int64_t` | 8 字节 |
| `int32`     | `int32_t` | 4 字节 |
| `float64`   | `float`   | 8 字节 |
| `float32`   | `double`  | 4 字节 |

Python 的 `int` 是不定长对象，每个对象头就有 28+ 字节开销；ndarray 用 C 固定类型才能实现连续存储和向量化计算。100 万 float64 约 8MB，100 万 float32 约 4MB。

> **Agent 场景**：Embedding 向量用 `float32`，Token ID 用 `int64`，Mask 用 `bool`。不要在同一个数组中混装不同类型数据。

## 4. strides（步幅）

`strides` 是一个元组，表示在每个维度上**前进一个元素需要跳过的字节数**，决定 NumPy 如何在内存中"行走"。

```python
arr = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.int64)
print(arr.shape)    # (2, 3)
print(arr.strides)  # (24, 8) = (3*8, 1*8)，int64 每元素 8 字节
# 行步幅 24 = 跳下一行需跳过 3 个元素；列步幅 8 = 跳下一列只需 1 个元素
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1786178700004_stride.png)

**关键影响——转置是零拷贝的**：

转置就是行变成列，列变成行。

```python
arr = [[1, 2, 3], [4, 5, 6]]

t = arr.T

t: [
	[1, 4],
	[2, 5],
	[3, 6]
	]
```

```python
t = arr.T
print(t.shape)    # (3, 2)
print(t.strides)  # (8, 24)——只是交换步幅
t[0, 0] = 99
print(arr)        # 原数组也被修改：视图共享内存
```

为什么直接交换步幅就变成了这个样子呢？查询之类的也正常。

```python
# 内存地址：0 = 1  8 = 2 16 = 3 24 = 4 32 = 5 40 = 6
arr = [[1, 2, 3], [4, 5, 6]]
# 步幅是 （24， 8）

# 转置之后步幅是（8， 24）

arr[1, 2] = 1*24+2*8 = 40(字节) = 6
t[2, 1] = 2*8+1*24 = 40(字节) = 6
```

## 5. axis（轴）

axis 是一个整数，表示数组的维度索引，用于指定操作沿哪个维度进行。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1786178700008_axis.png)

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr.sum(axis=0))  # 沿 axis=0 按列求和：[5, 7, 9]
print(arr.sum(axis=1))  # 沿 axis=1 按行求和：[6, 15]
```
