---
author: ai
ai_editable: true
summary: "Pandas 数据清洗完整流程：数据初探（info/head/dtypes/isna）、应届信息提取、学历/城市用 map+映射归类、经验/薪资用自定义函数+apply 解析为标准数值、结果验证与导出。"
refs:
  pages:
    - Pandas数据类型
  raw:
    - path: raw/operations-datascience/6. pandas-数据清洗/课件.ipynb
      sha256: 4f1ba9629b13a767eed6218ba1054f0fb7cd8607c40ffe44fdf23596b5e7c197
updated_by: ai
updated: 2026-08-08
---

## 1. 概述

数据清洗是数据分析中最耗时但也最重要的环节。真实数据往往"脏"：类型不统一、格式不一致、缺失值、异常值。本课以一份真实的程序员薪资调查数据（`linking.xlsx`）为例，完整走一遍清洗流程，核心目标是**统一各列数据类型**，让数据「干净、可用」。

## 2. 数据初探

拿到新数据先"观察"，不急着动手：

```python
df.info()          # 数据量、各列类型、内存占用
df.head()          # 前几行直观感受
df.dtypes          # 每列类型
df.isna().sum()    # 每列缺失值数量
```

> 这份数据有 679 行，很多列有缺失，且**类型全是 object/str**——数值型的经验、薪资被读成了字符串，这是要解决的核心问题。

## 3. 定位：loc 与 iloc

- `df.loc[行, 列]`：按**索引标签**定位
- `df.iloc[行, 列]`：按**整数位置**定位

```python
df.loc[0:5]                     # 索引 0~5 的所有行
df.loc[df["城市"] == "北京"]    # 条件筛选所有列
df.iloc[0:5, 0:3]               # 前 5 行、前 3 列
```

## 4. 应届信息提取

很多列混入「26 应届」「25 应届」，本质是毕业年份信息。统一做法：提取为独立列「毕业年份」，原列留空（经验列写 0）。

```python
mask = df['学历'].astype(str).str.contains('应届', na=False)
df['毕业年份'] = np.nan
for col in ['城市', '经验']:
    mask = df[col].astype(str).str.contains(r'应届', na=False)
    year = df.loc[mask, col].astype(str).str.extract(r'(\d+)\s*应届')
    if not year.empty:
        df.loc[mask, '毕业年份'] = 2000 + year[0].dropna().astype(int)
    if col == '经验':
        df.loc[mask, col] = 0.0
    else:
        df.loc[mask, col] = None
```

`str.extract()` 用正则从字符串提取数字，加 2000 即为真实毕业年份。

## 5. 学历清洗（分类映射）

学历是分类数据但写法不统一：「本」「本科」「本 211」「985 本」都是本科；「招人」「留美」是异常值。用 `map()` 做映射，不认识的统一为 NaN：

```python
edu_map = {'本':'本科','本科':'本科','本211':'本科','985本':'本科',
           '专':'大专','专科':'大专','大专':'大专',
           '硕':'硕士','硕士':'硕士','985硕士':'硕士', ...}
df['学历'] = df['学历'].map(edu_map)
df['学历'] = df['学历'].astype('category')   # 转分类类型，省内存且语义明确
```

## 6. 城市清洗

城市列混入非城市数据（「焦虑型人格」「在读」「-」）：

```python
df['城市'] = df['城市'].str.strip()                    # 去空格
df['城市'] = df['城市'].str.split('/').str[-1].str.strip()  # 「湖南/株洲」→「株洲」
df.loc[df['城市'].isin(['焦虑型人格', '在读', '-']), '城市'] = None  # 剔异常
df.loc[df['城市'] == '广西柳州', '城市'] = '柳州'    # 手动合并
```

## 7. 经验清洗（转数值）

目标转为数值（年），用**自定义函数 + `apply()`**：

处理规则：`「3年」「2.5年」`提取数字；`「3个月」`÷12；`「<1年」`取中间值减 0.5；`「10+年」`取下限；`「转行」「读研」`设 NaN。

```python
def parse_experience(val):
    if pd.isna(val): return np.nan
    if isinstance(val, (int, float)): return float(val)
    s = str(val).strip()
    if s in ['-','']: return np.nan
    plus = re.search(r'(\d+(?:\.\d+)?)\s*\+\s*年', s)   # 10+年
    if plus: return float(plus.group(1))
    lt = re.search(r'<(\d+(?:\.\d+)?)\s*年', s)          # <1年
    if lt: return max(float(lt.group(1)) - 0.5, 0)
    years = re.findall(r'(\d+(?:\.\d+)?)\s*年', s)        # 3年
    if years: return sum(float(y) for y in years)
    months = re.findall(r'(\d+)\s*个月', s)               # 3个月
    if months: return round(sum(float(m) for m in months) / 12, 1)
    return np.nan

df['经验'] = df['经验'].apply(parse_experience)
```

## 8. 薪资清洗（转数值）

薪资写法最复杂：`9k`、`20w/年`、`13k*15`、`30k+`、多行、变动历史 `25k->22k->18k`、带地点 `16k（广州）`、范围 `50k~60k`、异常 `实习`、`？？`。

```python
def parse_salary(val):
    if pd.isna(val): return np.nan
    s = str(val).strip()
    if s in ['实习','-','？？','']: return np.nan
    s = s.split('\n')[-1].strip() if '\n' in s else s   # 多行取最后
    s = s.split('->')[-1].strip() if '->' in s else s   # 变动历史取最新
    s = re.sub(r'[（(][^)）]*[)）]', '', s).strip()      # 去地名
    w = re.search(r'(\d+(?:\.\d+)?)\s*w', s, re.I)       # 年薪 w → 月薪
    if w: return round(float(w.group(1)) * 10 / 12, 1)
    slash = re.search(r'(\d+)\s*k\s*/\s*(\d+)\s*k', s, re.I)  # 范围取高
    if slash: return float(slash.group(2))
    k = re.search(r'(\d+(?:\.\d+)?)\s*\+\s*k', s, re.I)  # 30k+
    if k: return float(k.group(1))
    return np.nan

df['薪资'] = df['薪资'].apply(parse_salary)
df = df.rename(columns={'薪资': '薪资(k)', '经验': '经验(年)'})
```

> `星形` 无论形式如何，都统一为**千元/月**的数值（float64）。

## 9. 验证与导出

```python
df.info()                # 类型应为数值
df.head()                # 抽查
df = df[['昵称','学历','城市','经验(年)','薪资(k)','毕业年份','备注']]
df['毕业年份'] = df['毕业年份'].astype('Int32')   # Pandas 可空整数
df.to_excel('../linking_clean.xlsx', index=False)
df.to_csv('../linking_clean.csv', index=False, encoding='utf-8-sig')
```
