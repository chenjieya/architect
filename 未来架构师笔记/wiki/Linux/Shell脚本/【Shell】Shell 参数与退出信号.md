---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
## 1. 特殊变量

### 1.1 变量总表

| 变量 | 含义 |
| --- | --- |
| `$0` | shell 或脚本的**名字** |
| `$1` `$2` ... | 脚本的第 1、2 个参数，以此类推 |
| `$*` | 所有参数（当成一个整体字符串） |
| `$@` | 所有参数（每个参数独立） |
| `$#` | 参数的**个数** |
| `$_` | 上一个命令的最后一个参数 |
| `$$` | 当前 shell 进程的 PID |
| `$!` | 最后执行的**后台**命令的 PID |
| `$?` | 上一条命令的**执行结果**（0 成功，非 0 失败） |

### 1.2 脚本演示

```bash
#!/bin/bash
echo "\$0=$0"     # 脚本名
echo "\$1=$1"     # 第一个参数
echo "\$2=$2"     # 第二个参数
echo "\$*=$*"     # 参数整体
echo "\$@=$@"     # 参数列表
echo "\$#=$#"     # 参数个数
echo "\$$=$$"     # 当前 shell PID
ls -l ./
echo "\$_=$_"     # 上一个命令（ls）的最后一个参数
```

```bash
./param.sh aa bb
# $0=./param.sh
# $1=aa
# $2=bb
# $*=aa bb
# $@=aa bb
# $#=2
# $$=12345（进程号）
# $_=./
```

## 2. getopts 解析选项参数

适用于像 `./backup.sh -b 1 -d blog` 这种带选项的参数：

```bash
#!/bin/bash
function usage()
{
    echo "usage: command -b f -d blog"
}

echo "参数个数 $#"

if [ $# -eq "4" ]; then
    while getopts ":b:d:" opt; do
        case $opt in
            b)
                echo "backuplevel=$OPTARG"
                backuplevel=$OPTARG
                ;;
            d)
                echo "db=$OPTARG"
                db=$OPTARG
                ;;
            ?)
                usage
                exit 1
                ;;
        esac
    done

    if [ ! -z $backuplevel ] && [ ! -z $db ]; then
        echo "开始备份"
        if [ $? -eq 0 ]; then
            echo "$backuplevel 级别 backup ${db} success!"
        fi
    else
        echo "有参数未指定"
        usage
        exit 1
    fi
else
    usage
    echo "参数个数不对"
fi
```

**getopts 说明：**

- 写法 `getopts ":b:d:" opt`：`:` 开头的字符串表示选项，`b:` 表示 b 选项**需要带一个值**（`-b 1`），这个值存在变量 `$OPTARG` 中
- 遇到不认识的选项，`$opt` 变成 `?`，可进入 `?` 分支提示 usage
- `:` 开头的冒号用于屏蔽系统默认报错（可选）

## 3. 退出信号：exit 与 return

### 3.1 `$?` 执行结果

- 命令或脚本运行正常，`$?` 为 0
- 运行不正常，`$?` 为非 0 值
- 我们可以用 `exit` / `return` **自定义**这个值

### 3.2 函数中 return，脚本中 exit

```bash
#!/bin/bash
function1()
{
    local i=123
    b=2
    echo "function inner \$i=$i \$b=$b"
    return 99        # 函数返回自定义值 99
    # exit 19        # 如果用 exit，整个脚本直接结束
    echo "after return"    # return 之后函数内不再执行
}

function1
echo "after function \$?=$?"     # 输出 99，函数返回值

echo "function outer \$i=$i \$b=$b"

exit 120             # 整个脚本退出码为 120
echo "after exit"    # 脚本已退出，不会执行到这里
```

> - `return N`：只结束**当前函数**，退出码传给 `$?`
> - `exit N`：结束**整个脚本**，退出码是脚本的最终状态

## 4. 综合小结

```bash
echo $?      # 检查上一条命令是否成功，写脚本必备
echo $$      # 当前进程 PID，常用于日志文件命名（如 /tmp/x_$$.log）
echo $!      # 后台任务 PID，配合 wait/kill 使用
```

| 场景 | 用哪个 |
| --- | --- |
| 判断上条命令是否成功 | `$?` |
| 获取脚本参数 | `$1 $2 ... $#` |
| 遍历所有参数 | `for x in $@` |
| 解析 `-a xx -b yy` 选项 | `getopts` |
| 函数提前返回并传值 | `return N` |
| 脚本异常退出 | `exit N` |
