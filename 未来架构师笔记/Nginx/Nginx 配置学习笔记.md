# Nginx 配置学习笔记：root、alias、proxy_pass 与 URI 拼接

[TOC]

---

## 修订记录

| 编号 | 版本 | 修订人 | 修订内容 | 日期 |
|:----|:-----|:------:|:--------|:-----|
| 001 | 1.0 | jie.chen | 创建全文 | 2026-07-09 |

---

## 1. 概述

这份笔记用于理解 Nginx 中最容易混淆的几类配置：

- `root`：把请求 URI 拼到某个目录后面，用于找本地静态文件。
- `alias`：把匹配到的 location 前缀替换成指定目录，用于路径映射。
- `proxy_pass`：把请求转发给后端服务，重点是 URI 是否会被替换。
- WebSocket 代理：本质是 HTTP/1.1 Upgrade，前端用 `ws/wss`，Nginx 到后端通常仍用 `http/https`。

核心记忆：

> `root` 是“目录 + 完整 URI”；`alias` 是“location 前缀替换成目录”；`proxy_pass` 是否带 URI，决定是否改写转发路径。

---

## 2. Nginx 请求处理基础

### 2.1 请求由哪些部分组成

一个请求：

```text
http://example.com/admin-api/user/list?pageNo=1
```

可以拆成：

| 部分 | 示例 | 说明 |
|:--|:--|:--|
| scheme | `http` | 协议 |
| host | `example.com` | 域名或 IP |
| path / URI | `/admin-api/user/list` | Nginx location 主要匹配这个 |
| query string | `pageNo=1` | `?` 后面的参数 |

Nginx 的 `location` 匹配主要看 path，不看 query string。

所以：

```text
/infra/ws?token=abc
/infra/ws?x=1
```

都会命中：

```nginx
location /infra/ws {
}
```

### 2.2 location 常见匹配方式

| 写法 | 类型 | 示例 | 说明 |
|:--|:--|:--|:--|
| `location = /index.html` | 精确匹配 | 只匹配 `/index.html` | 优先级高 |
| `location /admin-api/` | 前缀匹配 | 匹配 `/admin-api/user` | 常用 |
| `location ^~ /static/` | 前缀优先 | 匹配后不再走正则 | 静态资源常用 |
| `location ~ \.php$` | 正则匹配 | 匹配 `.php` 结尾 | 谨慎使用 |
| `location /` | 兜底前缀 | 匹配所有路径 | SPA 常用 |

注意：`location` 不能嵌套 `location`。

错误写法：

```nginx
location / {
    location = /index.html {
    }
}
```

正确写法：

```nginx
location = /index.html {
}

location / {
}
```

---

## 3. root：目录加完整 URI

### 3.1 root 的基本规则

`root` 的规则是：

```text
最终文件路径 = root 配置的目录 + 请求 URI
```

示例：

```nginx
location /static/ {
    root /usr/share/nginx/html;
}
```

请求：

```text
/static/app.js
```

实际找文件：

```text
/usr/share/nginx/html/static/app.js
```

也就是说，`/static/` 这段不会被去掉，它会作为 URI 的一部分继续拼进去。

### 3.2 root 用于 SPA

常见 Vue/Vite 前端部署：

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

含义：

1. 先找真实文件：`$uri`
2. 再找真实目录：`$uri/`
3. 找不到就回退到 `/index.html`

例如：

```text
/data/alertSilent
```

磁盘上没有这个文件，最后会返回：

```text
/usr/share/nginx/html/index.html
```

让前端路由接管。

---

## 4. alias：用目录替换 location 前缀

### 4.1 alias 的基本规则

`alias` 的规则是：

```text
最终文件路径 = alias 配置的目录 + 去掉 location 前缀后的剩余路径
```

示例：

```nginx
location /static/ {
    alias /data/assets/;
}
```

请求：

```text
/static/app.js
```

实际找文件：

```text
/data/assets/app.js
```

这里 `/static/` 被替换成了 `/data/assets/`。

### 4.2 root 与 alias 对比

同样请求：

```text
/static/app.js
```

使用 `root`：

```nginx
location /static/ {
    root /data/assets;
}
```

实际路径：

```text
/data/assets/static/app.js
```

使用 `alias`：

```nginx
location /static/ {
    alias /data/assets/;
}
```

实际路径：

```text
/data/assets/app.js
```

### 4.3 alias 最容易错的斜杠

推荐：

```nginx
location /static/ {
    alias /data/assets/;
}
```

location 和 alias 都带尾部 `/`，最清晰。

不推荐混用：

```nginx
location /static/ {
    alias /data/assets;
}
```

这种容易拼出不符合预期的路径。

---

## 5. proxy_pass：是否带 URI 决定是否改写路径

### 5.1 proxy_pass 不带 URI：原样转发请求 URI

配置：

```nginx
location /infra/ws {
    proxy_pass http://example:12345;
}
```

请求：

```text
/infra/ws?token=abc
```

转发到后端：

```text
http://example:12345/infra/ws?token=abc
```

请求：

```text
/infra/ws/client/1?token=abc
```

转发到后端：

```text
http://example:12345/infra/ws/client/1?token=abc
```

特点：后端看到的 path 和浏览器请求 path 一致。

### 5.2 proxy_pass 带 URI：替换匹配到的 location 前缀

配置：

```nginx
location /api/ {
    proxy_pass http://example:12345/admin-api/;
}
```

请求：

```text
/api/system/user
```

转发到后端：

```text
http://example:12345/admin-api/system/user
```

这里 `/api/` 被替换成了 `/admin-api/`。

### 5.3 proxy_pass 带 URI 的斜杠问题

推荐写法：

```nginx
location /admin-api/ {
    proxy_pass http://example:12345/admin-api/;
}
```

请求：

```text
/admin-api/system/user
```

转发：

```text
/admin-api/system/user
```

如果写成：

```nginx
location /admin-api/ {
    proxy_pass http://example:12345;
}
```

也会原样转发：

```text
/admin-api/system/user
```

这两种在该场景下结果接近，但语义不同：

- 不带 URI：原样转发完整 URI。
- 带 URI：把 location 命中的前缀替换为 proxy_pass 里的 URI。

### 5.4 query string 会不会丢

一般不会。

请求：

```text
/infra/ws?token=abc
```

配置：

```nginx
location /infra/ws {
    proxy_pass http://example:12345;
}
```

后端收到：

```text
/infra/ws?token=abc
```

除非你用 `rewrite` 或手动拼接 `$uri`、`$args`，否则正常 query string 会保留。

---

## 6. WebSocket 代理

### 6.1 前端是 ws/wss，Nginx proxy_pass 通常是 http/https

前端连接：

```text
ws://front.example.com/infra/ws?token=abc
```

HTTPS 页面下：

```text
wss://front.example.com/infra/ws?token=abc
```

Nginx 转后端通常写：

```nginx
proxy_pass http://example:12345;
```

这不是矛盾。WebSocket 握手本质是 HTTP/1.1 Upgrade。

浏览器到 Nginx：

```text
ws/wss
```

Nginx 到后端：

```text
HTTP/1.1 + Upgrade: websocket
```

### 6.2 WebSocket 推荐配置

```nginx
http {
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    server {
        listen 80;
        server_name _;

        location /infra/ws {
            proxy_pass http://example:12345;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 60s;
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
        }
    }
}
```

### 6.3 map 语法解释

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

含义：

| 客户端请求头 | `$http_upgrade` | `$connection_upgrade` |
|:--|:--|:--|
| `Upgrade: websocket` | `websocket` | `upgrade` |
| 没有 `Upgrade` | 空字符串 | `close` |

然后：

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

WebSocket 请求会转成：

```http
Upgrade: websocket
Connection: upgrade
```

没有 Upgrade 的请求会转成：

```http
Connection: close
```

### 6.4 为什么不是 keep-alive

`Connection` 是逐跳头，只对当前连接有效：

```text
浏览器 -> Nginx
Nginx -> 后端
```

浏览器对 Nginx 的 `Connection: keep-alive` 不应该原样转发给后端。

Nginx 到后端是否复用连接，应该由 Nginx upstream keepalive 配置决定，而不是照搬浏览器请求头。

WebSocket location 里，如果没有 `Upgrade`，通常说明它不是合法 WebSocket 请求，用 `close` 更保守。

---

## 7. HTTPS 与 WSS

### 7.1 默认端口

| 协议 | 默认端口 |
|:--|--:|
| HTTP | 80 |
| HTTPS | 443 |
| WS | 80 |
| WSS | 443 |

所以：

```text
wss://example.com/infra/ws
```

等价于：

```text
wss://example.com:443/infra/ws
```

### 7.2 HTTPS 前端 + HTTP 后端

推荐链路：

```text
浏览器 --wss--> Nginx --http upgrade--> 后端网关
```

这时后端可以仍然是 HTTP：

```nginx
proxy_pass http://example:12345;
```

浏览器只校验 Nginx 对外证书，不直接校验后端证书。

### 7.3 HTTPS 前端直连 HTTP 后端的问题

如果页面是：

```text
https://front.example.com
```

却直连：

```text
ws://example:12345/infra/ws
```

浏览器会拦截混合内容。

如果改成：

```text
wss://example:12345/infra/ws
```

那后端端口必须支持 TLS 证书，否则连接失败。

生产更推荐前端连同源 Nginx：

```text
wss://front.example.com/infra/ws
```

---

## 8. 常见配置模板

### 8.1 Vue/Vite SPA + API + WebSocket

```nginx
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    server {
        listen 80;
        server_name _;

        location = /index.html {
            root /usr/share/nginx/html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires 0;
        }

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        location /admin-api/ {
            proxy_pass http://example:12345/admin-api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_read_timeout 120s;
        }

        location /infra/ws {
            proxy_pass http://example:12345;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
        }
    }
}
```

### 8.2 MinIO 代理

```nginx
location /minio/ {
    proxy_pass http://example.minio:9000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_buffering off;
    proxy_request_buffering off;
    proxy_connect_timeout 30s;
    proxy_read_timeout 300s;
    proxy_send_timeout 60s;
}
```

请求：

```text
/minio/sense/a.png
```

转发：

```text
http://example.minio:9000/sense/a.png
```

原因是 `location /minio/` 被 `proxy_pass` 里的 `/` 替换了。

---

## 9. 排错命令

### 9.1 检查配置语法

```bash
nginx -t
```

如果指定配置文件：

```bash
nginx -t -c /data1/middleware/nginx/nginx.conf
```

### 9.2 平滑重载

```bash
nginx -s reload
```

指定配置：

```bash
nginx -s reload -c /data1/middleware/nginx/nginx.conf
```

### 9.3 看错误日志

```bash
tail -n 100 /var/log/nginx/error.log
```

### 9.4 测试 WebSocket 是否命中 Nginx

浏览器 DevTools Network 选择 WS，看请求地址是否是：

```text
ws://前端域名/infra/ws?token=...
```

或：

```text
wss://前端域名/infra/ws?token=...
```

如果返回 HTML 或 200 静态页面，通常说明没有命中 WebSocket location，而是落到了 `location /`。

---

## 10. 快速记忆表

| 指令 | 是否访问本地文件 | 是否转发后端 | URI 拼接/替换规则 |
|:--|:--:|:--:|:--|
| `root` | 是 | 否 | `root + 完整 URI` |
| `alias` | 是 | 否 | `alias + 去掉 location 前缀后的剩余路径` |
| `proxy_pass http://host` | 否 | 是 | 原样转发完整 URI |
| `proxy_pass http://host/xxx/` | 否 | 是 | 用 `/xxx/` 替换 location 命中的前缀 |

常用判断：

- 静态前端 SPA：用 `root`。
- URL 前缀映射到另一个本地目录：用 `alias`。
- 转后端服务：用 `proxy_pass`。
- 不想改后端 path：`proxy_pass` 不带 URI。
- 想把 `/api/xxx` 转成 `/admin-api/xxx`：`proxy_pass` 带 URI。

---

## 参考资料

- Nginx 官方文档：`root`、`alias`、`proxy_pass`、`map`
- WebSocket over HTTP/1.1 Upgrade 机制
- 当前项目 Nginx 配置讨论与实时预警 WebSocket 对接配置
