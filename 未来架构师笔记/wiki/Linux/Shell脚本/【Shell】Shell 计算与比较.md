---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
## 1. 数值比较：`>` 还是 `-gt`？

对两个数用 `>` 和 `-gt` 比较，结果可能不一样，因为语义完全不同：

| 写法 | 含义 |
| --- | --- |
| `[ "$a" > "$b" ]` | 字符串**字典序**比较 |
| `[ "$a" -gt "$b" ]` | **数值**比较 |

**脚本验证：**

```bash
#!/bin/bash
a=1; b=2
declare -i c=3
declare -i d=4

echo "使用 > 比较"
if [ "$a" > "$b" ]; then echo "a > b"; else echo "a < b"; fi
if [ "$c" > "$d" ]; then echo "c > d"; else echo "c < d"; fi

echo "使用 -gt 比较"
if [ "$a" -gt "$b" ]; then echo "a > b"; else echo "a < b"; fi
if [ "$c" -gt "$d" ]; then echo "c > d"; else echo "c < d"; fi
```

运行后你会发现 `>` 比较输出都是 if 里的结果。原因有两个：

1. `>` 和 `<` 是 Linux 的**数据流重定向符号**（见 [[【数据流】标准数据流重定向与时间属性]]），在 `[ ]` 中不转义的话会被当作重定向处理
2. 就算转义了，`[ ]` 里的 `>` 也是按**字符串字典序**比较，不是数值比较

**结论**：
- 数字比较**必须用 `-gt` / `-lt` / `-eq` / `-ne` / `-ge` / `-le`**
- 若要强行用 `>`，必须转义：`[ "$a" \> "$b" ]`（但那是字典序，不推荐）

## 2. 浮点数比较：bc 计算器

bash 本身不支持浮点运算，需要借助 `bc`：

```bash
#!/bin/bash
fa=3.2
fb=5.3

# `echo "$fa < $fb" | bc` 会输出 1（真）或 0（假）
if [ `echo "$fa < $fb" | bc` = 1 ]; then
    echo "fa < fb"
else
    echo "fa > fb"
fi
```

> 先让 `bc` 做浮点比较，输出 1 或 0，再拿这个结果跟 1 比较。

## 3. 整数加减计算

```bash
$(($a+$b))            # 推荐写法
$[$a+$b]              # 老式写法
declare -i c=$a+$b    # declare 声明整数后运算
```

### 变量默认值

```bash
echo $(( ${j:-8} + 2 ))
# 如果变量 j 不存在或为空，${j:-8} 取默认值 8，8+2=10
```

## 4. 乘除、指数、取余、随机数

```bash
# 随机数：每次输出 0~32767 之间的随机整数
ran=$RANDOM
echo "随机数 $ran"

# 求模取余：判断随机数的奇偶
yushu=$(( $ran % 2 ))
echo "随机数 $ran 余数=$yushu"

# 指数
echo $(( 2 ** 10 ))   # 1024
```

## 5. 浮点计算与百分比

```bash
# bc -l 加载数学库，支持浮点
fc=`echo "$fa+$fb" | bc -l`

# scale 指定小数位数
US1=`echo "scale=3; 7/3" | bc -l`            # 2.333
USEPCT=`echo "scale=3; 7/3 * 100" | bc -l`   # 233.333
echo "USEPCT=$USEPCT %  $US1"
```

> `scale=3` 表示结果保留 3 位小数；`bc -l` 启用数学函数库。

## 6. 小结

| 场景 | 写法 |
| --- | --- |
| 整数运算 | `$(())` 或 `$[]` 或 `declare -i` |
| 浮点运算 | `echo "表达式" \| bc -l` |
| 整数比较 | `[ $a -gt $b ]` |
| 浮点比较 | `` [ `echo "$a > $b" \| bc` = 1 ] `` |
| 随机数 | `$RANDOM` |
| 取余 | `$(($a % $b))` |
| 变量默认值 | `${j:-8}` |
