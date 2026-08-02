---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：异常处理与健壮性 · Java 面向对象与核心类库

## 1. 概述

本节区分  **`throw`**（方法体内**抛出**异常实例）与  **`throws`**（方法签名上**声明**可能抛出的受检异常），说明调用方如何处理，以及异常如何在调用链上传递。

## 2. 核心概念

| 术语       | 说明                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| `throw`    | 在方法内**主动创建并抛出**异常对象，如  `throw new IllegalArgumentException("余额不足");` |
| `throws`   | 写在方法签名后，**声明**该方法可能抛出的受检异常，交给调用方处理                          |
| 调用方义务 | 对受检异常：必须  **`try-catch`**  或继续在方法上  **`throws`**，否则编译不通过           |
| 异常传播   | 未捕获的异常沿调用栈向上抛，直到被  `catch`  或导致线程终止                               |
| 重新抛出   | `catch`  后记录日志再  `throw e;`  或包装后抛出，把问题交给上层决策                       |

## 3. 操作步骤

跟做「校验 + 抛出 + 声明 + 调用方捕获」：

1. **新建** `BankAccount.java`：字段  `balance`，方法  `withdraw(double amount)`  余额不足时  **`throw`** `IllegalArgumentException`
2. **运行** `AccountDemo`  正常取款与超额取款，观察控制台输出与异常
3. **新建** `FileReadHelper.java`：方法  `readFirstLine(String path) throws IOException`，内部用  `BufferedReader`  读文件
4. **在** `FileReadCaller.java`  的  `main`  里  **`try-catch IOException`**  调用  `readFirstLine`
5. **对比**：`withdraw`  不需  `throws`（非受检）；`readFirstLine`  必须  `throws`  或内部 catch（受检）

## 4. 语法与写法

### 4.1 throw：主动抛出（非受检示例）

```java
// 文件：BankAccount.java
public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("取款金额必须大于 0");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("余额不足，当前余额: " + balance);
        }
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}
```

```java
// 文件：AccountDemo.java
public class AccountDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("张三", 100);
        account.withdraw(30);
        System.out.println("余额: " + account.getBalance());

        try {
            account.withdraw(200);
        } catch (IllegalArgumentException e) {
            System.out.println("取款失败: " + e.getMessage());
        }
    }
}
```

### 4.2 throws：声明受检异常

```java
// 文件：FileReadHelper.java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class FileReadHelper {
    public static String readFirstLine(String path) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        }
    }
}
```

```java
// 文件：FileReadCaller.java
import java.io.IOException;

public class FileReadCaller {
    public static void main(String[] args) {
        try {
            String line = FileReadHelper.readFirstLine("demo.txt");
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }
    }
}
```

### 4.3 调用链继续 throws

```java
public class ReportLoader {
    public void load(String path) throws IOException {
        String line = FileReadHelper.readFirstLine(path);
        System.out.println(line);
    }
}
```

`load`  的调用者仍须处理  `IOException`，或继续声明  `throws`。

## 5. 常见用法

1. **参数非法**：方法开头校验，`throw new IllegalArgumentException(...)`
2. **业务规则失败**：余额不足、状态不对（第 4 节用自定义异常表达）
3. **工具方法读文件**：签名  `throws IOException`，由上层决定提示用户还是重试
4. **catch 后包装抛出**：`throw new RuntimeException("加载配置失败", e);`  保留原因

## 6. 易错点

- **受检异常只 throw 不 throws**：方法内  `throw new IOException(...)`  却未在签名声明 → 编译错误
- **throws 了却不处理**：`main`  写  `throws Exception`  可以编译，但异常仍会在运行期终止程序（初学  `main`  可临时用，业务方法慎用）
- **throw 与 throws 拼写混用**：`throw`  是语句；`throws`  只在方法签名
- **对 RuntimeException 写 throws**：合法但通常多余，调用方仍不强制 catch
- **catch 后什么都不做也不 throw**：问题被吃掉，上层无法感知

## 7. 本节小结

- **`throw`**：方法内抛出异常对象；**`throws`**：声明受检异常由调用方处理
- **受检异常**必须「catch 或继续 throws」；**非受检**编译不强制，但运行仍可能中断
- 会用  **`BankAccount` + `IllegalArgumentException`**  与  **`IOException` + throws**  两种典型模式
