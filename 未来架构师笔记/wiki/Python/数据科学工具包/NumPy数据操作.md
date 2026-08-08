---
author: ai
ai_editable: true
summary: "NumPy 数据操作全集：创建（zeros/ones/arange/linspace/random）、索引与切片（视图 vs 拷贝、花式索引、布尔索引）、reshape 变形、向量化数学运算、统计（含总体/样本标准差）、np.where、拼接分割、排序、广播。"
refs:
  pages:
    - NumPy核心概念
  raw:
    - path: raw/operations-datascience/4. numpy-数据操作/课件.ipynb
      sha256: 3ec0ad113125002f9158632486c5eed583e74736515f272eaa66653db3d11303
updated_by: ai
updated: 2026-08-08
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

**标准差**——衡量数据离散程度：越小数据越集中、平均越有代表性；越大越分散、平均越不可靠。

- 总体标准差：$\sigma = \sqrt{\sum(x_i-\mu)^2 / N}$
- 样本标准差：$s = \sqrt{\sum(x_i-\bar{x})^2 / (n-1)}$，用 `ddof=1`

```python
arr.std()          # 总体标准差
arr.std(ddof=1)    # 样本标准差
arr.std() / arr.mean()   # 变异系数 CV：无量纲离散度
```

| CV 范围 | 离散程度 | 直观感受         | 典型场景           |
| ------- | -------- | ---------------- | ------------------ |
| < 10%   | 非常小   | 数据几乎一模一样 | 精密零件           |
| 10%~20% | 较小     | 有波动但稳定     | 身高体重气温       |
| 20%~30% | 中等     | 正常波动         | 考试成绩           |
| 30%~50% | 较大     | 平均代表性下降   | 房价、薪资         |
| > 50%   | 非常大   | 平均几乎没意义   | 股票收益、创业估值 |

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
