---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：集合框架与泛型 · Java 面向对象与核心类库

## 1. 概述

`HashMap`  是最常用的  **Map**  实现，通过键的  **哈希值（hash）**  定位存储位置，实现近似  **O(1)**  的查找。本节说明  **`hashCode`/`equals`**  与键的关系、**哈希冲突**  的处理方式，以及使用时的典型坑。

## 2. 核心概念

| 术语                    | 说明                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `HashMap`               | 基于哈希表 + 链表/红黑树（JDK 8+）的  `Map`  实现                     |
| 键（Key）               | `Map`  中用于查找的唯一标识；**键不重复**                             |
| 值（Value）             | 与键绑定的数据；不同键可映射相同值                                    |
| `hashCode()`            | `Object`  的方法；哈希表用其计算桶位置                                |
| `equals()`              | 判断两个键是否「同一个」；`HashMap`  先比  `hashCode`  再比  `equals` |
| 哈希冲突                | 不同键算出相同桶位置，需在同一桶内再比较  `equals`                    |
| 链表法                  | 同一桶内用链表存放多个条目（JDK 8 前常见形态）                        |
| 负载因子（load factor） | 默认  **0.75**；元素过多会  **扩容**  桶数组，降低冲突                |
| `null`  键              | `HashMap` **允许一个** `null`  键；`null`  值也允许                   |

## 3. 操作步骤

在 IDEA 中观察 HashMap 行为：

1. **新建** `HashMapDemo.java`，`put("语文", 90)`、`put("数学", 85)`，`get("语文")`
2. **覆盖**：再  `put("语文", 95)`，打印  `get("语文")`  应为 95
3. **键不存在**：`get("英语")`  返回  **`null`**，勿与值为  `null`  混淆
4. **遍历**：`for (Map.Entry<String, Integer> e : map.entrySet())`  打印键值
5. **运行** `UserSessionMap`：用  `Long`  用户 id 作键
6. **自定义键类（认识）**：若用自建类作键，须正确重写  **`equals`  与  `hashCode`**（与第 2 章对象相等一致）

## 4. 语法与写法

### 4.1 基本用法

```java
// 文件：HashMapDemo.java
import java.util.HashMap;
import java.util.Map;

public class HashMapDemo {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 88);
        scores.put("Bob", 92);
        scores.put("Alice", 90);   // 同键覆盖

        System.out.println(scores.get("Alice"));  // 90
        System.out.println(scores.containsKey("Bob"));
        System.out.println(scores.size());        // 2
    }
}
```

### 4.2 冲突处理（原理浅述）

```text
put(key, value)
  → 计算 key.hashCode() → 映射到桶下标
  → 桶内已有条目？
       否 → 直接放入
       是 → 用 equals 比较是否同一键
              是 → 覆盖 value
              否 → 冲突：链表（或树）挂多个 Entry
```

JDK 8+：链表过长会转为  **红黑树**  以优化极端冲突（了解即可）。

### 4.3 常用 API

| 方法                                   | 说明                   |
| -------------------------------------- | ---------------------- |
| `put(k, v)`                            | 放入或覆盖             |
| `get(k)`                               | 取值；无键返回  `null` |
| `remove(k)`                            | 删除键值对             |
| `containsKey(k)`                       | 是否包含键             |
| `keySet()` / `values()` / `entrySet()` | 三种视图               |

```java
// 文件：UserSessionMap.java
import java.util.HashMap;
import java.util.Map;

public class UserSessionMap {
    private final Map<Long, String> sessionByUserId = new HashMap<>();

    public void login(long userId, String token) {
        sessionByUserId.put(userId, token);
    }

    public String getToken(long userId) {
        return sessionByUserId.get(userId);
    }
}
```

## 5. 常见用法

1. **用户 ID → 对象缓存**：`Map<Long, User>`
2. **配置项名 → 配置值**：`Map<String, String>`
3. **统计词频**：`get`  为  `null`  时置 1，否则  `+1`（或用  `getOrDefault`，认识即可）

## 6. 易错点

- **自定义类作键却不重写  `hashCode`/`equals`**：逻辑上「不同对象同 id」却存成两条
- **`get`  返回  `null`  就认定键不存在**：值本身可能为  `null`，应用  **`containsKey`**
- **遍历时修改结构**：应用  `entrySet`  的 Iterator 删除，或  `remove(key)`，勿在增强 for 里直接删  `keySet`（会  `ConcurrentModificationException`）
- **用可变对象作键且修改参与  `hashCode`  的字段**：会导致找不到原条目（进阶坑，先记住「键字段应不可变」）

## 7. 本节小结

- `HashMap`  靠  **键的  `hashCode`  定位桶**，**`equals`  区分同键与冲突**
- **冲突**  用桶内链表（及树）解决；负载过高会  **扩容**
- 使用：**`put`/`get`/`containsKey`**；自定义键类必须  **`equals` + `hashCode`**
