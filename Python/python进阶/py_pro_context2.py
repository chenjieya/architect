"""
编写一个 `TempDirectory` 上下文管理器，进入时创建临时目录，退出时自动删除：

```python
with TempDirectory() as tmp_dir:
    print(f"临时目录: {tmp_dir}")
    # 可以在这个目录中创建文件
    # 离开 with 块时，目录及其内容自动删除

print("临时目录已清理")
```

**提示：** 使用 `tempfile` 模块创建临时目录，使用 `shutil.rmtree` 删除目录。
"""
from contextlib import contextmanager
import os
import tempfile
import shutil
import time

@contextmanager
def TempDirectory():
    path = tempfile.mkdtemp()
    try:
        yield path
    finally:
        shutil.rmtree(path)
    

with TempDirectory() as tmp_dir:
    print(f"临时目录: {tmp_dir}")
    # 可以在这个目录中创建文件
    with open(os.path.join(tmp_dir, "test.txt"), "w") as f:
        f.write("hello")
        time.sleep(1)
    # 离开 with 块时，目录及其内容自动删除

print("临时目录已清理")