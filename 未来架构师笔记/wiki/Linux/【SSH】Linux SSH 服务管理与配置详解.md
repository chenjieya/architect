---
author: ai
ai_editable: true
summary: "SSH（Secure Shell）是 Linux/Unix 系统中最常用的远程登录和管理工具。通过 SSH，我们可以安全地连接到远程主机，执行命令、传输文件，甚至做端口…"
refs:
  pages: []
  raw:
    - path: "raw/operations-linux/05. linux_ssh服务管理/05、linux_ssh服务管理.md"
      sha256: 1393f6b9860f42aa513b746596a0eeb523a0ac24af210edbe0d036e0cff02459
updated_by: ai
updated: 2026-08-03
---

SSH（Secure Shell）是 Linux/Unix 系统中最常用的远程登录和管理工具。通过 SSH，我们可以安全地连接到远程主机，执行命令、传输文件，甚至做端口转发。本文将带你快速了解 **SSH 服务的安装、配置、验证方式以及常用操作**。

## 1. 一、SSH 服务安装与管理

SSH 服务默认监听 **22 端口**，你可以通过以下命令确认服务是否在运行：

`netstat -ntpl | grep :22`

### 1.1 启动与关闭 SSH 服务

默认服务在 22 端口监听 `netstat -ntpl | grep :22`

在不同的 Linux 发行版中，管理方式略有不同：

```bash
# 使用 systemctl 管理
systemctl start sshd.service
systemctl stop sshd.service
systemctl restart sshd.service
systemctl status sshd.service
```

### 1.2 设置开机自启

```bash
systemctl enable sshd.service    # 开机自启
systemctl disable sshd.service   # 取消开机自启
```

---

## 2. 二、SSH 配置

SSH 服务的配置文件位于：

`/etc/ssh/sshd_config`

修改配置后需要重启服务才能生效。

常见配置项：

```bash
# 指定监听的地址和端口
ListenAddress 192.168.0.1 Port 22
# 是否允许 root 用户远程登录
PermitRootLogin yes   # 允许
PermitRootLogin no    # 禁止
```

---

## 3. 三、SSH 连接与验证方式

SSH 提供 **两种级别的安全验证**：

1. **基于口令的验证（Password Authentication）**  
   只需用户名和密码即可登录远程主机。
2. **基于密钥的验证（Public Key Authentication）**  
   通过公钥和私钥实现身份验证，更安全。  
   服务器保存公钥，客户端用私钥解密“质询”完成认证。

---

### 3.1 密码登录方式

```bash
# 使用默认端口（22）
ssh user@192.168.116.3
# 指定端口
ssh user@192.168.116.3 -p 2222

ssh  192.168.116.3  # 相当于 ssh 宿主机客户端用户名@192.168.116.3    -p  22
```

---

### 3.2 无密码登录方式（基于密钥）

#### 3.2.1 方法一：手动配置

客户端（192.168.77.131）生成密钥对：

`ssh-keygen -t rsa`

生成后会在 `~/.ssh/` 下生成：

- `id_rsa` —— 私钥
- `id_rsa.pub` —— 公钥

将公钥拷贝到服务器（192.168.77.128）：

`scp ~/.ssh/id_rsa.pub root@192.168.77.128:/home/

在服务器端：

```bash
# 这个文件若不存在的话，先创建
touch /root/.ssh/authorized_keys
cat /home/id_rsa.pub >> /root/.ssh/authorized_keys
```

测试登录：

`ssh root@192.168.77.128`

无需密码即可登录。

#### 3.2.2 方法二：ssh-copy-id 工具

客户端执行：

`ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.77.128`

然后直接登录：

`ssh root@192.168.77.128`

---

## 4. 四、SSH 常用操作命令

### 4.1 文件传输

```bash
# 传输文件
scp file user@192.168.116.3:/tmp
# 传输目录（-r 递归）
scp -r directory user@192.168.116.3:/tmp
```

> 注意：已有文件会被覆盖。

### 4.2 远程执行命令

```bash
ssh 192.168.116.3 "command"
# 示例：查看远程主机网卡信息
ssh 192.168.116.3 "ifconfig eth0"
```

---

## 5. 五、SSH 客户端工具

除了 Linux 终端自带的 `ssh` 命令，还有许多常见的 SSH 客户端工具可供选择：

- **Linux 终端**
- **gcm**（gnome-connection-manager）
- **Putty**
- **SecureCRT**
- **Xshell**
- **xterm**

---

## 6. 六、总结

本文介绍了 SSH 的基本操作，从 **服务管理 → 配置修改 → 连接验证 → 文件传输 → 客户端工具**，覆盖了日常运维常见的使用场景。

在生产环境中，建议：

- 修改默认端口（22），提高安全性
- 禁止 root 用户直接登录
- 使用 **基于密钥的验证** 代替密码登录

这样既能提升安全性，又能方便日常远程管理。

---

## 7. 七、思考与练习

### 7.1 思考题

**场景**：A 机器能**无密码登录** root@B（已配置好密钥验证）。

1. 此时 B 的 root 密码发生改变，A 还能无密码登录 B 吗？
2. 当 B 的 IP 从 `192.168.77.128` 改成 `192.168.77.150`（机器 C），A 还能无密码登录吗？

> **答案提示**：
>
> 1. **能**。密钥验证不依赖密码，只要 B 的 `authorized_keys` 里还存着 A 的公钥，密码怎么改都不影响 A 无密码登录。
> 2. **不能**。A 的 `~/.ssh/known_hosts` 里记录的是旧 IP 对应的主机指纹，换成新 IP 后指纹不匹配，SSH 会报 `Host key verification failed` 拒绝连接。需要先删掉 known_hosts 里该主机的旧记录再重连。

### 7.2 练习

安排两台虚拟机 A 和 B，配置**双向无密码登录**：A 能无密码登录 B，B 也能无密码登录 A。

**参考步骤**：

```bash
# 在 A 上：生成密钥并推送到 B
ssh-keygen -t rsa                # 一路回车即可
ssh-copy-id root@B的IP           # 输入一次 B 的密码完成安装

# 在 B 上：生成密钥并推送到 A
ssh-keygen -t rsa
ssh-copy-id root@A的IP

# 验证：两端互连都不需要密码
ssh root@B的IP
ssh root@A的IP
```
