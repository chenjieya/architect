## 1. sed：非交互式文本流编辑器

sed（Stream Editor）是一个**非交互式**的文本流编辑器，擅长对文件按行做增删改查，是重要的文本过滤工具。

### 1.1 增：a（after）与 i（insert）

```bash
sed '2a add' file      # 在第 2 行后面加一行 add（成为第 3 行）
sed '2i insert' file   # 在第 2 行位置插入一行 insert（新行成为第 2 行）
sed '/^%end/a add' 1.cfg   # 在匹配 ^%end 的行后面加一行
```

### 1.2 删：d

```bash
sed '2,5d' datafile        # 删除 datafile 的 2~5 行
sed '/my/,/you/d' datafile # 删除从"含 my 的行"到"含 you 的行"之间的所有行
sed '/my/,10d' datafile    # 删除从"含 my 的行"到第 10 行
```

### 1.3 查：-n 与 p

`-n` 是**只输出被处理的行**（不打印全部），配合 `p`（print）实现"按条件打印"：

```bash
sed -n '2p' /etc/passwd      # 只打印第 2 行
sed -n '1,3p' /etc/passwd    # 打印 1~3 行
sed -n '/dev/p' /etc/fstab   # 打印所有含 dev 的行
sed -n '6,/dev/p' /etc/fstab # 打印从第 6 行到第一个含 dev 的行
sed -n '1,$p' /etc/fstab     # $ 表示最后一行，打印整个文件
```

> **提醒**：以上所有操作（不加 `-i`）都**不会修改原始文件**，只是输出到屏幕。

### 1.4 改：s（替换）

```bash
sed 's/reiserfs/REISERFS/' /etc/fstab    # 每行第一次出现的 reiserfs 替换为 REISERFS
sed 's/reiserfs/REISERFS/g' /etc/fstab  # g 全局替换，行内所有出现都换
```

### 1.5 组合编辑：-e

`-e` 可以对输入行应用**多条** sed 命令：

```bash
sed -e '1,10d' -e 's/My/YOU/g' file
```

### 1.6 写回原文件：-i

前面所有操作只影响输出，`-i` 会**直接改原文件**（生产环境慎用，先备份）：

**给指定行加注释（#）：**

```bash
sed -i '/^adm/ s/^/#/g' /tmp/list.h
```

**去掉注释：**

```bash
sed -i '/^#adm/ s/^#//g' my.cnf
```

**实战例子**：给配置文件中以 master 开头的三行全部注释掉：

```
# test.txt 内容
master-host = 192.168.100.90
master-user = repuser
master-password = 123456
Replicate_Do_DB = mytianya
```

```bash
sed -i '/^master/ s/^/#/g' test.txt
```

执行后 master 开头的三行前面都加上 `#`，其它行不动。

> **sed 地址格式小结**：`行号`、`行号范围(1,3)`、`/正则/`、混合 `6,/dev/`，都可作选择条件。

## 2. awk：文本分析与报告生成器

awk 比 sed 更擅长**按列（域）**处理文本，把每行按分隔符切成多个字段。

### 2.1 内建变量

| 变量 | 含义 |
| --- | --- |
| `ARGC` | 命令行变元个数 |
| `ARGV` | 命令行变元数组 |
| `FILENAME` | 当前输入文件名 |
| `FNR` | 当前文件中的记录（行）号 |
| `FS` | 输入域分隔符，默认一个空格 |
| `RS` | 输入记录分隔符，默认换行 |
| `NF` | 当前记录里域（列）个数 |
| `NR` | 到目前为止的记录（行）数 |
| `OFS` | 输出域分隔符 |
| `ORS` | 输出记录分隔符 |

**示例**：显示每行的行号、列数、第一列、最后一列：

```bash
awk '{print NR, NF, $1, $NF}' file
```

### 2.2 BEGIN：预处理

`BEGIN` 块在处理任意行之前执行，常用来设置分隔符、初始化变量：

```bash
# 用 : 做分隔符，打印 uid>499 的行
awk 'BEGIN { FS=":" } $3>499 {print $0}' /etc/passwd

# 等价简写：-F 指定分隔符
awk -F ":" '$3>999 {print $0}' /etc/passwd

# 设置输出分隔符 OFS，把第 1 列和第 3 列用 -- 连起来输出
awk 'BEGIN { FS=":"; OFS="--" } $3>499 {print $1,$3}' /etc/passwd
```

### 2.3 三元表达式

```bash
# 每行第 1 列如果大于 max(100) 就更新 max
awk '{ max=100; print "max=" ($1 > max ? $1 : max); print $1, max }' file
```

### 2.4 awk 中调用 shell 变量（重点坑）

**必须用单引号**，否则 shell 会先把变量展开：

```bash
#!/bin/bash
# $1 是脚本的第一个参数，先被 shell 展开为数字，再交给 awk 取第几列
awk -F ":" '{print $'"$1"'}' /etc/passwd
```

这里的技巧是 `'{print $'` + `"$1"` + `'}'` 三段拼接，用双引号的部分由 shell 解析，从而把系统变量传进 awk。如果整个都用双引号，awk 会把 `$1` 当作字符串处理而不是变量取值。

## 3. sed vs awk 怎么选

| 场景 | 工具 |
| --- | --- |
| 按行增删改查、替换文本 | **sed** |
| 按列（域）分析、统计、格式化输出 | **awk** |
| 配合脚本处理文本流 | 两者都常配管道 |

> 更多管道与重定向的配合见 [[【数据流】标准数据流重定向与时间属性]]。
