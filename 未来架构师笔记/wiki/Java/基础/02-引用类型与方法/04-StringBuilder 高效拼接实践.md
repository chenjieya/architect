---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：数组与字符串 · Java 语言基础入门

## 1. 概述

本节说明在**循环或多次拼接**场景下，用 **`StringBuilder`** 代替 `String` 的 `+`，通过 `append` 累积内容，最后用 `toString()` 得到 `String`。

## 2. 核心概念

| 术语            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| StringBuilder   | 可变的字符序列容器，适合**频繁追加**字符                     |
| `append`        | 追加内容（`String`、`int` 等），返回自身引用，可**链式**调用 |
| `toString()`    | 将当前缓冲区内容转为**新的** `String`                        |
| `length()`      | 当前已追加的**字符个数**（Builder 上是方法）                 |
| 可变（Mutable） | 在同一对象上追加，不每次 `+` 都新建整个结果串                |

## 3. 语法与写法

### 3.1 基本用法

```java
public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello");
        sb.append(' ');
        sb.append("Java");
        String result = sb.toString();
        System.out.println(result);  // Hello Java
    }
}
```

### 3.2 链式 append

```java
StringBuilder sb = new StringBuilder();
sb.append("a").append("b").append("c");
System.out.println(sb.toString());  // abc
```

### 3.3 循环拼接（推荐写法）

```java
int[] arr = {1, 2, 3, 4, 5};
StringBuilder sb = new StringBuilder();
for (int i = 0; i < arr.length; i++) {
    if (i > 0) {
        sb.append(",");
    }
    sb.append(arr[i]);
}
System.out.println(sb.toString());  // 1,2,3,4,5
```

### 3.4 带初始容量（可选）

```java
StringBuilder sb = new StringBuilder(64);  // 预估长度，减少扩容次数
```

本阶段知道即可；不传容量时默认也会自动扩容。

### 3.5 与 String + 对比（现象）

```java
// 不推荐：循环里反复 +
String s = "";
for (int i = 0; i < 1000; i++) {
    s = s + i;   // 每次产生新 String
}

// 推荐
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String s2 = sb.toString();
```

## 4. 常见用法

1. **拼接 CSV 一行**：逗号分隔多个字段，`append` + 分隔符。
2. **构造 HTML/JSON 片段**（入门）：多次 `append` 固定标签与变量（复杂 JSON 后续用库）。
3. **逆序或逐字符处理**：`append` 配合循环；需要时再 `toString()`。
4. **清空重用**：`sb.setLength(0)` 或 `new StringBuilder()` 重新来（本阶段了解 `setLength(0)` 即可）。

## 5. 易错点

- **忘记 toString()**：`System.out.println(sb)` 打印的是对象地址形式，不是业务字符串。**处理**：输出或赋值前 `sb.toString()`。
- **在只需要一次拼接时用 Builder**：单次 `"a" + b` 可读性好，不必强行 Builder。
- **append 后未接收**：`append` 修改的是 Builder 自身，无需 `sb = sb.append(x)`，但也不要以为会改原来的 `String` 变量。
- **与 StringBuffer 混淆**：`StringBuffer` 线程安全、稍慢；本课统一用 **`StringBuilder`**（单线程 `main` 足够）。
- **混用 length**：数组用 `arr.length`，`String`/`StringBuilder` 用 `length()`。

## 6. 本节小结

- 多次、尤其**循环内**拼接 → `StringBuilder` + `append` + `toString()`
- `append` 可链式；`String` 仍不可变，最终用 `toString()` 得到 `String`
- 单次少量 `+` 可保留；大量拼接避免循环里 `s = s + ...`
