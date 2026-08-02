---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：流程控制 · Java 语言基础入门

## 1. 概述

本节说明  **switch**  对**单个表达式**的多路分支写法，包括传统  `case` + `break`  与 JDK 17 支持的**箭头写法 / switch 表达式**，以及何时用 switch、何时用 if-else。

## 2. 核心概念

| 术语             | 说明                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| switch 语句      | 根据**一个表达式的值**，跳转到匹配的  `case`  执行                        |
| case 标签        | `case 常量:`  或  `case 常量 ->`，常量须为**编译期可确定**的值            |
| break            | 在传统写法中**跳出** switch，防止**贯穿（fall-through）**到下一个 case    |
| fall-through     | 未写  `break`  时，执行流**继续**进入下一个 case（有时故意连用多个 case） |
| default          | 所有 case 都不匹配时的**默认**分支                                        |
| 箭头写法（`->`） | Java 14+：匹配后直接执行右侧语句/块，**默认不贯穿**                       |
| switch 表达式    | 整个 switch 可**求出一个值**，用  `yield`  或  `->`  返回值（JDK 17）     |

## 3. 语法与写法

### 3.1 传统 switch（带 break）

**支持类型（本阶段常用）**：`byte`、`short`、`int`、`char`、`String`、枚举（后续章节）。

```java
public class SwitchDemo {
    public static void main(String[] args) {
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("星期一");
                break;
            case 2:
                System.out.println("星期二");
                break;
            case 3:
                System.out.println("星期三");
                break;
            default:
                System.out.println("其他");
                break;
        }
    }
}
```

### 3.2 故意 fall-through（多 case 共用逻辑）

```java
switch (day) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        System.out.println("工作日");
        break;
    case 6:
    case 7:
        System.out.println("周末");
        break;
    default:
        System.out.println("无效日期");
}
```

### 3.3 箭头写法（推荐，JDK 17）

**无需 break**，不会 fall-through 到下一 case：

```java
switch (day) {
    case 1 -> System.out.println("星期一");
    case 2 -> System.out.println("星期二");
    case 3 -> System.out.println("星期三");
    default -> System.out.println("其他");
}
```

多个常量可合并：

```java
switch (day) {
    case 1, 2, 3, 4, 5 -> System.out.println("工作日");
    case 6, 7 -> System.out.println("周末");
    default -> System.out.println("无效");
}
```

### 3.4 switch 表达式（求值）

```java
int day = 5;
String type = switch (day) {
    case 1, 2, 3, 4, 5 -> "工作日";
    case 6, 7 -> "周末";
    default -> "无效";
};
System.out.println(type);
```

块内多条语句时用  `yield`  返回值：

```java
String msg = switch (day) {
    case 1, 2, 3, 4, 5 -> {
        System.out.println("计算中...");
        yield "工作日";
    }
    default -> "其他";
};
```

### 3.5 String 作为 switch 表达式

```java
String cmd = "start";
switch (cmd) {
    case "start" -> System.out.println("启动");
    case "stop" -> System.out.println("停止");
    default -> System.out.println("未知命令");
}
```

**注意**：`String`  比较的是**内容**；不要用  `==`  比较字符串内容（第 4 章字符串会细讲）。

## 4. 常见用法

1. **离散常量映射**：星期、菜单编号、命令字（`"start"` / `"stop"`）。
2. **多 case 合并**：多个值走同一逻辑，传统写法省略  `break`  串联，箭头写法用  `case 1, 2, 3`。
3. **有默认分支**：业务上总有「其他」时用  `default`，避免静默无输出。
4. **switch vs if-else**：**单变量、多常量**时 switch 更清晰；**区间、复杂布尔组合**用 if-else。

## 5. 易错点

- **忘记 break（传统写法）**：执行完一个 case 后**继续执行**下一 case，输出不符合预期。
- **case 不是常量**：`case x:`  若  `x`  是变量 → 编译错误；必须是字面量或  `final`  编译期常量。
- **重复 case 值**：同一 switch 中两个相同 case 常量 → 编译错误。
- **类型不匹配**：`switch`  表达式类型与  `case`  常量类型须兼容。
- **混用风格**：同一 switch 内不要混用  `case 1:`  与  `case 2 ->`（语法不允许）。

## 6. 本节小结

- switch 适合**单表达式、多离散值**分支；区间判断用 if-else
- **传统写法**依赖  `break`  防 fall-through；**箭头写法**默认不贯穿
- switch **表达式**可赋值给变量，块内用  `yield`  返回
- 本课环境  **JDK 17**，优先练习箭头写法与表达式形式
