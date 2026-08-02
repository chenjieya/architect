---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：数组与字符串 · Java 语言基础入门

## 1. 概述

本节说明  `String`  是**引用类型**且**不可变**：内容创建后不能原地修改；用  `+`  拼接会产生**新对象**。并区分比较**引用**（\` == \`）与比较**字符内容**（`equals`）。

## 2. 核心概念

| 术语                 | 说明                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String               | Java 中表示**文本**的引用类型类；字面量如  `"hello"`                                                                                                      |
| 不可变（Immutable）  | 对象创建后，**不能**通过 API 修改其内部字符序列；「修改」会得到**新** `String`                                                                            |
| 字符串字面量         | 双引号包裹的常量，如  `"Java"`，类型为  `String`                                                                                                          |
| \` == \`（引用比较） | 判断两个引用是否指向**同一个对象**                                                                                                                        |
| `equals`             | `String`  的实例方法，比较**字符内容**是否相同                                                                                                            |
| `null`               | 表示「没有对象」；对  `null`  调用方法会  **NullPointerException**                                                                                        |
| 字符串常量池（入门） | **相同字面量**（如两个  `"Hello"`）在编译/加载时常被放进常量池并**复用同一对象**，故  `s1==s2`  一般为  **true**；`new String(...)`  则在堆里**另建对象** |

## 3. 语法与写法

### 3.1 创建与拼接

```java
public class StringImmutableDemo {
    public static void main(String[] args) {
        String s1 = "Hello";
        String s2 = "Hello";
        String s3 = new String("Hello");

        System.out.println(s1 == s2);      // true（两个字面量 "Hello" 共用常量池中同一对象）
        System.out.println(s1 == s3);      // false（new 在堆上新建了另一个对象）
        System.out.println(s1.equals(s3)); // true（比的是字符内容，与是否同一对象无关）

        String s4 = s1;
        s4 = s4 + " World";   // 产生新对象，s1 仍为 "Hello"
        System.out.println(s1);  // Hello
        System.out.println(s4);  // Hello World
    }
}
```

### 3.2 不可变的表现

```java
String text = "abc";
// text[0] = 'A';     // 编译错误：String 无下标赋值
text = text.toUpperCase();  // 返回新 String "ABC"，须赋回变量
System.out.println(text);   // ABC
```

`toUpperCase()`  等方法**不修改原对象**，而是返回新  `String`。

### 3.3 比较规则（本课必会）

| 需求               | 写法                                       |
| ------------------ | ------------------------------------------ |
| 内容是否相同       | `a.equals(b)`                              |
| 忽略大小写比较内容 | `a.equalsIgnoreCase(b)`                    |
| 是否同一对象       | `a == b`（业务比较字符串内容时**不要用**） |

**安全写法**：比较前防  `null`：

```java
if ("admin".equals(username)) {  // 字面量在前，避免 username 为 null 时 NPE
    System.out.println("管理员");
}
```

### 3.4 与基本类型混用

```java
int age = 18;
String msg = "年龄:" + age;  // + 会把 int 转成字符串再拼接
```

## 4. 常见用法

1. **用户输入比对**：用  `input.equals("quit")`  判断是否退出（不用  \` == \`）。
2. **日志拼接**：少量  `+`  可以；循环里大量拼接见第 4 节  `StringBuilder`。
3. **只读传递**：方法参数  `String name`  调用方不必担心方法内部改掉字符（会换新对象）。
4. **作为 switch 分支**：第 3 章已学  `String`  可用于  `switch`（case 为常量）。

## 5. 易错点

- **用 == 比较内容**：即使两个  `"Hello"`  字面量  \` == \`  为 true，也**不要**在业务里用  \` == \`  比字符串——应用  `equals`（拼接、`new String`、用户输入等场景下  \` == \`  几乎都不是比内容）。
- **两个字面量为何 == 为 true**：JVM **字符串常量池**让相同字面量常指向同一对象；`new String("Hello")`  则**一定**是新对象，故与  `s1`  的  \` == \` **一定为 false**。
- **对 null 调用 equals**：`name.equals("x")`  当  `name`  为 null 崩溃。**处理**：`"x".equals(name)`  或先判空。
- **以为 += 在原对象上改**：`s += "!"`  等价于  `s = s + "!"`，产生新对象。
- **混淆 String 与 char**：`"A"`  是  `String`，`'A'`  是  `char`，不能混用。
- **空串与 null**：`""`  是长度为 0 的字符串对象；`null`  表示没有引用，二者不同。

## 6. 本节小结

- `String`  不可变：拼接、大小写转换等得到**新对象**
- 比较内容用  **`equals`**，比较同一对象用  \` == \`
- 防 NPE：常量在前  `"ok".equals(s)`  或先判  `null`
- 循环中大量  `+`  拼接效率差，下一节用  `StringBuilder`
