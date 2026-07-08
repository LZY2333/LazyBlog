---
title: Spring Boot 原理 00 · 总图谱
date: 2026-07-08 22:14:33
categories: 技术栈
tags:
    - Java
---

这个系列拆解 Spring Boot 的启动原理。  
主线只有一条,一次 `SpringApplication.run()` 从按下开关到服务就绪,中间做了哪些事。  
后面每一篇都挂在这条时序的某个节点上。

## 主线:一次 run() 的时序

```text
@SpringBootApplication          总开关,合并三个基础注解          →  第 1 篇
        │
new SpringApplication()         推断应用类型、加载扩展、定主类
        │
run()
 ├─ prepareEnvironment          加载 yml、命令行参数              →  第 6 篇
 ├─ createApplicationContext    按类型建容器、启动内嵌 Tomcat     →  第 7 篇
 ├─ prepareContext              执行 Initializer、注册主类
 ├─ refreshContext              自动装配 + 实例化全部 Bean        →  第 3、4、5 篇
 └─ callRunners                 就绪后回调一次性任务              →  第 8 篇
```

## 章节地图

| 篇 | 主题 | 解决的问题 | 落点 |
|---|---|---|---|
| 1 | `@SpringBootApplication` | 一个注解开启配置类、组件扫描、自动装配 | `@SpringBootConfiguration` / `@ComponentScan` / `@EnableAutoConfiguration` |
| 2 | `SpringApplication.run()` 时序 | 启动流水线标准化,沿途留出扩展点 | `ApplicationContextInitializer` / `SpringApplicationRunListener` / `Runner` |
| 3 | 自动装配 | 引入依赖即配好一整套 Bean | `AutoConfigurationImportSelector` / `spring.factories` |
| 4 | 条件装配 | 配置按需生效,避免冲突 | `@ConditionalOnClass` / `@ConditionalOnMissingBean` / `Condition` |
| 5 | Starter 本质 | 一个依赖带全一套,免去逐个凑版本 | `spring-boot-starter-*` |
| 6 | 外部化配置绑定 | 配置与代码解耦,一份代码多环境 | `@ConfigurationProperties` / `Binder` |
| 7 | 内嵌容器 | 免部署,main 方法即启动 | `ServletWebServerFactory` / `WebServerFactoryCustomizer` |
| 8 | 启动生命周期回调 | 在启动各阶段插入自定义逻辑 | `CommandLineRunner` / `ApplicationListener` |

## 基线

阅读与运行示例的统一前提。

- 版本 Spring Boot 2.7.x
- JDK 8 / 11
- 命名空间 `javax.*`
- 自动装配清单走 `META-INF/spring.factories`
- 源码深度到机制级,讲清关键类的职责与调用时序,不逐行抠

第 1 篇从主类上那个总开关 `@SpringBootApplication` 开始。
