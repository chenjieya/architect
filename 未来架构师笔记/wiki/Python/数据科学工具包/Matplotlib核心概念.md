---
author: ai
ai_editable: true
summary: 'Matplotlib 三层架构：Figure（画布，顶层容器）、Axes（绘图区，数据画在这里，一个图可有多个）、Artist（一切可见元素）。掌握这套体系即可准确查对 API。'
refs:
  pages: []
  raw:
    - path: raw/operations-datascience/7. matplotlib-核心概念/课件.ipynb
      sha256: f772107cf1bcf9634f9df10b47dec72a51e9d194e1a46e0c8c81ec5d176f2366
updated_by: ai
updated: 2026-08-08
---

## 1. 三层架构

Matplotlib 是 Python 数据可视化生态的基石，Seaborn、Plotly 底层都离不开它的三层架构。本节课建立概念体系：**Figure、Axes、Artist** 三个核心对象及其关系。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1786178734414_核心概念.png)

```
Figure（画布）
  ├── Axes（绘图区1）
  │     ├── Axis（X轴）
  │     ├── Axis（Y轴）
  │     ├── Line2D（折线）
  │     ├── Rectangle（柱体）
  │     ├── Text（文字）
  │     ├── Legend（图例）
  │     └── ...
  ├── Axes（绘图区2）
  └── ...
```

**核心理念**：

- **Figure** 负责容器和全局配置：大小、样式、布局
- **Axes** 负责数据和坐标：画什么、坐标范围、标签、图例
- **Artist** 负责视觉表现：颜色、线型、透明度、大小

## 2. Figure — 画布

**Figure** 是最顶层容器，相当于画布，可包含一个或多个 Axes（绘图区）。

```python
fig, ax = plt.subplots(figsize=(8, 4))   # 一张画布 + 一个绘图区
ax.plot([1,2,3], [1,4,9], marker="o")

# 多个子图
fig, axes = plt.subplots(2, 2, figsize=(8, 6))
axes[0,0].plot([1,2,3], [1,4,9])
axes[0,1].bar([1,2,3], [3,5,2])
axes[1,0].scatter([1,2,3], [1,4,9])
axes[1,1].hist(np.random.randn(10000), bins=100)
```

**主题/样式**：`plt.style.use()` 切换整体视觉风格，影响所有 Axes 配色、网格、字体；`plt.style.available` 列出可选样式；`plt.style.use('ggplot')` 后 `plt.style.use('default')` 恢复。

## 3. Axes — 绘图区

**Axes** 是 Figure 内部的独立绘图区域，数据实际绘制在 Axes 上，有自己的坐标空间、坐标轴（Axis）、刻度、标签。

> 常见误区：Axes ≠ Axis。一个 Axes 通常有 2 个 Axis（x 轴、y 轴）。

```python
fig, ax = plt.subplots(figsize=(8, 4))
x = np.linspace(0, 10, 100)
ax.plot(x, np.sin(x), label='sin')
ax.plot(x, np.cos(x), label='cos')

ax.set_title('三角函数')
ax.set_xlabel('X 轴'); ax.set_ylabel('Y 轴', rotation=0)
ax.set_xlim(0, 10); ax.set_ylim(-1.5, 1.5)
ax.legend()
ax.grid(True, linestyle=':', alpha=0.5)
```

**3D 图**：`fig.add_subplot(111, projection='3d')` 创建 3D Axes，生成螺旋线数据 `ax.plot(x,y,z)`。

### 3.1 Spines（脊线）

Axes 的四条边框线是 spines。「干净风格」常见做法是隐藏上、右两条脊线，并微调左、下：

```python
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('gray')
ax.spines['bottom'].set_linewidth(1.5)
```

### 3.2 注解与图例

```python
ax.annotate('最大值', xy=(5,25), xytext=(4,23),
            arrowprops={"arrowstyle": "->", "color": "red"})
ax.text(1, 20, '二次函数', fontsize=14, style='italic',
        bbox={"boxstyle": "round", "facecolor": "wheat", "alpha": 0.5})
```

## 4. Artist — 绘制元素

**Artist** 是 Matplotlib 里"一切可见的东西"：Figure、Axes、Axis、曲线、柱体、文字……都是 Artist。平时画图就是在不断创建和配置 Artist 对象。

```python
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot([1,2,3], [1,4,9], color='royalblue', linewidth=3, label='折线')
ax.bar([4,5,6], [3,7,5], color='tomato', edgecolor='black', alpha=0.7, label='柱状图')
ax.scatter([7,8,9], [8,2,6], color='green', s=100, label='散点')
ax.legend()   # 每个 Artist 均可单独修改属性
```

**价值观**：掌握这套概念体系后，遇到新的图表需求，你能准确判断该查 Figure 的 API、Axes 的 API，还是某个 Artist 的 API。
