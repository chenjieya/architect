---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
在日常运维或开发工作中，经常需要使用一些基础的 Linux 命令来进行系统管理、文件操作、网络调试等。本文对常见命令进行了整理，方便查阅。

## 帮助与手册（man 和 help）

Linux 命令记不住怎么办？系统自带两套帮助体系：

```bash
# 1. man 手册：查看命令的完整使用手册
man cp

# 2. --help 参数：查看命令的简要帮助（比 man 更简练）
cp --help

# 3. /usr/share 目录：存放系统自带的所有帮助文档
ls /usr/share

# 4. 查看配置文件/设备的手册（非命令，如 DNS 配置文件）
man resolv.conf
```

**man 手册翻页操作：** 空格/PageDown 向下翻页、`/关键字` 搜索、`q` 退出。

**源代码编译安装的软件，man 帮助也要单独指定路径**（编译到非默认目录时）：

```bash
# 方式一：临时指定手册路径
man -M /usr/local/ntfs-3g/share/man ntfs-3g

# 方式二：写入全局配置，永久生效
# 编辑 /etc/man_db.config，添加一行：
#   MANDATORY_MANPATH /usr/local/ntfs-3g/share/man
man ntfs-3g
```

## 文件与目录基础操作

### 1. 复制 cp

```bash
cp 源文件/目录 目标文件/目录
cp -r 目录A 目录B    # 拷贝目录时必须加 -r（递归）
```

### 2. 查看文件内容

```bash
cat 文件       # 全部内容一次性输出
less 文件      # 分页查看，支持上下翻页（q 退出）
more 文件      # 分页查看（只能向下翻）
tail 文件      # 看尾部（默认最后 10 行）
head 文件      # 看头部（默认前 10 行）
vim 文件       # 进入编辑器查看
```

### 3. 移动/重命名 mv

```bash
mv 源 目标      # 移动，或改名字（目标不存在时就是重命名）
```

> 思考题：同一个目录下已经有文件 `test`，还能创建同名目录吗？

### 4. 创建目录 mkdir

```bash
mkdir 目录名            # 创建单个目录
mkdir -p /a/b/c        # 穿透式创建：a、b、c 都不存在也能一次建好
mkdir {a,b}            # 花括号批量创建两个目录 a 和 b
```

### 5. 创建空文件 touch

```bash
touch 文件名    # 文件不存在则创建，存在则更新时间戳
touch "my file.txt"   # 文件名含空格时，记得加引号或转义
```

### 6. 显示当前路径 pwd

```bash
pwd    # 显示当前所在目录的绝对路径
```

### 7. 删除 rm

```bash
rm 文件           # 删除文件
rm -r 目录        # 删除目录（递归）
rm -v 文件        # 显示删除过程
rm -i 文件        # 删除前逐一确认
rm -rf 目录       # 强制递归删除（危险！）

# 海量小文件删除（如邮件队列 /var/spool/clientmqueue/）
ls | xargs rm -rvf
```

> **安全建议**：删除时先进到目标路径再删，尽量不用绝对路径直接删，避免误删系统文件。

### 8. 列出文件 ls

```bash
ls        # 列出当前目录
ls -a     # 显示所有文件（含隐藏文件，点开头）
ll        # 等价 ls -l（ll 是别名命令，man ll 查不到帮助）
```

### 9. 别名 alias

```bash
# 定义别名（临时，仅当前 shell 生效）
alias tttt='echo "别名命令"'

# 永久生效：写入家目录下的 ~/.bashrc
echo "alias ll='ls -l'" >> ~/.bashrc
source ~/.bashrc
```

### 10. 切换目录 cd

```bash
cd 目录
cd .       # 一个点：当前目录
cd ..      # 两个点：上一层目录
cd -       # 一个减号：上一次的工作目录
cd ~       # 波浪号：当前用户家目录
cd /etc    # 绝对路径：以 / 开头
```

**通配符：**

- `*`：匹配任意字符（0 个或多个）
- `?`：匹配任意一个字符

```bash
ls *.txt    # 列出所有 .txt 结尾的文件
ls file?    # 匹配 file1、fileA 这种单字符后缀
```

---

## 一、系统管理

### 关机命令

```bash
poweroff                 # 立即关机
init 0                   # 切换运行级别 0（关机）
shutdown -h now          # 立刻关机
shutdown -h +10          # 10 分钟后关机
halt                     # 停止系统
```

### 重启命令

```bash
reboot                   # 立即重启
init 6                   # 切换运行级别 6（重启）
shutdown -r now          # 立刻重启
shutdown -r +5           # 5 分钟后重启
```

---

## 二、网络管理

### 网卡重启

```bash
# 老版命令（基于 ifconfig）
ifdown ens34 && ifup ens34
# 新版命令（基于 NetworkManager）
nmcli c down ens34 && nmcli c up ens34
```

### 查看路由表

```bash
route          # 查看路由表
route -n       # 数字形式显示路由表
```

### 查看访问某个 IP 走的路由

`ip route get 192.168.1.6`

示例输出：

- **192.168.1.6**：要访问的 IP
- **via 192.168.1.1**：下一跳网关
- **dev ens33**：通过网卡 ens33 出口
- **src 192.168.0.110**：网卡的本机 IP

  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202509081339851.png)

### 网卡配置文件

`/etc/sysconfig/network-scripts/ifcfg-网卡名`

---

## 三、vim 编辑器常用命令

### 配置文件路径

- 用户配置文件：`~/.vimrc`
- 全局配置文件：`/etc/vimrc`

### 移动

- `gg` —— 回到第一行
- `:number` —— 跳转到指定行
- `G` —— 回到最后一行
- `0` —— 行首
- `$` —— 行尾

### 复制 / 粘贴

- `yy` —— 复制一行
- `y${n}y` —— 复制多行
- `p` —— 粘贴到光标行后
- `P` —— 粘贴到光标行前

### 删除

- `dd` —— 删除当前行（剪切）
- `D` —— 删除光标后的内容

### 可视化模式

- `v` —— 进入可视化模式

### 撤销

- `u` —— 撤销操作

### 查找替换

`:1,$ s/内容/替换成的内容/g`

### 其他

- `:r 文件路径` —— 将另一个文件内容写入到当前文件
- `:w 文件名` —— 文件另存为
- `:set paste` —— 保持粘贴的格式

---

## 四、文件操作与监控

### 查看文件内容

```bash
tail -n 10 filename        # 查看最后 10 行
tail -n 1 -f filename      # 实时监控文件最后 1 行
head -n 10 filename        # 查看前 10 行
```

### 文件信息

```bash
file 文件名                # 查看文件类型
stat 文件名                # 查看文件详细信息
```

### 磁盘与目录大小

```bash
du -sh 目录                # 查看目录大小
df -h                      # 查看磁盘挂载情况
```

---

## 五、压缩与解压

### 使用 tar 打包压缩

```bash
# 打包压缩（.gz 或 .bz2）
tar -zcvpf 压缩包名.tar.gz 源文件/目录
tar -jcvpf 压缩包名.tar.bz2 源文件/目录

# 解压缩
tar -zxvpf 压缩包名.tar.gz -C 输出目录
tar -jxvpf 压缩包名.tar.bz2 -C 输出目录

# 查看压缩包内文件
tar tvf 压缩包.tar.bz2

# 仅解压压缩包内的某个文件
tar -jxvpf 压缩包.tar.bz2 etc/pnpm2paa.conf

# 打包时排除指定文件/目录（注意：--exclude 要放在源路径之前）
tar -jcvpf etc.tar.bz2 --exclude=etc/sysconfig --exclude=etc/hosts /etc

# 从压缩包中恢复指定文件
tar -jxvpf etc.tar.bz2 etc/passwd etc/shadow
```

### 使用 gzip 压缩

```bash
gzip -9 文件名        # 压缩文件（会删除原文件）
gzip -r 目录名        # 递归压缩目录
```

---

## 六、管道与文本处理

### 管道符

`|`：前面命令的输出作为后面命令的输入。

### grep（过滤）

```bash
grep "关键字" 文件
grep -v "关键字" 文件              # 反选
grep -i "关键字" 文件              # 忽略大小写
grep -r "内容" ./                 # 在目录下递归搜索
grep -o "pass=......" 文件名      # 匹配键值对
cat xxx | grep -A 5 -B 5 abc     # 显示匹配结果及上下文
```

组合用法：

```bash
grep 127.0.0.1 | grep 192.168.0.1   # 并且
egrep "127.0.0.1|192.168.0.1"       # 或者
```

### sort

```bash
sort file.txt            # 默认按字典序排序
sort -n file.txt         # 按数值大小排序
sort -r file.txt         # 逆序排序
sort -u file.txt         # 去重排序（unique）

sort -k 2 file.txt       # 按第 2 列排序
sort -t ":" -k 3 file.txt # 指定分隔符 ":"，按第 3 列排序

sort -c file.txt         # 检查是否已排序
sort -cn file.txt        # 检查排序并输出未排序行
```

**更多参数：**

- `-f`：忽略大小写
- `-b`：忽略行首的空白字符
- `-M`：按月份名排序（如 JAN、FEB、DEC）
- `-n`：按数字大小排序（不指定时默认按第一个字符排序）
- `-r`：反向排序（默认从小到大）
- `-u`：去重，等价于 `uniq`
- `-t`：指定分隔符（默认是 Tab）
- `-k`：按第几个字段排序

```bash
# 组合示例：按 passwd 文件第 3 列（UID）数字排序
cat /etc/passwd | sort -t ":" -k 3 -n
```

### uniq（去重）

`uniq` 去除**相邻**的重复行（所以通常先 `sort` 再 `uniq`）：

```bash
# 原文件 /tmp/t2
aa
bb
bb
cc
cc
bb
bb
dd

# 只看相邻去重：cc 只去一次，但 bb 出现两次（不相邻）
cat t2 | uniq
# 输出：aa bb cc bb dd

# 先排序再去重：真正的全量去重
cat t2 | sort | uniq

# -c 计数：显示每行出现次数
cat t2 | sort | uniq -c
#      1 aa
#      4 bb
#      2 cc
#      1 dd
```

> 统计"访问最多的 IP"就是经典的 `sort | uniq -c | sort -rn` 组合。

### wc（统计）

```bash
wc -l 文件    # 统计多少行
wc -w 文件    # 统计多少单词
wc -m 文件    # 统计多少字符

cat /tmp/t2 | wc -l    # 8 行
```

**经典实践：日志分析**（统计 apache 日志中访问最多的前 10 个 IP）：

```bash
# 取第 1 列（IP）→ 排序 → 去重计数 → 按次数从大到小排序 → 取前 10
awk '{print $1}' apache.log | sort | uniq -c | sort -rn | head -10
```

### awk

`awk` 按行处理文本，并按列切分字段（默认分隔符为空格或制表符）。

```bash
awk '{print $1}' file.txt        # 打印第一列
awk '{print $1,$3}' file.txt     # 打印第1列和第3列
awk -F ":" '{print $1}' /etc/passwd  # 指定分隔符为 ":"
```

### cut

```bash
cut -c 1-5 file.txt        # 提取每行的第1到第5个字符
cut -c 3 file.txt          # 提取每行的第3个字符

cut -d ":" -f1 file.txt    # 指定分隔符 ":"，提取第1列
cut -d ":" -f1,3 file.txt  # 提取第1和第3列
cut -d ":" -f2-4 file.txt  # 提取第2到第4列
```

---

## 七、总结

本文整理了 Linux 中常用的 **系统管理、网络配置、Vim 编辑、文件操作、压缩解压、文本处理** 等命令。  
掌握这些命令，可以极大提高日常运维和开发效率。

## 八、管道练习

1. 对 `apache.log` 日志进行分析：找出**访问最多的前 10 个 IP**、出现的次数，由多到少排序。

   ```bash
   # 提示：apache 日志格式每行第 1 列是客户端 IP
   awk '{print $1}' apache.log | sort | uniq -c | sort -rn | head -10
   ```

2. 通过管道方式取出本机 IP 地址（`192.168.` 开头的地址）。

   ```bash
   # 提示：ifconfig/ip addr 输出中过滤出 192.168 开头的地址
   ip addr | grep -o "192\.168\.[0-9.]*" | head -1
   ```

