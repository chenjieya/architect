---
author: ai
ai_editable: true
summary: 'NumPy 数据操作全集：创建（zeros/ones/arange/linspace/random）、索引与切片（视图 vs 拷贝、花式索引、布尔索引）、reshape 变形、向量化数学运算、统计（含总体/样本标准差）、np.where、拼接分割、排序、广播。'
refs:
  pages:
    - NumPy核心概念
    - 标准差公式详解
    - 均值、中位数与标准误
  raw:
    - path: raw/operations-datascience/4. numpy-数据操作/课件.ipynb
      sha256: 3ec0ad113125002f9158632486c5eed583e74736515f272eaa66653db3d11303
updated_by: ai
updated: 2026-11-13
---

## 1. 数组创建

除从列表直接创建外，NumPy 提供很多便捷构造方法：

```python
np.zeros((2,3))                      # 全零数组
np.ones((2,3), dtype=np.float32)     # 全一数组（可指定 dtype）
np.eye(3)                            # 单位矩阵
np.arange(0, 10, 2)                  # 等差数组 [0,2,4,6,8]
np.linspace(0, 1, 5)                 # 等间隔 5 个点
np.linspace(0, 1, 5, endpoint=False) # 不含终点
```

随机数生成推荐用 `default_rng`（New API，种子可复现）：

```python
rng = np.random.default_rng(42)     # 固定种子
rng.uniform(10, 100, 10)            # 均匀分布
rng.normal(0, 1, (2, 3))            # 正态分布
rng.integers(0, 1000, 10)           # 随机整数
```

**场景**：快速造模拟数据测逻辑，如模拟 10 个商品价格和销量。

## 2. 索引与切片

### 2.1 基本索引与切片

语法 `arr[start:stop:step]`，多维用逗号分隔。

> **注意：切片返回的是视图（view）不是拷贝**——改切片会影响原数组；用 `.copy()` 才是拷贝。

```python
arr = np.arange(12).reshape(3, 4)
print(arr[0])        # 第一行
print(arr[:, 1:])    # 所有行、从第 1 列起
print(arr[1:, 2:])   # 第 1 行起、第 2 列起

view = arr[1:, 2:]
view[0, 0] = 99      # 会改到原数组！
copy = arr[1:, 2:].copy()
```

### 2.2 花式索引（Fancy Indexing）

用整数数组选取不连续的行/列，**返回的是拷贝**：

```python
print(arr[[0, 2]])             # 取第 0、2 行
print(arr[[0,1,3], [2,1,0]])   # 对角线式取元素
```

### 2.3 布尔索引（Boolean Indexing）

用布尔数组作为掩码筛选，**返回的是拷贝**：

```python
arr = np.array([10, 25, 3, 47, 8, 19])
print(arr[arr > 15])                    # [25 47 19]
print(arr[arr % 2 == 0])                # 偶数
print(arr[(arr > 10) & (arr < 30)])     # 组合条件用 & |
```

## 3. 变形与重塑

总元素数必须一致，`-1` 让 NumPy 自动算：

```python
np.arange(12).reshape(3, 4)   # (3,4)
np.arange(12).reshape(2, -1)  # (2,6)，-1 自动推断
np.arange(12).reshape(2, 2, 3)
np.resize([1,2,3,4], (2, 3))  # resize 可重复填充
```

**场景**：API 返回一维数据，`reshape` 成表格展示。

## 4. 数学运算（向量化）

所有运算符对整个数组一次性操作，不用循环：

```python
arr + 10; arr * 2; arr ** 2; arr > 2   # 标量广播
a + b; a - b; a * b; a / b              # 数组间运算
```

**场景**：商品全部打八折、摄氏度转华氏度。

## 5. 统计运算

`axis` 指定聚合方向：

```python
arr = np.arange(12).reshape(3, 4).astype(float)
arr.sum(); arr.mean(); arr.min(); arr.max()
arr.sum(axis=0)        # 按列求和
arr.sum(axis=1)        # 按行求和
arr.argmin(); arr.argmax()   # 最值下标
```

**标准差**衡量数据围绕均值的离散程度。同一单位与背景下，越小越集中、越大越分散；它不直接判断平均值估计得准不准。抽样均值的波动还依赖样本量与抽样方式，需看标准误，概念和推导见 [[均值、中位数与标准误]]。

- 总体标准差：$\sigma = \sqrt{\sum(x_i-\mu)^2 / N}$
- 样本标准差：$s = \sqrt{\sum(x_i-\bar{x})^2 / (n-1)}$，用 `ddof=1`

这里 $x_i$ 是第 i 个观测，$\mu$ 是总体均值，$\bar{x}$ 是样本均值，N 与 n 分别表示总体和样本的数据个数；$\sum$ 表示逐项相加，$\sqrt{\cdot}$ 表示开平方。样本公式要求 n 大于 1；分母 n−1 保证的是**样本方差**的无偏性，开根号后的标准差通常仍有偏，证明见 [[标准差公式详解]]。

```python
arr.mean()        # 均值：相加后除以个数
np.median(arr)    # 中位数：排序后的中间位置，与均值不是同一个概念
arr.std()          # 分母为数据个数；描述这批数据本身
arr.std(ddof=1)    # 样本标准差，其平方是总体方差的无偏估计
arr.std() / arr.mean()   # CV：仅适合均值为正且不接近零、有意义的绝对零点的量
```

**CV 没有跨业务通用的“10% 稳定、50% 均值没意义”分级。**例如重量均值 100、标准差 10，与重量均值 50、标准差 10 的 CV 分别为 10% 和 20%，只能说明后一组相对波动更大。

摄氏温度的零点不表示“没有温度”，不适合直接用 CV；均值为零时不能相除，接近零时结果也很不稳定。CV 大小不能代替对均值估计精度的判断，详细限制见 [[标准差公式详解]]。

## 6. 条件筛选与 np.where

`np.where(cond, x, y)`——向量化的 if-else：条件成立取 x，否则取 y。

```python
np.where(arr < 0, 0, arr)     # 负数替换为 0
np.where(arr > 25)            # 返回满足条件的下标
np.where(scores >= 60, '通过', '不通过')   # 分类标记
```

**场景**：成绩单 60 分以上标记「通过」。

## 7. 拼接与分割

```python
np.vstack([a, b])        # 垂直堆叠（行）
np.hstack([a, b])        # 水平堆叠（列）
np.concatenate([a, b], axis=0)   # 沿 axis 拼接
np.split(arr, [1, 3])    # 沿行分割出 [0:1]、[1:3]、[3:]
np.hsplit(arr, 2)        # 沿列对半分割
```

## 8. 排序

```python
np.sort(arr)         # 返回排序后的新数组
np.argsort(arr)      # 返回排序后的索引
np.unique(arr)       # 唯一值
np.sort(mat, axis=1) # 按行排序；axis=0 按列
arr.sort()           # 原地排序
```

**场景**：找出销量最高的前 3 个商品：`np.argsort(sales)[::-1][:3]`。

## 9. 广播（Broadcasting）

对不同形状数组运算时，NumPy **自动把小数组扩展成大数组形状**，无需手动复制。

规则：**从尾部维度开始比，维度相同或有一个是 1 就能广播**。

```python
arr + 10; arr * 5                    # 标量广播
matrix + row                         # 行广播
matrix + col                         # 列广播
np.array([[1],[2],[3]]) + np.array([10,20,30,40])  # (3,1)+(4,)→(3,4)
```

**场景**：给成绩表每行（学生）加不同加分。

## 10. 操作速查表

| 操作     | 常用方法                                            |
| -------- | --------------------------------------------------- |
| 创建     | `array` `zeros` `ones` `arange` `linspace` `random` |
| 索引     | `arr[i]`、切片、花式索引、布尔索引                  |
| 变形     | `reshape` `resize`                                  |
| 数学     | `+ - * / **` `sin` `cos` `exp` `sqrt`               |
| 统计     | `sum` `mean` `std` `min` `max` `cumsum`             |
| 筛选     | `np.where` 布尔掩码                                 |
| 拼接分割 | `concatenate` `vstack` `hstack` `split`             |
| 排序     | `sort` `argsort` `unique`                           |
| 广播     | 自动维度扩展                                        |
