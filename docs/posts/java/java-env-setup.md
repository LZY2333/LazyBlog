# Java 环境配置

## 一、安装 JDK

下载 [Adoptium Temurin 8](https://adoptium.net/)，选择 Java 8 (LTS) → Windows x64 → `.msi`, 勾选Path,安装完成。

验证(VScode终端中验证的话需要,先重启VScode)：

```bash
java -version
# openjdk version "1.8.0_xxx"
```

## 二、VS Code 插件

安装 **Extension Pack for Java**（微软官方），包含代码补全、调试、Maven、测试等。

如使用 Spring Boot 额外安装 **Spring Boot Extension Pack**。

## 三、VS Code 指定 JDK

已配置 `JAVA_HOME` 全局变量的情况下，VS Code 插件会自动识别，无需额外配置。

验证：`Ctrl+Shift+P` → `Java: Configure Java Runtime`，确认识别到 JDK 8 即可。

## 四、安装 Maven

1. 下载 [Maven](https://maven.apache.org/download.cgi) Binary zip archive，解压到固定目录，如 `C:\0Program\Maven\apache-maven-3.9.x`

2. 新增用户环境变量：
   - `MAVEN_HOME` = `C:\0Program\Maven\apache-maven-3.9.x`
   - `Path` 追加 `%MAVEN_HOME%\bin`

3. 验证（重开终端没用，要重启VScode）：

```bash
mvn -version
```

## 五、创建 Maven 项目 并运行

`Ctrl+Shift+P` → `Java: Create Java Project` → 选 **Maven** → `maven-archetype-quickstart` → 填写 `groupId`、`artifactId` → 选保存目录。

首次运行前需先编译：`Ctrl+Shift+P` → `Java: Compile Workspace`，或终端执行 `mvn compile`。

之后直接点击 `main` 方法上方的 `Run`，或 `Ctrl+F5` 即可。
