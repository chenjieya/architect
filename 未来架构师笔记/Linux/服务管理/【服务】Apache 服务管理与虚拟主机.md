## 1. Apache 安装与管理

### 1.1 安装

```bash
# 确认是否已安装 http 相关包
rpm -qa | grep http

# 未安装则用 yum 安装
yum install "http*"
```

> 如果想**源码编译安装**，方式是经典的 configure/make/make install 三步：
> ```bash
> ./configure --prefix=/usr/local/apache
> make
> make install
> ```

### 1.2 启停与状态

```bash
# 老命令（service 方式）
service httpd start/stop/restart/status

# 新命令（systemd 方式）
systemctl start/stop/restart/status httpd.service
systemctl enable/disable httpd.service    # 开机自启/取消自启

# 语法检查（改完配置必做）
apachectl -t
```

### 1.3 启动你的第一个 Web 服务

1. yum 安装完 http
2. 修改配置文件 `/etc/httpd/conf/httpd.conf`：
   `Listen 80` 改成 `Listen 你的IP:80`
3. 确认 80 端口已监听：`netstat -ntpl | grep :80`
4. 在 httpd.conf 中屏蔽一行 `IncludeOptional conf.d/*.conf`
5. 重启 apache 服务
6. 生成首页：`echo "你的IP" > /var/www/html/index.html`
7. 浏览器访问 `http://你的IP`

## 2. 日志解析

Apache 用两个指令定制日志格式：`LogFormat`（定义格式）和 `CustomLog`（指定文件使用哪种格式）。

### 2.1 常用日志变量

```bash
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```

| 变量 | 含义 |
| --- | --- |
| `%h` | 远程主机 IP |
| `%l` | 远程登录名（来自 identd，通常为 `-`） |
| `%u` | 远程用户（来自认证） |
| `%t` | 请求时间（公共日志格式） |
| `%r` | 请求的第一行（如 `GET /index.html HTTP/1.1`） |
| `%s` | 状态码；`%>s` 指重定向后的最终状态 |
| `%b` | 发送的字节数（不含 HTTP 头） |

```bash
# 使用 common 格式，输出到 access_log
CustomLog logs/access_log common
```

### 2.2 日志轮转 rotatelogs

```bash
# 按天切割日志：86400 秒 = 1 天，480 为时区偏移
CustomLog "|/usr/local/apache2/bin/rotatelogs /usr/local/apache2/logs/%Y%m%d_access.log 86400 480" common
```

> **注意**：rotatelogs 和日志文件都要写**绝对路径**，且 rotatelogs 路径要用 `|` 管道符连接。

### 2.3 错误日志

```bash
# 日志级别：debug, info, notice, warn, error, crit, alert, emerg（从低到高）
LogLevel warn
ErrorLog logs/error_log
```

> 生产环境建议 `LogLevel warn`，级别太低会刷爆磁盘，太高看不到问题。

## 3. 常见 HTTP 状态码

| 状态码 | 含义 |
| --- | --- |
| 200 | OK，一切正常 |
| 301 | 永久重定向 |
| 302 | 临时重定向 |
| 403 | 权限被拒绝 |
| 404 | 没找到 |
| 500 | 服务器内部错误 |
| 502 | Bad Gateway（网关错误） |
| 504 | Gateway Timeout（网关超时） |

## 4. 重要参数

```bash
# 1）web 服务进程所属的用户和组
User  apache
Group apache
# 用 ps -ef | grep httpd 可确认进程归属

# 2）域名对应资源的路径（网页放这里）
DocumentRoot "/var/www/html"

# 3）主配置目录（ServerRoot 相对路径的基准）
ServerRoot "/etc/httpd"

# 4）定义域名
ServerName www.example.com
```

## 5. 虚拟主机

虚拟主机允许一个 httpd 服务器**同时服务多个网站**，分三种：基于名称、基于 IP、基于端口。

```apache
<VirtualHost *:80>
    ServerName serverX.example.com
    ServerAlias example.com
    ServerAdmin webmaster@example.com
    DocumentRoot /var/www/html
</VirtualHost>
```

- `ServerName`：主域名
- `ServerAlias`：备用别名（也能访问到）
- `DocumentRoot`：该域名对应的网站目录

## 6. 目录浏览功能

```apache
# Indexes：目录下无 index 文件时，允许列出目录内容
# -Indexes：关闭目录浏览功能（生产环境建议关闭，防止目录结构泄露）
Options Indexes
```

## 7. 用户认证（htpasswd）

给指定目录加用户名密码：

```bash
# 1）创建密码文件（第一次用 -c）
htpasswd -c /etc/httpd/.htpasswd bob
htpasswd /etc/httpd/.htpasswd alice    # 文件已存在，不再加 -c
```

```apache
# 2）在虚拟主机中添加 Directory 配置
<Directory /var/www/virtual/wwwX/html>
    AuthName "Secret Stuff"
    AuthType basic
    AuthUserFile /etc/httpd/.htpasswd
    Require valid-user
</Directory>
```

3）浏览器访问时就会弹出用户名密码框。

## 8. 跳转（Redirect）

### 8.1 Redirect 永久跳转

```apache
<VirtualHost *:80>
    DocumentRoot "/www/hellen2.linux.com"
    ServerName hellen2.linux.com
    Redirect Permanent / http://hellen.linux.com
    ErrorLog logs/hellen2.linux.com-error_log
    CustomLog logs/hellen2.linux.com-access_log common
</VirtualHost>
```

> 访问 `hellen2.linux.com` 会 301 永久跳转到 `hellen.linux.com`。**跳转的目的地址别忘了写 http 协议**。

### 8.2 rewrite 方式跳转

```apache
<VirtualHost *:80>
    ServerName hellen3.linux.com
    rewriteengine on
    # 保留原路径跳转：/xxx -> http://hellen.linux.com/xxx
    rewriterule ^(.*)$ http://hellen.linux.com$1
    # 统一跳到首页：rewriterule ^(.*)$ http://hellen.linux.com/
</VirtualHost>
```

## 9. 访问控制（Order）

Apache 基于主机的访问控制用 `Order` 指令，两种模式：

| Order 值 | 行为 | 场景 |
| --- | --- | --- |
| `allow,deny` | 允许"明确 allow"的客户，拒绝其他**所有**客户 | 白名单 |
| `deny,allow` | 拒绝"明确 deny"的客户，允许其他**所有**客户 | 黑名单 |

> 重点：**两者同时匹配时**，`allow,deny` 一律拒绝（deny 后判断生效），`deny,allow` 一律允许（allow 后判断生效）。

```apache
# 例子1：允许所有客户端访问
Order allow,deny
Allow from all

# 例子2：拒绝 10.20.30.40 和 .apple.com 域，其他都可访问（黑名单）
Order deny,allow
Deny from 10.20.30.40
Deny from .apple.com

# 例子3：只允许 192.168.1.0/24 网段访问，但其中 192.168.1.100 不行（白名单+例外）
Order allow,deny
Allow from 192.168.1.0/24
Deny from 192.168.1.100

# 综合：虚拟主机内做目录级访问控制
<VirtualHost *:80>
    DocumentRoot "/www/hellen6.linux.com"
    ServerName hellen6.linux.com
    <Directory "/www/hellen6.linux.com">
        order deny,allow
        deny from 192.168.116.1
    </Directory>
</VirtualHost>
```

> Nginx 反向代理配合 Apache 的场景见 [[【Nginx】编译安装与运维脚本补充]]。
