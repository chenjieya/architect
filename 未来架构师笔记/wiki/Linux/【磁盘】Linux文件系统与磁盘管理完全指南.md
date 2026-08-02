---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---

## 1. 一、文件系统详解

### 1.1 文件系统基础概念

#### 1.1.1 节点和块

- **块(Block)**：文件系统的最小存储单位

  - 小文件较多的应用：建议使用较小的块大小
  - 存储大容量文件：建议使用较大的块大小
  - **超级块(Superblock)**：文件系统起始位置的块，记录整个文件系统的信息

- **Inode 和 Block 的关系**
  - **Inode**：存储文件属性信息，并记录文件内容所在的块位置
  - **Block**：实际存储文件内容，对于目录则存储文件关联性信息

**查看文件系统信息命令：**

```bash
dumpe2fs /dev/sda1
```

### 1.2 文件读取机制

文件读取过程遵循以下步骤：

1. 从根目录获取文件上层目录的 inode
2. 通过目录记录的关联性获取目标文件的 inode
3. 定位文件属性和数据存储位置
4. 权限验证通过后，读取对应块中的内容

### 1.3 文件删除原理

文件删除实际上是删除文件的指针信息，而非立即清除数据块内容。这使得数据恢复成为可能：

- 前提：没有新数据写入覆盖原有数据块
- 原理：重新建立数据连接关系

### 1.4 磁盘空间满的问题

**模拟实验：**

```bash
# 创建小分区并测试
mkfs.ext3 -N 20 /dev/sdb1
dumpe2fs /dev/sdb1
dd if=/dev/zero of=n bs=1K count=1

# 查看磁盘使用情况
df -h      # 查看磁盘空间使用
df -ih     # 查看inode使用情况
```

### 1.5 主流文件系统比较

| 特性             | ext2      | ext3      | ext4       | XFS        |
| ---------------- | --------- | --------- | ---------- | ---------- |
| **Inode 大小**   | 128 字节  | 128 字节  | 256 字节   | -          |
| **文件系统最大** | 16TB      | 16TB      | 1EB        | 18EB       |
| **单个文件最大** | 2TB       | 2TB       | 16TB       | 9EB        |
| **日志功能**     | 无        | 有        | 有(可关闭) | 有         |
| **索引方式**     | blockmaps | blockmaps | extents    | B+树       |
| **修复工具**     | fsck      | fsck      | fsck       | xfs_repair |

**XFS 文件系统修复：**

```bash
xfs_repair -L /dev/sda1
```

## 2. 二、磁盘管理实战

### 2.1 分区基础

#### 2.1.1 MBR 分区结构

- **MBR(Master Boot Recorder)**：位于硬盘第 0 磁道
  - 前 446 字节：系统引导程序
  - 中间 64 字节：分区表信息
  - 最多支持 4 个主分区

#### 2.1.2 分区类型

- **主分区**：最多 4 个
- **扩展分区**：3P+1E 模式中的 1E
- **逻辑分区**：在扩展分区内创建

### 2.2 分区操作

**查看磁盘信息：**

```bash
fdisk -l    # 查看分区信息
df -h       # 查看挂载情况
```

**分区管理：**

```bash
fdisk /dev/sdc   # 进入分区管理界面
```

### 2.3 文件系统格式化与挂载

**格式化命令：**

```bash
mkfs.ext2 /dev/sdc1
mkfs.ext3 /dev/sdc1
mkfs.ext4 /dev/sdc1
mkfs.ext4 -L "firstp" /dev/sdc1  # 指定标签格式化
```

**挂载操作：**

```bash
mount /dev/sdc1 /mnt              # 设备挂载
mount -L firstp /mnt              # 标签挂载
umount /dev/sdc1                  # 卸载设备
umount /mnt                       # 卸载目录
```

### 2.4 磁盘相关命令

```bash
fdisk -l           # 查看磁盘和分区
du -sh 目录名       # 查看目录实际大小
mount -a           # 挂载/etc/fstab中的所有配置
```

### 2.5 自动挂载配置

**/etc/fstab 文件格式：**

```
UUID=60ab619d-0db0-4d74-9951-c7bd3f67ed85 /data ext4 defaults 0 0
```

**查看 UUID 方法：**

```bash
# ext文件系统
tune2fs -l /dev/sdb2
dumpe2fs /dev/sdb2

# XFS文件系统
xfs_admin -u /dev/sdb1
lsblk --fs /dev/sdb1
```

### 2.6 文件系统修复

**文件系统只读时的处理：**

```bash
# 卸载设备
umount /dev/sdc1

# ext文件系统修复
fsck -c -y /dev/sdc1

# XFS文件系统修复
xfs_repair -L /dev/sda1
```

**重要提醒**：根文件系统修复请在急救模式下进行，避免数据丢失。

## 3. 三、交换分区管理

### 3.1 交换分区概念

交换分区(Swap)用于扩展物理内存，当内存紧张时将不常用数据交换到磁盘。分区 ID 为 0x82。

### 3.2 交换分区管理命令

```bash
swapon /dev/vda1        # 激活交换分区
swapoff /dev/vda1       # 取消激活
swapon -a               # 激活fstab中的所有swap
swapon -s               # 查看已激活的swap
```

### 3.3 自动挂载配置

**/etc/fstab 配置示例：**

```
/dev/vgsrv/swap2 swap swap defaults 0 0
```

### 3.4 增加交换分区

**方法一：使用分区**

```bash
# 创建swap分区
fdisk /dev/sdc  # 设置类型为82
mkswap /dev/sdc1
swapon /dev/sdc1
```

**方法二：使用文件**

```bash
# 创建swap文件
dd if=/dev/zero of=/tmp/swap bs=10M count=100
mkswap /tmp/swap
swapon /tmp/swap
```

**验证结果：**

```bash
free -m  # 查看内存和swap使用情况
```

## 4. 四、磁盘管理练习

### 4.1 练习要求：

1. 利用剩余空间创建三个分区（1G、100M、32M）
2. 将 1G 分区设置为开机自动挂载到/data 目录
3. 使用 32M 分区模拟 inode 空间满的情况

### 4.2 参考步骤：

```bash
# 1. 创建分区
fdisk /dev/sdc  # 创建三个分区

# 2. 格式化并设置自动挂载
mkfs.ext4 /dev/sdc1  # 1G分区
echo "UUID=$(blkid -s UUID -o value /dev/sdc1) /data ext4 defaults 0 0" >> /etc/fstab
mkdir /data
mount -a

# 3. 模拟inode满的情况
mkfs.ext3 -N 20 /dev/sdc3  # 32M分区，限制inode数量
mount /dev/sdc3 /mnt/test
# 创建大量小文件直到inode耗尽
```

## 5. 五、LVM 磁盘管理

### 5.1 LVM 基本概念

**LVM 组成：**

- **物理卷(PV)**：标记为 LVM 的分区，类型 0x8e
- **卷组(VG)**：一个或多个 PV 的集合
- **逻辑卷(LV)**：VG 的虚拟分区
- **物理区域(PE)**：分配的最小存储单元

### 5.2 LVM 创建步骤

```bash
# 1. 创建物理卷
pvcreate /dev/sdb1 /dev/sdc1
pvscan
pvdisplay

# 2. 创建卷组
vgcreate vgname /dev/sdb1 /dev/sdc1
vgcreate -s 8M vgname /dev/sdb1  # 指定PE大小
vgdisplay

# 3. 创建逻辑卷
lvcreate -L 800M -n data0 vgname    # 指定大小
lvcreate -l 200 -n data0 vgname     # 指定PE数量
lvdisplay

# 4. 格式化并挂载
mkfs.ext4 /dev/vgname/data0
mkdir /data0
mount /dev/vgname/data0 /data0
```

### 5.3 LVM 扩展

```bash
# 1. 检查当前状态
df -h /data0
vgdisplay vgname

# 2. 扩展物理卷（如需要）
pvcreate /dev/sdd1
vgextend vgname /dev/sdd1

# 3. 扩展逻辑卷
lvextend -l +20 /dev/vgname/data0    # 增加20个PE
# 或者
lvextend -L +1G /dev/vgname/data0    # 增加1G空间

# 4. 扩展文件系统
# ext文件系统
resize2fs -p /dev/vgname/data0

# XFS文件系统（RHEL 8+）
xfs_growfs /data0
```

### 5.4 LVM 缩小

```bash
# 1. 卸载文件系统
umount /data0

# 2. 检查文件系统
e2fsck -f /dev/vgname/data0

# 3. 调整文件系统大小
resize2fs -p /dev/vgname/data0 512M

# 4. 调整逻辑卷大小
lvreduce -L 512M /dev/vgname/data0

# 5. 重新挂载
mount -a
```

### 5.5 LVM 快照

```bash
# 1. 创建快照
lvcreate -s -n snap_data0 -L 20M /dev/vgname/data0

# 2. 挂载快照（如需要）
mkdir /snapmount
mount -o ro /dev/vgname/snap_data0 /snapmount

# 3. 查看快照状态
lvs /dev/vgname/snap_data0

# 4. 删除快照
umount /snapmount
lvremove /dev/vgname/snap_data0
```

## 6. 总结

本文详细介绍了 Linux 文件系统和磁盘管理的各个方面，从基础概念到高级的 LVM 管理，涵盖了日常系统管理中最常用的技术和命令。掌握这些知识对于 Linux 系统管理员至关重要，能够有效管理存储资源，确保系统的稳定运行。

通过实践练习和深入理解每个概念，你将能够熟练处理各种磁盘管理和文件系统相关的问题，为构建稳定高效的 Linux 系统打下坚实基础。
