---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：异常处理与健壮性 · Java 面向对象与核心类库

## 1. 概述

本节说明 Java **异常体系** 的根类型 **`Throwable`**，以及 **`Error`** 与 **`Exception`** 的分工，并区分 **受检异常（Checked）** 与 **非受检异常（Unchecked）**，为后续 `try-catch` 与 `throws` 打基础。

## 2. 核心概念

| 术语                              | 说明                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| 异常（Exception）                 | 程序运行中发生的、可预期或可处理的非正常事件，用对象表示并沿调用栈向上传播             |
| `Throwable`                       | 所有异常与错误的**根类**；含 `getMessage()`、`printStackTrace()` 等                    |
| `Error`                           | 严重系统级问题（如内存不足），一般**不由业务代码捕获处理**                             |
| `Exception`                       | 应用层可处理的异常基类，分受检与非受检两大类                                           |
| 受检异常（Checked Exception）     | 继承 `Exception` 且**不是** `RuntimeException` 子类；编译器要求必须处理或声明 `throws` |
| 非受检异常（Unchecked Exception） | `RuntimeException` 及其子类，以及 `Error`；编译器**不强制** `try-catch`                |
| `RuntimeException`                | 运行时异常基类，如 `NullPointerException`、`IllegalArgumentException`                  |
| 调用栈（Stack Trace）             | 异常抛出时记录的**方法调用链**，用于定位出错行                                         |

## 3. 操作步骤

在 IDEA 中观察异常类型与栈信息：

1. **新建类** `ThrowableDemo.java`，在 `main` 中写 `int n = 10 / 0;`
2. **运行**：控制台出现 `ArithmeticException`（属于 `RuntimeException`）
3. **展开红色栈信息**：从上到下看 **自己的类名与行号**（如 `ThrowableDemo.main`）
4. **再试**：`String s = null; System.out.println(s.length());`，观察 `NullPointerException`
5. **对比**：在 `main` 签名后加 `throws Exception` 不会消除运行期错误，只是声明语法（下一节详讲）

## 4. 语法与写法

### 4.1 体系结构（初学必记）

```text
Throwable
├── Error          （如 OutOfMemoryError，一般不 catch）
└── Exception
    ├── RuntimeException 及其子类   → 非受检（Unchecked）
    └── 其他 Exception 子类         → 受检（Checked），如 IOException
```

### 4.2 常见子类对照

| 类型                             | 父类               | 受检？ | 典型场景                       |
| -------------------------------- | ------------------ | ------ | ------------------------------ |
| `NullPointerException`           | `RuntimeException` | 否     | 对 `null` 引用调用方法         |
| `IllegalArgumentException`       | `RuntimeException` | 否     | 参数不合法（主动 `throw`）     |
| `ArrayIndexOutOfBoundsException` | `RuntimeException` | 否     | 数组下标越界                   |
| `ArithmeticException`            | `RuntimeException` | 否     | 如除以 0                       |
| `ClassCastException`             | `RuntimeException` | 否     | 强制类型转换失败               |
| `IOException`                    | `Exception`        | **是** | 文件/网络 IO（本章先认识名称） |

### 4.3 查看异常信息

```java
// 文件：ThrowableDemo.java
public class ThrowableDemo {
    public static void main(String[] args) {
        try {
            int[] arr = {1, 2, 3};
            System.out.println(arr[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("消息: " + e.getMessage());
            e.printStackTrace();   // 打印完整调用栈
        }
    }
}
```

运行后应看到 **异常类名**、**消息** 与 **at 类名.方法(文件:行号)** 行。

## 5. 常见用法

1. **区分要不要写 `throws`**：看到 `IOException` 想到受检；看到 `NullPointerException` 想到非受检
2. **读栈定位**：从下往上找**第一个自己项目包名下的行**
3. **业务主动抛非受检**：参数校验失败用 `IllegalArgumentException`（第 4 节自定义异常会扩展）

## 6. 易错点

- **把 Error 当普通异常 catch**：`OutOfMemoryError` 捕获后往往无法恢复，应优先排查原因
- **认为所有 Exception 都要 try-catch**：`RuntimeException` 编译期不强制，但运行仍可能崩溃
- **只看异常类名不看栈**：同一 `NullPointerException` 可能来自不同行，必须看 **行号**
- **混淆 Exception 与 Error**：`Exception` 可处理；`Error` 多表示 JVM/系统级故障

## 7. 本节小结

- **`Throwable`** 是根；**`Error`** 一般不业务处理；**`Exception`** 是应用异常入口
- **受检**：非 `RuntimeException` 的 `Exception` 子类，编译器强制处理或 `throws`
- **非受检**：`RuntimeException` 子类，编译不强制，但运行期仍会抛出
- 会用 **`getMessage()`** 与 **`printStackTrace()`** 阅读调用栈定位问题
