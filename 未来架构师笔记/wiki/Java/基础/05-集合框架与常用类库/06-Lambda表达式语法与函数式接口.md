---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：函数式编程与常用类库 · Java 面向对象与核心类库

## 1. 概述

本节介绍 **Lambda 表达式** 的基本写法，以及与之配套的 **函数式接口（Functional Interface）** 概念，说明如何用简洁语法替代部分 **匿名内部类**（如 `Comparator`、`Runnable`）。

## 2. 核心概念

| 术语                    | 说明                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| Lambda 表达式           | 无方法名的简短函数写法，形如 `(参数) -> 表达式或代码块`                 |
| 函数式接口              | **只有一个抽象方法** 的接口；可用 `@FunctionalInterface` 标注           |
| 目标类型（Target Type） | Lambda 不单独存在类型，由**赋值左侧**或**方法参数类型**推断             |
| 方法引用                | 用 `类名::方法名` 或 `对象::方法名` 简写 Lambda，如 `String::compareTo` |
| `Predicate<T>`          | 接收 `T` 返回 `boolean` 的函数式接口，常用于 **filter** 条件            |
| `Function<T,R>`         | 接收 `T` 返回 `R`，常用于 **map** 转换                                  |
| `Consumer<T>`           | 接收 `T` 无返回值，常用于 **forEach**                                   |
| `Supplier<T>`           | 无参返回 `T`，常用于延迟提供对象                                        |

## 3. 操作步骤

在 IDEA 中对比匿名类与 Lambda：

1. **新建** `ComparatorLambdaDemo.java`，用 **匿名内部类** 对 `List<Student>` 按姓名排序并运行
2. **改写** 为 Lambda：`Comparator.comparing(Student::getName)` 或 `(a, b) -> a.getName().compareTo(b.getName())`
3. **新建** `LambdaDemo.java`，定义函数式接口 `StringProcessor`，用 Lambda 实现 `process`
4. **运行** 两个 Demo，确认排序与输出一致
5. **观察**：Lambda 左侧必须有 **函数式接口类型**（变量、参数或返回值）

## 4. 语法与写法

### 4.1 基本形式

```text
(参数列表) -> 表达式
(参数列表) -> { 语句; return 值; }
```

参数类型可省略（由编译器推断）；单参数可省略括号。

### 4.2 自定义函数式接口

```java
// 文件：LambdaDemo.java
@FunctionalInterface
interface StringProcessor {
    String process(String input);
}

public class LambdaDemo {
    public static void main(String[] args) {
        StringProcessor upper = s -> s.toUpperCase();
        System.out.println(upper.process("hello"));  // HELLO

        StringProcessor prefix = s -> "【" + s + "】";
        System.out.println(prefix.process("订单"));   // 【订单】
    }
}
```

### 4.3 替代 Comparator 匿名类

```java
// 文件：ComparatorLambdaDemo.java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class ComparatorLambdaDemo {
    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student("002", "李四"));
        students.add(new Student("001", "张三"));

        // 匿名内部类（第 4 章写法）
        Collections.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student a, Student b) {
                return a.getName().compareTo(b.getName());
            }
        });

        // Lambda 等价写法
        Collections.sort(students, (a, b) -> a.getName().compareTo(b.getName()));

        // 方法引用（更简洁）
        Collections.sort(students, Comparator.comparing(Student::getName));

        System.out.println(students);
    }
}
```

`Student` 类复用第 4 章 `学习文档/04-集合框架与泛型/05-集合遍历、排序与去重策略.md` 中的定义。

### 4.4 内置函数式接口示例

```java
import java.util.function.Predicate;

Predicate<String> notEmpty = s -> !s.isEmpty();
System.out.println(notEmpty.test(""));   // false
System.out.println(notEmpty.test("a"));  // true
```

## 5. 常见用法

1. **集合排序**：`Comparator.comparing(Student::getId)` 替代匿名 `Comparator`
2. **线程任务**：`new Thread(() -> System.out.println("run")).start();`（认识 `Runnable`）
3. **条件判断**：`Predicate<String>` 传给后续 Stream 的 `filter`（第 2 节）
4. **回调**：自定义函数式接口作为方法参数，调用方传入 Lambda

## 6. 易错点

- **Lambda 不能单独编译**：必须赋给函数式接口变量或作为函数式接口参数
- **接口有多个抽象方法**：不能当函数式接口用 Lambda（如普通 `Comparator` 还可有 `equals`，但 `Comparator` 本身是函数式接口因其仅一个抽象方法 `compare`）
- **局部变量在 Lambda 中使用须为 effectively final**：循环里修改的变量不能直接放进 Lambda
- **与第 4 章匿名类混用**：同一处逻辑只保留一种风格，优先 Lambda + 方法引用

## 7. 本节小结

- Lambda 写法：**`(参数) -> 表达式`**，配合 **函数式接口** 使用
- 常用内置接口：**`Predicate`、`Function`、`Consumer`、`Supplier`**
- 排序等场景可用 **`Comparator.comparing(类::方法)`** 替代冗长匿名类
