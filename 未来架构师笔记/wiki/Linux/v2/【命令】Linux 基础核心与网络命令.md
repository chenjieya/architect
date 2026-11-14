---
author: ai
ai_editable: true
summary: 'Linux 日常操作全览：目录与文件、搜索、打包、dnf/rpm、进程与服务、权限、SSH 传输，以及 ping/curl/ss/防火墙的排查套路。'
refs:
  pages:
    - 【环境】Linux 历史、发行版与安装
    - 【Shell】Shell 脚本入门与命令组合
    - 【性能】系统资源与性能排查
    - 【网络】计算机网络基础
    - 【命令】Linux 常用命令总结
    - 【权限】用户和组以及权限
    - 【软件包】软件和包管理
    - 【进程】系统状态和进程管理
  raw:
    - path: raw/linux-core/06-17. Linux命令/课件.md
      sha256: 7bbeaa0e5eb39cf61940b2184f042e259e3b80c44cce398ae8d4b853febc721a
updated_by: ai
updated: 2026-11-14
---

## 1. 概述

这篇把服务器上最常用的命令串成一条线：先认清目录，再学会看、找、改文件，然后处理软件、进程、服务、权限，最后用网络命令定位“为什么访问不了”。命令不用背，重点记住**什么时候该用哪一类**。

## 2. 目录结构

Linux 里**一切从 `/`（根）开始**，没有 C 盘、D 盘：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652101_11-dir-tree.png)

_Linux 目录结构_

> 找配置去 `/etc`，找日志去 `/var/log`，练习都在家目录 `~`。

## 3. 命令的通用格式

所有命令基本是同一个格式：

```bash
命令  [选项]  [参数]
ls  -l  /var/log
```

- **命令**：`ls`，要做什么；
- **选项**：`-l`，怎么做（短选项一个横线，长选项两个横线，如 `--help`）；
- **参数**：`/var/log`，对谁做。

忘了怎么用，不用背：

```bash
ls --help       # 输出简短用法
man ls          # 完整手册：按 q 退出，按 /关键字 搜索
```

## 4. 查看文件

先准备练习数据。后面都在 `~/lab` 里做，里面有日志、配置文件和各种大小的文件：

```bash
bash lab-init.sh
```

练坏了，再执行一次就恢复了。

### 4.1 pwd 与 cd

```bash
pwd                 # 我在哪
cd /var/log         # 去绝对路径（从 / 开头）
cd lab              # 去相对路径（相对当前位置）
cd ..               # 回上一级
cd -                # 回到上一次所在的位置
cd ~                # 回家目录
```

> 写脚本时尽量用**绝对路径**，因为脚本运行时的“当前位置”不一定是你以为的那里。

### 4.2 ls

```bash
cd ~/lab
ls -lah             # 最常用：详细列表 + 隐藏文件 + 大小易读
ls -lt              # 按修改时间排序，新的在前
ls -lS              # 按大小排序，大的在前
```

```text
total 28K
drwxr-xr-x 7 ops ops 4.0K Oct 22 11:00 .
drwx------ 5 ops ops 4.0K Oct 22 11:00 ..
drwxr-xr-x 4 ops ops 4.0K Oct 22 11:00 app
drwxr-xr-x 2 ops ops 4.0K Oct 22 11:00 backup
drwxr-xr-x 3 ops ops 4.0K Oct 22 11:00 data
drwxr-xr-x 3 ops ops 4.0K Oct 22 11:00 nginx
drwxr-xr-x 2 ops ops 4.0K Oct 22 11:00 scripts
```

`ls -l` 每一行从左到右依次是：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652104_41-ls-l.png)

_`ls -l` 每一列的含义_

> 权限那一列后面单独讲；链接数可以先不管。

### 4.3 cat 与 tail

```bash
cat app/conf/app.conf
```

```text
# order-service 配置
server.port=8080
db.host=127.0.0.1
db.port=3306
db.user=app
db.password=ChangeMe123
redis.host=127.0.0.1
redis.port=6379
log.level=INFO
```

**`cat` 只适合短文件。** 几千行的日志用 `cat` 只会刷屏。另外，`cat /etc/os-release` 可以确认系统版本。

> 配置里有**明文密码**。真实项目里密码不该这样放，后续会讲配置与密钥的管理方式。

```bash
tail -n 50 app/logs/app.log     # 看最后 50 行（不写 -n 默认 10 行）
tail -F app/logs/app.log        # 持续追踪新增内容，Ctrl + C 退出
```

```text
$ tail -n 3 app/logs/app.log
2026-10-21 09:13:19 [INFO] order-service - request handled ok
2026-10-21 09:13:20 [INFO] order-service - request handled ok
2026-10-21 09:59:59 [ERROR] order-service - OutOfMemoryError: Java heap space
```

最后一行报了 `OutOfMemoryError`：Java 堆内存不够。**日志的最后几行，往往就是答案。**

> `-F` 和 `-f` 都能追踪，区别是日志被切割、换了文件之后，`-F` 仍能继续追踪，**生产上推荐 `-F`**。

## 5. 搜索内容

日志几千行、配置文件几十个，肉眼找不到，让命令来找。

### 5.1 grep

> 在**文件内容**中搜索。

```bash
grep "ERROR" 文件              # 显示含 ERROR 的行
grep -c ERROR 文件             # 只统计有多少行
grep -n ERROR 文件             # 带上行号
grep -r "关键字" 目录          # 递归搜索目录下所有文件
```

```bash
$ grep -c ERROR app/logs/app.log
44

$ grep -n OutOfMemory app/logs/app.log
801:2026-10-21 09:59:59 [ERROR] order-service - OutOfMemoryError: Java heap space

$ grep -r "password" app
app/conf/app.conf:db.password=ChangeMe123
```

其他常用选项：`-i` 忽略大小写，`-v` 反向（只留不含关键字的行）。用到时 `grep --help` 查。

**`grep` 常和管道 `|` 一起用。** 管道把前一个命令的输出交给后一个命令继续处理：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652106_12-pipe.png)

_管道：前一个命令的输出成为后一个命令的输入_

```bash
tail -n 1000 app/logs/app.log | grep ERROR
```

### 5.2 find

> 按**文件特征**找文件。

```bash
find ~/lab -name "*.tmp"            # 按名字找（通配符要加引号）
find ~/lab -type f -size +10M       # 大于 10MB 的文件
find ~/lab -mtime +7                # 7 天前修改的
```

```bash
$ find ~/lab -name "*.tmp"
/home/ops/lab/data/uploads/cache_1.tmp
/home/ops/lab/data/uploads/cache_2.tmp
/home/ops/lab/data/uploads/cache_3.tmp

$ find ~/lab -type f -size +10M
/home/ops/lab/data/uploads/big.bin
```

**怎么选？** 知道的是文件里的**内容**，想找哪个文件、哪一行 → `grep`；知道的是文件的**名字、大小、时间** → `find`。

这一节只查不删。批量删除在下一节，并且要“先查后删”。

## 6. 文件操作

### 6.1 创建、复制、移动

```bash
mkdir -p a/b/c                  # 连父目录一起建，已存在也不报错
touch 文件                      # 新建空文件（已存在则更新时间）
cp 源 目标                      # 复制文件
cp -r 目录 目标                 # 复制目录（目录必须加 -r）
mv 源 目标                      # 移动；移到同目录的新名字就是重命名
```

```bash
mv data/uploads/"my notes.txt" data/uploads/notes.txt
```

> 文件名里有空格，要加**引号**，否则会被当成两个文件。

### 6.2 删除

```bash
rm 文件              # 删除文件
rm -r 目录           # 删除目录及里面所有内容
```

**Linux 没有回收站，删了就没了。** 批量删除要“先查后删”：

```bash
find ~/lab/data/uploads -name "*.tmp"          # 先看有哪些
rm ~/lab/data/uploads/*.tmp                    # 确认无误再删
find ~/lab/data/uploads -name "*.tmp"          # 再确认，没有输出
```

### 6.3 修改文件

最小安装的 Rocky 可能没有 nano，先安装：

```bash
sudo dnf install -y nano
nano app/conf/app.conf
```

最少记住两个快捷键：**`Ctrl + O` 回车保存，`Ctrl + X` 退出**。

> 服务器上也常见 `vim`。不要求熟练，只要知道**误入 vim 时，按 `Esc`，输入 `:q!` 回车，可以放弃修改并退出**。

**改配置的标准动作：**

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652107_13-config-flow.png)

_备份 → 修改 → 对比 → 回滚_

```bash
cp app/conf/app.conf app/conf/app.conf.bak        # 1 备份
nano app/conf/app.conf                            # 2 修改
diff app/conf/app.conf.bak app/conf/app.conf      # 3 对比（没有输出代表一样）
cp app/conf/app.conf.bak app/conf/app.conf        # 4 不对，回滚
```

## 7. 打包与解压

最小化安装可能没有 `tar`：

```bash
sudo dnf install -y tar
```

常用选项：

```text
c : create    创建
v : verbose   显示详细信息
z : gzip      使用 gzip 压缩
f : file      指定文件名
x : extract   解包、解压
```

```bash
tar -cvf aa.tar aa.txt bb.txt cc.txt        # 打包
tar -xvf aa.tar                             # 解包到当前目录

tar -zcvf aa.tar.gz aa.txt bb.txt cc.txt    # 打包并压缩
tar -zxvf aa.tar.gz                         # 解压到当前目录
tar -zxvf aa.tar.gz -C /目标目录             # 解压到指定目录
```

## 8. 软件包管理

### 8.1 dnf

RHEL 系用 `dnf` 装软件，它会自动处理依赖：

```bash
sudo dnf install -y nginx       # 安装（-y 自动确认）
sudo dnf remove nginx           # 卸载
dnf search 关键字               # 搜索
dnf provides iostat             # 查某个命令由哪个包提供
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652108_21-dnf-repos.png)

_软件源（仓库）是软件包的来源_

### 8.2 rpm

`rpm` 也能安装，但**不会主动解决依赖**，这点不如 `dnf`。日常重点掌握它的**查询**功能：

```bash
rpm -qa | grep nginx        # 系统装了哪些包
rpm -ql nginx               # 这个包把文件装到了哪里（找配置文件、服务文件）
```

## 9. 进程与服务

一个程序跑起来就是一个**进程**；把进程交给系统统一管理，就是**服务**。

### 9.1 ps

```bash
ps aux                  # 显示所有进程
ps aux | grep java      # 在所有进程里找某个程序
```

`ps aux` 输出很多列，常看这四列：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652109_44-ps-aux.png)

_`ps aux` 常看的四列_

> 用 `grep` 过滤 `ps` 时，`grep` 自己也会出现在结果里。写成 `grep [s]shd` 可以避开它。

### 9.2 kill

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652111_22-kill-signals.png)

_`kill` 的两种常用信号_

```bash
sleep 1000 &        # 启动一个进程，暂停 1000 秒，& 表示后台执行

kill PID            # SIGTERM(15)：客气地请它退出，它可以先收尾
kill -9 PID         # SIGKILL(9)：强制杀死，没有收尾机会
```

**先 `kill`，等几秒还在，再 `kill -9`。不要对数据库用 `kill -9`**：没保存的数据会丢，不能回滚，还可能造成数据损坏。

### 9.3 systemctl

```bash
sudo systemctl status sshd       # 看状态（最常用）
sudo systemctl start sshd        # 启动
sudo systemctl stop sshd         # 停止
sudo systemctl restart sshd      # 重启
```

`status` 的输出很长，只看三处：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652112_42-systemctl-status.png)

_`systemctl status` 最该看的三处_

### 9.4 journalctl

```bash
sudo journalctl -u sshd -n 50              # 服务最近 50 行日志
sudo journalctl -u sshd -f                 # 实时追踪服务日志
sudo journalctl -u sshd --since "10 min ago"   # 最近 10 分钟
sudo journalctl -p err                     # 整个系统的错误级别日志
```

**服务出问题，三步查：**

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652114_23-service-3steps.png)

_状态 → 日志 → 配置/环境_

## 10. 权限与用户

`Permission denied` 是 Linux 里最常见的报错。这一节让你读懂它，并且知道怎么改对。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652115_24-permission.png)

_读懂权限字符串_

`r`、`w`、`x` 对文件和目录的含义不同：

- **`r` 读**：文件能看内容；目录能 `ls` 列出里面的东西。
- **`w` 写**：文件能修改；目录能在里面新建、删除文件。
- **`x` 执行**：文件能当程序运行；目录能 `cd` 进去。

### 10.1 chmod

```bash
chmod 755 文件      # 属主 rwx，其他人 r-x（脚本、程序、目录）
chmod 644 文件      # 属主 rw-，其他人 r--（普通配置、网页文件）
chmod 600 文件      # 只有属主能读写（私钥、含密码的文件）
chmod +x 文件       # 加上执行权限
```

### 10.2 chown

```bash
sudo touch aa.txt                   # 用 sudo 创建，属主是 root:root
echo hello > aa.txt                 # 用普通用户操作：Permission denied
sudo chown ops:ops aa.txt           # 修改属主和属组
echo hello > aa.txt                 # 成功
```

### 10.3 sudo

```bash
sudo 命令        # 以管理员身份执行这一条命令
sudo -l          # 看看我能 sudo 做哪些事
```

为什么不直接用 root？**留有记录**（谁在什么时候做了什么）、**更不容易出错**（每次提权都要确认）、**符合最小权限**。

> 能执行 `sudo` 的用户，在 Rocky 里属于 `wheel` 组（安装时勾选“设为管理员”就加进去了）。

### 10.4 遇到 Permission denied，别用 777

- ✗ `chmod -R 777 目录`：报错消失了，但整个目录对所有人敞开，原来的权限也丢了，**不可接受**。
- ✓ 找到进程的运行用户，把 `chown` 改对。
- ✓ 只给需要的权限（`755`、`644`），遵循最小权限。

## 11. 远程登录与文件传输

### 11.1 查看 IP 与 SSH 登录

```bash
ip a
```

```text
2: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    inet 192.168.56.10/24 brd 192.168.56.255 scope global dynamic noprefixroute ens160
```

`inet` 后面的 `192.168.56.10` 就是虚拟机的 IP。

```bash
ssh ops@192.168.56.10        # 登录
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652116_34-ssh-key.png)

_SSH 密钥认证示意_

### 11.2 scp 传输文件

```bash
scp aa.txt ops@192.168.56.10:/tmp/          # 上传到服务器 /tmp/
scp ops@192.168.56.10:/tmp/aa.txt .         # 下载到当前目录
```

## 12. 网络排查命令

网络原理在其他系列已经讲过，这里只讲服务器上最常用的几个排查命令。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652117_31-net-layers.png)

_按分层定位问题：链路、IP、端口、服务_

### 12.1 ping

```bash
ping -c 4 127.0.0.1
```

`-c 4` 表示只发 4 次（不加会一直发，`Ctrl + C` 停止）。

```text
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.040 ms
...
--- 127.0.0.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3070ms
```

`4 received, 0% packet loss`：发 4 个、收到 4 个，通。

### 12.2 curl

```bash
curl http://localhost            # 取回页面内容
curl -I http://localhost         # 只看响应头
curl -v http://localhost         # 显示连接、请求、响应的完整过程
```

```text
$ curl -I http://localhost
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
...
```

`200 OK` 说明服务正常、有响应。访问没人监听的端口会报错：

```text
$ curl http://127.0.0.1:9999
curl: (7) Failed to connect to 127.0.0.1 port 9999 after 0 ms: Couldn't connect to server
```

### 12.3 ss：谁在监听哪个端口

```bash
sudo ss -tlnp
```

选项：

```text
t : tcp
l : listening  只看正在监听的
n : numeric    端口用数字显示
p : process    显示进程（需要 sudo）
```

```text
State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
LISTEN  0       128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=912,fd=3))
LISTEN  0       511     0.0.0.0:80          0.0.0.0:*          users:(("nginx",pid=1236,fd=6))
LISTEN  0       5       127.0.0.1:8090      0.0.0.0:*          users:(("python3",pid=2410,fd=3))
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652118_43-ss-output.png)

_`ss -tlnp` 只盯 Local Address 这一列_

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652118_32-listen-addr.png)

_监听地址决定谁能访问_

上面的输出里，22 和 80 监听在 `0.0.0.0`，外面能访问；8090 监听在 `127.0.0.1`，**只有本机能访问**。

### 12.4 防火墙 firewalld

Rocky 默认开着 firewalld：**除了明确放行的，其他全部拦住。** 端口是服务器的“门牌号”（SSH 是 22，网站是 80），放行就是允许外面的人从这个门进来。

```bash
sudo firewall-cmd --state                              # 防火墙是否运行
sudo firewall-cmd --list-all                           # 放行了哪些服务和端口
sudo firewall-cmd --permanent --add-port=8088/tcp      # 永久放行 8088
sudo firewall-cmd --reload                             # 重新加载，让规则生效
sudo firewall-cmd --permanent --remove-port=8088/tcp   # 取消放行
```

> `--permanent` 写进永久配置，必须 `--reload` 才生效。

**不要为了省事关掉防火墙**（`systemctl stop firewalld`）。学习环境可以试，生产环境不要。

### 12.5 综合示例：为什么外面访问不了

启动一个只监听本机的服务：

```bash
python3 -m http.server 8090 --bind 127.0.0.1 &     # & 放到后台
curl -I http://localhost:8090                       # 本机能访问
sudo ss -tlnp | grep "8090"                         # 看到监听在 127.0.0.1
```

从自己的电脑访问 `http://虚拟机IP:8090` 不通，原因是只监听了 `127.0.0.1`。改成监听所有网卡：

```bash
kill %1                                            # 先停掉后台服务
python3 -m http.server 8090 --bind 0.0.0.0 &       # 监听所有网卡
```

可能**还是不通**，这次是防火墙拦住了：

```bash
sudo firewall-cmd --permanent --add-port=8090/tcp
sudo firewall-cmd --reload
```

再访问就成功。练完收尾：

```bash
kill %1
sudo firewall-cmd --permanent --remove-port=8090/tcp
sudo firewall-cmd --reload
```

**访问失败时，按报错判断原因：**

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631652119_33-refused-timeout.png)

_立刻拒绝 vs 一直超时_

```text
Connection refused       机器到了，没人接：服务没启动，或没监听这个端口 → 用 ss -tlnp 看
Connection timed out     没有回应：被防火墙拦了 → 用 firewall-cmd --list-all 看
```

## 13. 命令速查

```bash
# 查看
pwd / cd / ls -lah / cat / tail -F
# 搜索
grep -rn 关键字 目录            grep -c ERROR 文件
find 目录 -name "*.tmp"          find 目录 -type f -size +10M
# 文件操作
mkdir -p a/b/c   touch   cp -r   mv   rm -r
# 打包
tar -zcvf x.tar.gz 文件...       tar -zxvf x.tar.gz -C 目录
# 软件
sudo dnf install -y 包           dnf provides 命令
rpm -qa | grep 包                rpm -ql 包
# 进程与服务
ps aux | grep 程序               kill PID / kill -9 PID
sudo systemctl status/start/stop/restart 服务
sudo journalctl -u 服务 -n 50 / -f
# 权限
chmod 755/644/600 文件           chmod +x 文件
sudo chown 用户:组 文件          sudo -l
# 网络
ip a                             ssh 用户@IP
scp 文件 用户@IP:/路径            ping -c 4 目标
curl -I URL                      sudo ss -tlnp
sudo firewall-cmd --list-all     sudo firewall-cmd --permanent --add-port=端口/tcp
```

## 14. 相关页面

- [[【环境】Linux 历史、发行版与安装]]：装好机器、配好 SSH
- [[【Shell】Shell 脚本入门与命令组合]]：把这一篇里的命令组合成脚本
- [[【性能】系统资源与性能排查]]：CPU、内存、磁盘、句柄的进一步排查
- [[【网络】计算机网络基础]]：理解 IP、端口、监听地址背后的原理
- [[【命令】Linux 常用命令总结]]：v1 中的命令分类汇总
- [[【权限】用户和组以及权限]]：v1 中更完整的用户、组与特殊权限
- [[【软件包】软件和包管理]]：v1 中的 RPM 与软件源细节
- [[【进程】系统状态和进程管理]]：v1 中的进程与服务管理补充
