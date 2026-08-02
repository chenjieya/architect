---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> 所属：开发环境与第一个程序 · Java 语言基础入门

## 1. 概述

本节说明 JDK 相关术语、在 Windows 上安装 JDK 17 的完整步骤、环境变量配置，以及安装后的验证方法。版本与发行版**怎么选**见教案。

## 2. 核心概念

| 术语                            | 说明                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| JDK（Java Development Kit）     | Java **开发**工具包，含编译器 `javac`、运行工具 `java`、标准类库等 |
| JRE（Java Runtime Environment） | Java **运行**环境，只能运行程序，**不含** `javac`                  |
| JVM（Java Virtual Machine）     | **虚拟机**，负责加载并执行字节码（`.class`）                       |
| LTS（Long-Term Support）        | **长期支持**版本，企业常用；本课默认使用 **JDK 17**                |
| `JAVA_HOME`                     | 指向 JDK **根目录**（不是 `bin`）的环境变量，供 Maven、IDEA 等读取 |
| Path                            | 操作系统查找可执行文件的目录列表，**按顺序匹配，先找到先生效**     |

关系：**JDK ⊇ JRE ⊇ JVM**。开发必须安装 **JDK**。

常见发行版（仅列举，选型见教案）：Oracle JDK、OpenJDK、Eclipse Temurin（Adoptium）、Amazon Corretto 等，命令用法一致。

## 3. 操作步骤

### 3.1 下载 JDK 17

1. 打开 [Adoptium Temurin 17](https://adoptium.net/) 或 Oracle JDK 下载页
2. 选择 **Windows x64**，下载 **JDK**（不是 JRE）安装包

### 3.2 安装

1. 运行安装程序，路径建议无中文，例如：`C:\Program Files\Java\jdk-17`
2. 记住安装目录，后面配置 `JAVA_HOME` 要用

### 3.3 配置环境变量（Windows）

1. **Win + R** → `sysdm.cpl` → **高级** → **环境变量**
2. **系统变量** → **新建**：
   - 变量名：`JAVA_HOME`
   - 变量值：`C:\Program Files\Java\jdk-17`（你的实际路径）
3. 编辑系统变量 **Path** → **新建** → 输入：`%JAVA_HOME%\bin`
4. 若 Path 中已有其他 Java 路径（如 `javapath`、旧版 JRE），建议**删除或移到该项之后**，避免版本冲突
5. 确定保存，**关闭并重新打开**终端

### 3.4 验证安装

```powershell
java -version
javac -version
```

两者均应显示 **17** 且路径一致。进一步确认：

```powershell
where java
where javac
```

两条命令输出的目录应在**同一 JDK** 的 `bin` 下（或同为 JDK 17 安装路径）。

## 4. 语法与写法

### 4.1 Linux / macOS 简要

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
java -version && javac -version
```

## 5. 常见用法

1. **只装一个 JDK**：学习阶段推荐，减少 Path 冲突
2. **机器上多个 JDK**：靠 `JAVA_HOME` + Path 顺序决定默认版本；排查用 `where java` / `where javac`
3. **改完环境变量无效**：必须新开终端；已打开的 IDEA 可能需重启

## 6. 易错点

- **只配 Path 到 JRE**：`java` 可用但无 `javac` → 应指向 **JDK** 的 `bin`，并设置 `JAVA_HOME`
- **`JAVA_HOME` 指向 `bin` 目录**：错误 → 应指向 JDK **根目录**
- **Path 有多条 Java 且顺序不对**：`java -version` 与 `javac -version` 版本可能**不一致** → 用 `where` 查实际路径，调整 Path 顺序或删除冗余项
- **只测 `java` 不测 `javac`**：无法确认开发环境完整

## 7. 本节小结

- 开发用 **JDK**；验证用 `java -version` + `javac -version` + `where java/javac`
- Windows：`JAVA_HOME` = JDK 根目录；Path 添加 `%JAVA_HOME%\bin`
- Path **顺序优先**；多版本共存时易出现 `java` 与 `javac` 不一致
