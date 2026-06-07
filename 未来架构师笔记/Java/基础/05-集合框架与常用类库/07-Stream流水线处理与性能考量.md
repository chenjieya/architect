> 所属：函数式编程与常用类库 · Java 面向对象与核心类库

## 1. 概述

本节介绍 **`Stream`** 的 **流水线（Pipeline）** 写法：从集合等数据源经过 **中间操作** 到 **终端操作** 完成过滤、映射、排序与收集，并说明初学阶段的 **性能与 parallelStream 注意点**。

## 2. 核心概念

| 术语                           | 说明                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `Stream<T>`                    | 对元素序列的一次性、通常不存储数据的处理视图                                            |
| 数据源                         | 如 `list.stream()`、`Arrays.stream(arr)`，**不修改原集合**（终端 `collect` 生成新结果） |
| 中间操作                       | `filter`、`map`、`sorted`、`distinct` 等；**惰性求值**，串联成流水线                    |
| 终端操作                       | `collect`、`forEach`、`count`、`reduce` 等；**触发**整条流水线执行                      |
| `collect(Collectors.toList())` | 将 Stream 结果收集为 `List`                                                             |
| `map`                          | 将每个元素映射为另一种类型或值                                                          |
| `filter`                       | 按 `Predicate` 保留满足条件的元素                                                       |
| `parallelStream`               | 并行流；多线程处理，**小数据量通常更慢**                                                |
| 短路操作                       | 如 `findFirst`、`anyMatch`，满足条件可提前结束                                          |

## 3. 操作步骤

在 IDEA 中完成 Stream 流水线：

1. **新建** `Order.java`（订单号、金额、状态字段）
2. **新建** `StreamPipelineDemo.java`，从 `List<Order>` 创建 `stream()`
3. **流水线**：`filter` 状态为 `PAID` → `map` 取金额 → `sorted` → `collect(toList())`
4. **运行** 打印结果列表
5. **对比**：用第 4 章 for-each + if 写同等逻辑，体会代码行数差异
6. **勿滥用** `parallelStream()`：本课示例数据量小，保持 **串行 `stream()`**

## 4. 语法与写法

### 4.1 Order 模型

```java
// 文件：Order.java
public class Order {
    private final String orderNo;
    private final double amount;
    private final String status;  // 如 PAID, CANCELLED

    public Order(String orderNo, double amount, String status) {
        this.orderNo = orderNo;
        this.amount = amount;
        this.status = status;
    }

    public String getOrderNo() { return orderNo; }
    public double getAmount() { return amount; }
    public String getStatus() { return status; }

    @Override
    public String toString() {
        return orderNo + ":" + amount + "(" + status + ")";
    }
}
```

### 4.2 典型流水线

```java
// 文件：StreamPipelineDemo.java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StreamPipelineDemo {
    public static void main(String[] args) {
        List<Order> orders = Arrays.asList(
                new Order("O001", 120.0, "PAID"),
                new Order("O002", 80.0, "CANCELLED"),
                new Order("O003", 200.0, "PAID")
        );

        List<Double> paidAmounts = orders.stream()
                .filter(o -> "PAID".equals(o.getStatus()))
                .map(Order::getAmount)
                .sorted()
                .collect(Collectors.toList());

        System.out.println(paidAmounts);  // [120.0, 200.0]
    }
}
```

### 4.3 流水线阶段示意

```text
数据源 list.stream()
  → filter (中间)
  → map (中间)
  → sorted (中间)
  → collect (终端，触发执行)
```

### 4.4 其他常用操作

```java
long paidCount = orders.stream()
        .filter(o -> "PAID".equals(o.getStatus()))
        .count();

List<String> nos = orders.stream()
        .map(Order::getOrderNo)
        .collect(Collectors.toList());

orders.stream()
        .filter(o -> o.getAmount() > 100)
        .forEach(System.out::println);
```

### 4.5 parallelStream（认识，慎用）

```java
// 仅当数据量大、计算密集且已验证收益时使用
orders.parallelStream().filter(...).collect(Collectors.toList());
```

初学与普通业务列表：**默认 `stream()`**。

## 5. 常见用法

1. **筛选 + 收集**：已支付订单号列表
2. **映射统计**：`mapToDouble(Order::getAmount).sum()`（认识）
3. **去重**：`distinct()` 或先 `map` 再 `distinct`
4. **排序**：`sorted()` 自然序，或 `sorted(Comparator.comparing(Order::getAmount))`

## 6. 易错点

- **只写中间操作不调用终端操作**：流水线**不会执行**，无输出
- **在 stream 中修改外部集合**：易引发并发修改或逻辑混乱；用 **`collect`** 得到新结果
- **小列表滥用 parallelStream**：线程开销可能大于收益
- **`map` 返回 null**：下游可能 NPE；结合第 3 节 `Optional` 或过滤 null
- **重复终端操作**：同一 Stream 实例终端操作后**不能再次使用**，需重新 `stream()`

## 7. 本节小结

- Stream = **数据源 → 中间操作 → 终端操作**；中间操作惰性，终端操作触发
- 常用：**`filter`、`map`、`sorted`、`collect`**
- 性能：初学与普通业务用 **串行 `stream()`**；`parallelStream` 需实测再定
