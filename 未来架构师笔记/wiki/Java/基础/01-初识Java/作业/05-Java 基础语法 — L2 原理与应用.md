---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 课程：Java 语言基础入门 · 推理与排查

---

## 1. 整数除法与类型

某程序片段：

```java
int total = 7;
int count = 2;
double avg = total / count;
System.out.println(avg);
```

输出不是 `3.5` 而是 `3.0`。请按 **现象 → 推理 → 结论 → 修改方式** 说明原因，并给出一种能得到 `3.5` 的改法。

---

## 2. 局部变量未初始化

```java
public class TypeDemo {
    static int classVar;

    public static void main(String[] args) {
        int methodVar;
        if (classVar > 0) {
            methodVar = 1;
        }
        System.out.println(methodVar);
    }
}
```

编译器报错：`variable methodVar might not have been initialized`。说明 **为何成员变量 `classVar` 可用而 `methodVar` 不行**，以及如何让代码通过编译（写出一种合理改法）。

---

## 3. 短路与非短路

```java
int n = 0;
if (n != 0 & 10 / n > 1) {
    System.out.println("ok");
}
```

运行可能抛出异常；若把 `&` 改为 `&&` 则正常结束。说明 **`&` 与 `&&` 在此处的执行差异** 及与除零的关系。

---

## 4. byte 运算与赋值

```java
byte b1 = 10;
byte b2 = 20;
byte sum = b1 + b2;
```

第三行编译失败。说明 **编译器要求的类型** 以及两种合法写法（一种用 `int` 接收，一种用 `byte` 接收并强转）。

---

## 5. 作用域与遮蔽

```java
public class ScopeDemo {
    public static void main(String[] args) {
        int x = 1;
        if (true) {
            int x = 2;
            System.out.println(x);
        }
        System.out.println(x);
    }
}
```

第二处 `int x = 2` 编译失败。说明 **违反了哪条作用域规则**；若要在 `if` 内使用不同值且块外仍为 `1`，应如何改（不要求运行，写出思路即可）。

## 6. 从 JavaScript 转到 Java

某开发者习惯 JavaScript，写下：

```java
System.out.println(1 + '1');
System.out.println("1" + '1');
```

两行输出分别是什么？请用 **现象 → 推理（有无 String、`+` 含义、char 如何参与）→ 结论** 说明；并解释为什么 Java **不会**在第一个表达式里把 `1` 转成 `"1"` 再拼接。

---

> 参考答案见 [[02-Java 基础语法 — 参考答案]]
