---
author: ai
ai_editable: true
summary: "bash shell 把任何存储在变量中的值，在未声明数据类型的情况下，都视为字符串。"
refs:
  pages:
    - "【Shell】sed 与 awk 详解"
  raw:
    - path: "raw/operations-shell/1.1 shell-1.md"
      sha256: 58bd52c17ed98717bea45efe1e96df73baf3a33675445a9fa1cad617bd163ac3
    - path: "raw/operations-shell/1.2 shell-2.md"
      sha256: d0ec231487e62025613419f7d4f3f3cf7492898625443878047651976e42bd5d
    - path: "raw/operations-shell/1.2 shell-2-gai.md"
      sha256: 1a64a72eb41bff6a601fbf3328755242eb6ce9e91160cbdda215e8f584063ae5
updated_by: ai
updated: 2026-08-03
---

## 1. 变量概述

bash shell 把任何存储在变量中的值，在**未声明数据类型**的情况下，都视为**字符串**。

### 1.1 变量命名规则

- 由英文字母、数字、下划线 `_` 组成
- **大小写有区分**（`name` 和 `NAME` 是两个变量）
- **不可以数字开头**
- 不能使用关键字（如 if、for）

### 1.2 设定变量

```bash
num=hello        # 正确：等号两边不能有空格！
num1 = hell01    # 错误：等号两边有空格会报错
```

> **要点**：`=` 两边绝对不能有空格，这是新手最容易犯的错。

## 2. declare 声明变量类型

bash 默认把变量当字符串，`declare` 可以显式声明类型。

### 2.1 整数类型 -i

```bash
# 不加 declare，变量是字符串，$a*$b 只是拼接字符串
a=3
b=4
c="$a*$b"
echo $c
# 输出：3*4      （就是字符串拼接）

# 加上 declare -i，做整数运算
declare -i c="$a*$b"
echo $c
# 输出：12       （真正算乘法）

# 再举个直观例子
sum=100+50
echo $sum          # 输出：100+50
declare -i sum=100+50
echo $sum          # 输出：150
```

### 2.2 数组类型 -a

```bash
declare -a arrayvar2=(a b c d e)     # arrayvar2[0]="a" ... arrayvar2[4]="e"

# 注意：必须用花括号取数组元素
echo $arrayvar2[1]      # 错误写法（只输出 arrayvar2[1] 字符串）
echo ${arrayvar2[1]}    # 正确：输出 b

echo ${arrayvar2[1+1]}  # 下标支持表达式：1+1=2，输出 c
echo ${arrayvar2[@]}    # 取出所有元素：a b c d e
echo ${#arrayvar2[@]}   # 看数组有多少个元素：5
echo ${#arrayvar2[1]}   # 看某个字符串元素的长度：b 的长度=1
```

### 2.3 只读变量 -r

```bash
declare -r numname=pigpig
numname=test    # 报错：readonly variable，无法修改
```

> 只读变量连 `unset` 都无法取消。

### 2.4 导出变量 -x

`declare -x` 等价于 `export`，把变量导出到**子进程**：

```bash
declare -x tename="hello world"   # 导出的变量，子脚本能读到
tename1=hell                      # 未导出的变量，子脚本读不到
```

测试脚本 `sh.sh`：

```bash
#!/bin/bash
echo "tename=$tename"     # 能读到（导出了）
echo "tename1=$tename1"   # 读不到（未导出，为空）
```

```bash
./sh.sh
# tename=hello world
# tename1=
```

### 2.5 变量之间传值

```bash
n1=2
n2=n1        # 赋值的是字符串 "n1"，不是它的值
echo $n2     # 输出：n1

n2=$n1       # 加了 $，取 n1 的值
echo $n2     # 输出：2
```

### 2.6 查看变量类型

```bash
declare -p 变量名    # 查看变量的类型（属性）
```

## 3. 读取变量

```bash
$变量名      ${变量名}
```

```bash
hename=jacky
echo $henameMMMMM      # 出错：shell 会把变量名当作 henameMMMMM（未定义，为空）
echo ${hename}MMMMM    # 正确：输出 jackyMMMMM
```

> **规则**：当变量名后面紧跟着英文字母或数字时，**必须用 `{}` 把变量名包起来**；后面是其他字符（如 `/`）时可以不用。

```bash
echo /home/$jim/Desktop   # 这里 $jim 后面是 /，可以不加花括号
```

## 4. 取消变量

```bash
n1=2
echo $n1      # 2
unset n1
echo $n1      # 空
```

## 5. 单引号 vs 双引号

- **双引号**：会**置换变量**（里面的 `$变量` 会替换成值）
- **单引号**：**不会置换**，原样输出

```bash
#!/bin/bash
num1=110
echo -e "\$num1=$num1"    # 双引号：$num1 被替换为 110，输出 $num1=110
echo -e '\$num1=$num1'    # 单引号：原样输出 \$num1=$num1
```

> **提醒**：在 awk、sed 中引用时也要注意引号语义，见 [[【Shell】sed 与 awk 详解]]。

## 6. 练习

1. 定义变量 `name=dog`，分别用不带引号、双引号、单引号赋含空格的值，观察区别
2. 用 `declare -i` 计算 `5*6` 的和，验证结果是整数
3. 定义数组 `(1 9 8 6 10 11)`，用 `for` 循环找出最大值并输出
