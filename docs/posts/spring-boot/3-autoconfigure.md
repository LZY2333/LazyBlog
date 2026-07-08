---
title: Spring Boot 原理 03 · 自动装配机制
date: 2026-07-09 22:37:41
categories: 技术栈
tags:
    - Java
---

接上一篇,`refreshContext()` 调用的 `refresh()` 里,有一步专门解析配置类。  
解析主类时读到 `@EnableAutoConfiguration`,自动装配就是从这里触发的。

「引入一个依赖就自动配好一堆 Bean」到底靠什么做到,不是魔法。  
先弄清 Bean 是什么,再从 `@EnableAutoConfiguration` 这个入口一层层往里看,直到 Bean 被导入容器。

## 什么是 Bean

Bean 是由 Spring 容器创建、装配、管理的对象。  
普通 `new` 出来的对象自己管,Bean 交给容器管,容器负责实例化、注入依赖、控制生命周期。

日常写的 `@Component`、`@Service`、`@Controller` 类,以及 `@Bean` 方法返回的对象,都是 Bean。  
用的时候靠 `@Autowired` 从容器取,不用自己 `new`。

```java
@Service                       // 声明为 Bean,容器启动时创建并托管
public class UserService { }

@RestController
public class UserController {
    @Autowired                 // 从容器取 UserService,不用自己 new
    private UserService userService;
}
```

自动装配配好的一整套 Bean,和平时 `@Service` 声明的是同一种东西,只是改由 Boot 自动声明装配。

## @EnableAutoConfiguration 做了什么

自动装配的入口,拆开是两个注解。

```java
// 源码 @EnableAutoConfiguration
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {
    Class<?>[] exclude() default {};   // 排除指定的自动配置
}
```

`@AutoConfigurationPackage` 记录主类所在包,供后续按包扫描(如 JPA 实体扫描)。  
`@Import(AutoConfigurationImportSelector.class)` 是真正干活的,导入自动装配的选择器。

## @Import 与 ImportSelector

入口靠 `@Import` 干活,先弄清这个机制。

`@Import` 是 Spring 的机制,把一个类的 Bean 定义导入容器。  
可导入普通配置类,也可导入 `ImportSelector`。  
`ImportSelector` 的 `selectImports()` 返回一批类名,这些类被当作配置导入容器。

```java
// 源码 ImportSelector
public interface ImportSelector {
    // 返回的类名会被容器当作配置类导入
    String[] selectImports(AnnotationMetadata importingClassMetadata);
}
```

`AutoConfigurationImportSelector` 实现的是子接口 `DeferredImportSelector`。  
延迟到普通配置处理完再执行,保证用户自定义配置优先生效。

## 候选清单从哪来

`selectImports()` 要返回一批类名,这批候选来自 `spring.factories`。

`AutoConfigurationImportSelector` 扫描 classpath 下所有 `META-INF/spring.factories`。  
取键为 `EnableAutoConfiguration` 的值,得到一串自动配置类的全限定名。

```properties
# 源码 spring-boot-autoconfigure 的 META-INF/spring.factories(节选)
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
```

引入某个 starter 后配置自动出现,就是因为 starter 的 jar 里带着自己的 `spring.factories`。  
Boot 2.7 起新增 `META-INF/spring/...AutoConfiguration.imports` 作为推荐位置,机制相同。

## 候选怎么收敛

候选有上百个,不会全部生效。`selectImports` 内部还要去重、排除、按条件过滤。

```java
// 源码 AutoConfigurationImportSelector(简化)
protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata metadata) {
    List<String> configs = getCandidateConfigurations(metadata, attrs); // 读 spring.factories
    configs = removeDuplicates(configs);                                // 去重
    Set<String> exclusions = getExclusions(metadata, attrs);            // 取 exclude
    configs.removeAll(exclusions);                                      // 排除
    configs = getConfigurationClassFilter().filter(configs);           // 按条件过滤
    return new AutoConfigurationEntry(configs, exclusions);
}
```

上百个候选进来,去重、排除、条件过滤之后,最终只留下满足条件的少数生效。

## 自动配置类长什么样

留下的每个候选都是一个配置类,长这样。

```java
// 源码 DataSourceAutoConfiguration(简化)
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class }) // classpath 有这些类才生效
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean            // 用户没自定义 DataSource 时才用默认
    DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}
```

配置类被导入后,内部 `@Bean` 方法产出的对象就成了容器里的 Bean,自动装配到此闭环。  
每个配置类都挂着 `@ConditionalOnXxx`,决定自身在什么条件下才生效。

自动装配的本质是 `@Import` 一个 `DeferredImportSelector`。  
从 `spring.factories` 取候选,按条件过滤后导入容器。

候选靠 `@ConditionalOnXxx` 收敛成最终生效的少数,这套条件注解怎么判断,第 4 篇展开。
