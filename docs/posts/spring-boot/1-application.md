---
title: Spring Boot 原理 01 · @SpringBootApplication:启动的总开关
date: 2026-07-08 23:41:07
categories: 技术栈
tags:
    - Java
---

原理系列以一次 `SpringApplication.run()` 的执行时序为主线,层层展开。第一站是主类上那个总开关。

---

**一个注解合并了启动 Spring 应用必需的三个基础注解。**

```java
// 传统写法
@Configuration                    // 配置类,可定义 @Bean
@ComponentScan                    // 扫描本包及子包下的 @Component/@Service...
@EnableAutoConfiguration          // 开启自动装配
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

```java
// Boot写法:一个注解等价于上面三个
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

```java
// 源码
@SpringBootConfiguration              // 1. 本质是 @Configuration
@EnableAutoConfiguration              // 2. 自动装配入口(第 3 点重点展开)
@ComponentScan(excludeFilters = {     // 3. 组件扫描,默认扫描主类所在包
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class)
})
public @interface SpringBootApplication {
    // 别名:把常用属性透传给内部三个注解
    @AliasFor(annotation = EnableAutoConfiguration.class, attribute = "exclude")
    Class<?>[] exclude() default {};

    @AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
    String[] scanBasePackages() default {};
}
```

## @SpringBootConfiguration

把标注的类变成 Bean 的定义来源。  
类里每个带 `@Bean` 的方法执行一次,返回的对象注册进容器,成为别处可直接注入的 Bean。  
`@Bean` 是 Spring 手动注册 Bean 的注解,标在配置类的方法上,等价于早期 XML 里的 `<bean>` 标签。  
内部就是 `@Configuration`。Spring 扫描到这类,用 CGLIB 生成子类代理,拦截 `@Bean` 方法调用。  
第一次调用真正 new 对象,之后再调用同一方法直接返回已缓存的实例,以此保证单例。  
`@SpringBootConfiguration` 换了个语义化名字,让框架识别出这是启动类的配置。

```java
@Configuration
public class DataConfig {
    @Bean
    public DataSource dataSource() {        // 方法返回值 → 容器里一个名为 dataSource 的 Bean
        return new HikariDataSource();
    }
    @Bean
    public JdbcTemplate jdbcTemplate() {
        return new JdbcTemplate(dataSource());  // 拿到的是上面同一个实例,不会 new 第二个
    }
}
```

## @ComponentScan

自动把带注解的类收进容器。  
标注后,Spring 扫描指定包及其子包,把带 `@Component` 等注解的类一律注册成 Bean,省去逐个手写。  
不指定 `basePackages` 时,扫描根就是标注该注解的类所在的包。  
这是主类必须放在项目最顶层包的原因。位置放低,其他包的 `@Service` 落在扫描范围外,注入直接失败。

## @EnableAutoConfiguration

根据依赖自动配好一整套 Bean。  
标注后,Spring 查看 classpath 引入了哪些 jar,自动把对应的成套 Bean 配置好。  
引入 web 依赖就自动配好 Spring MVC 那一套。具体机制留到第 3 点。

覆盖默认行为的两个常用属性:

```java
// 排除某个自动配置(不想让 Boot 自动配数据源时)
@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)

// 改扫描范围(主类不在顶层包,或要扫描额外的包)
@SpringBootApplication(scanBasePackages = "com.xxx")
```

`@SpringBootApplication` 合并配置类、组件扫描、自动装配,是三合一的启动总开关。  
三者中 `@EnableAutoConfiguration` 是关键,引入依赖就自动配好 Bean 的机制,第 3 点展开。
