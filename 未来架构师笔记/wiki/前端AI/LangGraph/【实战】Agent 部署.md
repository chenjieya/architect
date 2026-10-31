---
author: ai
ai_editable: true
summary: '把本地能跑的 Agent 部署成容器服务：用 Docker 起 Postgres、pgAdmin、Redis，配置 langgraph.json 与环境变量，构建镜像并以容器方式启动。'
refs:
  pages:
    - 【实战】Agent Server 与线程检查点
    - 【实战】System API、MCP 与 A2A
    - 容器数据卷
  raw:
    - path: raw/langgraph-python/37. Agent部署.md
      sha256: e17145e7121f741e1a15f42a749d1665d92238a1f5bd560b5c0d13926d1b390b
updated_by: ai
updated: 2026-10-31
---

本地 `langgraph dev` 用的是内存存储，重启即丢，也不能多实例部署。上生产的标准组合是：**Postgres 存检查点与 Store，Redis 做队列/缓存，Agent Server 跑在容器里**。

## 1. 环境搭建

### 1.1 创建容器网络

容器之间要互相访问，先建一个专用网络：

```shell
docker network create local-net
```

后面所有容器都通过 `--network local-net` 加入，容器名可以直接当主机名用。

### 1.2 启动 PostgreSQL

```shell
docker run -d \
  --name pg16 \
  --network local-net \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=123123 \
  -v pg_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16
```

数据卷 `pg_data` 保证容器重建后数据仍在，原理见 [[容器数据卷]]。

### 1.3 启动 pgAdmin

```shell
docker run -d \
  --name pgadmin4 \
  --network local-net \
  -e PGADMIN_DEFAULT_EMAIL=admin@qq.com \
  -e PGADMIN_DEFAULT_PASSWORD=123123 \
  -v pgadmin_data:/var/lib/pgadmin \
  -p 5050:80 \
  dpage/pgadmin4
```

浏览器打开 `http://localhost:5050`，登录后新建数据库 `langgraph_db`，主机填容器名 `pg16`。

### 1.4 启动 Redis

```shell
docker run -d \
  --name redis7 \
  --network local-net \
  -v redis_data:/data \
  -p 6379:6379 \
  redis:7-alpine redis-server --appendonly yes
```

`--appendonly yes` 开启 AOF 持久化，避免重启丢队列数据。

## 2. 工程配置

### 2.1 langgraph.json

```json
{
  "python_version": "3.13",
  "source": { "kind": "uv", "root": "." },
  "graphs": { "agent": "langgraph_python.dev:agent" },
  "env": ".env"
}
```

### 2.2 Python 版本

`.python-version`：

```text
3.13
```

`pyproject.toml`：

```toml
requires-python = ">=3.13"
```

然后同步依赖：

```shell
uv sync
```

### 2.3 环境变量

在 `.env` 里补上数据库与 Redis 地址，**主机名用容器名**，因为 Agent Server 也在 `local-net` 里：

```env
DATABASE_URI=postgres://admin:123123@pg16:5432/langgraph_db
REDIS_URI=redis://redis7:6379/0
```

如果临时在宿主机跑，把 `pg16` / `redis7` 换成 `127.0.0.1`。

### 2.4 .dockerignore

把不该进镜像的东西排除掉：

```text
.env
.git
.venv
.langgraph_api
.ruff_cache
.vscode
temp
```

## 3. 构建与启动

### 3.1 构建镜像

```shell
make build TAG=0.1.0
```

本质是 `docker build -t langgraph-python-agent:0.1.0 .`，用 `make` 只是把版本号参数化。

### 3.2 启动 Agent Server 容器

```shell
docker run -d \
  --name langgraph-agent \
  --network local-net \
  --env-file .env \
  -p 8123:8000 \
  langgraph-python-agent:0.1.0
```

- `--env-file .env`：把数据库地址等配置注入容器；
- `-p 8123:8000`：宿主机 8123 映射容器的 8000；
- 容器内服务通过 `pg16:5432`、`redis7:6379` 访问依赖。

启动后访问 `http://localhost:8123/docs` 检查接口。生产环境还应接入：

- **健康检查**：用 `/ok` 做探针；
- **监控**：用 `/metrics` 接 Prometheus；
- **反向代理与 HTTPS**：前置 Nginx 等网关。

这些接口见 [[【实战】System API、MCP 与 A2A]]。如果只想在本地验证图逻辑，用 [[【实战】Agent Server 与线程检查点]] 里的 `langgraph dev` 就够了。
