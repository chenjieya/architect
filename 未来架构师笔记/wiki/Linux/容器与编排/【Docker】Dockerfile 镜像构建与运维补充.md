---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---

> 本笔记补充老师课程中**已有的 Docker 笔记没有覆盖**的内容：Dockerfile 镜像构建、容器导出导入、数据卷容器、仓库概念、可视化工具。
> 基础命令见 [[docker的常用命令]]，安装见 [[docker准备工作]]，网络见 [[docker网络]]，数据卷见 [[容器数据卷]]。

## 1. Docker 基本概念

| 概念                   | 说明                                                           |
| ---------------------- | -------------------------------------------------------------- |
| 镜像（Image）          | 只读模板，是创建容器的基础                                     |
| 容器（Container）      | 镜像运行起来的实例，可写层                                     |
| 仓库（Repository）     | 集中存放镜像的地方，可看作一个项目或目录                       |
| 注册服务器（Registry） | 管理仓库的服务器，一个 Registry 有多个仓库，每个仓库有多个镜像 |

> 例如 `dl.dockerpool.com/ubuntu`：`dl.dockerpool.com` 是**注册服务器**，`ubuntu` 是**仓库**。
> 公共仓库是 Docker Hub（`docker login` 登录）；私有仓库可用官方工具 `docker-registry` 搭建，适合不想公开的项目。

## 2. 创建自定义镜像

### 2.1 两种方式

```bash
# 方式一：通过 Dockerfile 构建（推荐）
docker build .

# 方式二：对容器提交生成镜像
docker commit 容器名 镜像名
```

### 2.2 Dockerfile 四部分

基础镜像（FROM）、维护者信息（MAINTAINER）、镜像操作指令（RUN 等）、启动时命令（CMD/ENTRYPOINT）。

最简单的例子：

```dockerfile
# 若本地没有 centos 先执行 docker pull centos
FROM centos
MAINTAINER docker docker@163.com
RUN echo hi
```

## 3. Dockerfile 常用指令详解

> Dockerfile 中**所有语法命令必须大写**。

| 指令         | 作用                                                              |
| ------------ | ----------------------------------------------------------------- |
| `FROM`       | 指定基础镜像（容器操作系统）                                      |
| `MAINTAINER` | 维护者信息（可省略）                                              |
| `RUN`        | 在基础镜像上执行的命令。**每个 RUN 就是一层，层越多镜像越大**     |
| `CMD`        | 容器运行的默认命令，`docker run` 后追加命令会**覆盖**它           |
| `ENTRYPOINT` | 设置容器运行时的**主程序**（与 CMD 任选其一，不易被覆盖）         |
| `EXPOSE`     | 暴露端口                                                          |
| `ENV`        | 设置环境变量，可被 RUN 使用                                       |
| `ADD`        | 复制文件，**支持 URL，自动解压 tar.gz/tar.bz2**（不支持 zip/rar） |
| `COPY`       | 复制本地文件，**不解压、不支持 URL**（官方推荐复制用 COPY）       |
| `VOLUME`     | 创建容器内挂载点，实现宿主机挂载或容器间挂载                      |
| `USER`       | 设置运行镜像时的用户或 UID                                        |
| `WORKDIR`    | 为后续指令设置工作目录（CMD/ENTRYPOINT 的工作目录）               |
| `ONBUILD`    | 该镜像被其他镜像引用时触发执行                                    |
| `ARG`        | 构建时传参（`docker build --build-arg`）；ENV 是运行时环境变量    |

## 4. 完整例子：nginx 镜像构建

```dockerfile
FROM centos
MAINTAINER s s@163.com

RUN wget http://nginx.org/download/nginx-1.14.2.tar.gz
RUN tar -xvf nginx-1.14.2.tar.gz
WORKDIR nginx-1.14.2

RUN yum install -y gcc gcc-c++ glibc make autoconf openssl openssl-devel
RUN yum install -y libxml2 libxslt-devel -y gd gd-devel pcre pcre-devel
RUN useradd -M -s /sbin/nologin nginx

RUN ./configure --user=nginx --group=nginx --prefix=/usr/local/nginx \
    --with-http_ssl_module --with-http_stub_status_module \
    && make && make install

ENV PATH /usr/local/nginx/sbin:$PATH
EXPOSE 80

# 防止启动后退出，必须前台运行 daemon off;
CMD ["/bin/bash", "-c", "nginx -g 'daemon off;'"]
```

> **关键**：容器主进程必须**前台运行**，否则容器启动就退出（docker 后台运行也必须有前台进程）。

## 5. 优化镜像的两个技巧

### 5.1 多阶段构建

```dockerfile
# 第一阶段：编译
FROM centos AS first
# .... 编译安装 nginx 到 /usr/local/nginx

# 第二阶段：只拷贝编译产物，镜像更小
FROM centos
COPY --from=first /usr/local/nginx /usr/local/nginx
RUN yum install -y gcc gcc-c++ ...
```

### 5.2 用 && 合并命令减少层

```dockerfile
# 多个 RUN 合并成一个，减少镜像层数
RUN yum install -y gcc gcc-c++ make && \
    useradd -M -s /sbin/nologin nginx && \
    mkdir -p /usr/local/nginx
```

## 6. 镜像与容器的导出/导入/删除

```bash
# 镜像导出/导入
docker save -o ubuntu_14.04.tar ubuntu:14.04   # 导出镜像
docker load < ubuntu_14.04.tar                 # 导入镜像
docker rmi ubuntu                              # 删除镜像

# 容器导出/导入
docker export 容器id前4位 > test_con.tar       # 导出容器
cat test_con.tar | docker import - test/ubuntu:v1.0   # 导入为镜像

# 容器删除
docker rm 容器id
```

> 区别：`save/load` 针对**镜像**（含历史层）；`export/import` 针对**容器**（不含历史层，镜像更小但丢失 commit 历史）。

## 7. 数据卷补充：数据卷容器

已有笔记介绍了 `-v` 挂载，这里补充**数据卷容器**（让多个容器共享数据卷）：

```bash
# 1）创建数据卷容器 ubuntu_c，数据卷在 /dbdata（目录不存在会自动创建）
docker run -it --name ubuntu_c -v /dbdata docker.io/ubuntu

# 2）新容器 db1 挂载 ubuntu_c 的数据卷（--volumes-from 继承）
docker run -it --name db1 --volumes-from ubuntu_c docker.io/ubuntu
```

```bash
# 挂载目录（宿主机目录:容器目录，ro 只读，默认 rw）
docker run -d -P --name web -v /local/dir:/docker/dir:ro train/webapp python app.py

# 也可以挂载单个文件（如历史命令记录）
docker run -d -P --name web -v ~/.bash_history:/.bash_history ubuntu /bin/bash
```

## 8. 端口映射补充

已有笔记讲了 `-P/-p`，这里整理几种 `-p` 写法：

```bash
docker run -it -P httpd                    # -P 随机映射
docker run -d -p 5000:80 httpd:latest      # 宿主机5000 -> 容器80
docker run -d -p 5001:5001 -p 3000:80 httpd # 多端口映射
docker run -d -p 127.0.0.1:5000:80 httpd   # 绑定指定IP
docker logs -f 容器名                        # 看日志确认映射
```

## 9. 可视化工具 Portainer

基于 Docker API 的图形化管理工具：

```bash
docker run -d -p 9001:9000 --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name portainer-test portainer/portainer

# 访问 http://ip:9001
```

**优点**：轻量、基于 docker API 安全（可指定 API 端口、支持 TLS）、支持权限分配和集群。
**缺点**：功能不够强大；容器创建后无法后台增加端口。

> 拉镜像超时，可在 `/etc/docker/daemon.json` 配置国内镜像加速：
>
> ```json
> { "registry-mirrors": ["https://registry.cn-hangzhou.aliyuncs.com"] }
> ```
>
> 改完重启 docker。
