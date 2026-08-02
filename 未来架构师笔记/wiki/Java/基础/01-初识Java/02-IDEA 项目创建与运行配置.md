---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 所属：开发环境与第一个程序 · Java 语言基础入门

## 1. 概述

本节介绍 IntelliJ IDEA 创建 Java 项目、配置  **Project SDK**、编写并运行第一个程序。**IDE 是否必须用 IDEA、能否用 Cursor**  见教案。

## 2. 核心概念

| 术语              | 说明                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Project SDK       | IDEA 官方叫法，指**项目级 JDK 合同**；在界面里通常显示为  **「SDK」**  下拉框（见下节路径），不是 Maven 菜单里的那一项 |
| Module SDK        | **模块级** JDK，在  **项目结构 → 模块 → 依赖项**；默认可继承 Project SDK（`<Project SDK>`）                            |
| Module            | IDEA 中的**模块**，一个项目可含多个模块（初学通常一个即可）                                                            |
| Source Root       | **源码根目录**，标记为蓝色的文件夹；其下  `.java`  才会被编译                                                          |
| Run Configuration | **运行配置**，指定入口类、程序参数等；Run 使用的 JDK 跟 Project SDK 一致（本课不单独改）                               |

### 2.1 IDEA 里 Project SDK 在哪（本课定稿路径）

教案里的  **Project SDK** = 下面这一处，**不是**「设置 → 构建工具 → Maven」里的 JDK。

| 界面语言 | 菜单路径                                                                     | 页面上要找的控件                                    |
| -------- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| 中文     | **文件 → 项目结构**（快捷键  `Ctrl+Alt+Shift+S`）→ 左侧  **项目设置 → 项目** | **SDK**  下拉框选  **17**；**语言级别**  选  **17** |
| 英文     | **File → Project Structure** → **Project Settings → Project**                | **SDK** / **Project SDK**  下拉框                   |

新建项目时也会出现同一概念：

- **文件 → 新建 → 项目** → 左侧选  **Java**（本课**不要**选 Maven）→ 向导里的  **SDK**  就是 Project SDK。

**为何有人只在 Maven 里看到 JDK？**

- 打开的是  **Maven 项目**，或去  **设置 → 构建、执行、部署 → 构建工具 → Maven → 运行程序/JRE**  找——那是  **Maven 执行  `mvn`  命令用的 JDK**，管的是 Maven 插件进程，**不能代替** Project SDK 给编辑器做代码提示。
- 本课  `hello-java`  是  **普通 Java 项目**（有  `src`、无  `pom.xml`），L3 排查**只查项目结构里的 SDK**，不查 Maven。

**与 Maven JDK 的分工（了解即可，第 1 章不考 Maven）**

| 配置项                     | 位置（中文 IDEA）                       | 管什么                                             |
| -------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Project SDK**（本课 L3） | 项目结构 → 项目 → **SDK**               | 编辑、编译、`String`  提示、绿色三角 Run           |
| Maven 运行程序 JRE         | 设置 → … → Maven → **运行程序**         | 仅  `mvn`  命令行进程                              |
| Module SDK                 | 项目结构 → 模块 → 依赖项 → **模块 SDK** | 单模块可覆盖项目；初学保持  **继承项目 SDK**  即可 |

## 3. 操作步骤

### 3.1 创建 Java 项目

1. 启动 IntelliJ IDEA → **File → New → Project**
2. 左侧选  **Java**，点 Next
3. **Project SDK**：
   - 若列表有  **17**，选中
   - 若无：点  **Add SDK → Download JDK**  或  **Add JDK**  指向本机 JDK 目录（即  `JAVA_HOME`  所指路径）
4. 可不勾选模板，Next → 输入项目名如  `hello-java` → Finish

### 3.2 确认 Project SDK

**文件 → 项目结构**（`Ctrl+Alt+Shift+S`）→ 左侧  **项目设置 → 项目**

- **SDK**  下拉框：选  **17**（列表中可能显示为  `17`、`temurin-17`  等，主版本为 17 即可）
- **语言级别**：**17**（与 SDK 一致）

若 SDK 为  **<无 SDK>** / `<No SDK>`，代码中  `String`  等会报红：`Cannot resolve symbol`。

> 界面上写的是  **SDK**，教案/题目里的  **Project SDK**  指的就是这一项。

### 3.3 创建并运行 HelloWorld

1. 左侧展开项目，右键  **`src`** → **New → Java Class**
2. 类名  `HelloWorld`，回车
3. 输入：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

4. 在  `main`  左侧点击绿色三角 → **Run 'HelloWorld.main()'**
5. 底部 Run 窗口应输出：`Hello, Java!`

### 3.4 配置程序参数（可选）

**Run → Edit Configurations → 选中 HelloWorld → Program arguments**  填入  `a b c`，再运行；在  `main`  中可用  `args`  读取（见第 3 节文档）。

## 4. 语法与写法

### 4.1 目录结构

```text
hello-java/
├── .idea/
├── src/                 ← Source Root（蓝色）
│   └── HelloWorld.java
└── hello-java.iml
```

### 4.2 文件名规则

含  `public`  的类，**文件名必须与类名完全一致**（含大小写）：

- ✅ `HelloWorld.java` + `public class HelloWorld`
- ❌ `hello.java` + `public class HelloWorld` → 编译报错

## 5. 常见用法

1. **切换 Project SDK**：Project Structure 中更换；Language level 应同步
2. **源码必须在 Source Root 下**：根目录随便放的  `.java`  可能不参与编译
3. **Run 背后**：IDEA 等价执行编译 + `java 主类名`（产物多在  `out/production/项目名/`）

## 6. 易错点

- **Project SDK 未配置**：无法识别 Java 标准库 → 在 Project Structure 中选 JDK 17
- **类名与文件名不一致**：见上
- **终端 java 17 但 IDEA 仍用 8**：IDEA **独立**使用 Project SDK，与系统 Path 无关 → 检查 Project Structure，必要时  **File → Invalidate Caches / Restart**

## 7. 本节小结

- **Project SDK** = **项目结构 → 项目 → SDK**（不是 Maven 设置里的 JDK）
- 新建选  **Java**  项目；源码放  **`src`**；`public`  类名 = 文件名
- 绿色三角 Run = 编译 + 运行；IDE 的 JDK 与命令行 Path **分别配置**
