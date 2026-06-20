> 所属：异常处理与健壮性 · Java 面向对象与核心类库

## 1. 概述

本节说明 **`try-catch-finally`** 捕获与处理异常的写法，以及 **`try-with-resources`** 自动关闭资源，并给出**捕获顺序**、**粒度**与**不要吞异常**等入门实践。

## 2. 核心概念

| 术语                 | 说明                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| `try`                | 包裹可能抛出异常的代码块                                                      |
| `catch`              | 捕获指定类型异常并处理；可多个，**子类在前、父类在后**                        |
| `finally`            | 无论是否异常、是否 `return`，**几乎总会执行** 的清理块（用于释放资源等）      |
| 多 catch             | 多个 `catch (具体类型 e)` 分别处理不同异常                                    |
| `try-with-resources` | `try (资源声明)` 语法，资源须实现 **`AutoCloseable`**，离开块时自动 `close()` |
| 吞掉异常             | `catch` 中什么都不做，导致问题被隐藏，难以排查                                |
| 异常链               | 包装新异常时保留原因：`new XxxException("msg", cause)`                        |

## 3. 操作步骤

在 IDEA 中练习捕获与 finally：

1. **新建** `TryCatchDemo.java`，用 `try-catch` 捕获 `NumberFormatException`
2. **运行** 非法数字字符串 `"abc"` 的 `Integer.parseInt`，观察被捕获后程序继续执行
3. **加上 `finally`**：在其中 `System.out.println("清理");`，分别测试「正常结束」与「抛异常」两种路径
4. **新建** `TryWithResourceDemo.java`（见下文），对比手写 `finally` 关闭
5. **故意写错 catch 顺序**（父类在前），观察编译错误并改正

## 4. 语法与写法

### 4.1 基本 try-catch

```java
// 文件：TryCatchDemo.java
public class TryCatchDemo {
    public static void main(String[] args) {
        String input = "abc";
        try {
            int value = Integer.parseInt(input);
            System.out.println("结果: " + value);
        } catch (NumberFormatException e) {
            System.out.println("不是合法整数: " + input);
        }
        System.out.println("程序继续运行");
    }
}
```

### 4.2 try-catch-finally

```java
// 文件：FinallyDemo.java
public class FinallyDemo {
    public static int divide(int a, int b) {
        try {
            return a / b;
        } catch (ArithmeticException e) {
            System.out.println("除数不能为 0");
            return -1;
        } finally {
            System.out.println("divide 方法结束（finally）");
        }
    }

    public static void main(String[] args) {
        System.out.println(divide(10, 0));
        System.out.println(divide(10, 2));
    }
}
```

### 4.3 多个 catch（顺序：先具体后笼统）

```java
public static void parse(String s) {
    try {
        int n = Integer.parseInt(s);
        int[] arr = {1};
        System.out.println(arr[n]);
    } catch (NumberFormatException e) {
        System.out.println("数字格式错误");
    } catch (ArrayIndexOutOfBoundsException e) {
        System.out.println("下标越界");
    } catch (RuntimeException e) {
        System.out.println("其他运行时异常");
    }
}
```

### 4.4 try-with-resources（推荐关闭资源）

```java
// 文件：TryWithResourceDemo.java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class TryWithResourceDemo {
    public static void main(String[] args) {
        String path = "demo.txt";   // 课前可新建一个含一行文字的文本文件
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            String line = reader.readLine();
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("读文件失败: " + e.getMessage());
        }
        // reader 在此自动 close，无需手写 finally 里 close
    }
}
```

> `IOException` 是受检异常，必须 `catch` 或方法上 `throws`（下一节）。

## 5. 常见用法

1. **能 recover 就 catch 并给友好提示**；不能处理就向上抛（`throw` / `throws`）
2. **catch 具体类型**，避免一上来 `catch (Exception e)` 掩盖细节
3. **日志或打印**：至少记录 `e.getMessage()` 或 `printStackTrace()`，不要空 `catch`
4. **IO、连接**：优先 `try-with-resources` 防止忘记 `close()`

## 6. 易错点

- **catch 顺序颠倒**：`catch (Exception e)` 写在 `catch (IOException e)` 前面 → 编译错误「已捕获」
- **finally 里再抛异常**：可能掩盖 `try` 中的原始异常（进阶再学，初学避免在 finally 抛新异常）
- **return 与 finally**：`try` 里 `return` 后仍会执行 `finally`（理解执行顺序即可）
- **空 catch**：程序「看起来正常」其实逻辑错了，线上难查
- **用异常控制正常流程**：不要用抛异常代替 `if` 做业务分支

## 7. 本节小结

- **`try-catch`** 捕获并处理；**`finally`** 做收尾；多个 `catch` 要**先子类后父类**
- **`try-with-resources`** 自动关闭 `AutoCloseable` 资源，减少泄漏
- 实践：**具体捕获、记录信息、不吞异常**；IO 类受检异常必须处理或声明
