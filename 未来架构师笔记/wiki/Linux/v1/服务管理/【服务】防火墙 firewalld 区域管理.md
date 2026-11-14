---
author: ai
ai_editable: true
summary: 'FirewallD 通过把网络划分成不同区域，每个区域有不同的信任级别，实现不同的访问控制策略。'
refs:
  pages:
    - '【服务】Samba 文件共享详解'
  raw:
    - path: 'raw/operations-services/3. linux运维-防火墙/3. 防火墙.md'
      sha256: ccf6cf994f1b150bdc51663b3dcf9060db1b618ad4defba7557614b711280184
updated_by: ai
updated: 2026-08-03
---

## 1. 防火墙服务管理

> 虚拟机里如何初始化关闭 firewalld，见 [[虚拟机基础事项]]。

```bash
systemctl enable firewalld.service   # 设置开机启动
systemctl start firewalld.service    # 开启服务
systemctl status firewalld           # 查看状态
```

## 2. 区域（Zone）管理

FirewallD 通过把网络划分成不同**区域**，每个区域有不同的信任级别，实现不同的访问控制策略。

### 2.1 区域说明

| 区域     | 信任级别 | 说明                                           |
| -------- | -------- | ---------------------------------------------- |
| block    | 全部阻止 | 任何传入网络包都被阻止                         |
| dmz      | 中       | 隔离区（非军事区），内外网之间的缓冲层         |
| drop     | 全部丢弃 | 任何传入连接都被拒绝                           |
| external | 中       | 不信任，仅接受指定连接                         |
| home     | 高       | 信任网络上的其他计算机                         |
| internal | 高       | 信任网络上的其他计算机                         |
| public   | 低       | **默认区域**，不信任任何计算机，仅接受指定连接 |
| trusted  | 最高     | 接受所有连接                                   |
| work     | 高       | 信任网络上的其他计算机                         |

> **FirewallD 的默认区域是 public**。

### 2.2 区域操作命令

```bash
firewall-cmd --get-zones            # 显示支持的区域列表
firewall-cmd --list-all-zones       # 查看所有区域信息
firewall-cmd --get-default-zone     # 查看默认区域
firewall-cmd --set-default-zone=home   # 设置默认区域为 home
firewall-cmd --get-active-zones     # 查看当前活动区域
firewall-cmd --zone=public --list-all  # 显示 public 区域所有配置
```

### 2.3 服务管理

```bash
firewall-cmd --get-services                  # 查看内置服务列表（FTP/Samba/TFTP 等）
firewall-cmd --list-services                 # 查看当前已放行的服务
firewall-cmd --permanent --zone=internal --add-service=http   # 添加 http 到 internal 区域
firewall-cmd --reload                        # 重载防火墙（不改变状态）
```

### 2.4 端口管理

```bash
firewall-cmd --add-port=443/tcp              # 临时打开 443/TCP 端口
firewall-cmd --permanent --add-port=3690/tcp # 永久打开 3690/TCP 端口
firewall-cmd --reload                        # 永久规则需要 reload 生效
firewall-cmd --list-all                      # 查看已添加的端口
```

> **重点**：`--permanent` 表示永久生效；不加 `--permanent` 是临时生效，**一旦 reload 临时规则就失效**。所以永久规则必须配 `--reload`，临时规则不要 reload。

## 3. 小结

| 操作         | 命令                                           |
| ------------ | ---------------------------------------------- |
| 查看区域列表 | `firewall-cmd --get-zones`                     |
| 放行服务     | `firewall-cmd --permanent --add-service=http`  |
| 放行端口     | `firewall-cmd --permanent --add-port=3690/tcp` |
| 生效永久规则 | `firewall-cmd --reload`                        |
| 查看当前配置 | `firewall-cmd --list-all`                      |

> 与 SELinux、iptables 一起构成 Linux 安全三件套，配置服务时要**三处都放行**。相关见 [[【服务】Samba 文件共享详解]] 中的系统权限提醒。

> **关联页**：放行 HTTP 端口配 [[【服务】Apache 服务管理与虚拟主机|Apache]]，放行文件传输端口配 [[【服务】FTP 服务 vsftpd 详解|FTP/Samba]]。
