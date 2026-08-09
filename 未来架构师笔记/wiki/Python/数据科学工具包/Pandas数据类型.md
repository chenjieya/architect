---
author: ai
ai_editable: true
summary: 'Pandas 核心数据结构：Series（带标签一维数组）与 DataFrame（二维表格）。含创建方式、从文件/数据库读取、DataFrame 内部结构（columns/index/values/dtypes/shape 等）。'
refs:
  pages: []
  raw:
    - path: raw/operations-datascience/5. pandas-数据类型/课件.ipynb
      sha256: a33bab895a7f73e74724cecb80663c5af40001c4a10e192876061bc2919d532a
updated_by: ai
updated: 2026-08-08
---

## 1. 概览

Pandas 是数据分析的核心库，核心数据结构就两个：

- **Series** → 一列带标签的数据（带索引的数组，类似 Excel 一列）
- **DataFrame** → 带标签的二维表格（类似 Excel 工作表或 SQL 表）

> 竞品参考：Polars、Dask、DuckDB、Modin、FireDucks、Datatable。

## 2. Series

"带标签的一维数组"，由两部分组成：`values`（数据本身）和 `index`（每个数据点的标签）。

```python
pd.Series([10, 20, 30, 40])                       # 默认整数标签
pd.Series([10, 20, 30, 40], index=['a','b','c','d'])  # 指定标签
pd.Series({'a': 10, 'b': 20, 'c': 30})            # 从字典，key 成索引

s = pd.Series([10, 20, 30, 40], index=['a','b','c','d'])
s.values    # numpy 数组
s.index     # Index(['a','b','c','d'])
s.dtype     # int64
s.shape     # (4,)
```

## 3. DataFrame 创建

三维建法：字典、嵌套列表、NumPy 数组：

```python
# 1. 从字典——key 是列名，value 是列数据
pd.DataFrame({
    '姓名': ['张三', '李四', '王五', '赵六'],
    '年龄': [25, 30, 35, 28],
    '城市': ['北京', '上海', '广州', '深圳'],
    '薪资': [15000, 20000, 25000, 18000]
})

# 2. 从嵌套列表——columns 指定列名
pd.DataFrame([['张三',25,'北京',15000], ...],
             columns=['姓名', '年龄', '城市', '薪资'])

# 3. 从 NumPy 数组
arr = np.array([[25,15000],[30,20000],[35,25000]])
pd.DataFrame(arr, columns=['年龄', '薪资'])
```

## 4. 从文件读取

```python
pd.read_csv('../linking.csv')
# 常用参数：encoding / header / index_col / usecols / nrows

pd.read_excel('../linking.xlsx', sheet_name='Sheet1')
pd.read_json('data.json')
```

## 5. 从数据库读取

`read_sql` 直接拉取 SQL 查询结果（以 SQLite 为例），团队用 MySQL/PostgreSQL 时免去手动导出 CSV：

```python
import sqlite3
conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE employees (name TEXT, age INT, city TEXT, salary INT)')
conn.execute("INSERT INTO employees VALUES ('张三',25,'北京',15000)")
conn.commit()

df = pd.read_sql('SELECT * FROM employees', conn)
conn.close()
```

## 6. DataFrame 内部结构

掌握这些属性，就掌握了一半：

| 属性                          | 含义                        |
| ----------------------------- | --------------------------- |
| `df.columns`                  | 列名（Index）               |
| `df.index`                    | 行索引（Index）             |
| `df.values` / `df.to_numpy()` | 核心数据（二维 NumPy 数组） |
| `df.dtypes`                   | 每列数据类型                |
| `df.shape`                    | (行数, 列数)                |
| `df.size`                     | 元素总数                    |
| `df.ndim`                     | 维度数（2）                 |
