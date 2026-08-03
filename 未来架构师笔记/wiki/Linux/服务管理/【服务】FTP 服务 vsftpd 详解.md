---
author: ai
ai_editable: true
summary: "FTP（文件传输协议）是最常用的网络协议之一，用于通过网络和远程服务器进行文件传输。"
refs:
  pages: []
  raw:
    - path: "raw/operations-services/4. linux运维-ftp和samba/4.1 ftp.md"
      sha256: ef1a58b328a9a004fcbc0fcf5c9f5666315ebaaba07d78fe863db56cfc5c9425
updated_by: ai
updated: 2026-08-03
---

## 1. FTP 简介与软件选型

FTP（文件传输协议）是最常用的网络协议之一，用于通过网络和远程服务器进行文件传输。

常见的 FTP 服务软件：wuftp、proftp、pureftp、**vsftpd**（Very secure FTP Daemon，最常用，安全）。

- 包名：`vsftpd`
- 服务名：`vsftpd`
- 配置文件：`/etc/vsftpd/vsftpd.conf`
- 默认共享目录：`/var/ftp/`

## 2. 安装与管理

```bash
yum install vsftpd.x86_64        # 或 rpm -ivh vsftpd-xxx.rpm

service vsftpd start/stop/restart    # 老命令
systemctl start/stop/restart vsftpd.service   # 新命令
systemctl enable vsftpd.service      # 开机自启
```

## 3. 核心配置参数

### 3.1 版本差异提醒

- **RHEL7** 默认是匿名 FTP 服务器：允许匿名下载、禁用本地用户、禁止上传
- **RHEL8** 默认没开匿名

改完配置必须**重启服务**。

### 3.2 监听地址和端口

```bash
listen=yes           # 开启监听
listen_address=IP    # 单个 IP 时默认在指定 IP 监听；多个 IP 时可指定
listen_port=21       # 默认端口 21
listen_ipv6=no       # 要指定 IP 监听前，需先关闭 IPv6
```

### 3.3 匿名用户与本地用户

```bash
anonymous_enable=YES|NO    # 是否允许匿名登录
anon_root=路径             # 匿名用户的家目录（默认 /var/ftp）
local_enable=YES|NO        # 系统用户能否登录 vsftpd（默认 YES）
```

### 3.4 用户名单控制（userlist）

```bash
userlist_enable=YES|NO   # 是否启用用户名单（默认 NO）
userlist_file=/etc/vsftpd/user_list   # 名单文件（默认路径，可不配）
userlist_deny=YES|NO     # 默认 YES：user_list 中记录的是【被拒绝】的名单
```

**白名单配置例子**（只允许 testuser 登录）：

```bash
anonymous_enable=NO
local_enable=YES
userlist_enable=YES
userlist_deny=NO          # NO = 名单里的人是【允许】的
```

再在 `/etc/vsftpd/user_list` 中只写入 `testuser`，效果就是**只有 testuser 能登录 FTP**。

### 3.5 常见坑

1. 如果用户的 shell 是 `/sbin/nologin`，需要在 `/etc/shells` 中加一行 `/sbin/nologin`，否则登录失败
2. `/etc/vsftpd/ftp_users` 中列出的用户**依然不能登录**

## 4. 日志配置

```bash
xferlog_enable=YES|NO      # 是否开启日志（默认 YES）
xferlog_std_format=YES|NO  # 建议改成 NO
```

- `xferlog_std_format=YES`：日志写到 `/var/log/xferlog`，格式复杂难解析
- `xferlog_std_format=NO`：日志写到 `/var/log/vsftpd.log`，格式更好读

> 系统自带配置文件示例可参考 `/usr/share/doc/vsftpd`。

## 5. 小结

| 需求                         | 配置                                                |
| ---------------------------- | --------------------------------------------------- |
| 只允许本地用户登录           | `local_enable=YES` + `anonymous_enable=NO`          |
| 只允许指定用户登录（白名单） | `userlist_enable=YES` + `userlist_deny=NO`          |
| 改变共享目录                 | `anon_root=路径`                                    |
| 查看传输日志                 | 关闭 `xferlog_std_format`，看 `/var/log/vsftpd.log` |
