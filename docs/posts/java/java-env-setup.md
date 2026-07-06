---
title: Java 环境配置
date: 2026-06-23 01:54:26
categories: 技术栈
tags:
    - Java
---

## 一、安装 JDK

下载 [Adoptium Temurin 8](https://adoptium.net/)，选择 Java 8 (LTS) → Windows x64 → `.msi`, 勾选Path,安装完成。

验证(VScode终端中验证的话需要,先重启VScode)：

```bash
java -version
# openjdk version "1.8.0_xxx"
```

## 二、配置 JAVA_HOME

新增用户环境变量：

- `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-8.x.x.x-hotspot`（替换为实际安装路径）
- `Path` 追加 `%JAVA_HOME%\bin`

验证（重开终端或重启 VS Code 后）：

```bash
echo %JAVA_HOME%
```

## 三、VS Code 插件

安装 **Extension Pack for Java**（微软官方），包含代码补全、调试、Maven、测试等。

如使用 Spring Boot 额外安装 **Spring Boot Extension Pack**。

## 四、VS Code 指定 JDK

已配置 `JAVA_HOME` 全局变量的情况下，VS Code 插件会自动识别，无需额外配置。

验证：`Ctrl+Shift+P` → `Java: Configure Java Runtime`，确认识别到 JDK 8 即可。

## 五、安装 Maven

1. 下载 [Maven](https://maven.apache.org/download.cgi) Binary zip archive，解压到固定目录，如 `C:\0Program\Maven\apache-maven-3.9.x`

2. 新增用户环境变量：
   - `MAVEN_HOME` = `C:\0Program\Maven\apache-maven-3.9.x`
   - `Path` 追加 `%MAVEN_HOME%\bin`

3. 验证（重开终端没用，要重启VScode）：

```bash
mvn -version
```

## 六、创建 Maven 项目 并运行

`Ctrl+Shift+P` → `Java: Create Java Project` → 选 **Maven** → `maven-archetype-quickstart` → 填写 `groupId`、`artifactId` → 选保存目录。

首次运行前需先编译：`Ctrl+Shift+P` → `Java: Compile Workspace`，或终端执行 `mvn compile`。

之后直接点击 `main` 方法上方的 `Run`，或 `Ctrl+F5` 即可。

## 七、常见问题

### Java extension 要求 JDK 21+

报错：`Java 21 or more recent is required to run the Java extension.`

原因：Red Hat 语言服务器（JDT LS）本身是 Java 程序，新版本用了 Java 21 特性编写，需要 JDK 21+ 启动自身进程，与项目编译版本无关。

解决步骤：

1. 额外下载安装 [JDK 21+](https://adoptium.net/)（与 JDK 8 共存，无需改 `JAVA_HOME`）

2. VS Code User `settings.json`（`Ctrl+Shift+P` → `Open User Settings JSON`）中添加：

```json
{
  "java.jdt.ls.java.home": "D:\\Java\\jdk22",
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-1.8",
      "path": "你的 JDK 8 实际路径",
      "default": true
    }
  ],
  "maven.executable.preferMavenWrapper": false
}
```

3. 执行 `Java: Clean Java Language Server Workspace` → Restart and delete，完整重启 VS Code。

### 函数无法跳转 / Configure Java Runtime 无 Java 项目

症状：代码中函数无法 Ctrl+Click 跳转，

`Ctrl+Shift+P` → `Java: Configure Java Runtime` Project Settings中显示 There are no java projects opened in the current workspace。

原因：VS Code Java 插件找不到 Maven 的 `settings.xml`，导致无法解析依赖，项目未被正确识别。

解决：在 VS Code User `settings.json` 中添加 Maven 用户配置路径：

```json
{
  "java.configuration.maven.userSettings": "C:\\Users\\你的用户名\\.m2\\settings.xml"
}
```

保存后执行 `Java: Clean Java Language Server Workspace` → Restart and delete，重启 VS Code
