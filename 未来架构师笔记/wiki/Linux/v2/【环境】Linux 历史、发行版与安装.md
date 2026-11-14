---
author: ai
ai_editable: true
summary: '从 Unix 到 Linux 发行版，讲清内核与发行版的区别、Debian 与 RHEL 两大家族，并完整走一遍虚拟机创建、Rocky Linux 安装与 SSH 首次连接。'
refs:
  pages:
    - 【导言】Linux 基础与运维学习地图
    - 【命令】Linux 基础核心与网络命令
    - 【网络】计算机网络基础
    - 虚拟机基础事项
  raw:
    - path: raw/linux-core/02-05. Linux环境/课件.md
      sha256: dc1a4b79db0601bcfae10f9837f3ec0b61488e5dac3278547e642eed2c44cc6e
updated_by: ai
updated: 2026-11-14
---

## 1. 概述

这篇先讲清 Linux 从哪来、内核和发行版是什么关系，再动手装一台 Rocky Linux 虚拟机，最后用 SSH 从自己的电脑连上去。装好这台机器，后面所有实验都在它上面做。

## 2. Linux 的历史

### 2.1 Unix 打底

- 1969 年，贝尔实验室的 Ken Thompson、Dennis Ritchie 等人开发了 **Unix**，稳定、强大，后来成为大型机和工作站上的主流系统。
- 但 Unix **收费、不开源**。1980 年代开始商业化授权，价格很贵，原来大学里可以研究的源码也不再公开。

### 2.2 Linux 诞生

- **1991 年**，芬兰赫尔辛基大学的学生 **Linus Torvalds**（当时 21 岁）不满意 Minix，利用业余时间写了一个内核，并把消息发到网上，**邀请大家一起改**。
- 名字来自 **Linus + Unix**。
- 1992 年起采用 **GPL 协议**：任何人都可以免费使用、修改、再发布，但改过之后也必须继续开放源码。
- **GNU 的工具 + Linux 内核 = 一套完整可用、免费开源的操作系统。**

> 一个业余项目，没有被公司关起来，而是开放源码让全世界的程序员一起改，最终成了今天的 Linux。

### 2.3 从内核到发行版

内核只是核心，普通人直接用并不方便。于是有人把内核、命令行工具、软件包管理器打包起来，做成**发行版**：

- 1993 年 **Debian**，1994 年前后 **Red Hat Linux**，2004 年 **Ubuntu**；
- 2000 年代初，Red Hat 推出面向企业、提供收费支持的 **RHEL**，基于它的免费版本 **CentOS** 在服务器上非常流行；
- 2008 年，**Android** 基于 Linux 内核发布，Linux 走进手机；
- 2020 年 CentOS 调整方向，社区又做出了 **Rocky Linux**，也就是本系列使用的系统。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629052_01-linux-timeline.png)

_Linux 发展时间线_

**Linux 用在哪？**

- 网站、App 背后的服务器
- 云服务器（阿里云、腾讯云、AWS 等）
- 手机 Android（底层是 Linux 内核）
- 路由器、智能电视、车载系统
- 超级计算机
- Docker、Kubernetes

**服务器为什么偏爱它？**

| 优点       | 通俗一点说                                   |
| ---------- | -------------------------------------------- |
| 免费、开源 | 不用买授权，出了问题还能看源码               |
| 稳定       | 一台服务器连续跑几个月、几年不重启很正常     |
| 省资源     | 不需要花哨的桌面，内存和 CPU 全留给程序      |
| 安全       | 权限管得严，漏洞出来后修补得快               |
| 好远程管理 | 一根网线、一个命令行，就能管理千里之外的机器 |

## 3. 内核与发行版

- **Linux 只是内核**：管 CPU、内存、硬盘、网络、进程。
- **发行版 = 内核 + 命令行工具 + 软件包管理器 + 默认配置**，打包给大家用。
- 平时说的“Linux 系统”，其实都指某个发行版。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629053_02-kernel-distro.png)

_内核与发行版的关系_

**两大家族：**

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629054_03-distro-family.png)

_Debian 系与 RHEL 系_

| 家族      | 代表                           | 装软件 | 常见场景               |
| --------- | ------------------------------ | ------ | ---------------------- |
| Debian 系 | Debian、Ubuntu                 | `apt`  | 个人、开发、互联网公司 |
| RHEL 系   | RHEL、Rocky、AlmaLinux、CentOS | `dnf`  | 银行、电信、传统企业   |

两个家族的核心知识（文件、进程、权限、服务、网络）通用，区别主要在三处：

| 区别               | Debian 系（以 Ubuntu 为例） | RHEL 系（以 Rocky 为例）    |
| ------------------ | --------------------------- | --------------------------- |
| 装软件的命令       | `apt`                       | `dnf`                       |
| 默认的安全设置     | AppArmor、ufw 防火墙        | SELinux、firewalld 防火墙   |
| 部分配置文件的位置 | 软件源：`/etc/apt/`         | 软件源：`/etc/yum.repos.d/` |

## 4. 安装虚拟机

虚拟机是一款软件，它虚拟出一台“电脑”，共享宿主机的硬件。你在这台虚拟电脑里学命令、装软件、部署项目，**怎么折腾都不会影响真实电脑**，是学习 Linux 的首选方式。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629055_05-vm.png)

_虚拟机与宿主机共享硬件_

| 你的电脑            | 虚拟化软件                             | 网址                       |
| ------------------- | -------------------------------------- | -------------------------- |
| Windows / Intel Mac | VirtualBox（免费）                     | https://www.virtualbox.org |
| Windows             | VMware Workstation（收费、免费 30 天） | https://www.vmware.com     |
| 苹果 M 系列 Mac     | UTM                                    | https://mac.getutm.app     |
| 苹果 M 系列 Mac     | Parallels Desktop                      | https://www.parallels.com  |

**建议配置（一台）：**

| 系统        | CPU  | 内存 | 磁盘  |
| ----------- | ---- | ---- | ----- |
| Rocky Linux | 4 核 | 8 GB | 40 GB |

- 8 GB 是分给虚拟机的，你自己的电脑建议 16 GB 或以上；内存不够时先给 4 GB。
- 做危险操作前先**拍快照**，改坏了可以回到原来的状态。
- 苹果 M 系列芯片必须用 **ARM 版**镜像。

**新建虚拟机时这样填：**

| 设置项   | 填什么                                                |
| -------- | ----------------------------------------------------- |
| 名称     | `rocky`                                               |
| 系统类型 | Linux，Red Hat Enterprise Linux 9 64 位               |
| 安装镜像 | 选择下载好的 Rocky ISO                                |
| 内存     | 8192 MB                                               |
| CPU      | 4 核                                                  |
| 硬盘     | 40 GB，动态分配（用多少占多少，不会一下子占满 40 GB） |
| 网络     | NAT                                                   |

## 5. 安装 Rocky Linux

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629057_04-centos-rocky.png)

_从 CentOS 到 Rocky Linux_

- 早期服务器系统大多是 **CentOS**。
- 2020 年底，CentOS 官方宣布不再维护传统的 CentOS Linux。
- 之后社区做出了 **Rocky Linux**：免费、兼容 RHEL、社区维护。

**为什么选 Rocky？**

| 原因         | 说明                                    |
| ------------ | --------------------------------------- |
| 企业里用得多 | RHEL 系在银行、电信、传统企业里大量使用 |
| 贴近生产环境 | 默认开着防火墙（firewalld）和 SELinux   |
| 稳定         | 同一个大版本能用好几年                  |

### 5.1 下载 ISO

- 官网下载页：https://rockylinux.org/download
- 国内镜像站（阿里云）：https://mirrors.aliyun.com/rockylinux/

| 你的电脑            | 选择的架构     |
| ------------------- | -------------- |
| Windows / Intel Mac | x86_64         |
| 苹果 M 系列 Mac     | aarch64（ARM） |

ISO 常见类型：

| 类型    | 说明                     | 用吗       |
| ------- | ------------------------ | ---------- |
| Minimal | 最小安装，体积小         | **用这个** |
| DVD     | 完整版，包含更多软件     | 不用       |
| Boot    | 只有引导，安装时联网下载 | 不用       |

### 5.2 安装步骤

启动虚拟机，选择 **Install Rocky Linux** 进入安装向导。**磁盘不分区**，直接使用整块磁盘。

| 步骤                               | 选什么                                    | 说明                           |
| ---------------------------------- | ----------------------------------------- | ------------------------------ |
| 1 语言                             | English（United States）                  | 报错信息是英文，方便搜索       |
| 2 时区                             | Asia / Shanghai                           |                                |
| 3 磁盘（Installation Destination） | 选中 40 GB 磁盘，存储配置选 **Automatic** | 自动使用整块盘，不手动分区     |
| 4 软件（Software Selection）       | **Minimal Install**                       | 没有图形界面，省资源           |
| 5 网络（Network & Host Name）      | 打开网络开关，主机名填 `rocky`            | 后面装软件、远程连接都要联网   |
| 6 root 密码                        | 设置一个密码                              | 平时不用 root 登录，但必须设置 |
| 7 创建用户                         | 用户名 `ops`，勾选“设为管理员”            | 这样 `ops` 可以用 `sudo`       |
| 8 开始安装                         | 点击 Begin Installation                   | 等待安装完成                   |
| 9 重启                             | 点击 Reboot System，并**移除安装镜像**    | 否则会再次进入安装界面         |

## 6. 远程连接

真实服务器没有屏幕，都是**远程连接**。远程连接用 **SSH**：本地敲命令 → 服务器执行 → 结果传回来。

| 你的电脑        | 怎么用                                            |
| --------------- | ------------------------------------------------- |
| macOS           | 打开“终端”，直接用 `ssh`                          |
| Windows 10 / 11 | 打开 Windows Terminal 或 PowerShell，直接用 `ssh` |

先检查本机有没有 SSH 客户端：

```bash
ssh -V
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629058_image-20261028153846225.png)

_`ssh -V` 的输出_

也可以用图形工具（任选）：

| 工具             | 平台          | 网址                                                |
| ---------------- | ------------- | --------------------------------------------------- |
| Windows Terminal | Windows       | https://learn.microsoft.com/zh-cn/windows/terminal/ |
| Tabby            | Windows / Mac | https://tabby.sh                                    |
| MobaXterm        | Windows       | https://mobaxterm.mobatek.net                       |

### 6.1 第一次连接

先在虚拟机窗口里查看 IP：

```bash
ip a
```

找到网卡下 `inet` 那一行，例如 `192.168.56.10`。然后从自己的电脑连接：

```bash
ssh 用户名@服务器IP
ssh ops@192.168.56.10
```

- 第一次连接会问是否信任主机，输入 `yes`。
- 输入密码时**屏幕不显示字符，这是正常的**。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631629059_06-prompt.png)

_读懂命令行提示符_

> 平时用普通用户，不直接用 root。需要管理员权限时，在命令前加 `sudo`。

登录后确认系统版本：

```bash
cat /etc/os-release
```

看到 `NAME="Rocky Linux"` 就说明连对了。

## 7. 命令速查

```bash
ip a                     # 查看网卡和 IP
ssh -V                   # 查看 SSH 客户端版本
ssh 用户@IP               # 远程登录
cat /etc/os-release      # 查看发行版信息
```

## 8. 相关页面

- [[【导言】Linux 基础与运维学习地图]]：这一版的学习路线与实验约定
- [[【命令】Linux 基础核心与网络命令]]：登录服务器后马上要用的命令
- [[【网络】计算机网络基础]]：SSH 连不上时，按网络分层排查
- [[虚拟机基础事项]]：v1 中的虚拟机资源配置笔记
- [[【SSH】Linux SSH 服务管理与配置详解]]：v1 中更完整的 SSH 服务端配置
