---
author: ai
ai_editable: true
summary: "本笔记补充老师课程中已有的 Nginx 笔记没有覆盖的内容（编译安装、管理脚本、日志变量、日志轮转、负载均衡补充策略）。"
refs:
  pages:
    - "【定时】Linux 定时任务 crontab 与 at 完全指南"
    - "核心技术"
    - "Nginx 配置学习笔记"
  raw:
    - path: "raw/operations-services/2. linux运维-nginx服务管理/2.1、nginx服务管理一之安装和基本配置.md"
      sha256: b17b9c942c6e3e2951c30a5a74369eaba864b3b591350d24711be9ddf8711c12
    - path: "raw/operations-services/2. linux运维-nginx服务管理/2.2、nginx服务管理二之日志和虚拟主机.md"
      sha256: 09e77b0bc6ba94c8014bcf81b174fbac7be6872f307199b0942f862df55427f8
    - path: "raw/operations-services/2. linux运维-nginx服务管理/2.3、nginx服务管理三反向代理.md"
      sha256: 0ce612dfb1e38d8f282e4637e1b16204a4b293fb381713adc02283003fec7aea
    - path: "raw/operations-services/2. linux运维-nginx服务管理/2.4、nginx服务管理四负载平衡.md"
      sha256: bace11cf33afe2a6ac296ce72f2d45acf9b681f4fbd226151142bf3dbfac804a
updated_by: ai
updated: 2026-08-03
---

> 本笔记补充老师课程中**已有的 Nginx 笔记没有覆盖**的内容（编译安装、管理脚本、日志变量、日志轮转、负载均衡补充策略）。
> 基础配置、虚拟主机、反向代理、rewrite、防盗链见 [[核心技术]] 和 [[Nginx 配置学习笔记]]。

## 1. 源码编译安装

### 1.1 准备目录与依赖

```bash
mkdir /usr/local/src/{tarbag,software}
cd /usr/local/src/tarbag

# 编译依赖包
yum install -y pcre-devel.x86_64 gcc openssl-devel libxml2-devel libxslt-devel \
  gd-devel perl-devel perl-ExtUtils-Embed make
```

### 1.2 下载解压

```bash
wget http://nginx.org/download/nginx-1.14.2.tar.gz
tar -zxvpf nginx-1.14.2.tar.gz -C ../software
cd ../software/nginx-1.14.2

useradd nginx    # 创建运行用户
```

### 1.3 configure 编译选项

```bash
./configure --prefix=/usr/local/nginx \
    --user=nginx --group=nginx \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_gzip_static_module \
    --with-http_stub_status_module \
    --with-http_auth_request_module \
    --with-stream \
    --with-stream_ssl_module \
    --with-http_v2_module \
    --with-http_image_filter_module=dynamic \
    --with-http_perl_module=dynamic \
    --with-compat \
    --with-file-aio
make
make install
```

**常用模块速查：**

| 模块                             | 作用                              |
| -------------------------------- | --------------------------------- |
| `--with-http_ssl_module`         | HTTPS 支持                        |
| `--with-http_v2_module`          | HTTP/2 支持                       |
| `--with-http_stub_status_module` | 提供 `/nginx_status` 查看并发状态 |
| `--with-http_realip_module`      | 反向代理后获取真实 IP             |
| `--with-http_gzip_static_module` | 预压缩 gzip                       |
| `--with-stream`                  | TCP/UDP 四层代理（stream 模块）   |

> `=dynamic` 表示编译成**动态模块**（编译为 .so 后按需加载）。

## 2. 主配置核心指令

```bash
user nginx                 # nginx 进程归 nginx 用户
worker_processes 1         # 进程数，有几个 CPU 写几个：
                           # cat /proc/cpuinfo | grep processor | wc -l
worker_rlimit_nofile 65535 # worker 进程能打开的最大文件数
worker_connections 10240   # 每个 worker 最大并发连接数
pid /var/run/nginx.pid     # pid 文件（配合管理脚本用）
```

> **注意**：每行结尾的 `;` 分号不能少。

### 2.1 启动与信号

```bash
/usr/local/nginx/sbin/nginx -t          # 语法检查
/usr/local/nginx/sbin/nginx             # 启动
/usr/local/nginx/sbin/nginx -s stop     # 关闭
/usr/local/nginx/sbin/nginx -s reload   # 重新加载配置
/usr/local/nginx/sbin/nginx -s reopen   # 重新打开日志文件（轮转用）

netstat -ntpl | grep :80                # 确认监听
```

## 3. 部署 nginx 管理脚本（init.d）

源码安装的 nginx 无法直接用 systemctl，可写一个 `/etc/init.d/nginx` 脚本，通过 service 管理：

```bash
#!/bin/bash
# nginx Startup script
# chkconfig: - 85 15
# description: Nginx is a high-performance web and proxy server.
# pidfile: /var/run/nginx.pid
# config: /usr/local/nginx/conf/nginx.conf

nginxd=/usr/local/nginx/sbin/nginx
nginx_config=/usr/local/nginx/conf/nginx.conf
nginx_pid=/var/run/nginx.pid

. /etc/rc.d/init.d/functions

start() {
    if [ -e $nginx_pid ]; then
        echo "nginx already running...."; exit 1
    fi
    echo -n $"Starting $prog: "
    daemon $nginxd -c ${nginx_config}
    RETVAL=$?
    [ $RETVAL = 0 ] && touch /var/lock/subsys/nginx
    return $RETVAL
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $nginxd
    RETVAL=$?
    [ $RETVAL = 0 ] && rm -f /var/lock/subsys/nginx $nginx_pid
}

reload() {
    echo -n $"Reloading $prog: "
    killproc $nginxd -HUP      # HUP 信号 = 平滑重载
    RETVAL=$?
}

case "$1" in
    start)   start   ;;
    stop)    stop    ;;
    reload)  reload  ;;
    restart) stop; start ;;
    status)  status $prog ;;
    *)       echo "Usage: $prog {start|stop|restart|reload|status}" ; exit 1 ;;
esac
exit $RETVAL
```

```bash
chmod a+x /etc/init.d/nginx
chkconfig --add nginx
chkconfig nginx on

# 之后即可用 service 管理
service nginx start/stop/restart/status/reload
```

> `reload` 本质是发 **HUP 信号**：`kill -HUP \`cat /var/run/nginx.pid\``，平滑重载不中断服务。

## 4. 访问日志变量详解

```bash
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';
```

| 变量                    | 含义                                            |
| ----------------------- | ----------------------------------------------- |
| `$remote_addr`          | 远程客户端 IP                                   |
| `$remote_user`          | 远程客户端用户                                  |
| `$time_local`           | 访问时间与时区（如 18/Jul/2012:17:00:01 +0800） |
| `$request`              | 请求的 URI 和 HTTP 协议（PV 统计核心）          |
| `$status`               | 返回的 HTTP 状态码                              |
| `$body_bytes_sent`      | 发送给客户端的文件大小（吞吐量依据）            |
| `$http_referer`         | 从哪个页面链接访问过来                          |
| `$http_user_agent`      | 客户端浏览器信息                                |
| `$http_x_forwarded_for` | **真实客户端 IP**（重点，见下）                 |

> **X-Forwarded-For 的坑**：nginx 做反向代理时，后端拿到的 `$remote_addr` 是**代理机**的 IP。要让后端拿到真实客户端 IP，必须在转发时带上转发头：
>
> ```nginx
> proxy_set_header X-Real-IP $remote_addr;
> proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
> ```

## 5. 日志轮转切割（脚本版）

思路：每天 0 点把当天的日志改名归档，只保留 3 天。

```bash
# /usr/local/nginx/logs/nginxlog.sh
#!/bin/bash
# 按天归档，保留 3 天，压缩节省空间
```

```bash
chmod 755 /usr/local/nginx/logs/nginxlog.sh
crontab -e
00 00 * * * /usr/local/nginx/logs/nginxlog.sh
```

> 定时任务写法见 [[【定时】Linux 定时任务 crontab 与 at 完全指南]]。

**脚本完善方向**（生产建议）：

1. 关键值参数化（如保留天数、日志路径）
2. 归档时压缩，节省磁盘
3. 轮转后远程备份，历史数据留更久
4. 轮转操作记日志，并提供监控报警
5. 全站 nginx 日志统一规范（路径、命名、格式），方便后续采集分析

## 6. 负载均衡策略补充

已有笔记讲了**轮询、weight、down、backup**，这里补充其余策略。

### 6.1 节点参数

```bash
upstream rr {
    server 192.168.56.121:8080 max_fails=3 fail_timeout=30s;
    server 192.168.56.121:8081 down;      # down：不参与负载
    server 192.168.56.122:8082 backup;    # backup：其他都挂了才顶上
}
```

| 参数               | 含义                                                  |
| ------------------ | ----------------------------------------------------- |
| `max_fails=3`      | fail_timeout 内最大失败次数，超过则判不可用（默认 1） |
| `fail_timeout=30s` | 失败超时时长                                          |
| `down`             | 该机器不参与负载                                      |
| `backup`           | 备用机器，参与负载的都挂了才顶上                      |

### 6.2 常见均衡策略

| 策略       | 写法          | 特点                                                      |
| ---------- | ------------- | --------------------------------------------------------- |
| 轮询       | （默认）      | 轮流分发，平均分配                                        |
| 权重       | `weight=5`    | 按权重比例分发，weight 越大分到越多                       |
| ip_hash    | `ip_hash;`    | 同一客户端固定分到同一台（**解决 session 不能跨服务器**） |
| least_conn | `least_conn;` | 转发给当前连接数最少的后端                                |
| fair       | （第三方）    | 按响应时间分配                                            |
| url_hash   | （第三方）    | 按 URL 分配                                               |

```bash
# ip_hash：同一个 IP 永远访问同一台后端，保证 session
upstream iphash {
    ip_hash;
    server 192.168.56.121:8080;
    server 192.168.56.121:8081;
}

# least_conn：分给连接数最少的后端，适合请求耗时差别大的场景
upstream leastconn {
    least_conn;
    server 192.168.56.121:8080;
    server 192.168.56.121:8081;
}
```

```bash
# 使用：proxy_pass 指向 upstream 名即可
location / {
    proxy_pass http://iphash;
}
```

## 7. 反向代理转发头（总结）

```nginx
proxy_set_header Host              $host;                     # 主机名
proxy_set_header X-Real-IP         $remote_addr;              # 客户端真实 IP
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;# 客户端真实 IP（链式）
proxy_set_header X-NginX-Proxy     true;                      # 标记经过 nginx
```

> `proxy_pass` 带不带 `/` 的区别详见 [[Nginx 配置学习笔记]]（带 URI 会替换 location 前缀，不带则原样转发）。
