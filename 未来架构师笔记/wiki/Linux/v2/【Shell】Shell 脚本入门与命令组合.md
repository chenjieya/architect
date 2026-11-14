---
author: ai
ai_editable: true
summary: 'Shell 脚本入门：Shebang、变量与引号、脚本参数、环境变量、退出码，if/for/while、函数、重定向与管道、awk 文本处理，以及 bash -n/-x 调试。'
refs:
  pages:
    - 【命令】Linux 基础核心与网络命令
    - 【导言】Linux 基础与运维学习地图
    - 【Shell】Shell 变量与数据类型
    - 【Shell】Shell 流程控制与函数
    - 【Shell】Shell 参数与退出信号
    - 【Shell】sed 与 awk 详解
  raw:
    - path: raw/linux-core/22-32. Shell脚本/课件.md
      sha256: 64c540fcaa5115717f67afa75ddfb42828130ca70420ad48e856b8b456cdb1ca
updated_by: ai
updated: 2026-11-14
---

## 1. 概述

前面已经会在终端里敲 `ls`、`pwd`、`df -h`。这一篇把这些命令写进文件，加上变量、判断、循环和函数，变成可以重复执行的 **Shell 脚本**。重点不是背语法，而是读懂脚本、写出能自检的基础脚本。

## 2. 终端、Shell 与 Bash

- **终端（Terminal）**：输入命令、查看输出的界面。
- **Shell**：命令解释器，负责解析命令、展开变量、执行内置命令或启动外部程序。
- **Bash**：一种常见的 Shell，Rocky Linux 中经常使用。
- **Shell 脚本**：把一组命令和判断、循环等逻辑写进文件，交给 Shell 执行。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631671641_01-shell-and-terminal.png)

_终端、Bash 与命令之间的关系_

**为什么运维要学？** 假设每天都要检查磁盘空间、确认 SSH 服务是否正常、执行备份。每次手动敲多个命令容易遗漏；写成脚本就能重复运行，还能交给定时任务或 CI/CD 流水线调用。

先在终端里观察：

```bash
pwd              # 查看当前目录
whoami           # 查看当前用户名
echo "$SHELL"    # 查看登录 Shell，输出 /bin/bash 说明用的是 Bash
bash --version   # 查看 Bash 版本
```

## 3. 第一个脚本

目标：让脚本自动输出问候语和当天日期。用编辑器创建 `hello.sh`：

```bash
#!/usr/bin/env bash
# 第一个 Shell 脚本
name="Rocky"
echo "你好，$name"
echo "今天是：$(date +%F)"
```

**逐行读：**

1. `#!/usr/bin/env bash`：称为 **Shebang**。直接执行文件时，系统根据它选择 Bash 解释器。也可以写成 `#!/usr/bin/bash` 或 `#!/bin/bash`。
2. `# 第一个 Shell 脚本`：注释；第一行 Shebang 是特殊用法。
3. `name="Rocky"`：给变量 `name` 赋值。**等号两侧不能有空格。**
4. `echo "你好，$name"`：输出文字，并把 `$name` 替换为变量值。
5. `$(date +%F)`：先执行 `date +%F`，再把输出的日期插入这行文字，这叫**命令替换**。

先用 Bash 运行：

```bash
bash hello.sh
```

```text
你好，Rocky
今天是：2026-11-02
```

也可以加执行权限后直接运行：

```bash
chmod +x hello.sh
./hello.sh
```

- `chmod +x`：添加执行权限。
- `./`：明确指出运行**当前目录**下的文件，而不是从 `PATH` 找同名命令。
- `bash hello.sh`：由 Bash 读取脚本，通常不要求脚本自身有执行权限；`./hello.sh` 则需要权限和可用解释器。

**常见错误**：写成 `name = "Rocky"` 时，Bash 会把 `name` 当命令尝试执行。遇到 `Permission denied`，先检查文件权限，不要直接用 `sudo` 掩盖问题。

## 4. 变量与引号

> 为什么要写 `"$name"`？

```bash
name="Rocky Linux"
echo "$name"
echo '$name'
```

```text
Rocky Linux
$name
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631671642_02-quotation-comparison.png)

_双引号与单引号的输出差异_

- **双引号**：允许 `$name` 等变量展开，输出变量值。
- **单引号**：`$name` 按原样输出，不做变量展开。

为什么强调双引号？看这个变量：

```bash
file="/var/tmp/my report.txt"
printf '%s\n' "$file"
```

`file` 的值包含空格。`"$file"` 通常能让它作为一个完整参数传给命令；不加引号，很多情况下会被拆成多个参数。**操作路径时优先写 `"$变量"`。**

## 5. 脚本参数

每次要问候的人不同，不必改脚本，可以让运行者传入参数。创建 `args.sh`：

```bash
#!/usr/bin/env bash
echo "脚本名称：$0"
echo "第一个参数：${1:-未提供}"
echo "参数个数：$#"
```

```bash
bash args.sh Alice
```

```text
脚本名称：args.sh
第一个参数：Alice
参数个数：1
```

- `$0`：脚本的调用名称；用 `bash args.sh` 运行时通常显示 `args.sh`。
- `$1`：第一个位置参数；`$2` 是第二个，以此类推。
- `$#`：传入的位置参数数量。
- `${1:-未提供}`：第一个参数未设置或为空时，使用“未提供”。

再运行 `bash args.sh`，第一个参数变成“未提供”、个数变成 0。**这就是同一个脚本根据外部输入完成不同工作的基本思路。**

## 6. 环境变量

`name="Rocky"` 是当前 Shell 的普通变量。如果这个 Shell 启动另一个程序，那个程序能读到它吗？默认不能。

```bash
APP_ENV="test"
echo "$APP_ENV"          # test
bash -c 'echo "$APP_ENV"'   # 空行：子进程读不到未导出的变量
export APP_ENV
bash -c 'echo "$APP_ENV"'   # test
```

过程：

1. `APP_ENV=test`：在当前 Shell 中赋值；
2. `export APP_ENV`：标记为导出；
3. `bash -c ...`：创建子 Bash，子进程继承导出的环境变量。

也可以一步写成 `export APP_ENV=test`。

## 7. 退出码

命令执行结束时有退出状态码（Exit Status）：通常 `0` 表示成功，非零表示失败或其他非成功状态。**判断成功与否，不能只看终端有没有输出。**

```bash
ls /tmp
echo "$?"        # 0

ls /not_exist_for_demo
echo "$?"        # 非零（GNU ls 常见为 2）

true;  echo "$?"   # 0
false; echo "$?"   # 1
```

`$?` 表示**上一条命令**的退出状态。注意：

```bash
false
echo "Hello"
echo "$?"     # 0，因为 echo 成功了，覆盖了上一条的状态
```

需要保留退出码，要立刻保存：

```bash
false
status=$?
echo "退出码：$status"   # 1
```

**运维意义**：`if` 根据退出状态选择分支；CI/CD 流水线也根据每一步的退出码决定成功或失败。

## 8. if 条件判断

成绩达到 60 分才算合格：

```bash
#!/bin/bash
score=85
if [ "$score" -ge 60 ]; then
    echo "合格"
else
    echo "不合格"
fi
```

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631671643_03-if-branch.png)

_if 的两条执行路径_

1. `score=85`：定义数字变量。
2. `[ "$score" -ge 60 ]`：判断是否大于等于 60，条件成立时返回状态 0。
3. `then`：条件成立时执行。
4. `else`：条件不成立时执行。
5. `fi`：结束 if 结构。

把 `score` 改成 `50`，输出 `不合格`。

**特别注意**：`[` 本质上是一个命令，`[`、`]` 周围要留空格；`-ge` 是整数比较，不是普通字符串比较。

| 写法          | 作用                 |
| ------------- | -------------------- |
| `-eq` / `-ne` | 整数相等 / 不相等    |
| `-gt` / `-ge` | 大于 / 大于等于      |
| `-lt` / `-le` | 小于 / 小于等于      |
| `-f "文件"`   | 判断普通文件是否存在 |
| `-d "目录"`   | 判断目录是否存在     |
| `-z "字符串"` | 判断字符串是否为空   |

```bash
if [ -d /var/log ]; then
    echo "日志目录存在"
fi
```

**很多运维脚本先判断路径是否存在，再进行后续操作。**

## 9. for 循环

```bash
for item in A B C; do
    echo "当前：$item"
done
```

```text
当前：A
当前：B
当前：C
```

- `for item in A B C`：依次把 A、B、C 赋给 `item`；
- `do` 到 `done`：每次重复执行的内容。

**运维案例：检查两个服务是否处于 active 状态。**

```bash
#!/bin/bash
for service in sshd crond; do
    if systemctl is-active --quiet "$service"; then
        echo "[OK] $service"
    else
        echo "[WARN] $service"
    fi
done
```

1. 第一次循环 `service=sshd`，第二次 `service=crond`。
2. `systemctl is-active --quiet "$service"`：查询服务是否 active；`--quiet` 不打印普通状态，主要用**退出码**表达结果。
3. `if` 根据退出码判断：成功显示 `[OK]`，非成功显示 `[WARN]`。
4. `done` 结束循环。`if` 的结束标志是 `fi`，不要弄混。

输出示例（取决于系统实际状态）：

```text
[OK] sshd
[WARN] crond
```

`[WARN]` 只表示**当前不是 active**，还可能是服务未安装、服务名不同，不能立即断言故障。可以用 `systemctl status` 进一步确认。

## 10. while 循环

不知道要重复多少次，而是根据条件决定是否继续时，用 `while`：

```bash
#!/bin/bash
n=1
while [ "$n" -le 3 ]; do
    echo "第 $n 次"
    n=$((n + 1))
done
```

```text
第 1 次
第 2 次
第 3 次
```

- 初始 `n=1`；
- `[ "$n" -le 3 ]`：只要 `n` 小于等于 3 就继续；
- `n=$((n + 1))`：每次加 1，否则可能死循环。

**怎么选？** 知道有一组对象要逐个处理，用 `for`；要一直等待条件变化（例如服务启动），用 `while`。

## 11. 函数

脚本里多处需要“当前时间 + 消息”，每次复制不方便。**函数就是给一段可重复使用的代码起个名字。**

### 11.1 定义与调用

```bash
#!/bin/bash
log() {
    echo "[$(date +%T)] $1"
}

log "开始检查"
log "检查结束"
```

```text
[14:20:01] 开始检查
[14:20:02] 检查结束
```

- `log() { ... }`：定义函数，函数体放在 `{}` 内；
- `log "开始检查"`：调用函数并传参；
- 函数内部的 `$1`：本次函数调用的第一个参数，与脚本参数区分开；
- `$(date +%T)`：取当前时分秒。

### 11.2 return 返回状态码

> `return` 只适合返回状态码（0～255）。

```bash
#!/bin/bash
check_dir() {
    if [ -d "$1" ]; then
        return 0
    else
        return 1
    fi
}

if check_dir /tmp; then
    echo "目录存在"
else
    echo "目录不存在"
fi
```

- `check_dir /tmp`：把 `/tmp` 传给函数，函数里的 `$1` 就是 `/tmp`；
- `-d`：判断参数是否是目录（directory）；
- `return 0` 成功，`return 1` 失败；
- `if check_dir /tmp`：直接根据函数返回状态选择分支。

**不要混淆**：`return` 结束当前函数，`exit` 结束当前脚本或 Shell 进程。Shell 的 `return 30` 表示状态码 30，不等于 C 语言里把整数 30 返回给调用者。

### 11.3 local 局部变量

> 防止覆盖函数外的同名变量。

```bash
#!/bin/bash
name="Rocky"
hello() {
    local name="Linux"
    echo "$name"
}
hello
echo "$name"
```

```text
Linux
Rocky
```

`local name="Linux"` 声明函数内部的局部变量：函数内打印 `Linux`，外面保留 `Rocky`。函数多时，`local` 能减少变量互相影响。

### 11.4 用 echo + 命令替换“返回数据”

```bash
#!/bin/bash
add() {
    local a="$1"
    local b="$2"
    echo $((a + b))
}

result=$(add 10 20)
echo "计算结果：$result"
```

```text
计算结果：30
```

- `$((...))` 叫**算术展开**：把括号里的内容当数学表达式求值，再把结果替换到原位置；`echo $((a+b))` 等价于 `echo 30`。
- 外层的 `$(...)` 叫**命令替换**：执行 `add 10 20`，把命令打印到 stdout 的所有内容捕获下来，赋给 `result`。
- **`echo` 负责把数据“生产”到 stdout，`$(...)` 负责“消费”stdout 并变成变量值。**

## 12. 标准输入输出

| 编号 | 名称             | 通俗解释                 |
| ---- | ---------------- | ------------------------ |
| `0`  | stdin，标准输入  | 程序通常从这里读输入     |
| `1`  | stdout，标准输出 | 程序通常把正常结果写这里 |
| `2`  | stderr，标准错误 | 程序通常把错误信息写这里 |

## 13. 重定向

让输出写进文件：

```bash
echo "第一次" > /var/tmp/demo.txt
echo "第二次" >> /var/tmp/demo.txt
cat /var/tmp/demo.txt
```

```text
第一次
第二次
```

- `>`：把标准输出写入文件，原有内容通常会被**覆盖**；
- `>>`：追加到文件末尾；
- `cat`：读取并显示内容。

错误输出单独重定向：

```bash
ls /this_path_does_not_exist 2> /var/tmp/error.log
cat /var/tmp/error.log
```

`2>` 的 `2` 指标准错误。`ls` 的报错没有显示在终端，而是写进了 `error.log`。

## 14. 管道

管道 `|` 把前一个命令的 stdout 交给后一个命令作为输入：

```bash
ps aux | grep nginx
tail -n 1000 /var/log/messages | grep ERROR
```

需要同时保留正常输出和错误输出时，可以先 `2>&1` 合并，再交给管道；需要丢弃输出时，可以重定向到 `/dev/null`。

## 15. awk：按列处理文本

准备一个模拟日志：

```bash
cat > /var/tmp/app-demo.log <<'EOF'
2026-11-02 09:00:01 INFO nginx started
2026-11-02 09:01:15 ERROR mysql connection_failed
2026-11-02 09:02:30 WARN disk_usage_high
2026-11-02 09:03:45 INFO nginx running
2026-11-02 09:04:20 ERROR redis timeout
EOF
```

> `cat > 文件 <<'EOF'` 是 Here Document 语法，这里只要知道它能一次性写入多行即可。

### 15.1 提取字段

```bash
awk '{print $3}' /var/tmp/app-demo.log
```

```text
INFO
ERROR
WARN
INFO
ERROR
```

`awk` 默认逐行读取、按空白分列：`$3` 是第 3 个字段，`print $3` 输出该字段。

### 15.2 筛选指定内容

```bash
awk '$3=="ERROR" {print $0}' /var/tmp/app-demo.log
```

```text
2026-11-02 09:01:15 ERROR mysql connection_failed
2026-11-02 09:04:20 ERROR redis timeout
```

- `$3=="ERROR"`：判断第 3 个字段是否等于 `ERROR`；
- `{print $0}`：满足条件时输出整行；
- `$0`：当前整行文本。

### 15.3 统计数量

```bash
awk '$3=="ERROR" {count++} END {print count+0}' /var/tmp/app-demo.log
```

```text
2
```

`count++` 每匹配一次加 1；`END` 在全部读取完后执行；`count+0` 保证没有匹配时也输出 `0`。

### 15.4 综合：提取根分区使用率

```bash
df -P /
```

```text
Filesystem  1024-blocks  Used  Available Capacity Mounted on
/dev/mapper/rl-root  ...  ...  ...  31% /
```

只想得到数字 `31`：

```bash
df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}'
```

1. `df -P /`：查询根文件系统，采用便于按列处理的格式；
2. `|`：把输出交给 `awk`；
3. `NR==2`：只处理第 2 行（第 1 行是表头）；
4. `gsub(/%/, "", $5); print $5`：去掉第 5 列的 `%`，输出数字。

## 16. 调试脚本

修改脚本后，不要直接在生产服务器上执行，先做基础检查：

```bash
bash -n hello.sh   # 只检查语法，不执行
bash -x hello.sh   # 执行并打印执行过程
```

- `bash -n`：发现括号、引号、关键字结构等语法错误，但不能证明逻辑一定正确；
- `bash -x`：观察命令执行顺序和变量展开结果；**可能暴露密码或令牌**，不要把跟踪输出直接存进含敏感数据的日志。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1794631671644_04-ai-checklist.png)

_让 AI 协助检查脚本时的自查清单_

## 17. 命令速查

```bash
#!/usr/bin/env bash          # Shebang
chmod +x 脚本 && ./脚本      # 执行
bash -n 脚本                 # 语法检查
bash -x 脚本                 # 跟踪执行

# 变量与参数
name="值"                    # 等号两侧不能有空格
echo "$name"                 # 双引号展开变量
$0 $1 $# ${1:-默认值}        # 脚本名 / 第一个参数 / 参数个数 / 默认值
export 变量                  # 导出给子进程
$?                           # 上一条命令退出码

# 判断与循环
if [ 条件 ]; then ...; fi
for x in A B C; do ...; done
while [ 条件 ]; do ...; done

# 函数
f() { local x="$1"; echo ...; }
return 0                     # 函数返回状态码

# 输出与重定向
> 文件   >> 文件   2> 文件  2>&1
cmd1 | cmd2                  # 管道

# awk
awk '{print $3}' 文件
awk '$3=="ERROR" {print $0}' 文件
awk '$3=="ERROR" {c++} END {print c+0}' 文件
df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}'
```

## 18. 相关页面

- [[【命令】Linux 基础核心与网络命令]]：脚本里最常用的那些命令
- [[【导言】Linux 基础与运维学习地图]]：整体学习路线与实验环境
- [[【Shell】Shell 变量与数据类型]]：v1 中的变量与数据类型细节
- [[【Shell】Shell 流程控制与函数]]：v1 中的流程控制与函数补充
- [[【Shell】Shell 参数与退出信号]]：v1 中的参数与信号处理
- [[【Shell】sed 与 awk 详解]]：v1 中更完整的 sed/awk 用法
