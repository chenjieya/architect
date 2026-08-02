---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：集合框架与泛型 · Java 面向对象与核心类库

## 1. 概述

`ArrayList` 与 `LinkedList` 都实现 **`List` 接口**，对外 API 相似，但**内部存储结构不同**，导致在随机访问、中间插入等场景下性能与用法偏好不同。本节通过操作与示例建立选型直觉。

## 2. 核心概念

| 术语               | 说明                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `ArrayList`        | 内部是**可扩容数组**；按下标 `get(i)`、`set(i)` 快                                                |
| `LinkedList`       | 内部是**双向链表**节点；按索引访问需从头/尾遍历，慢                                               |
| 容量（capacity）   | `ArrayList` 数组当前可存长度；元素个数用 `size()`                                                 |
| 扩容               | `ArrayList` 满时创建更大数组并复制元素（对使用者透明）                                            |
| 头尾操作           | `LinkedList` 提供 `addFirst`/`addLast` 等，适合双端队列式用法                                     |
| 时间复杂度（初学） | `ArrayList` 随机读 **O(1)**；中间插入/删除常需移动元素 **O(n)**；`LinkedList` 按索引访问 **O(n)** |

## 3. 操作步骤

在 IDEA 中对比两种 List：

1. **新建** `ArrayListLinkedListDemo.java`
2. **ArrayList**：`List<Integer> arr = new ArrayList<>();` 循环 `add(i)` 一万次，记录耗时（可选 `System.nanoTime()`）
3. **LinkedList**：`List<Integer> link = new LinkedList<>();` 同样循环 `add`
4. **随机读**：各 `add` 1000 个元素后，循环 `get(500)` 一万次，对比耗时（`ArrayList` 通常明显更快）
5. **中间插入**：`arr.add(0, 99)` 与 `link.add(0, 99)` 观察在大列表上 `ArrayList` 更慢的现象（理解即可，不必死记常数）
6. **运行**下方 `ProductCatalog` 示例

## 4. 语法与写法

### 4.1 ArrayList 常用 API

```java
// 文件：ProductCatalog.java
import java.util.ArrayList;
import java.util.List;

public class ProductCatalog {
    private final List<String> products = new ArrayList<>();

    public void addProduct(String name) {
        products.add(name);
    }

    public String getProduct(int index) {
        return products.get(index);
    }

    public int count() {
        return products.size();
    }
}
```

### 4.2 LinkedList 双端操作

```java
// 文件：TaskQueue.java
import java.util.LinkedList;
import java.util.List;

public class TaskQueue {
    private final LinkedList<String> queue = new LinkedList<>();

    public void enqueue(String task) {
        queue.addLast(task);
    }

    public String dequeue() {
        return queue.isEmpty() ? null : queue.removeFirst();
    }
}
```

### 4.3 对比小结（记结论即可）

| 操作场景                     | 更合适                  |
| ---------------------------- | ----------------------- |
| 大量 `get(i)` / 遍历按下标   | `ArrayList`             |
| 只在尾部 `add`               | `ArrayList`（通常足够） |
| 频繁在头尾插入删除、当队列用 | `LinkedList`            |
| 无特殊理由的通用 List        | **`ArrayList`**         |

```java
// 文件：ArrayListLinkedListDemo.java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ArrayListLinkedListDemo {
    public static void main(String[] args) {
        List<String> arr = new ArrayList<>();
        arr.add("中");
        arr.add("间");
        arr.add(1, "间前插入");  // 下标 1 插入

        List<String> link = new LinkedList<>();
        ((LinkedList<String>) link).addFirst("队头");
        link.add("队尾");
        System.out.println(arr);
        System.out.println(link);
    }
}
```

## 5. 常见用法

1. **商品列表、成绩列表**：`ArrayList`
2. **简单任务队列（头出尾进）**：`LinkedList` 的 `addLast`/`removeFirst`
3. **需要 `List` 但不知道用谁**：先 `ArrayList`，性能瓶颈再测再换

## 6. 易错点

- **凡是用 List 就上 LinkedList**：多数业务 `ArrayList` 更快、更省内存
- **把 `LinkedList` 当数组频繁 `get(i)`**：索引越大越慢
- **强转不当**：`List` 引用要调用 `addFirst` 需保证实际是 `LinkedList`，或字段直接声明 `LinkedList`
- **在 for-each 里边遍历边删**：应使用 `Iterator.remove()`（第 5 节）

## 7. 本节小结

- **`ArrayList`**：数组实现，**随机访问快**，默认首选
- **`LinkedList`**：链表实现，**按索引慢**，适合头尾队列式操作
- 选型看**主要操作**：读多写少 → `ArrayList`；双端队列 → `LinkedList`
