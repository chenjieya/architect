---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：开发环境与第一个程序 · Java 语言基础入门

## 1. 概述

本节说明 `.java` 到程序运行的基本流程、`main` 方法签名，以及 **JIT** 的浅层含义。编译期与 JS 的**准确对比**见教案。

## 2. 核心概念

| 术语                            | 说明                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 源文件                          | 扩展名 `.java`，人类编写的文本                                                                                                |
| 字节码                          | 扩展名 `.class`，由 `javac` 生成，供 JVM 执行                                                                                 |
| 编译（javac）                   | **编译期**将源码转为字节码，并进行语法与主要类型检查                                                                          |
| JVM                             | **运行期**加载 `.class`，解释执行字节码                                                                                       |
| JIT（Just-In-Time compilation） | **即时编译**：JVM 在**运行过程中**将**频繁执行**的字节码编译为本地机器码，以提升性能；与 `javac` 生成 `.class` **不是同一步** |
| 入口方法                        | `public static void main(String[] args)`，JVM 启动程序时调用的固定入口                                                        |

## 3. 操作步骤

### 3.1 命令行编译与运行

在 `HelloWorld.java` 所在目录（本节假设无 `package`）：

```bash
javac HelloWorld.java
java HelloWorld
```

- `javac` 生成 `HelloWorld.class`
- `java` 后的参数是**类名**，不是文件名：❌ `java HelloWorld.class`

带命令行参数：

```bash
java HelloWorld hello world
```

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("参数个数: " + args.length);
        for (String arg : args) {
            System.out.println(arg);
        }
    }
}
```

### 3.2 main 方法标准签名（需背熟）

```java
public static void main(String[] args)
```

| 部分            | 含义                                               |
| --------------- | -------------------------------------------------- |
| `public`        | 可被 JVM 从外部调用                                |
| `static`        | 属于类本身；JVM 启动时尚未创建对象，必须能直接调用 |
| `void`          | 无返回值                                           |
| `main`          | 固定方法名                                         |
| `String[] args` | 命令行参数字符串数组                               |

## 4. 语法与写法

### 4.1 最小程序

```java
public class App {
    public static void main(String[] args) {
        System.out.println("start");
    }
}
```

### 4.2 注释

```java
// 单行注释
System.out.println("ok"); /* 行尾块注释 */
```

## 5. 常见用法

1. **日常开发**：IDEA 一键 Run；**学习阶段仍须会** `javac` + `java`
2. **一个文件多个类**：可有多个非 public 类；**最多一个** `public` 类且与文件名同
3. **IDEA 编译产物**：一般在 `out/production/项目名/` 下

## 6. 易错点

- **`java App.class`**：错误，应写 `java App`
- **缺少 `main` 或签名不对**：运行报 `Error: Main method not found in class: X`
- **缺少 `static` 的 main**（常见考题）：

```java
public class Test {
    public void main(String[] args) {  // 缺少 static
        System.out.println("ok");
    }
}
```

- **编译**：✅ `javac Test.java` 可通过（编译器把它当作普通实例方法）
- **运行**：❌ `java Test` → `Main method not found in class: Test`
- **原因**：JVM 只认 `public static void main(String[] args)`，不会 `new Test()` 再去调实例方法
- **混淆 javac 与 JIT**：`javac` 在运行前生成 `.class`；**JIT 在 JVM 运行期间**优化热点代码，两者阶段不同

## 7. 本节小结

- 流程：**`.java` →（javac）→ `.class` →（JVM + 必要时 JIT）→ 运行结果**
- 入口：**`public static void main(String[] args)`**；缺 `static` 可能**编译过、运行失败**
- `java` 参数是**类名**；`args` 接收命令行参数
