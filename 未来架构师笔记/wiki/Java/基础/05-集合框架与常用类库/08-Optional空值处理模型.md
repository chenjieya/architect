---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：函数式编程与常用类库 · Java 面向对象与核心类库

## 1. 概述

本节介绍  **`Optional<T>`**  如何显式表达「值可能不存在」，以及  **`of` / `ofNullable` / `orElse` / `map` / `ifPresent`**  等常用 API，减少直接  **`null`**  判断带来的遗漏。

## 2. 核心概念

| 术语                         | 说明                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `Optional<T>`                | 可能包含一个非 null 值  `T`  的容器，或为空（empty） |
| `Optional.of(value)`         | 包装**非 null**  值；传入 null 会  **NPE**           |
| `Optional.ofNullable(value)` | 值为 null 时得到  **empty**，否则包装值              |
| `Optional.empty()`           | 明确表示无值的实例                                   |
| `isPresent()`                | 是否有值                                             |
| `orElse(default)`            | 无值时返回默认值                                     |
| `orElseGet(Supplier)`        | 无值时**延迟**计算默认值（避免无谓创建对象）         |
| `map`                        | 有值时对内容转换，无值保持 empty                     |
| `ifPresent(Consumer)`        | 有值时执行副作用，无值跳过                           |

## 3. 操作步骤

在 IDEA 中练习 Optional：

1. **新建** `UserLookupService.java`，方法  `findNicknameById(Long id)`  返回  `Optional<String>`
2. **模拟**：id 为  `1L`  返回  `Optional.of("张三")`，其他 id 返回  `Optional.empty()`
3. **新建** `OptionalDemo.java`，分别用  **`orElse`**、**`ifPresent`**  处理结果
4. **对比**：不用 Optional 时直接  `String name = map.get(id); if (name != null)`  的写法
5. **运行**  确认无值分支不抛 NPE

## 4. 语法与写法

### 4.1 UserLookupService

```java
// 文件：UserLookupService.java
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class UserLookupService {
    private final Map<Long, String> nicknameById = new HashMap<>();

    public UserLookupService() {
        nicknameById.put(1L, "张三");
        nicknameById.put(2L, "李四");
    }

    public Optional<String> findNicknameById(Long id) {
        return Optional.ofNullable(nicknameById.get(id));
    }
}
```

### 4.2 OptionalDemo

```java
// 文件：OptionalDemo.java
public class OptionalDemo {
    public static void main(String[] args) {
        UserLookupService service = new UserLookupService();

        String name1 = service.findNicknameById(1L)
                .orElse("访客");
        System.out.println(name1);  // 张三

        String name99 = service.findNicknameById(99L)
                .orElse("访客");
        System.out.println(name99);  // 访客

        service.findNicknameById(2L)
                .ifPresent(n -> System.out.println("欢迎：" + n));

        String upper = service.findNicknameById(1L)
                .map(String::toUpperCase)
                .orElse("UNKNOWN");
        System.out.println(upper);  // 张三（若环境为中文则 toUpperCase 不变，演示 map 链）
    }
}
```

### 4.3 of 与 ofNullable 区别

```java
Optional<String> a = Optional.of("ok");        // 必须有值
Optional<String> b = Optional.ofNullable(null); // empty，不抛异常
// Optional.of(null);  // 运行期 NullPointerException
```

### 4.4 orElse 与 orElseGet

```java
Optional<String> empty = Optional.empty();
String v1 = empty.orElse(expensiveDefault());           // 总会先算 default 参数（了解）
String v2 = empty.orElseGet(() -> expensiveDefault());  // 仅无值时才执行 Supplier
```

## 5. 常见用法

1. **查询可能无结果**：DAO/Service 返回  `Optional<T>`  而非 null
2. **链式转换**：`optional.map(User::getEmail).orElse("无邮箱")`
3. **有值才处理**：`optional.ifPresent(this::sendMail)`
4. **与 Stream 配合**：`stream.map(...).filter(Optional::isPresent).map(Optional::get)`（进阶认识）

## 6. 易错点

- **`Optional.get()`  无值时抛异常**：优先  **`orElse` / `orElseGet` / `ifPresent`**
- **到处包 Optional 又立刻 get**：失去表达意义；在**边界**（API 返回值）使用即可
- **把 Optional 当字段长期存储**：初学不推荐；多用于**方法返回值**
- **`orElse`  传入昂贵计算**：应改  **`orElseGet`**
- **与第 3 章 NPE 习惯**：`Map.get`  仍可能 null，可  `Optional.ofNullable(map.get(key))`

## 7. 本节小结

- 创建：**`ofNullable`**  最常用；明确无值用  **`empty()`**
- 取值：**`orElse` / `orElseGet` / `ifPresent`**，避免裸  **`get()`**
- 转换：**`map`**  链式处理；Optional 表达「可能没有」，不替代所有 null 检查
