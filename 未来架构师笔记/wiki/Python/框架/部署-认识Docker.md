---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 运行时的问题

你有一个从 git 拉取下来的 FastAPI 应用的全部源码。

如果你要在一个崭新的操作系统上启动它，需要做哪些事情？

📖 查看参考答案

1. 安装 Python
2. 从镜像源安装 uv
3. 设置 uv 镜像源
4. 安装运行时依赖：uv sync --frozen --no-dev --no-editable
5. 删除除.venv 外的全部文件
6. 启动服务：uvicorn api.main:app --host 0.0.0.0 --port 8080

这些操作涉及到：

- 准备环境
- 准备必须的文件
- 启动命令

越是复杂的应用，需要安装的前置软件就越多，需要准备文件的过程就越复杂。

如果一台服务器中需要跑多个应用：

- 如何才能保证不同的应用环境互不干扰？
- 如何才能保证每一次在服务器端准备环境和文件的过程快捷而高效？
- 如何才能保证当应用更新过后，当环境和必须的文件发生变化过后，快速的更新？

这就是 Docker 要解决的问题。

## 2. Docker

### 2.1 Dockerfile

一个配置文件，通过该文件产生一个镜像

```dockerfile
# 依赖轻量级python镜像，比完整镜像小90%，提升构建速度和构建产物的大小
FROM python:3.14-slim AS builder

# WORKDIR：设置工作目录，如果目录不存在则自动创建
WORKDIR /app

# RUN：安装 uv，RUN命令在镜像构建过程中执行
RUN pip install uv -i https://mirrors.aliyun.com/pypi/simple/
# 设置环境变量UV_INDEX_URL，后续uv使用该镜像源
ENV UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
# 以下两行是为了提升构建性能的，现在不用管它
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# 将当前目录下的所有文件复制到镜像的 /app 目录中
COPY . .

# --mount=type=cache,target=/root/.cache/uv 为了提升构建性能，可选，现在不管
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-editable


# ============================================================================
# 开启全新环境
FROM python:3.14-slim

WORKDIR /app

# 将 builder 阶段的 /app/.venv 目录复制到当前镜像的 /app/.venv 目录中
COPY --from=builder /app/.venv /app/.venv

# 将虚拟环境目录加入到PATH变量
ENV PATH="/app/.venv/bin:$PATH"

# 描述信息，可使用 docker image inspect <镜像名>:<tag> 查看
EXPOSE 8080

# CMD：将来启动镜像时需要执行的命令
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080"]

```

```shell
# 构建镜像
docker build -t <镜像名>:<tag> .

# 构建指定平台可用的镜像
docker --platform linux/amd64 build -t <镜像名>:<tag> .
```

### 2.2 镜像

包含运行所需要的一切，比如`python`、`uv`、`.venv`

### 2.3 容器

通过镜像启动，启动时会运行镜像中的`CMD`

```shell
docker run -d \
  --name my-app \
  -p 9090:8080 \
  -e environment=production \
  --restart unless-stopped \
  --memory=512m \
  --cpus=1 \
  <镜像名>:<tag>
```

- **`-d` (detach)**: **后台运行容器**。这是生产环境中最常用的参数，让容器在后台默默运行，并把容器 ID 返回给你。
- **`--name`**: **给容器起个名字**。如果不指定，Docker 会随机生成一个名字。
- **`-p 9090:8080` (publish)**: **端口映射**。将宿主机的  `9090`  端口，映射到容器内部的  `8080`  端口。
- `-e environment=production`  设置环境变量。
- **`--restart unless-stopped`**: **重启策略**。告诉 Docker 当容器意外退出或宿主机重启时，自动重新启动容器（除非你手动停止了它）。
- **`--memory=512m` / `--cpus=1`**: **资源限制**。限制容器最多只能使用 512MB 内存和 1 个 CPU 核心，防止单个容器耗尽宿主机所有资源。

## 3. 为 service 构建镜像

1. 复制`Dockerfile`和`dockerignore`
2. 构建镜像

   ```shell
   docker build -t app-service:latest .
   ```

3. 准备好生产数据库：`app_prod_db`
4. 启动镜像

   ```shell
   docker run -d \
     --name app-service \
     -p 80:8080 \
     -e COMMON_ENVIRONMENT=production \
     -e WEB_APP_NAME=app-api \
     -e WEB_CORS_ORIGINS=www.example.com \
   	-e WEB_CORS_EXPOSE_HEADERS=X-Process-Time \
   	-e WEB_JWT_SECRET_KEY=8f231a2b3c4d5e6f444b9c0d1e2f3a4b \
   	-e DB_HOST=192.168.1.6 \
     -e DB_PORT=5432 \
     -e DB_NAME=app_prod_db \
     -e DB_USER=admin \
     -e DB_PASSWORD=123123 \
     -e LOG_LEVEL=INFO \
     -e LOG_SLOW_QUERY_THRESHOLD=200 \
     --restart unless-stopped \
     --memory=512m \
     --cpus=1 \
     app-service:latest
   ```

## 4. 容器简易部署流程

1. 开发
2. 本地通过 Dockerfile 构建镜像
3. 将镜像传输给服务器
4. 服务器运行容器
