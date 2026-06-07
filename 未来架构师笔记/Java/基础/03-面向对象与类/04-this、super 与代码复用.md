> 所属：面向对象编程基础 · Java 面向对象与核心类库

## 1. 概述

本节说明 `**this**` 引用当前对象、在构造器重载间复用初始化逻辑，以及子类通过 `**super**` 访问父类成员，减少重复代码并为第 2 章「继承」打基础。

## 2. 核心概念

| 术语                | 说明                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `this`              | 指向**当前对象**的引用，用于区分同名字段与参数、调用本类其他构造器                       |
| `this(参数)`        | 在一个构造器内调用**本类另一个构造器**，必须写在构造器**第一行**                         |
| `super`             | 指向**直接父类**的对象引用，用于调用父类构造器或父类方法                                 |
| `super(参数)`       | 子类构造器中调用**父类构造器**，也必须在构造器**第一行**                                 |
| `extends`           | 声明继承关系：`class 子类 extends 父类`（第 2 章会系统讲解，本节用最小示例配合 `super`） |
| 继承（Inheritance） | 子类获得父类的非私有成员，并可扩展或改写行为                                             |

## 3. 语法与写法

### 3.1 `this` 区分字段与参数

```java
public class Student {
    private String name;

    public void setName(String name) {
        this.name = name;   // this.name 是字段，name 是参数
    }
}
```

### 3.2 `this()` 构造器重载串联

```java
public class Book {
    private String title;
    private double price;

    public Book() {
        this("未命名", 0.0);   // 必须为首行：转去两参构造
    }

    public Book(String title, double price) {
        this.title = title;
        this.price = price;
    }
}
```

### 3.3 最小继承示例 + `super`

```java
// 文件：Person.java
public class Person {
    protected String name;

    public Person(String name) {
        this.name = name;
    }

    public void introduce() {
        System.out.println("我是 " + name);
    }
}
```

```java
// 文件：Employee.java
public class Employee extends Person {
    private String dept;

    public Employee(String name, String dept) {
        super(name);          // 第一行：先初始化父类 name
        this.dept = dept;
    }

    @Override
    public void introduce() {
        super.introduce();    // 复用父类方法
        System.out.println("部门：" + dept);
    }
}
```

```java
// 文件：EmployeeDemo.java
public class EmployeeDemo {
    public static void main(String[] args) {
        Employee e = new Employee("赵六", "研发");
        e.introduce();
    }
}
```

### 3.4 子类构造器默认行为

若子类构造器**第一行** 既没有 `this(...)` 也没有 `super(...)`，编译器自动插入 `**super();`\*\*。父类若无无参构造，子类必须显式 `super(实参)`，否则编译错误。

## 4. 常见用法

1. **setter 中 `this.field = param`**：消除字段与参数同名歧义
2. **多个构造器共享逻辑**：无参 `this()` 转有参，避免重复赋值代码
3. **子类扩展父类行为**：`super.method()` 先执行父类逻辑再追加子类逻辑

## 5. 易错点

- `**this()` / `super()` 不在第一行\*\*：编译错误
- **同时写 `this()` 和 `super()`**：一个构造器里只能二选一，且都在首行
- `**this()` 形成死循环\*\*：`public A(){ this(); }` 无限递归 → 编译错误
- **父类没有无参构造，子类未写 `super(参数)`**：编译失败，提示父类构造器不可见
- **静态方法中使用 `this`**：编译错误，`this` 只代表实例

## 6. 本节小结

- `**this**`：当前对象；区分同名成员；`**this()**` 调用本类其他构造器（首行）
- `**super**`：父类部分；`**super()**` 初始化父类（首行）；`**super.方法()**` 复用父类实现
- 配合 `**extends**` 使用 `super`；继承的完整规则在第 2 章展开
