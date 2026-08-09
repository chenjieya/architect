---
author: ai
ai_editable: true
summary: 'Matplotlib 交互式组件（matplotlib.widgets）：Slider 滑块、Button 按钮、CheckButtons 复选框、RadioButtons 单选、TextBox 文本框，绑定回调让图表可交互。'
refs:
  pages:
    - Matplotlib核心概念
  raw:
    - path: raw/operations-datascience/9. matplotlib-交互式组件/课件.ipynb
      sha256: 009729e5a1f9d1a8267890672f0a15b888be9ef9e5910fa7977551fd91923471
updated_by: ai
updated: 2026-08-08
---

## 1. 概述

`matplotlib.widgets` 提供一组交互组件：滑块、按钮、复选框、文本框等，可直接嵌入图表让图表"活"起来。统一模式：**创建组件 + 绑定回调函数**。

```python
from matplotlib.widgets import Slider, Button, CheckButtons, RadioButtons, TextBox
```

## 2. Slider — 滑块

最常用的交互组件，适合拖动调整连续数值。创建 Slider 对象，绑定 `on_changed` 回调：

```python
fig, ax = plt.subplots(figsize=(8, 4))
fig.subplots_adjust(bottom=0.25)          # 给滑块留出底部空间

x = np.linspace(0, 10, 500)
line, = ax.plot(x, np.sin(x), lw=2)

slider_ax = fig.add_axes((0.2, 0.1, 0.6, 0.03))   # 先建一个大轴区域
slider = Slider(ax=slider_ax, label='频率',
                valmin=0.1, valmax=5.0, valinit=1.0, valstep=0.1)

def update(freq):
    line.set_ydata(np.sin(freq * x))
    fig.canvas.draw_idle()   # 必须重绘

slider.on_changed(update)    # 绑定回调
```

**多个滑块**分别控制不同参数（频率、振幅），各自绑定回调，用同一个 `update` 函数统一重绘：

```python
freq_slider = Slider(freq_slider_ax, '频率', 0.1, 5.0, valinit=1.0)
amp_slider  = Slider(amp_slider_ax,  '振幅', 0.1, 2.0, valinit=1.0)

def update(_):
    line.set_ydata(amp_slider.val * np.sin(freq_slider.val * x))
    fig.canvas.draw_idle()

freq_slider.on_changed(update)
amp_slider.on_changed(update)
```

## 3. Button — 按钮

触发一次性动作，如重新生成数据，绑定 `on_clicked`：

```python
button_ax = fig.add_axes((0.4, 0.05, 0.2, 0.075))
button = Button(button_ax, '重新生成', color='lightblue', hovercolor='skyblue')

def regenerate(event):
    line.set_ydata(np.random.randn(100).cumsum())
    ax.relim()               # 重新计算数据范围
    ax.autoscale_view()     # 自动缩放
    fig.canvas.draw_idle()

button.on_clicked(regenerate)
```

## 4. CheckButtons — 复选框

多个独立开关，常用于控制多条曲线显隐：

```python
lines = {}
for label, color, func in zip(labels, colors, funcs):
    line, = ax.plot(x, func(x), color=color, lw=2, label=label, visible=True)
    lines[label] = line
ax.legend()

check_ax = fig.add_axes((0.05, 0.4, 0.15, 0.2))
check = CheckButtons(check_ax, labels, [True, True, True])

def toggle(label):
    lines[label].set_visible(not lines[label].get_visible())
    fig.canvas.draw_idle()

check.on_clicked(toggle)
```

## 5. RadioButtons — 单选按钮

一组互斥选项，切换图表类型或数据源：

```python
radio_ax = fig.add_axes((0.05, 0.4, 0.15, 0.2))
radio = RadioButtons(radio_ax, ('sin', 'cos', 'tan'))

func_map = {'sin': np.sin, 'cos': np.cos, 'tan': lambda x: np.tan(x)*0.5}

def switch(label):
    line.set_ydata(func_map[label](x))
    fig.canvas.draw_idle()

radio.on_clicked(switch)
```

## 6. TextBox — 文本框

获取用户输入文本，适合精确数值或自定义表达式：

```python
text_ax = fig.add_axes((0.2, 0.05, 0.6, 0.06))
text_box = TextBox(text_ax, '频率', initial='1.0')

def submit(text):
    try:
        freq = float(text)
        line.set_ydata(np.sin(freq * x))
        fig.canvas.draw_idle()
    except ValueError:
        pass    # 非法输入静默忽略

text_box.on_submit(submit)
```

## 7. 使用要点

- 组件需要 `fig.add_axes((左, 下, 宽, 高))` 开辟独立区域（0~1 相对坐标），并配合 `fig.subplots_adjust(bottom=...)` 给底部留空间。
- 所有回调里改完图形后都要调用 `fig.canvas.draw_idle()` 触发重绘。
- 交互式组件依赖 `ipympl` 后端：`%matplotlib widget`。
