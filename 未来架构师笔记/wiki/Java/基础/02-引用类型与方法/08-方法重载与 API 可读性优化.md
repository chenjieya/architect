---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：方法与程序结构化 · Java 语言基础入门

## 1. 概述

**方法重载（Overloading）**  指同一类中**方法名相同、参数列表不同**的多个方法；编译器按实参**匹配**具体版本，让调用方写法更自然、API 更易读。

## 2. 核心概念

| 术语                           | 说明                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| 方法重载（Method Overloading） | 同类中**同名**、**参数个数或类型或顺序不同**的多个方法                                 |
| 重载解析                       | 编译期根据**实参类型与个数**选择最匹配的重载版本                                       |
| 参数列表                       | 仅  **返回类型不同** **不能**  构成重载                                                |
| 固定参数列表                   | 每个重载版本各自声明**确定个数与类型**的形参                                           |
| 可变参数（varargs）            | `类型... 名`  放在**参数列表最后一项**；与固定参数重载可共存，但本课**不展开**匹配规则 |
| API 可读性                     | 同一语义用同一方法名，不同输入用不同参数形态，减少「记很多奇怪方法名」                 |

## 3. 语法与写法

```java
public class MethodOverloadDemo {
    public static void main(String[] args) {
        print(42);
        print("score", 90);
        print(new int[]{1, 2, 3});
    }

    public static void print(int value) {
        System.out.println("数字: " + value);
    }

    public static void print(String label, int value) {
        System.out.println(label + ": " + value);
    }

    public static void print(int[] arr) {
        for (int n : arr) {
            System.out.print(n + " ");
        }
        System.out.println();
    }
}
```

**预期输出**：

```text
数字: 42
score: 90
1 2 3
```

### 3.1 合法的重载差异

| 差异方式 | 示例                                                         |
| -------- | ------------------------------------------------------------ |
| 参数个数 | `max(int a, int b)`  与  `max(int a, int b, int c)`          |
| 参数类型 | `format(int n)`  与  `format(double n)`                      |
| 参数顺序 | `log(String msg, int code)`  与  `log(int code, String msg)` |

### 3.2 不能仅靠返回类型区分

```java
// 编译错误：方法已在类中定义
// public static int  parse(String s) { ... }
// public static double parse(String s) { ... }
```

调用  `parse("1")`  时编译器**无法**仅凭返回类型选版本。

### 3.3 与默认参数、可变参数的对比

| 需求                 | Python/JS 常见写法             | Java 本课做法                                               |
| -------------------- | ------------------------------ | ----------------------------------------------------------- |
| 少传参时用默认值     | `def connect(host, port=8080)` | **重载**：`connect(host)`  内部调  `connect(host, 8080)`    |
| 传不定个数同类型实参 | `*args`  等                    | **可变参数**：`sum(int... nums)`（语法见第 1 节，本课了解） |
| 固定几种调用形态     | 多个函数名                     | **重载**：同名、不同固定参数列表                            |

Java **没有**形参默认值语法；「参数个数不固定」靠  **varargs**，不是靠默认参数。

```java
public static void connect(String host) {
    connect(host, 8080);
}

public static void connect(String host, int port) {
    System.out.println("连接 " + host + ":" + port);
}
```

### 3.4 自动类型提升与重载

实参为  `int`  时可能匹配  `long`  形参（类型提升）；多个重载都「差不多能匹配」时可能**编译歧义**——本阶段避免写过于接近的重载。

## 4. 常见用法

1. **打印/格式化**：`print(x)`、`print(label, x)`  同名不同参。
2. **求最值**：两参数与三参数  `max`。
3. **校验入口**：`isValid(String s)`  与  `isValid(String s, int minLen)`。
4. **构造感 API**：`open()`  调  `open(defaultPath)`，内部再调完整版。

## 5. 易错点

- **仅改返回类型重载**：编译失败。**处理**：必须改**参数列表**。
- **重载与递归混淆**：重载是**多个不同签名**；递归是**同一签名自己调自己**（见第 4 节）。
- **实参无法匹配任何重载**：如只有  `print(int)`  却调用  `print("a")` → 编译错误。**处理**：实参类型要能对应某一版本的形参。
- **混淆默认参数与可变参数**：Java **不支持** `int y=0`  形参默认值；**支持** `int... nums`  可变参数——二者不同，不要混为一谈。

## 6. 本节小结

- 重载 = **同名 + 不同参数列表**（个数/类型/顺序）
- **不能**只靠返回类型区分两个方法
- Java **无默认参数** → 用重载；**有可变参数  `类型...`**（了解，练习以固定参数为主）
- 用重载提升  **API 可读性**，代替「一堆相似方法名」
