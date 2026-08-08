---
author: ai
ai_editable: true
summary: 'Matplotlib 动画两大工具：FuncAnimation（更新函数驱动，配 frames/interval/blit）与 ArtistAnimation（预生成帧）。含实时数据流、blit 优化、保存 GIF/MP4/HTML。'
refs:
  pages:
    - Matplotlib核心概念
  raw:
    - path: raw/operations-datascience/8. matplotlib-动画/课件.ipynb
      sha256: 02e13849b3b7edcc3b48b1c4a597bb19d4b54b5006c7fa8fb6460c33b0d73e58
updated_by: ai
updated: 2026-08-08
---

## 1. 概述

动画把静态图表变成动态过程，用于展示变化趋势、实时数据流或算法演化。核心两大工具：**`FuncAnimation`**（函数驱动动画）和 **`ArtistAnimation`**（预生成帧）。

```python
from matplotlib.animation import FuncAnimation, ArtistAnimation
```

## 2. FuncAnimation — 函数驱动动画

提供"更新函数"，动画循环每次调用它来更新图表。核心三要素：`fig` 画布、`update(frame)` 每帧更新函数、`frames` 帧总数（或可迭代对象）。

```python
fig, ax = plt.subplots(figsize=(8, 4))
x = np.linspace(0, 2*np.pi, 100)
line, = ax.plot(x, np.sin(x))
ax.set_ylim(-1.5, 1.5)

frames = 50
def update(frame):
    phase = 2*np.pi * frame / frames   # 最后一帧相位 2π 与第一帧视觉相等
    line.set_ydata(np.sin(x + phase))
    return line,

ani = FuncAnimation(fig, update, frames=range(frames+1), interval=16, repeat=True)
```

### 2.1 核心参数

| 参数               | 作用                                                   |
| ------------------ | ------------------------------------------------------ |
| `frames`           | 帧总数或可迭代对象（`range(100)`、`np.linspace(...)`） |
| `interval`         | 每帧间隔（毫秒），默认 200                             |
| `repeat`           | 是否循环播放，默认 True                                |
| `blit`             | 只更新变化部分，大幅提升性能                           |
| `init_func`        | 初始化函数，配合 blit 使用                             |
| `cache_frame_data` | 无限帧数据流时设 False 避免缓存                        |

### 2.2 实时数据流

用无限生成器模拟实时数据，配 `deque(maxlen=100)` 滚动窗口：

```python
from collections import deque
x_data, y_data = deque(maxlen=100), deque(maxlen=100)
line, = ax.plot([], [], lw=2)

def data_stream():
    t = 0
    while True:
        yield t, np.sin(t * 0.1)
        t += 1

def update(frame):
    x, y = frame
    x_data.append(x); y_data.append(y)
    line.set_data(x_data, y_data)
    if x >= 100:
        ax.set_xlim(x - 100, x)   # x 轴滚动窗口

ani = FuncAnimation(fig, update, frames=data_stream(), interval=30,
                    cache_frame_data=False)
```

### 2.3 Blit 模式

`blit=True` 只重新绘制变化的 Artist 而非整个 Axes，建议配 `init_func` 先初始化所有 Artist，每帧只更新特定部分：

```python
def init():
    ax.set_xlim(0, 2*np.pi + 5); ax.set_ylim(-1.5, 1.5)
    return line, point

def update(frame):
    y = np.sin(x + frame * 0.1)
    line.set_data(x, y)
    point.set_data([x[-1]], [y[-1]])
    return line, point

ani = FuncAnimation(fig, update, frames=100, init_func=init, blit=True, interval=50)
```

## 3. ArtistAnimation — 预生成帧

每帧的所有 Artist 都准备好后传入列表，每元素是该帧要显示的所有 Artist。需要精确控制每帧内容时非常有用。

```python
frames = []
for phase in np.linspace(0, 2*np.pi, 50):
    line, = ax.plot(x, np.sin(x + phase), color='royalblue')
    frames.append([line])

ani = ArtistAnimation(fig, frames, interval=50, repeat=True)
```

## 4. 保存动画

GIF（pillow）、MP4（ffmpeg）、HTML（Notebook 内嵌）：

```python
ani.save('sine_wave.gif', writer='pillow', fps=20)   # 需 pillow
# 或 MP4：ani.save('ani.mp4', writer='ffmpeg')，需装 ffmpeg
# HTML 内嵌（无需额外播放器）：
HTML(ani.to_jshtml())
HTML(ani.to_html5_video())   # HTML5 视频，需 ffmpeg
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1786178744765_sine_wave.gif)

---

涉及图片：本页已嵌入 `sine_wave.gif`（动画效果 GIF，原始文件来自 `raw/operations-datascience/8. matplotlib-动画/sine_wave.gif`）。
