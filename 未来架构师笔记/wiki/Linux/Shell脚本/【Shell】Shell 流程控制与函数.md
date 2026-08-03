---
author: ai
ai_editable: true
summary: "脚本示例（判断用户输入是否为 y）："
refs:
  pages: []
  raw:
    - path: "raw/operations-shell/1.2 shell-2.md"
      sha256: 2a733f0e4a7ad9724deb840787fda3908c1e872c1c05d84a74c30a9943fea24d
    - path: "raw/operations-shell/1.2 shell-2-gai.md"
      sha256: 5f8a01c8e617a2c7812b6a9615ac94f600348543747ca1d2fc672f8cc755cdd8
updated_by: ai
updated: 2026-08-03
---

## 1. if 条件判断

### 1.1 基本语法

```bash
if [ 条件 ]; then
    命令1
else
    命令2
fi
```

**脚本示例**（判断用户输入是否为 y）：

```bash
#!/bin/bash
echo "Press y to continue"
read yn
if [ "$yn" = "y" ]; then
    echo "the script continue"
else
    echo "the script stoped"
fi
```

### 1.2 多条件连接

`[ ]` 中可以用逻辑连接符：

- `&&`：而且（and）
- `||`：或者（or）
- `-a`：and 的老写法
- `-o`：or 的老写法

```bash
#!/bin/bash
echo "Press y or yes to continue"
read yn
if [ "$yn" = "y" ] || [ "$yn" = "yes" ]; then
    echo "the script continue"
else
    echo "the script stoped"
fi
```

> **注意**：`[` 和 `]` 中间、以及它们和条件之间**必须有空格**，否则语法错误。

### 1.3 test 文件判断

`[ ]` 本质就是 `test` 命令，可以判断文件属性：

```bash
# -f 是普通文件？  -x 是否有执行权限？  -d 是目录？  -e 是否存在？
if [ -f ifelsefi.sh -a ! -x ifelsefi.sh ]; then
    echo "ifelsefi.sh 没有执行权限"
else
    echo "ifelsefi.sh 有执行权限"
fi
```

**常用判断参数：**

| 参数                      | 含义                                              |
| ------------------------- | ------------------------------------------------- |
| `-e`                      | 文件是否存在                                      |
| `-f`                      | 是否为普通文件                                    |
| `-d`                      | 是否为目录                                        |
| `-x`                      | 是否可执行                                        |
| `-w`                      | 是否可写                                          |
| `-r`                      | 是否可读                                          |
| `-z`                      | 字符串是否为空                                    |
| `-n`                      | 字符串是否非空                                    |
| `-gt/-lt/-eq/-ne/-ge/-le` | 数值比较（大于/小于/等于/不等/大于等于/小于等于） |

## 2. case 多分支

适合"一个值多个分支"的场景：

```bash
#!/bin/bash
echo "Please select one \ two \ three"
read number
case $number in
    one)
        echo "You select one!"
        ;;
    two)
        echo "You select two"
        ;;
    three)
        echo "You select three"
        ;;
    *)
        echo 100          # 默认分支（都不匹配时）
        # exit 100
        ;;
esac
```

> 每个分支结尾用 `;;`；`*` 是默认匹配项。

## 3. select 菜单

`select` 自动生成带编号的菜单，用户选编号即可：

```bash
#!/bin/bash
PS3="Please enter you select install menu:"
select i in http mysql php config all exit
do
    case $i in
        http)  echo "install http ..."   ;;
        mysql) echo "install mysql ..."  ;;
        php)   echo "install php ..."    ;;
        config)echo "config ..."         ;;
        all)   echo "all ..."            ;;
        exit)
            echo "The system exit"
            exit
            ;;
    esac
done
```

> `PS3` 是 select 的提示符，可自定义。

## 4. for 循环

### 4.1 C 风格（带计数）

```bash
#!/bin/bash
declare -i i
declare -i s=0
for ((i=1; i<=100; i=i+1))
do
    s=s+i
done
echo "1..100 the sum is $s"    # 输出 5050
```

### 4.2 遍历命令输出

```bash
#!/bin/bash
# 遍历当前目录下的所有文件名
for file in `ls`        # 等价写法：for file in $(ls)
do
    echo "file=$file"
done
```

### 4.3 seq 生成序列

```bash
for i in $(seq 0 39); do echo "$i"; done     # 0 到 39
for i in $(seq -w 0 999); do echo "$i"; done # -w 自动补零（001,002...）
for i in $(seq -f '%03.1f' 0 39); do ...; done  # 格式化输出 000.0
```

## 5. while 循环

```bash
#!/bin/bash
declare -i i=0
declare -i s=0
while [ $i != 101 ]
do
    s=s+i
    i=i+1
done
echo "1..100 the sum is $s"
```

**死循环（监控类脚本常用）：**

```bash
#!/bin/bash
while [ 1 != 0 ]
do
    sleep 1
    date
done
```

## 6. 函数

### 6.1 定义与调用

```bash
function logfunc
{
    echo "`date` local function is running ...." | tee -a /var/log/messages
}

# 调用函数
logfunc
```

### 6.2 调用外部脚本里的函数

```bash
#!/bin/bash
# 用 source 引入外部函数定义文件
source /data/linux/shell/logfunc
logfunc
```

### 6.3 函数中的变量作用域

```bash
#!/bin/bash
function1()
{
    local i=123    # local 声明局部变量，只在本函数内有效
    b=2            # 不加 local 的变量是全局的
    echo "function inner \$i=$i \$b=$b"
}

function1
echo "function outer \$i=$i \$b=$b"
# 输出：function inner $i=123 $b=2
#      function outer $i=   $b=2   （i 是局部的，外面取不到；b 是全局的，还在）
```

> **函数命名规则**：和变量一样，由字母/数字/下划线组成，不能用 `-`（如 `fun-1` 是非法函数名）。

## 7. 综合练习

1. **判断目录**：判断是否存在 `/usr/local/diy`，不存在则创建，并在其中建文件 `diy1`；如果目录已存在则继续判断是否有 `diy1`，没有则新建
2. **批量建文件**：在 `/tmp/tempdir` 目录下建立 `001`~`999` 共 999 个文件，文件内容为对应的文件名（如 001 文件内容就是 001）
3. **找最大值**：在数组 `(1 9 8 6 10 11)` 中找出最大值输出
4. **定时负载**：每隔 3 秒获取隔壁同学服务器的负载情况（可结合 uptime + sleep）
