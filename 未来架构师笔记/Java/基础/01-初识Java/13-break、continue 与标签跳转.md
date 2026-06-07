> 所属：流程控制 · Java 语言基础入门

## 1. 概述

本节说明 **break**、**continue** 如何改变循环与 switch 的执行流，以及带**标签（label）**的跳转用法（本阶段了解即可，嵌套循环中会用到）。

## 2. 核心概念

| 术语              | 说明                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| break             | **立即终止**所在的最内层 `switch` 或循环，跳到其后继续执行                                 |
| continue          | **跳过本次**循环体剩余语句，进入**下一次**循环迭代（先执行 for 的更新或 while 的条件判断） |
| 标签（Label）     | 语句前的标识符，如 `outer:`，用于 `break` / `continue` **指定跳出哪一层**循环              |
| 带标签的 break    | `break 标签名;` 终止**标签所标记**的那层循环                                               |
| 带标签的 continue | `continue 标签名;` 跳到**标签所标记**循环的下一次迭代                                      |

## 3. 语法与写法

### 3.1 break 在 switch 中

（传统 switch 必讲；箭头写法默认不需要 break。）

```java
switch (n) {
    case 1:
        System.out.println("one");
        break;   // 防止 fall-through
    default:
        break;
}
```

### 3.2 break 在循环中

```java
public class JumpDemo {
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            if (i == 5) {
                break;   // 结束整个 for 循环
            }
            System.out.println(i);
        }
        // 输出 0 1 2 3 4
    }
}
```

### 3.3 continue 在循环中

```java
for (int i = 0; i < 5; i++) {
    if (i == 2) {
        continue;   // 跳过 i==2 时的 println
    }
    System.out.println(i);
}
// 输出 0 1 3 4
```

### 3.4 break 与 continue 对比

| 关键字     | 效果                           |
| ---------- | ------------------------------ |
| `break`    | 结束**整个**循环               |
| `continue` | 结束**当前这一轮**，继续下一轮 |

```java
// break：找到第一个大于 3 的偶数索引后停止
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0 && i > 3) {
        System.out.println("break at " + i);
        break;
    }
}

// continue：只打印奇数
for (int i = 0; i < 5; i++) {
    if (i % 2 == 0) {
        continue;
    }
    System.out.println(i);
}
```

### 3.5 带标签的 break / continue（嵌套循环）

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;   // 跳出外层 outer 循环，不是只 break 内层
        }
        System.out.println(i + "," + j);
    }
}
```

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) {
            continue outer;   // 外层 i 进入下一轮，内层 j 不再继续
        }
        System.out.println(i + "," + j);
    }
}
```

**标签命名**：合法标识符 + 冒号，如 `search:`、`outer:`。

## 4. 常见用法

1. **提前结束搜索**：找到目标后 `break`，不必跑完所有迭代。
2. **跳过无效数据**：某次迭代不符合条件时用 `continue` 处理下一项（配合后续数组遍历）。
3. **多层循环提前退出**：矩阵搜索命中后 `break outer`，避免多余内层循环。
4. **switch 防贯穿**：传统 `case` 末尾 `break`（见第 2 节学习文档）。

## 5. 易错点

- **continue 后仍执行更新**：在 `for` 中 `continue` 会跳到**更新表达式**再判断条件，不是跳过更新。
- **break 只跳一层**：无标签时只退出**最内层**循环；外层仍继续。
- **标签必须标记循环**：`break label` 的 label 须标在**循环语句**上，不能标在普通块上（Java 不允许 `break` 跳出任意块）。
- **滥用标签**：层数多、逻辑复杂时，优先**重构方法**或**布尔标志**，标签仅作了解。
- **switch 中无 continue**：`continue` 只能用于循环，不能用于 switch（编译错误）。

## 6. 本节小结

- `break`：结束当前 switch 或**最内层**循环；带标签则结束**标记的那层**循环
- `continue`：跳过本轮剩余代码，进入下一轮循环
- 传统 switch 依赖 `break`；循环中合理使用 break/continue 可简化逻辑
- 标签跳转用于**嵌套循环**提前退出；不宜过度使用
