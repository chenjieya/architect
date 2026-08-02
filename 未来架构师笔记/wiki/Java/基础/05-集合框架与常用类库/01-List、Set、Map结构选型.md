---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：集合框架与泛型 · Java 面向对象与核心类库

## 1. 概述

本节介绍 Java **集合框架（Collections Framework）** 的三大常用结构：**List**、**Set**、**Map**，说明各自语义与典型实现类，并给出业务场景下的**选型思路**。

## 2. 核心概念

| 术语             | 说明                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 集合框架         | JDK 提供的一组存放多个对象的接口与实现类，统一在 `java.util` 包              |
| `Collection`     | 单列集合的根接口；**不包含** `Map`                                           |
| `List`           | **有序**、可重复；按下标访问，如 `ArrayList`、`LinkedList`                   |
| `Set`            | **不允许重复元素**（由 `equals`/`hashCode` 判定）；常见 `HashSet`、`TreeSet` |
| `Map`            | **键值对（Key-Value）**；键不重复，一个键对应一个值；常见 `HashMap`          |
| `ArrayList`      | 基于**动态数组**的 `List`，随机访问快                                        |
| `LinkedList`     | 基于**双向链表**的 `List`，首尾插入相对灵活                                  |
| `HashSet`        | 基于哈希表的 `Set`，**不保证**遍历顺序                                       |
| `HashMap`        | 基于哈希表的 `Map`，通过键快速查找值                                         |
| 泛型（Generics） | 写法如 `List<String>`，编译期约束元素类型，减少强转错误                      |

## 3. 操作步骤

在 IDEA 中对比三种结构：

1. **新建** `ListSetMapDemo.java`
2. **List**：`List<String> names = new ArrayList<>();` 连续 `add("张三")` 两次，观察 `size()` 为 2
3. **Set**：`Set<String> tags = new HashSet<>();` 两次 `add("Java")`，观察 `size()` 为 1
4. **Map**：`Map<String, Integer> scores = new HashMap<>();` `put("李四", 90)` 再 `put("李四", 95)`，观察键唯一、值为 95
5. **遍历**：List 用 for-each；Set 用 for-each；Map 用 `entrySet()` 的 for-each（见第 5 节详讲）
6. **运行** `ListSetMapDemo`（下方语法）核对输出

## 4. 语法与写法

### 4.1 体系关系（初学必记）

```text
Iterable
└── Collection
    ├── List     → ArrayList, LinkedList
    └── Set      → HashSet, TreeSet
Map（独立接口，不继承 Collection）
└── HashMap, TreeMap, LinkedHashMap
```

### 4.2 List / Set / Map 最小示例

```java
// 文件：ListSetMapDemo.java
import java.util.*;

public class ListSetMapDemo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("A");
        list.add("A");
        System.out.println("List size=" + list.size());  // 2，允许重复

        Set<String> set = new HashSet<>();
        set.add("A");
        set.add("A");
        System.out.println("Set size=" + set.size());    // 1，去重

        Map<String, Integer> map = new HashMap<>();
        map.put("Tom", 80);
        map.put("Tom", 90);
        System.out.println("Map Tom=" + map.get("Tom")); // 90，键覆盖
    }
}
```

### 4.3 声明接口、创建实现类（推荐写法）

```java
List<String> items = new ArrayList<>();
Set<Integer> ids = new HashSet<>();
Map<Long, String> cache = new HashMap<>();
```

左侧写**接口类型**，右侧 `new` **具体实现**，便于以后替换实现类。

### 4.4 选型对照表

| 需求                         | 优先结构 | 常用实现                    |
| ---------------------------- | -------- | --------------------------- |
| 有序列表、允许重复、按下标取 | `List`   | `ArrayList`（默认首选）     |
| 只要唯一、不关心顺序         | `Set`    | `HashSet`                   |
| 按唯一键查值                 | `Map`    | `HashMap`                   |
| 键值对且要保持插入顺序       | `Map`    | `LinkedHashMap`（认识即可） |

## 5. 常见用法

1. **购物车行项目**：用 `List` 保留顺序与重复 SKU 数量行
2. **用户已选标签去重**：用 `Set<String>`
3. **学号 → 姓名**：用 `Map<String, String>`
4. **默认 List 实现**：业务代码无特殊理由时 **`new ArrayList<>()`**

## 6. 易错点

- **用 List 当 Set 手动去重**：易漏逻辑；应直接用 `Set` 或第 5 节的 `HashSet` 包装
- **把 Map 当成 Collection**：`Map` 没有 `add()`，用 `put(key, value)`
- **裸类型 `List list`**：失去泛型检查，易运行期 `ClassCastException`（第 4 节详讲）
- **认为 Set 一定有序**：`HashSet` 遍历顺序不稳定；要排序用 `TreeSet`（需元素可比较，进阶）

## 7. 本节小结

- **List** 有序可重复；**Set** 不重复；**Map** 键不重复、键值查找
- 日常 **List 默认 `ArrayList`**，去重用 **`HashSet`**，键值用 **`HashMap`**
- 声明用 **接口 + 泛型**，如 `List<String> list = new ArrayList<>()`
