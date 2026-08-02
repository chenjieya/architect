---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
## 1. 用户切换基础概念

在Linux系统中，我们经常需要在不同用户身份之间切换来执行特定任务，主要有两种方式：`su` 和 `sudo`。

## 2. su命令详解

### 2.1 基本语法

```bash
# 切换到root用户
su -
su - root

# 切换到指定用户
su - username
```

### 2.2 su - 与 su 的区别

| 特性     | `su -`                 | `su`               |
| -------- | ---------------------- | ------------------ |
| 环境变量 | 读取目标用户的完整环境 | 保留当前用户环境   |
| 工作目录 | 切换到目标用户的家目录 | 保持当前工作目录   |
| PATH变量 | 使用目标用户的PATH     | 使用当前用户的PATH |
| 推荐程度 | ✅ **推荐使用**        | ❌ 不推荐          |

### 2.3 实际示例

```bash
# 当前环境
$ pwd
/home/user1
$ echo $PATH
/usr/local/bin:/usr/bin:/bin

# 使用 su -（推荐）
$ su -
密码：
# pwd
/root
# echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# 使用 su（不推荐）
$ su
密码：
# pwd
/home/user1  # 工作目录未变！
# echo $PATH
/usr/local/bin:/usr/bin:/bin  # PATH未更新！
```

### 2.4 退出用户

```bash
# 退出当前切换的用户，返回原用户
exit
# 或使用快捷键
Ctrl + D
```

## 3. sudo命令详解

### 3.1 sudo基本概念

`sudo` 允许授权用户以其他用户（通常是root）的身份执行命令，而不需要知道root密码。

```bash
# 基本用法
sudo command
sudo -u username command  # 以指定用户身份执行
```

### 3.2 sudo配置文件

#### 3.2.1 编辑方式

**推荐使用：**

```bash
sudo visudo
```

**也可以使用（不推荐）：**

```bash
vim /etc/sudoers
```

> **注意**：始终使用 `visudo` 编辑sudo配置，因为它会进行语法检查，防止配置错误导致系统无法使用。

### 3.3 sudo配置语法

基本格式：

```
用户或组  登录的主机 = (可切换的身份)  [NOPASSWD:] 可执行的命令
```

#### 3.3.1 各字段说明

- **用户或组**：
  - 用户名：`john`
  - 用户组：`%wheel`、`%admin`
  - 用户别名：`User_Alias`

- **登录的主机**：
  - 主机名或IP
  - `ALL` 表示所有主机

- **可切换的身份**：
  - 用户名或`ALL`
  - 省略时默认为root

- **NOPASSWD**：（可选）
  - 包含时：执行命令不需要密码
  - 不包含时：需要验证当前用户密码

- **可执行的命令**：
  - 命令的完整路径
  - 命令别名：`Cmnd_Alias`
  - `ALL` 表示所有命令

### 3.4 配置示例

#### 示例1：wheel组管理员权限

```
%wheel ALL=(ALL) ALL
```

**说明**：wheel组成员可以在任何主机上切换为任何用户执行任何命令，需要输入自己的密码。

#### 示例2：无密码管理员权限

```
%wheel ALL=(ALL) NOPASSWD: ALL
```

**说明**：wheel组成员可以无密码执行所有命令。

#### 示例3：精细的密码管理权限

```
User_Alias ADMPW = jsmith, mikem
ADMPW ALL = NOPASSWD: !/usr/bin/passwd, /usr/bin/passwd [A-Za-z]*, !/usr/bin/passwd root
```

**说明**：

- 用户jsmith和mikem可以无密码执行passwd命令
- 但不能修改root密码（`!/usr/bin/passwd root`）
- 可以修改其他用户密码（`/usr/bin/passwd [A-Za-z]*`）

#### 示例4：软件管理权限

```
Cmnd_Alias SOFTWARE = /bin/rpm, /usr/bin/up2date, /usr/bin/yum
User_Alias ADMINS = %wheel
ADMINS ALL = SOFTWARE
```

**说明**：管理员可以执行软件包管理相关命令。

### 3.5 高级配置技巧

#### 使用别名简化管理

```bash
# 用户别名
User_Alias ADMINS = john, %wheel, %admin
User_Alias DEVELOPERS = alice, bob, %devgroup

# 主机别名
Host_Alias WEBSERVERS = 192.168.1.10, 192.168.1.11
Host_Alias DBSERVERS = db1.example.com, db2.example.com

# 命令别名
Cmnd_Alias PROCESSES = /bin/nice, /bin/kill, /usr/bin/kill, /usr/bin/killall
Cmnd_Alias WEB_COMMANDS = /usr/sbin/apachectl, /usr/bin/htpasswd

# 组合使用
ADMINS WEBSERVERS = (ALL) PROCESSES, WEB_COMMANDS
DEVELOPERS DBSERVERS = (operator) ALL
```

## 4. 安全最佳实践

### 4.1 原则性建议

1. **最小权限原则**：只授予完成工作所必需的最小权限
2. **使用sudo代替su**：避免共享root密码
3. **定期审计**：定期检查sudo权限分配
4. **使用visudo**：避免配置语法错误

### 4.2 安全配置示例

```bash
# 允许用户管理服务，但不能获得shell
User_Alias SERVICEADMINS = tom, jerry
SERVICEADMINS ALL = /bin/systemctl restart *, /bin/systemctl stop *, /bin/systemctl start *

# 允许备份操作，但限制访问
User_Alias BACKUPUSERS = backupadmin
BACKUPUSERS ALL = (backup) /usr/bin/rsync, /bin/tar
```

### 4.3 调试和验证

```bash
# 检查用户的sudo权限
sudo -l

# 以其他用户身份执行命令
sudo -u username command

# 启动root shell（如果权限允许）
sudo -i
sudo -s
```

## 5. 实际工作场景

### 场景1：开发环境

```bash
# 开发人员需要重启web服务
User_Alias DEVS = alice, bob
DEVS ALL = NOPASSWD: /bin/systemctl restart nginx, /bin/systemctl restart php-fpm
```

### 场景2：数据库管理

```bash
# DBA需要管理数据库服务
User_Alias DBAS = charlie
DBAS ALL = (mysql) /bin/systemctl *, /usr/bin/mysql*, /usr/bin/mysqldump
```

### 场景3：系统监控

```bash
# 监控用户需要查看系统状态
User_Alias MONITORS = nagios, zabbix
MONITORS ALL = NOPASSWD: /bin/ps, /usr/bin/top, /bin/df, /usr/bin/iostat
```

## 6. 总结

- **su**：用于完全切换用户身份，推荐使用 `su -` 获得完整环境
- **sudo**：用于临时提权执行特定命令，更安全可控
- **visudo**：安全编辑sudo配置文件的正确方式
- **最小权限**：遵循安全原则，按需分配权限

正确使用su和sudo可以大大提高系统安全性，同时保证工作效率。建议在生产环境中优先使用sudo，并严格限制权限范围。
