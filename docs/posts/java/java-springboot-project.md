---
title: Spring Boot 项目速查:构建 · 结构 · 配置
date: 2026-07-01 15:47:09
categories: 技术栈
tags:
    - Java
---

# Spring Boot 项目速查:构建 · 结构 · 配置

拿到一个陌生的 Java 后端项目，从这三件事读起：**靠什么构建、代码怎么分层、配置放在哪**。全程用前端概念类比（`package.json` / `main.ts` / `.env`）。

---

## 一、构建工具 Maven：项目的 package.json

**用途**：管理依赖、打包、跑测试、启动项目。核心文件是 `pom.xml`（相当于 `package.json`），依赖仓库缓存在本地 `~/.m2/repository`（相当于 `node_modules`，但全局共享）。

### 1. pom.xml 结构

```xml
<project>
    <!-- 继承 Spring Boot 父 POM，统一管理依赖版本 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <!-- 三元组：定位本项目坐标（组织 + 项目名 + 版本） -->
    <groupId>com.company</groupId>          <!-- 公司/组织 -->
    <artifactId>order-service</artifactId>  <!-- 项目名 -->
    <version>1.0.0</version>                <!-- 版本 -->

    <properties>
        <java.version>21</java.version>     <!-- JDK 版本 -->
    </properties>

    <!-- 依赖列表，相当于 package.json 的 dependencies -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>  <!-- Web 场景启动器 -->
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>          <!-- 依赖范围，见下表 -->
        </dependency>
    </dependencies>
</project>
```

### 2. 依赖范围 scope

| scope | 含义 | 例子 |
|---|---|---|
| `compile` | 默认，编译+运行都用 | 绝大多数依赖 |
| `provided` | 编译时用，运行时由环境提供 | `lombok`、`servlet-api` |
| `runtime` | 运行时才用，编译不用 | 数据库驱动 `mysql-connector` |
| `test` | 只在测试用 | `junit`、`spring-boot-starter-test` |

### 3. 常用命令速查

```bash
mvn clean                       # 清空 target 编译产物
mvn compile                     # 编译源码
mvn test                        # 跑单元测试
mvn package                     # 打包成 jar（跑 test）
mvn package -DskipTests         # 打包但跳过测试（常用）
mvn install                     # 打包并装进本地仓库供其他项目引用
mvn dependency:tree             # 打印依赖树，排查版本冲突神器
mvn spring-boot:run             # 直接启动项目（开发时用）
```

### 4. 启动方式（3 种）

```bash
# ① 开发时：IDEA 里点主类（带 main 方法那个）旁边的绿色三角
# ② 命令行开发启动：
mvn spring-boot:run
# ③ 生产部署：先打包成可执行 jar，再用 java 运行
mvn clean package -DskipTests
java -jar target/order-service-1.0.0.jar
java -jar app.jar --server.port=9090   # 启动时覆盖配置（见第三章）
```

### 5. 启动流程（发生了什么）

```txt
java -jar app.jar
   ↓
执行主类 main() → SpringApplication.run()
   ↓
① 创建 Spring 容器（IoC 容器）
② 扫描主类所在包及子包，注册所有 @Component/@Service/... 为 Bean
③ 自动装配（读 spring-boot-starter-* 的默认配置）
④ 读取 application.yml 配置，覆盖默认值
⑤ 启动内嵌 Tomcat（默认 8080，无需单独装 Tomcat）
   ↓
控制台出现 "Started Application in x seconds" → 启动成功，可以调接口了
```

> 主类上的 `@SpringBootApplication` 注解如何驱动这套流程，见《Java 注解速查》。

---

## 二、项目结构：DDD 四层架构

**用途**：DDD（领域驱动设计）把代码按「关注点」分四层，核心目标是**让业务逻辑（domain）不被技术细节（数据库、框架）污染**。读项目先认层，再读单个类。

### 1. 四层职责（从外到内）

| 层 | 职责一句话 | 典型内容 |
|---|---|---|
| **adapter**（适配层） | 对接外部世界的入口和出口 | Controller、RPC 接口、MQ 消费者 |
| **application**（应用层） | 编排用例、定义事务边界，不含业务规则 | ApplicationService、Command/Query、DTO |
| **domain**（领域层） | 核心业务规则，纯 Java 不依赖框架 | Entity、值对象、领域服务、仓储**接口** |
| **infrastructure**（基础设施层） | 技术实现，为上层接口提供落地 | 仓储**实现**、Mapper、缓存、外部调用 |

### 2. 命名与依赖规范（每条一句话）

- **依赖方向单向向内**：adapter → application → domain，绝不反向。
- **infrastructure 反向实现 domain 的接口**：依赖倒置，domain 定接口、infra 写实现。
- **每一层必须通过接口调用下一层**：面向接口编程，禁止直接 new 实现类。
- **接口以 `I` 开头**：如 `IOrderRepository`、`IUserApplicationService`。
- **仓储接口定义在 domain，实现放 infrastructure**：`IOrderRepository`（domain）↔ `OrderRepositoryImpl`（infra）。
- **domain 层零框架依赖**：不出现 `@Autowired`、`@Mapper`、`import org.springframework.*`。
- **每层数据模型不共用，跨层要转换**：`DTO`（对外）→ `Entity`（领域）→ `PO`（数据库）各司其职。
- **命名后缀固定**：`XxxController` / `XxxApplicationService` / `XxxDomainService` / `IXxxRepository` / `XxxRepositoryImpl` / `XxxPO` / `XxxDTO`。

### 3. 数据模型分层（跨层必转换）

| 模型 | 全称 | 所在层 | 用途 |
|---|---|---|---|
| `DTO` | Data Transfer Object | adapter/application | 接口出入参，对前端 |
| `Entity` | 领域实体 | domain | 承载业务规则，有行为 |
| `PO` | Persistent Object | infrastructure | 对应数据库表，纯字段 |

### 4. 项目树状图 Demo

```txt
order-service/
├── pom.xml
└── src/main/
    ├── resources/
    │   ├── application.yml              # 主配置（见第三章）
    │   └── mapper/OrderMapper.xml       # MyBatis SQL
    └── java/com/company/order/
        │
        ├── OrderApplication.java        # 启动主类，含 main()
        │
        ├── adapter/                     # ① 适配层：外部入口
        │   ├── web/
        │   │   ├── OrderController.java     # HTTP 接口，@RestController
        │   │   └── dto/
        │   │       ├── OrderCreateDTO.java  # 请求参数
        │   │       └── OrderVO.java         # 响应结果
        │   └── consumer/
        │       └── OrderMqConsumer.java     # 消费 MQ 消息
        │
        ├── application/                 # ② 应用层：编排用例
        │   ├── IOrderAppService.java        # 应用服务接口（I 开头）
        │   ├── impl/
        │   │   └── OrderAppServiceImpl.java # 编排 domain，加 @Transactional
        │   └── command/
        │       └── CreateOrderCommand.java  # 用例入参对象
        │
        ├── domain/                      # ③ 领域层：纯业务，零框架
        │   └── order/
        │       ├── Order.java               # 领域实体，含业务方法
        │       ├── OrderStatus.java         # 值对象/枚举
        │       ├── IOrderRepository.java    # 仓储接口（只声明，不实现）
        │       └── OrderDomainService.java  # 跨实体的领域逻辑
        │
        └── infrastructure/              # ④ 基础设施层：技术落地
            ├── persistence/
            │   ├── OrderRepositoryImpl.java # 实现 domain 的 IOrderRepository
            │   ├── mapper/OrderMapper.java  # MyBatis Mapper 接口
            │   └── po/OrderPO.java          # 数据库表映射对象
            ├── cache/OrderCacheImpl.java    # Redis 缓存实现
            └── config/                      # 配置类（数据源、线程池等）
```

### 5. 一次调用穿透四层（读懂链路）

```
HTTP 请求
  → OrderController          [adapter]  接收 DTO，转 Command
  → IOrderAppService         [application] 编排、开事务
  → Order.pay() / IOrderRepository  [domain] 执行业务规则、调仓储接口
  → OrderRepositoryImpl → Mapper    [infrastructure] 真正读写数据库
  ← 逐层返回，Entity 转 VO，响应 JSON
```

---

## 三、配置文件：项目的 .env

**用途**：数据库连接、端口、日志级别、第三方密钥等都在这。放在 `src/main/resources/`，Spring Boot 启动时自动加载。

### 1. application.yml vs application.properties

两者等价，**新项目一律用 yml**（层级清晰、无重复前缀）。语法对照：

```properties
# application.properties —— 扁平 key=value
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/db
spring.datasource.username=root
```

```yaml
# application.yml —— 树状缩进（推荐），注意冒号后有空格
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db
    username: root
```

### 2. 常见配置项（带注释的完整 Demo）

```yaml
server:
  port: 8080                          # 服务端口
  servlet:
    context-path: /api                # 全局路径前缀，接口都带 /api

spring:
  application:
    name: order-service               # 应用名（注册中心/日志用）

  datasource:                         # 数据库连接
    url: jdbc:mysql://localhost:3306/order_db?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:                           # 连接池（Spring Boot 默认 HikariCP）
      maximum-pool-size: 20           # 最大连接数
      minimum-idle: 5                 # 最小空闲连接

  redis:                              # Redis 配置
    host: localhost
    port: 6379
    database: 0

# MyBatis-Plus 配置（若使用）
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml   # XML 位置
  configuration:
    map-underscore-to-camel-case: true       # 下划线转驼峰 order_no → orderNo

# 日志级别
logging:
  level:
    root: info
    com.company.order: debug          # 本项目包设为 debug，方便调试
```

### 3. 多环境 Profile

**用途**：开发/测试/生产用不同配置（不同数据库地址等）。约定 `application-{env}.yml`。

```yaml
# application.yml（主配置，放公共部分 + 指定激活哪个环境）
spring:
  profiles:
    active: dev                       # 激活 dev 环境

# application-dev.yml（开发）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/order_db

# application-prod.yml（生产）
spring:
  datasource:
    url: jdbc:mysql://prod-host:3306/order_db
```

```bash
# 激活方式（优先级从高到低）
java -jar app.jar --spring.profiles.active=prod   # ① 命令行
# ② 环境变量 SPRING_PROFILES_ACTIVE=prod
# ③ 主配置里 spring.profiles.active: dev
```

### 4. 读取配置的三种姿势

```java
// ① @Value：读单个值，适合零散配置
@Value("${server.port}")
private int port;

@Value("${custom.timeout:5000}")   // 冒号后是默认值，配置缺失时用
private int timeout;

// ② @ConfigurationProperties：批量绑定一组配置到对象（推荐）
@Component
@ConfigurationProperties(prefix = "custom.oss")   // 绑定 custom.oss.* 前缀
@Data                                              // Lombok 生成 getter/setter
public class OssProperties {
    private String endpoint;        // ← custom.oss.endpoint
    private String accessKey;       // ← custom.oss.access-key（自动驼峰映射）
    private String bucket;          // ← custom.oss.bucket
}

// ③ Environment：动态读取，适合运行时按 key 取值
@Autowired
private Environment env;
String url = env.getProperty("spring.datasource.url");
```
