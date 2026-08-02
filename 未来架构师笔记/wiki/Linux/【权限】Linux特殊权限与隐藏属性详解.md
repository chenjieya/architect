---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---

## 1. 特殊权限概述

除了基本的 rwx 权限外，Linux 还提供了三种特殊权限：SUID、SGID 和 Sticky Bit，它们为文件和目录提供了更精细的权限控制。

## 2. SUID 特殊权限

### 2.1 基本概念

- **SUID**（Set User ID）：仅对**二进制可执行文件**有效，对目录无效
- 作用：让普通用户在执行该程序时，**临时拥有文件所有者的权限**
- 原理：使用程序**所属用户**的权限运行，而不是**执行者**的权限

### 2.2 常见示例

```bash
# 查看设置了SUID的程序
ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root 59976 Nov 24  2022 /usr/bin/passwd

ls -l /etc/shadow
-rw-r----- 1 root shadow 1234 Oct 17 20:37 /etc/shadow
```

**工作原理**：

- 普通用户执行`passwd`命令时，临时获得 root 权限
- 从而能够修改`/etc/shadow`文件（原本普通用户无权限）

### 2.3 实验验证

```bash
# 实验步骤：
# 1. 切换到root用户
su -

# 2. 查看/root目录权限
ls -l / | grep root
dr-xr-x---. 1 root root 4096 Oct 17 20:37 root

# 3. 普通用户test尝试查看/root目录
su test
ls /root
# 提示：ls: cannot open directory '/root': Permission denied

# 4. root用户给ls命令添加SUID权限
exit  # 返回root用户
which ls  # 确认ls路径，通常是/bin/ls
chmod u+s /bin/ls
ls -l /bin/ls
-rwsr-xr-x 1 root root 141936 Oct  1  2020 /bin/ls

# 5. 普通用户再次测试
su test
ls /root  # 现在可以正常显示了！
```

## 3. SGID 特殊权限

### 3.1 基本概念

- **SGID**（Set Group ID）：对文件和目录都有效
- **对文件**：执行时使用**文件所属组**的权限，文件就好比你的女儿，只会继承你的姓（所数组）
- **对目录**：在该目录中创建的文件**继承目录的组身份**。文件夹就好比你的儿子，不仅继承你的姓，还会继承你的家产（s 特殊权限）

### 3.2 不同场景的作用

#### 3.2.1 对文件的作用

```bash
# 示例：/usr/bin/wall
ls -l /usr/bin/wall
-rwxr-sr-x 1 root tty 30800 Aug  4  2022 /usr/bin/wall
```

- 普通用户执行`wall`命令时，使用`tty`组的权限

#### 3.2.2 对目录的作用

```bash
# 创建共享目录
mkdir /shared
chgrp developers /shared
chmod g+s /shared  # 设置SGID

# 测试SGID效果
ls -ld /shared
drwxr-sr-x 2 root developers 4096 Oct 17 20:37 /shared

# 用户在/shared目录创建文件
touch /shared/testfile
ls -l /shared/testfile
-rw-r--r-- 1 user developers 0 Oct 17 20:37 testfile
# 注意：文件所属组自动继承为developers
```

**SGID 目录特性**：

- 创建的文件继承目录的组身份
- 创建的子目录不但继承组身份，还继承 SGID 权限位

## 4. Sticky Bit 粘滞位

### 4.1 基本概念

- **Sticky Bit**：主要针对目录设置
- 作用：在设置了粘滞位的目录中，文件**只能被文件所有者或 root 删除**
- 常见应用：临时文件目录 `/tmp`

### 4.2 实际示例

```bash
# 查看/tmp目录权限
ls -ld /tmp
drwxrwxrwt 1 root root 4096 Oct 17 20:37 tmp
# 注意：其他用户执行位显示为 't'

# 粘滞位工作原理：
# - 用户A在/tmp创建文件fileA
# - 用户B可以看到fileA，但无法删除它
# - 只有用户A或root可以删除fileA
```

### 4.3 验证实验

```bash
# 用户A操作
su userA
touch /tmp/fileA.txt
echo "userA's file" > /tmp/fileA.txt

# 用户B操作
su userB
# 尝试删除用户A的文件
rm /tmp/fileA.txt
# 提示：rm: cannot remove '/tmp/fileA.txt': Operation not permitted

# 但用户可以删除自己创建的文件
touch /tmp/fileB.txt
rm /tmp/fileB.txt  # 成功删除
```

## 5. 特殊权限设置方法

### 5.1 字符方式设置

```bash
# 设置SUID
chmod u+s filename

# 设置SGID
chmod g+s filename
chmod g+s directory

# 设置Sticky Bit
chmod o+t directory

# 移除特殊权限
chmod u-s filename
chmod g-s directory
chmod o-t directory
```

### 5.2 数字方式设置

特殊权限使用**4 位八进制数**表示：

| 权限       | 数字值 | 字符表示 |
| ---------- | ------ | -------- |
| SUID       | 4      | u+s      |
| SGID       | 2      | g+s      |
| Sticky Bit | 1      | o+t      |

**语法**：`chmod XYYY file`

- `X`：特殊权限位（4+2+1）
- `YYY`：基本权限位（777 格式）

**示例**：

```bash
# 设置SUID
chmod 4755 filename      # rwsr-xr-x

# 设置SGID
chmod 2755 directory     # rwxr-sr-x

# 设置Sticky Bit
chmod 1777 directory     # rwxrwxrwt

# 组合设置
chmod 6755 filename      # rwsr-sr-x (SUID+SGID)
```

### 5.3 大小写 s/t 的含义区别

| 显示 | 含义   | 说明                       |
| ---- | ------ | -------------------------- |
| `s`  | 小写 s | 具有执行权限(x) + 特殊权限 |
| `S`  | 大写 S | 只有特殊权限，没有执行权限 |
| `t`  | 小写 t | 具有执行权限(x) + 粘滞位   |
| `T`  | 大写 T | 只有粘滞位，没有执行权限   |

**示例**：

```bash
chmod u+s /usr/bin/ls      # 显示为 rwsr-xr-x (小s)
chmod u+s /etc/passwd      # 显示为 rwSr--r-- (大S，因为passwd不可执行)
```

## 6. 隐藏属性

### 6.1 查看隐藏属性

```bash
# 查看文件隐藏属性
lsattr filename

# 查看目录隐藏属性
lsattr -d directory

# 递归查看目录内容隐藏属性
lsattr -R directory
```

### 6.2 设置隐藏属性

```bash
# 基本语法
chattr [+-=] [属性] 文件或目录名

# 常用属性
# i: 不可修改 - 不能删除、重命名、修改内容、创建链接
# a: 只能追加 - 只能添加内容，不能删除或修改现有内容
```

### 6.3 常用属性详解

#### 6.3.1 i 属性（不可修改）

```bash
# 设置i属性
chattr +i filename

# 测试效果
echo "test" > filename      # 失败：Permission denied
rm filename                 # 失败：Operation not permitted
mv filename newname         # 失败：Operation not permitted

# 移除i属性
chattr -i filename
```

#### 6.3.2 a 属性（只能追加）

```bash
# 设置a属性
chattr +a filename

# 测试效果
echo "new content" >> filename    # 成功：可以追加
echo "overwrite" > filename       # 失败：不能覆盖
rm filename                       # 失败：不能删除

# 移除a属性
chattr -a filename
```

### 6.4 完整属性列表

| 属性 | 说明                   |
| ---- | ---------------------- |
| a    | 只能以追加方式打开文件 |
| A    | 不更新文件的访问时间   |
| c    | 透明压缩/解压文件      |
| d    | 不做 dump 备份         |
| i    | 不可修改文件           |
| s    | 安全删除（用 0 填充）  |
| u    | 删除保护               |

## 7. 安全最佳实践

### 7.1 特殊权限使用建议

1. **谨慎使用 SUID**：只在必要时为可信程序设置
2. **SGID 用于协作**：适合团队共享目录
3. **Sticky Bit 保护**：用于公共可写目录

### 7.2 隐藏属性使用场景

- **系统关键文件**：使用`+i`防止误修改
- **日志文件**：使用`+a`防止日志被篡改
- **敏感配置文件**：结合使用多种保护

### 7.3 实际应用示例

```bash
# 保护系统配置文件
chattr +i /etc/passwd
chattr +i /etc/shadow

# 保护日志文件
chattr +a /var/log/secure
chattr +a /var/log/messages

# 创建安全的共享目录
mkdir /team-share
chgrp team /team-share
chmod 2770 /team-share    # SGID + 组读写
chmod +t /team-share      # Sticky Bit
```

通过合理使用特殊权限和隐藏属性，可以大大提高 Linux 系统的安全性和管理效率。
