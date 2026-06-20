"""
6.1 实现代码块计时

```python
from contextlib import contextmanager

# 使用
with timer("数据处理"):
    import time
    time.sleep(1)
    print("处理完成")
# 处理完成
# 数据
"""
import time
from contextlib import contextmanager

@contextmanager
def timer(val):
    start = time.time()
    try:
        yield
    finally:
        end = time.time() - start
        print(f"{val} 耗时: {end:.4f} 秒")



# 使用
with timer("数据处理"):
    import time
    time.sleep(1)
    print("处理完成")
# 处理完成
# 数据处理 耗时: 1.0012 秒