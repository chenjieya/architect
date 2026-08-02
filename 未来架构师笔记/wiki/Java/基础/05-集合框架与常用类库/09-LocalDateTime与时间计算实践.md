---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：函数式编程与常用类库 · Java 面向对象与核心类库

## 1. 概述

本节介绍 Java 8 **`java.time`**  包中的  **`LocalDate`、`LocalTime`、`LocalDateTime`**  及  **`Period`、`Duration`、`DateTimeFormatter`**，用于日期时间的创建、格式化和简单计算（本章不展开旧版  `Date`/`Calendar`  细节）。

## 2. 核心概念

| 术语                | 说明                                              |
| ------------------- | ------------------------------------------------- |
| `LocalDate`         | 仅日期（年-月-日），无时区                        |
| `LocalTime`         | 仅时间（时:分:秒）                                |
| `LocalDateTime`     | 日期 + 时间，无时区                               |
| `ZonedDateTime`     | 带时区的日期时间（认识即可）                      |
| `Period`            | 基于**日历**的间隔，如加 1 个月                   |
| `Duration`          | 基于**时间长度**的间隔，如加 2 小时               |
| `DateTimeFormatter` | 格式化与解析日期时间字符串                        |
| `now()`             | 获取当前日期/时间（系统默认时区下的「本地」概念） |

## 3. 操作步骤

在 IDEA 中完成时间计算：

1. **新建** `DateTimeDemo.java`，用  **`LocalDate.now()`**、**`LocalDateTime.now()`**  打印当前值
2. **构造**：`LocalDate.of(2026, 6, 1)`、`LocalTime.of(14, 30)`
3. **格式化**：`DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")`  格式化  `LocalDateTime`
4. **解析**：`LocalDate.parse("2026-06-01")`  或带 formatter 的  `parse`
5. **新建** `BookingTimeDemo.java`，预约开始时间加  **`Duration.ofHours(2)`**  得结束时间
6. **Period**：会员到期日  `expireDate = startDate.plus(Period.ofMonths(12))`
7. **运行**  核对输出格式与计算结果

## 4. 语法与写法

### 4.1 创建与获取

```java
// 文件：DateTimeDemo.java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class DateTimeDemo {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        LocalDateTime now = LocalDateTime.now();

        LocalDate deadline = LocalDate.of(2026, 12, 31);
        LocalDateTime meeting = LocalDateTime.of(2026, 6, 5, 14, 30);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        System.out.println(meeting.format(fmt));

        LocalDate parsed = LocalDate.parse("2026-06-01");
        System.out.println(parsed);
    }
}
```

### 4.2 Duration 与 Period

```java
// 文件：BookingTimeDemo.java
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.LocalDate;

public class BookingTimeDemo {
    public static void main(String[] args) {
        LocalDateTime start = LocalDateTime.of(2026, 6, 5, 10, 0);
        LocalDateTime end = start.plus(Duration.ofHours(2));
        System.out.println("结束：" + end);  // 12:00

        LocalDate memberStart = LocalDate.of(2026, 1, 1);
        LocalDate memberExpire = memberStart.plus(Period.ofMonths(12));
        System.out.println("到期：" + memberExpire);  // 2027-01-01
    }
}
```

### 4.3 比较与判断

```java
LocalDate a = LocalDate.of(2026, 6, 1);
LocalDate b = LocalDate.of(2026, 6, 5);
boolean before = a.isBefore(b);   // true
boolean after = a.isAfter(b);     // false
```

### 4.4 常用格式模式（认识）

| 模式   | 含义          |
| ------ | ------------- |
| `yyyy` | 四位年        |
| `MM`   | 两位月        |
| `dd`   | 两位日        |
| `HH`   | 24 小时制小时 |
| `mm`   | 分钟          |
| `ss`   | 秒            |

## 5. 常见用法

1. **订单创建时间**：`LocalDateTime.now()`  记入字段
2. **会员有效期**：`startDate.plus(Period.ofYears(1))`
3. **会议时长**：`start.plus(Duration.ofMinutes(90))`
4. **日志时间戳字符串**：`DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")`

## 6. 易错点

- **`LocalDateTime`  不含时区**：跨时区业务需  **`ZonedDateTime`**  或  `Instant`（进阶）
- **混用旧 API `Date`/`Calendar`**：新代码优先  **`java.time`**
- **月份从 1 开始**：`LocalDate.of(2026, 1, 1)`  是一月一日，不是 0
- **格式化模式大小写**：`MM`  是月，`mm`  是分钟；写反导致错误字符串
- **`parse`  格式不匹配**：字符串须与  `DateTimeFormatter`  模式一致，否则  **`DateTimeParseException`**

## 7. 本节小结

- 日期时间用  **`LocalDate` / `LocalTime` / `LocalDateTime`**，替代旧  `Date`  日常用法
- 间隔：**日历用  `Period`，时长用  `Duration`**
- 显示与解析：**`DateTimeFormatter.ofPattern(...)`**
