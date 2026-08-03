---
author: ai
ai_editable: true
summary: 'Linux 中"定时任务"就是让系统在指定时间自动执行某条命令或脚本。最常见、功能最强大的是 crontab（周期性任务，如"每天凌晨 3 点备份"），另外还有一个轻量…'
refs:
  pages: []
  raw:
    - path: "raw/operations-linux/10. crontab周期性任务/10、crontab周期性任务.md"
      sha256: a6751e5d7e5bc589e2883c056eb18925b99cf3264ddeda7d928b04c6a1a5ae32
updated_by: ai
updated: 2026-08-03
---

## 1. 定时任务概述

Linux 中"定时任务"就是**让系统在指定时间自动执行某条命令或脚本**。最常见、功能最强大的是 **crontab**（周期性任务，如"每天凌晨 3 点备份"），另外还有一个轻量的 **at**（一次性任务，如"2 小时后执行一次"）。

两者适用场景对比：

| 工具    | 场景           | 例子             |
| ------- | -------------- | ---------------- |
| crontab | 周期性重复执行 | 每天、每周、每月 |
| at      | 只执行一次     | 今晚 11 点关机   |

---

## 2. crontab 周期性任务

### 2.1 crond 服务管理

crontab 要能工作，后台必须有 **crond** 这个守护进程在运行。

```bash
# 老式写法（service 命令）
service crond {start|stop|status|reload|restart}

# 新式写法（systemd，推荐）
systemctl start crond.service      # 启动
systemctl stop crond.service       # 停止
systemctl status crond.service     # 查看状态
systemctl restart crond.service    # 重启
systemctl reload crond.service     # 重新加载配置（不中断运行）
```

> **实战判断**：写完定时任务却发现不执行，第一步永远是 `systemctl status crond` 确认服务是否在运行。

### 2.2 crontab 常用命令

`crontab` 命令用来管理"当前用户"的定时任务表（每个用户都有自己的任务表）：

```bash
crontab -e    # 编辑当前用户的定时任务（打开后会进入 vim）
crontab -l    # 列出当前用户的定时任务
crontab -r    # 删除当前用户的所有定时任务
crontab -u 用户名   # 指定操作用户（一般只有 root 用）
```

示例：

```bash
$ crontab -l
# 我的第一个任务：每天 2:30 备份数据库
30 2 * * * /root/backup_db.sh

# root 查看普通用户 tom 的任务
$ crontab -u tom -l
```

> 系统把每个用户的定时任务存在 `/var/spool/cron/用户名` 文件里，`crontab -e` 实际就是编辑这个文件。

### 2.3 crontab 时间格式（五列 + 命令）

```
分  时  日  月  星期  命令
```

从左到右共 6 部分，前 5 列是时间，第 6 列是"要执行的命令"：

| 列      | 含义         | 取值范围                      |
| ------- | ------------ | ----------------------------- |
| 第 1 列 | 分钟         | 0 ～ 59                       |
| 第 2 列 | 小时         | 0 ～ 23                       |
| 第 3 列 | 日期         | 1 ～ 31                       |
| 第 4 列 | 月份         | 1 ～ 12                       |
| 第 5 列 | 星期         | 0 ～ 7（0 和 7 都代表星期天） |
| 第 6 列 | 要执行的命令 | -                             |

**各列都支持特殊符号**：

- `*` 任意值（每一分钟/每小时/每天）
- `,` 列举多个值，如 `1,15,30 分`
- `-` 范围，如 `9-18 点`
- `/` 间隔，如 `*/5` 表示每 5 分钟

常用写法示例：

```bash
# 每分钟执行一次
* * * * * command

# 每小时的 5 分和 35 分各执行一次
5,35 * * * * command

# 每天 2 点 30 分执行
30 2 * * * command

# 每天上午 9 点到 18 点，每 2 小时执行一次
0 9-18/2 * * * command

# 每周一、周三、周五的凌晨 0 点执行
0 0 * * 1,3,5 command

# 每月 1 号 5 点执行
0 5 1 * * command
```

> **最小周期是每分钟**。需要更细的粒度（每 10 秒、20 秒）时，crontab 本身做不到，见下文 2.6 的替代方案。

### 2.4 谁能用 crontab（allow / deny 白名单黑名单）

系统通过两个文件控制"哪些用户允许使用 crontab"：

```bash
/etc/cron.allow    # 白名单：写在里面的用户才被允许
/etc/cron.deny     # 黑名单：写在里面的用户被拒绝
```

规则：

- **allow 优先级高于 deny**
- 两个文件只要存在一个即可生效
- 两个都不存在时，**只有 root 能使用 crontab**
- 默认一般只存在 `/etc/cron.deny`（通常为空），表示"除了黑名单，其他人都可以用"

```bash
# 禁止用户 tom 使用 crontab
$ echo "tom" >> /etc/cron.deny

# 只允许 root 和 ops 使用
$ cat /etc/cron.allow
root
ops
```

### 2.5 任务到底有没有执行？（日志与恢复）

#### 2.5.1 查看执行痕迹

所有 crontab 任务的执行记录都会写入 `/var/log/cron`：

```bash
$ tail -20 /var/log/cron
Aug  2 02:30:01 localhost CROND[1234]: (root) CMD (/root/backup_db.sh)
Aug  2 03:00:01 localhost CROND[5678]: (root) CMD (/usr/sbin/ntpdate)
```

> 当有人质疑你的脚本"到底跑没跑"时，就看这个日志，一查便知。

#### 2.5.2 从日志恢复任务

如果误删了 crontab 任务，可以从日志里找回执行的命令。但**长周期任务（如每月的任务）日志里可能没有最近记录，无法完整恢复**。

更稳妥的做法是**养成备份习惯**：定时任务都保存在 `/var/spool/cron/用户名`，备份这个文件即可：

```bash
# 备份 tom 的定时任务
cp /var/spool/cron/tom /root/cron_tom.bak

# 恢复：把备份内容写回
crontab /root/cron_tom.bak
```

### 2.6 系统自带的 crontab（/etc/crontab）

系统层面还有一个全局的定时任务文件 `/etc/crontab`，与用户的 crontab 不同：它比用户的多一列 **用户名**（指定任务以谁的身份执行），并使用 **run-parts** 机制调度目录中的脚本：

```bash
$ cat /etc/crontab
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
HOME=/

# run-parts：自动执行目录下的所有脚本
01 * * * * root run-parts /etc/cron.hourly      # 每小时
02 4 * * * root run-parts /etc/cron.daily       # 每天 4:02
22 4 * * 0 root run-parts /etc/cron.weekly      # 每周日 4:22
42 4 1 * * root run-parts /etc/cron.monthly     # 每月 1 号 4:42
```

> 想加一个"每天执行"的脚本？直接把脚本放进 `/etc/cron.daily/` 目录，系统到点自动跑，无需自己写时间。

#### 2.6.1 实现更小周期（每 10 秒 / 20 秒）

crontab 最小粒度只有 1 分钟，要执行更频繁的任务（比如每 10 秒探活一次），常见两种做法：

**方案一：shell 循环 + sleep**

```bash
#!/bin/bash
# check_10s.sh
while true; do
    /root/check_status.sh   # 要每 10 秒执行的命令
    sleep 10
done
```

再配合 crontab 每 1 分钟启动一次该脚本：

```bash
* * * * * /root/check_10s.sh
```

**方案二：配合 systemd timer**（更规范，适合生产）

用 systemd 的 `timer` 单元，最小可以精确到秒级，这里不作展开。

---

## 3. 一次性任务 at

`at` 适合"只执行一次"的场景，由 **atd** 服务支撑。

### 3.1 atd 服务管理

```bash
systemctl restart atd.service   # 启动
systemctl stop atd.service      # 停止
systemctl status atd.service    # 查看状态
```

### 3.2 指定时刻执行

```bash
# 在指定时刻运行，输入命令后按 Ctrl+D 结束输入
$ at 15:10 2024-06-01
warning: commands will be executed using /bin/sh
at> echo "数据库清理完成" >> /var/log/clean.log
at> <EOT>          # 按 Ctrl+D
job 3 at Mon Jun  1 15:10:00 2024
```

### 3.3 指定多久后执行

```bash
# 2 分钟后执行
$ at now +2 minutes

# 1 小时后执行
$ at now +1 hour

# 明天下午 3 点
$ at 15:00 tomorrow
```

### 3.4 查看与删除任务

```bash
atq              # 查看还未执行的任务（列出作业号）
atrm 作业号       # 删除指定作业
```

```bash
$ atq
3       Mon Jun  1 15:10:00 2024 a root
$ atrm 3
$ atq     # 已无输出，任务已删除
```

---

## 4. 练习巩固

1. 为 root 配置 crontab：**每周一、周三、周五的 4、5、6、8 点整**，执行 `date >> /tmp/dbrecover.log`。
2. 新建一个用户 `cronuser`，分别写入 `/etc/cron.allow` 和 `/etc/cron.deny`，测试：该用户能否编写第 1 题中的 crontab 任务？（结合 allow/deny 优先级思考）

> 第 1 题参考答案：`0 4,5,6,8 * * 1,3,5 date >> /tmp/dbrecover.log`
