---
author: ai
ai_editable: true
summary: 'Samba 让 Linux 和 Windows 之间实现文件共享和打印共享，是 Linux 服务器给 Windows 客户端共享目录的常用方案。'
refs:
  pages:
    - '【服务】防火墙 firewalld 区域管理'
  raw:
    - path: 'raw/operations-services/4. linux运维-ftp和samba/4.2 samba.md'
      sha256: 8b2b030f6f6a8fd900da3e5156d76296a07ccf3098892bf8678fd28f284bc933
updated_by: ai
updated: 2026-08-03
---

## 1. Samba 简介

Samba 让 Linux 和 Windows 之间实现**文件共享和打印共享**，是 Linux 服务器给 Windows 客户端共享目录的常用方案。

```bash
systemctl enable smb.service   # 设置开机启动
systemctl start smb.service    # 开启服务
systemctl status smb           # 查看状态
```

## 2. 配置详解（/etc/samba/smb.conf）

### 2.1 全局参数 [global]

```bash
[global]
    security = share|user|server   # 认证模式
    hosts allow = 127. 192.168.0.  # 允许访问的主机网段
```

`security` 三种模式：

| 模式     | 说明                                 |
| -------- | ------------------------------------ |
| `share`  | 没有账号密码，直接共享               |
| `user`   | 用主机的密码文件做登录验证（最常用） |
| `server` | 由其他服务端做登录验证               |

### 2.2 共享段例子

```bash
[data]                # 客户端看到的共享名（不一定等于目录名）
    path = /home/username   # 共享的本地路径
    comment = tech          # 注释
    public = no             # 不公开（有密码才能进），类似 guest ok = no
    valid users = @t        # 访问权限：t 组（@ 表示组）
    write list = @t         # 写权限：t 组
```

> **注意**：
>
> - 客户端连接时显示的是 `[data]` 这个名字，而非真实路径 `/home/username`
> - 修改配置后先用 `testparm` 检查配置文件语法
> - 除了 samba 权限，**系统权限、SELinux、iptables/firewalld** 也要匹配放行，三层都要通

## 3. 增加 Samba 用户

```bash
# a. 先增加系统账号
useradd smbuser -s /bin/false
passwd smbuser

# b. 再把系统账号加入 samba
smbpasswd -a smbuser
```

> **重点**：smb 用户与系统账号的密码**互相独立**，修改系统密码不会影响 smb 用户之前设置的密码。

```bash
pdbedit -L             # 查看哪些 samba 用户
pdbedit -x -u smbuser  # 删除 smbuser
```

## 4. 客户端使用

### 4.1 查看共享

```bash
smbclient -L //IP      # 列出该服务器共享了哪些目录
```

### 4.2 挂载共享

```bash
mount -t cifs -o username=guest,password=guest //192.168.116.3/img /smb
```

> 挂载报错时，先确认**服务端和客户端都安装了 cifs-utils 包**。

### 4.3 开机自动挂载

在 `/etc/fstab` 中写入：

```bash
//ip/devops /mnt/dev cifs defaults,username=silene,password=redhat 0 0
```

## 5. 小结

| 操作            | 命令                                                           |
| --------------- | -------------------------------------------------------------- |
| 增加 samba 用户 | `useradd 用户名` + `smbpasswd -a 用户名`                       |
| 查看 samba 用户 | `pdbedit -L`                                                   |
| 检查配置语法    | `testparm`                                                     |
| 客户端看共享    | `smbclient -L //IP`                                            |
| 客户端挂载      | `mount -t cifs -o username=..,password=.. //IP/共享 /本地目录` |

> 放行 samba 端口见 [[【服务】防火墙 firewalld 区域管理]]。
