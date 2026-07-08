---
title: Spring Boot 原理 02 · SpringApplication.run() 时序
date: 2026-07-09 01:12:55
categories: 技术栈
tags:
    - Java
---

上一篇的总开关 `@SpringBootApplication` 按下后,干活的是 `run()`。

`SpringApplication.run(App.class, args)` 就一行,背后到底做了什么。

## 两个阶段

`run()` 先构造 `SpringApplication` 对象,再调用实例方法 `run()` 推进启动。

```java
// 源码 SpringApplication#run(静态入口)
public static ConfigurableApplicationContext run(Class<?> primarySource, String... args) {
    return new SpringApplication(primarySource).run(args);
    //     构造                                  启动
}
```

## 构造阶段 new SpringApplication()

构造只确定三件事,不启动任何服务。

```java
// 源码 SpringApplication 构造方法
public SpringApplication(Class<?>... primarySources) {
    // 1. 推断应用类型:有 DispatcherServlet → SERVLET,有 WebFlux → REACTIVE,都没有 → NONE
    this.webApplicationType = WebApplicationType.deduceFromClasspath();
    // 2. 从 META-INF/spring.factories 读出扩展并缓存
    setInitializers(getSpringFactoriesInstances(ApplicationContextInitializer.class));
    setListeners(getSpringFactoriesInstances(ApplicationListener.class));
    // 3. 推断主类:哪个类有 main 方法
    this.mainApplicationClass = deduceMainApplicationClass();
}
```

应用类型决定启动阶段创建哪种容器。  
`spring.factories` 是 Boot 加载扩展的统一入口,第 3 篇的自动装配走同一份文件。

## 启动阶段 run()

`run()` 按固定时序推进,每步之间广播事件。

```java
// 源码 SpringApplication#run(简化)
public ConfigurableApplicationContext run(String... args) {
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting();                                   // 1. 启动监听器,后续各阶段由此广播

    ConfigurableEnvironment env = prepareEnvironment(listeners, ...);  // 2. 加载 yml、命令行参数

    Banner banner = printBanner(env);                       // 3. 打印 Banner

    context = createApplicationContext();                   // 4. 按应用类型创建容器

    prepareContext(context, env, listeners, ...);           // 5. 执行 Initializer,注册主类

    refreshContext(context);                                // 6. 实例化全部单例 Bean,启动 Tomcat

    afterRefresh(context, ...);
    listeners.started(context);                             // 7. 刷新后广播 started

    callRunners(context, args);                             // 8. 容器就绪后执行一次性任务

    listeners.running(context);                             // 9. 广播 running,启动完成
    return context;
}
```

几个步骤和平时写的代码直接相关。

第 2 步 `prepareEnvironment` 读入配置,`application.yml`、`@Value` 等都在这里生效,见第 6 篇。  
第 4 步 `createApplicationContext` 建容器,改 `server.port`、换内嵌容器都靠这一步,见第 7 篇。  
第 6 步 `refreshContext` 实例化全部 Bean、启动内嵌容器,是最重的一步,也是后续几篇的落脚处。

## 生命周期回调:在启动的某一步插入代码

时序是固定的,但 Spring 走到某些步骤时会回调一批约定好的接口。  
实现这些接口,就能让项目在启动的那个时刻执行自己的代码,这类接口叫生命周期回调。

回调类是项目里普通的类,放在主类所在包或子包下,能被组件扫描到即可。  
标上 `@Component` 或实现对应接口,Spring 启动时自动发现并在对应时机调用,不写在 `main` 方法里。

### CommandLineRunner / ApplicationRunner

最常用。在第 8 步 `callRunners` 调用,容器已就绪,适合跑启动后的初始化任务。

```java
// 放在主类同级或子包下的任意 .java 文件,标 @Component 即被扫描
@Component
public class CacheWarmUpRunner implements CommandLineRunner {
    // 启动后预热字典缓存,最常见的初始化写法
    @Override
    public void run(String... args) {
        dictService.loadAllToRedis();
    }
}
```

### ApplicationListener

常用。监听启动过程中广播的事件,`ApplicationReadyEvent` 表示服务已就绪。  
日常更常写 `@EventListener`,底层仍是 `ApplicationListener` 加事件广播。

```java
@Component
public class StartupReporter {
    // 服务就绪后回调,常用来向注册中心上报、打印启动完成
    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        registry.register();
    }
}
```

### ApplicationContextInitializer 与 SpringApplicationRunListener

少用,了解即可。  
`ApplicationContextInitializer` 在第 5 步执行,容器还没刷新,可提前改配置或注册 Bean 定义。  
`SpringApplicationRunListener` 贯穿 starting 到 running,可用来统计启动耗时。  
两者不通过组件扫描注册,要写进 `META-INF/spring.factories` 才生效。

`run()` 是一条固定时序的启动流水线,生命周期回调让项目在指定时机插入代码。  
第 6 步 `refreshContext` 实例化全部 Bean,而该配哪些 Bean 由自动装配决定,第 3 篇展开。
