---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：流程控制 · Java 语言基础入门

## 1. 概述

本节说明如何用 **if / else if / else** 根据**布尔条件**选择不同代码路径，以及多分支、嵌套分支的常见写法与易错点。

## 2. 核心概念

| 术语                       | 说明                                                         |
| -------------------------- | ------------------------------------------------------------ |
| 条件分支                   | 根据条件真假，**只执行其中一条**路径的语句                   |
| if 语句                    | `if (条件) { ... }`，条件为 `true` 时执行块内语句            |
| else if                    | 在前序条件为 `false` 时，**继续判断**下一个条件              |
| else                       | 前面所有条件都不满足时执行的**默认**分支                     |
| 布尔表达式                 | 结果为 `true` 或 `false` 的表达式，如 `score >= 60`          |
| 代码块（Block）            | 一对 `{ }` 包裹的多条语句，形成独立作用域                    |
| 悬空 else（Dangling else） | 多个 `if`/`else` 嵌套时，`else` 与**最近**的未配对 `if` 绑定 |

## 3. 语法与写法

### 3.1 单分支 if

```java
public class BranchDemo {
    public static void main(String[] args) {
        int score = 85;
        if (score >= 60) {
            System.out.println("及格");
        }
    }
}
```

### 3.2 if-else 双分支

```java
if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

### 3.3 if-else if-else 多分支

**规则**：从上到下依次判断，**命中一条后不再判断后续**。

```java
int score = 72;
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

### 3.4 省略花括号（不推荐）

单条语句可省略 `{ }`，但团队规范通常**要求始终写花括号**，避免后续加语句时逻辑出错。

```java
if (score >= 60)
    System.out.println("及格");  // 合法，但易维护出错
```

### 3.5 嵌套 if

内层 `if` 写在外层 `if` 的块内，用于**组合条件**：

```java
int age = 20;
boolean hasTicket = true;
if (age >= 18) {
    if (hasTicket) {
        System.out.println("可以入场");
    } else {
        System.out.println("请先购票");
    }
} else {
    System.out.println("未成年限制入场");
}
```

**可读性更好**的写法常把嵌套改为 **逻辑与** `&&`：

```java
if (age >= 18 && hasTicket) {
    System.out.println("可以入场");
} else if (age >= 18) {
    System.out.println("请先购票");
} else {
    System.out.println("未成年限制入场");
}
```

### 3.6 条件必须是 boolean

```java
int x = 1;
// if (x) { }           // 编译错误：int 不能当条件
if (x > 0) {            // 正确
    System.out.println("正数");
}

// if (x = 1) { }       // 编译错误：= 是赋值，不是比较
if (x == 1) {           // 正确
    System.out.println("等于 1");
}
```

## 4. 常见用法

1. **区间判断**：用 `else if` 链表示互斥区间（分数段、年龄段）。
2. **边界校验**：先判非法输入（如 `score < 0 || score > 100`），再判业务分支。
3. **二选一默认**：只有两种结果时用 `if-else`，超过两种用 `else if` 链。
4. **提前返回/打印**：在 `main` 或后续章节的方法里，满足条件则执行对应逻辑（本阶段以 `println` 为主）。

## 5. 易错点

- **条件写赋值**：`if (x = 1)` 编译失败；比较相等用 \` == \`。
- **else if 顺序颠倒**：若先写 `>= 60` 再写 `>= 90`，高分也会被归入「及格」——**更严格的条件应写在前面**。
- **悬空 else**：`if (a) if (b) x; else y;` 中 `else` 属于内层 `if (b)`，不是外层 `if (a)`。
- **块作用域**：`if` 块内声明的变量，块外不可见（与第 2 章作用域规则一致）。
- **浮点相等**：`double` 用 \` == \` 比较常不可靠；本阶段整数比较为主，浮点比较后续再展开。

## 6. 本节小结

- `if / else if / else` 实现**互斥多分支**，命中一条即停止后续判断
- 条件必须是 **boolean**；比较用 \` == \`，勿写赋值 \` = \`
- 多区间判断时 **先严后宽**；复杂嵌套可改写为 `&&` / `||` 或 `else if` 链
- 建议 **始终使用花括号** 包裹分支体
