---
author: ai
ai_editable: true
summary: 'Agent 要执行代码就得关进沙箱：对比 Process/Container/VM/MicroVM 四种隔离方案与底层实现，并给出 E2B 创建、读写、OSS 挂载和按线程复用的实战步骤。'
refs:
  pages:
    - 沙箱权限与安全执行
    - 【实战】服务端 CodingAgent 完整实现
    - 【基础】文件系统、权限与多模态
  raw:
    - path: raw/langchain-python/13. 沙箱.md
      sha256: 1c6633e7a78f9a2d513ed079d78be06b35dc2e90d63e533bf46316cf22e4af98
    - path: raw/langchain-python/14. E2B.ipynb
      sha256: 59f1dfcf2f934adce4c799e74c101374a3e825c3b514550cfe18c68bb1fad59c
    - path: raw/langchain-python/15. 沙箱隔离方案.md
      sha256: cdc7e6e53346aea8564722a967a6afe8adfa6330628ed5007f7e50b7145e7e56
    - path: raw/langchain-python/assets/沙箱隔离方案.svg
      sha256: 099db5f0c917113913557f7fcc0f9408d78fe007b0d7906e972f20c01b801c18
    - path: raw/langchain-python/assets/沙箱隔离方案.excalidraw
      sha256: bd49dac9d9225d455c904cc10054c8a9f3ba80da181d08bd5327d9a27872753e
    - path: raw/langchain-python/assets/aliyun-sandbox.svg
      sha256: 62bc1789cb3f564c271d2ef6cf742596d733f03de7be080c5c7ae79e0bfd1696
    - path: raw/langchain-python/assets/aliyun-sandbox.excalidraw
      sha256: 11276541141c943cd05790b44e25ef17461f07ee98afd63ca8ba0b1443d271ce
updated_by: ai
updated: 2026-11-28
---

Agent 一旦能执行命令和写代码，就必须有个"笼子"——代码跑在笼子里，就算写错或被人诱导，也碰不到宿主系统。这个笼子就是沙箱。本篇先讲怎么选沙箱技术，再用 E2B 走一遍真实操作。思路与 [[沙箱权限与安全执行]] 一致，这里更偏向技术选型和落地步骤。

## 1. 四种隔离方案

| 方案            | 原理                                   | 隔离性               | 逃逸风险                   | 适用场景                       |
| --------------- | -------------------------------------- | -------------------- | -------------------------- | ------------------------------ |
| Process         | 用操作系统进程权限和资源限制约束程序   | 取决于配置           | 较高，进程漏洞可能影响宿主 | 本地开发、运行低风险代码       |
| Container       | 用命名空间和控制组隔离进程、限制资源   | 中等，与宿主共享内核 | 中等，内核漏洞可能导致逃逸 | 应用部署、运行受控第三方代码   |
| Virtual Machine | 虚拟化硬件，运行独立完整操作系统       | 高，拥有独立内核     | 较低，需突破虚拟化边界     | 强隔离、多租户、运行不可信代码 |
| **MicroVM**     | 精简设备模型，运行轻量虚拟机和独立内核 | 高，拥有独立内核     | 较低，需突破虚拟化边界     | Serverless、AI Agent 代码执行  |

怎么理解差别？关键在于**内核是不是独立的**：

- Process 只是给进程划了个圈，程序还是和宿主共用一套系统。
- Container 把进程装进隔离的房间，但所有房间共享同一栋楼的地基（宿主内核）。
- Virtual Machine 每栋楼都有自己的地基，隔离最强，代价是启动慢、资源重。
- MicroVM 是"精装小楼"：保留独立内核的强隔离，同时把设备模型砍到最少，启动快、开销小——正好适合 Agent 这种"每次任务开一个、用完就扔"的场景。

## 2. 底层技术实现

| 名称            | 对应方案        | 定位           | 描述                                  |
| --------------- | --------------- | -------------- | ------------------------------------- |
| sandbox-exec    | Process         | 进程沙箱工具   | 用 macOS 系统策略限制进程可访问的资源 |
| Docker          | Container       | 容器运行平台   | 创建和管理基于内核隔离的容器          |
| KVM             | Virtual Machine | 虚拟化基础设施 | 利用 Linux 内核提供硬件虚拟化能力     |
| VMware          | Virtual Machine | 虚拟化平台     | 创建和管理运行完整系统的虚拟机        |
| **Firecracker** | MicroVM         | 微虚拟机监控器 | 创建启动快、设备模型精简的微虚拟机    |

## 3. 上层技术实现

底层技术用起来麻烦，所以有了封装成 SDK/API 的上层方案：

| 名称                | 定位         | 底层方案                | 描述                                     |
| ------------------- | ------------ | ----------------------- | ---------------------------------------- |
| **E2B**             | 云沙箱平台   | MicroVM（Firecracker）  | 通过 SDK 和 API 为 AI Agent 提供托管沙箱 |
| OpenSandbox         | 开源沙箱框架 | Container、VM、MicroVM  | 统一管理 Docker/K8s 中的多种沙箱运行时   |
| CubeSandbox         | 开源沙箱平台 | MicroVM（KVM、RustVMM） | 面向 AI Agent 的高性能微虚拟机沙箱       |
| LangSmith Sandboxes | 托管沙箱平台 | MicroVM（自托管需 KVM） | 用 LangSmith SDK 创建和管理隔离开发环境  |
| 云服务              | 托管沙箱平台 | MicroVM                 | 阿里云、腾讯云、AWS 均支持，通常兼容 E2B |

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1795850417137_aliyun-sandbox.svg)

## 4. E2B 实战

### 4.1 安装

```bash
uv add e2b
```

### 4.2 沙箱管理

创建时带一份基础配置，`timeout` 从创建开始计时，到点自动销毁：

```python
from e2b import AsyncSandbox

basic_config = {
    "timeout": 300,
    "api_key": sandbox_settings.api_key,
    "api_url": sandbox_settings.api_url,
    "domain": sandbox_settings.domain,
}

sandbox = await AsyncSandbox.create(
    template=sandbox_settings.template,
    **basic_config,
)
```

其他常用操作：

```python
# 连接已有沙箱（靠 sandbox_id 找回）
sandbox = await AsyncSandbox.connect(sandbox_id=sandbox.sandbox_id, **basic_config)

# 手动销毁
await sandbox.kill()

# 续期：从现在起再计 300 秒
await sandbox.set_timeout(300)
```

注意每次操作前都调用 `set_timeout` 续期——否则沙箱可能在长任务中途被自动销毁。

### 4.3 文件读写与命令执行

```python
await sandbox.files.write("/home/user/workspace/test.txt", "Hello World!")
await sandbox.files.read("/home/user/workspace/test.txt")

await sandbox.commands.run("node --version")
await sandbox.commands.run("npm init -y", cwd="/home/user/workspace")
await sandbox.commands.run("ls", cwd="/home/user/workspace", timeout=60)
```

### 4.4 挂载 OSS 做持久化

沙箱会被销毁，产物不能跟着一起没。办法是把云存储挂进沙箱的两个目录：`/home/user/workspace` 放工作区，`/home/user/output` 放最终产物。

```python
import json
metadata_config = {
    "metadata": {
        "fc.sandbox.storage.oss": json.dumps({
            "mountPoints": [
                {
                    "bucketName": sandbox_settings.oss_bucket,
                    "mountDir": "/home/user/workspace",
                    "bucketPath": "/e2b-test/workspace",
                    "endpoint": sandbox_settings.oss_endpoint,
                    "readOnly": False,
                },
                {
                    "bucketName": sandbox_settings.oss_bucket,
                    "mountDir": "/home/user/output",
                    "bucketPath": "/e2b-test/output",
                    "endpoint": sandbox_settings.oss_endpoint,
                    "readOnly": False,
                },
            ]
        }),
        "fc.sandbox.auth.role": sandbox_settings.role_arn,
    }
}

sandbox = await AsyncSandbox.create(
    template=sandbox_settings.template,
    **basic_config,
    **metadata_config,
)
```

验证持久化的办法：往两个目录各写一个文件，销毁沙箱再新建一个挂同样 OSS 的沙箱，`ls` 还能看到文件，说明挂载生效了。

### 4.5 完整例子：在沙箱里构建前端工程

```python
await sandbox.commands.run(
    "npm create vite@latest my-vue-app -- --template vue --no-interactive",
    cwd="/home/user/workspace",
)
await sandbox.commands.run("npm i", cwd="/home/user/workspace/my-vue-app")

# 静态资源用相对路径，否则部署到子目录后会 404
await sandbox.files.write("/home/user/workspace/my-vue-app/vite.config.js", """
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  base: '',
});
""")

await sandbox.commands.run("npm run build", cwd="/home/user/workspace/my-vue-app")
await sandbox.commands.run("cp -a /home/user/workspace/my-vue-app/dist /home/user/output/my-vue-app")
await sandbox.kill()
```

`base: ''` 这行很关键，原因在 [[【实战】服务端 CodingAgent 完整实现]] 的系统提示词里会详细解释。

## 5. 按线程复用沙箱

真实服务里，一个用户的一次会话应该用同一个沙箱，不然前一轮写的文件下一轮就找不到了。做法是把 `thread_id` 作为键，把沙箱存进 store：

```python
async def get_sandbox(
    *, key: str | None = None, store: BaseStore | None = None
) -> AsyncSandbox:
    "获取一个沙箱"
    pass
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1795850417139_沙箱隔离方案.svg)

要点：用 `thread_id`（即会话线程）当隔离键，从 store 里查；查到就 `connect` 回原沙箱并续期，查不到就新建一个并存进去。这样每个线程有专属环境，互不干扰，又能在多轮之间保持状态。
