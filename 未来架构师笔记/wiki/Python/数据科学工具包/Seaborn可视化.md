---
author: ai
ai_editable: true
summary: 'Seaborn 建立在 Matplotlib 之上的高级统计可视化库。用前端开发薪资调研数据带出核心图类型：histplot/kdeplot（分布）、boxplot/violinplot（分类对比）、scatterplot/regplot（回归）。'
refs:
  pages:
    - Pandas数据清洗
    - Matplotlib核心概念
  raw:
    - path: raw/operations-datascience/10. seaborn/课件.ipynb
      sha256: 8ede950f9b8d838b7b433c595556e0362ec6e895bd8f6adde757f0a51f7f0c28
updated_by: ai
updated: 2026-08-08
---

## 1. 概述

Seaborn 是建立在 Matplotlib 之上的高级统计可视化库，特点：**简洁代码生成美观且有统计意义的图表**。本节用一份前端开发者薪资调研数据（`linking_clean.csv`），做探索性分析。

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

sns.set_theme(style="whitegrid", font="PingFang SC")
df = pd.read_csv("../linking_clean.csv")
df_clean = df.dropna(subset=["薪资(k)"]).copy()   # 去缺失
```

## 2. 薪资分布 — 单变量分析

- `histplot`：直方图，展示区间频次
- `kdeplot`：核密度估计，平滑展示概率密度

```python
fig, axes = plt.subplots(1, 2, figsize=(8, 4))
sns.histplot(data=df_clean, x="薪资(k)", bins=30, ax=axes[0])
axes[0].set_title("薪资直方图")
sns.kdeplot(data=df_clean, x="薪资(k)", fill=True, ax=axes[1])
axes[1].set_title("薪资核密度估计")

# displot 可同时展示直方图 + 密度曲线
sns.displot(data=df_clean, x="薪资(k)", kde=True, bins=30)
```

## 3. 学历与薪资 — 分类对比

- `boxplot`：箱线图，中位数、四分位数、异常值
- `violinplot`：小提琴图，箱线图基础上叠加分布形状
- `barplot`：默认显示均值 + 置信区间

```python
order = ["小学","中专","初中","高中","大专","本科","硕士"]
fig, axes = plt.subplots(1, 2, figsize=(8, 5))
sns.boxplot(data=df_clean, x="学历", y="薪资(k)", order=order, ax=axes[0])
axes[0].set_title("学历 vs 薪资 — 箱线图")
sns.violinplot(data=df_clean, x="学历", y="薪资(k)", order=order, ax=axes[1])
axes[1].set_title("学历 vs 薪资 — 小提琴图")

sns.barplot(data=df_clean, x="学历", y="薪资(k)", order=order)   # 均值+置信区间
```

## 4. 经验与薪资 — 回归分析

- `scatterplot`：散点图，看分布
- `regplot`：自动加回归线，判断工作年限对薪资影响

```python
fig, axes = plt.subplots(1, 2, figsize=(8, 5))
sns.scatterplot(data=df_clean, x="经验(年)", y="薪资(k)", alpha=0.6, ax=axes[0])
axes[0].set_title("经验 vs 薪资 — 散点图")
sns.regplot(data=df_clean, x="经验(年)", y="薪资(k)",
            scatter_kws={"alpha": 0.5},
            line_kws={"color": "red", "linewidth": 2},
            ax=axes[1])
axes[1].set_title("经验 vs 薪资 — 回归图")
```

## 5. 核心图类型速查

| 图类型     | 函数                   | 用途                |
| ---------- | ---------------------- | ------------------- |
| 直方图     | `histplot` / `displot` | 单变量频次分布      |
| 核密度     | `kdeplot`              | 单变量平滑密度      |
| 箱线图     | `boxplot`              | 分布统计量 + 异常值 |
| 小提琴图   | `violinplot`           | 分布形状 + 统计量   |
| 条形图     | `barplot`              | 分类均值 + 置信区间 |
| 散点图     | `scatterplot`          | 两变量关系          |
| 回归图     | `regplot`              | 关系 + 线性拟合     |
| 分类汇总图 | `catplot`              | 分类汇总通用        |
| 热力图     | `heatmap`              | 相关性/矩阵         |
| 成对关系   | `pairplot`             | 多维变量两两关系    |
