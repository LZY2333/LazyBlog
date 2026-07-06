---
title: Java 后端注解速查
date: 2026-07-06 09:32:51
categories: 技术栈
tags:
    - Java
---

# Java 后端注解速查

按**所属包 / 依赖**归类，同一来源放一起，Spring 全家桶排最前。同一分类内**按使用频率排序**（高频在前）。每个注解一个小节配一个 demo，`// →` 或 `//` 注释说明效果。

> **频率标注**：`★高频`＝天天见/几乎每个类都有　`☆低频`＝偶尔用/了解即可　未标注＝普通频率。选择场景另标 `★推荐` / `✘不推荐`。

## 一、Spring Boot / Spring　`org.springframework.*`
----

## 1.1 启动与配置

### @SpringBootApplication　★高频
`org.springframework.boot.autoconfigure` —— 标在主类上，一顶三个，驱动整个启动流程（每个项目必有一个）。

```java
@SpringBootApplication
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);  // 启动入口
    }
}
// = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan
```

### @Configuration　★高频
`org.springframework.context.annotation` —— 声明配置类，内部可用 `@Bean` 注册对象。

```java
@Configuration
public class ThreadPoolConfig { /* 里面写 @Bean 方法 */ }
```

### @Bean　★高频
`org.springframework.context.annotation` —— 方法返回值注册为 Bean，方法名即 Bean 名。常用于注册第三方类。

```java
@Configuration
public class ThreadPoolConfig {
    @Bean                   // 注册一个名为 bizPool 的 Bean
    public ThreadPoolExecutor bizPool() {
        return new ThreadPoolExecutor(4, 8, 60, TimeUnit.SECONDS, new LinkedBlockingQueue<>(100));
    }
}
```

### @Value　★高频
`org.springframework.beans.factory.annotation` —— 从 `application.yml` 读**单个**值，`${}` 里是 yml 层级用点连接。

```yaml
# application.yml
server:
  port: 8080                # 对应 key：server.port
```

```java
@Value("${server.port}")        // 读 yml 的 server.port → 8080
private int port;

@Value("${server.port:9090}")   // 冒号后是默认值：yml 没配时用 9090
private int portOrDefault;
```

### @ConfigurationProperties　★高频
`org.springframework.boot.context.properties` —— 把**一组**配置批量绑定到对象（★推荐，优于写一堆 `@Value`）。

```yaml
# application.yml
custom:
  oss:
    endpoint: https://oss.aliyun.com
    access-key: AK123         # 中划线自动转驼峰
    bucket: my-bucket
```

```java
@Component
@ConfigurationProperties(prefix = "custom.oss")   // 绑定 custom.oss.* 一整组
@Data                                             // Lombok 生成 getter/setter（绑定必需）
public class OssProperties {
    private String endpoint;    // ← custom.oss.endpoint
    private String accessKey;   // ← custom.oss.access-key
    private String bucket;      // ← custom.oss.bucket
}
```

### @Profile
`org.springframework.context.annotation` —— 按环境激活 Bean / 配置类。

```java
@Bean
@Profile("prod")            // 仅 prod 环境生效
public DataSource prodDataSource() { ... }
```

### @SpringBootConfiguration　☆低频
`org.springframework.boot` —— 标记这是配置类（`@Configuration` 的特化），被 `@SpringBootApplication` 包含，一般不单独写。

```java
@SpringBootConfiguration    // 被 @SpringBootApplication 包含
```

### @EnableAutoConfiguration　☆低频
`org.springframework.boot.autoconfigure` —— 开启自动装配：读 starter 依赖，自动配好 Tomcat、数据源等。被 `@SpringBootApplication` 包含。

```java
@EnableAutoConfiguration    // 被 @SpringBootApplication 包含
```

### @ComponentScan　☆低频
`org.springframework.context.annotation` —— 扫描本类所在包及子包，注册所有组件为 Bean。被 `@SpringBootApplication` 包含。

```java
@ComponentScan              // 被 @SpringBootApplication 包含
// → 推论：主类必须放在所有业务包最外层，否则扫不到子包的 @Service，启动报 "bean not found"
```

## 1.2 Bean 声明　`org.springframework.stereotype`

### @Service　★高频
标记业务 / 应用服务层，用在 application 层实现类。

```java
@Service
public class OrderAppServiceImpl implements IOrderAppService { }
```

### @RestController　★高频
`org.springframework.web.bind.annotation` —— `= @Controller + @ResponseBody`，方法默认返回 JSON。

```java
@RestController             // 这个类所有方法返回 JSON
public class OrderController { }
```

### @Repository　★高频
标记数据访问层，额外做数据库异常转换。

```java
@Repository
public class OrderRepositoryImpl implements IOrderRepository { }
```

### @Component　★高频
通用组件注解，不属于下面典型层时用。

```java
@Component
public class SnowflakeIdGenerator { }   // 注册为 Bean，可被注入
```

### @Controller　☆低频
标记 Web 控制器，方法返回值当作视图模板名（服务端渲染）。前后端分离项目用 `@RestController` 取代，故极少见。

```java
@Controller
public class PageController { }
```

## 1.3 依赖注入　`org.springframework.beans.factory.annotation`

### @Autowired　★高频
注入依赖，默认按**类型**匹配。注入接口即可，Spring 自动找实现类。

```java
@Service
public class OrderAppServiceImpl implements IOrderAppService {
    // ① 构造器注入（★推荐：可 final、便于测试、避免循环依赖），单构造器时可省 @Autowired
    private final IOrderRepository orderRepository;
    public OrderAppServiceImpl(IOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Autowired              // ② 字段注入（✘不推荐：无法 final、难测试）
    private IOrderRepository repo;
}
```

### @Qualifier
一个接口多个实现时，按 Bean 名指定用哪个。

```java
@Autowired
@Qualifier("orderRepositoryImpl")   // 指定实现
private IOrderRepository repo;
```

### @Primary
`org.springframework.context.annotation` —— 多实现时标记默认首选。

```java
@Primary
@Repository
public class OrderRepositoryImpl implements IOrderRepository { }
```

## 1.4 Web 层　`org.springframework.web.bind.annotation`

### @RequestMapping　★高频
类级 / 方法级路径映射，可指定请求方法。

```java
@RestController
@RequestMapping("/orders")      // 类级路径前缀，下面方法都带 /orders
public class OrderController { }
```

### @GetMapping　★高频
GET 请求，查询用。

```java
@GetMapping("/{id}")            // GET /orders/123
public OrderVO detail(@PathVariable Long id) { }
```

### @PostMapping　★高频
POST 请求，新增用。

```java
@PostMapping                    // POST /orders
public OrderVO create(@RequestBody OrderCreateDTO dto) { }
```

### @RequestBody　★高频
把 JSON 请求体反序列化为对象。

```java
@PostMapping
public OrderVO create(@RequestBody OrderCreateDTO dto) { }   // 读 body 里的 JSON
```

### @PathVariable　★高频
取 URL 路径变量 `{}`。

```java
@GetMapping("/{id}")
public OrderVO detail(@PathVariable Long id) { }   // /orders/123 → id=123
```

### @RequestParam　★高频
取查询参数 `?key=value`。

```java
@GetMapping
public List<OrderVO> list(@RequestParam String status,               // 必填
                          @RequestParam(defaultValue = "1") int page) { }  // 带默认值
// GET /orders?status=PAID&page=2
```

### @PutMapping
PUT 请求，整体更新。

```java
@PutMapping("/{id}")            // PUT /orders/123
public void update(@PathVariable Long id, @RequestBody OrderDTO dto) { }
```

### @DeleteMapping
DELETE 请求，删除。

```java
@DeleteMapping("/{id}")         // DELETE /orders/123
public void delete(@PathVariable Long id) { }
```

### @RequestHeader
取请求头。

```java
public void h(@RequestHeader("Authorization") String token) { }
```

### @RestControllerAdvice
全局异常处理 / 统一响应包装，配 `@ExceptionHandler` 使用（项目里通常只有一个）。

```java
@RestControllerAdvice
public class GlobalExceptionHandler { }
```

### @ExceptionHandler
捕获指定异常，统一返回错误 JSON。

```java
@ExceptionHandler(BizException.class)   // 捕获业务异常
public Result<?> handle(BizException e) { return Result.fail(e.getMessage()); }
```

### @PatchMapping　☆低频
PATCH 请求，局部更新（实际多数团队用 PUT 代替）。

```java
@PatchMapping("/{id}")          // PATCH /orders/123
public void patch(@PathVariable Long id, @RequestBody OrderDTO dto) { }
```

### @ResponseBody　☆低频
方法返回值直接作为响应体。`@RestController` 已含，用了它就无需再写。

```java
@ResponseBody
public OrderVO detail() { }     // 返回对象自动转 JSON
```

### @CrossOrigin　☆低频
允许跨域。开发临时用，生产一般在网关 / Nginx 统一处理。

```java
@CrossOrigin
@RestController
public class OrderController { }
```

## 1.5 事务　`org.springframework.transaction.annotation`

### @Transactional　★高频
一组数据库操作要么全成功、要么全回滚。通常加在 application 层方法上。

```java
@Transactional                                          // 内部任何异常 → 整体回滚
public void createOrder(CreateOrderCommand cmd) {
    orderRepository.save(order);
    inventoryService.deduct(cmd);
}

@Transactional(rollbackFor = Exception.class)           // 扩到所有异常（默认只回滚 RuntimeException）
@Transactional(readOnly = true)                         // 只读事务，查询优化
@Transactional(propagation = Propagation.REQUIRES_NEW)  // 开新事务，与外层隔离
// 坑：① 受检异常需 rollbackFor；② 同类内自调本类方法，事务不生效（未走代理）
```

## 1.6 定时 / 异步　`org.springframework.scheduling.annotation`

### @Scheduled
标记定时执行的方法。

```java
@Scheduled(cron = "0 0 2 * * ?")    // 每天凌晨 2 点执行
@Scheduled(fixedRate = 5000)        // 每 5 秒执行一次
public void job() { }
```

### @Async
方法异步执行，立即返回（另起线程）。

```java
@Async
public void sendMail(String to) { }   // 调用方不阻塞
```

### @EnableScheduling
主类 / 配置类开启定时任务能力（全局开一次）。

```java
@EnableScheduling
```

### @EnableAsync
主类 / 配置类开启异步支持（全局开一次）。

```java
@EnableAsync
```

## 1.7 测试

### @SpringBootTest
`org.springframework.boot.test.context` —— 加载完整容器做集成测试。

```java
@SpringBootTest
class OrderServiceTest { }
```

### @MockBean
`org.springframework.boot.test.mock.mockito` —— 替换容器里的 Bean 为 mock。

```java
@MockBean
private IOrderRepository orderRepository;   // 测试时用假实现
```

## 二、MyBatis / MyBatis-Plus
----

### @Mapper　★高频
`org.apache.ibatis.annotations` —— 标记 Mapper 接口，自动生成实现（infrastructure 层）。

```java
@Mapper
public interface OrderMapper extends BaseMapper<OrderPO> { }   // 继承 BaseMapper 白嫖 CRUD（MyBatis-Plus）
```

### @TableName　★高频
`com.baomidou.mybatisplus.annotation` —— 指定 PO 对应的表名（用 MyBatis-Plus 时每个 PO 都有）。

```java
@TableName("t_order")
public class OrderPO { }
```

### @TableId　★高频
`com.baomidou.mybatisplus.annotation` —— 标记主键及生成策略。

```java
@TableId(type = IdType.AUTO)    // 自增主键
private Long id;
```

### @Select
`org.apache.ibatis.annotations` —— 注解式查询 SQL，`#{}` 防注入。复杂 SQL 一般写 XML。

```java
@Select("SELECT * FROM t_order WHERE id = #{id}")
OrderPO selectById(Long id);
```

### @Insert
`org.apache.ibatis.annotations` —— 注解式插入 SQL。

```java
@Insert("INSERT INTO t_order(no) VALUES(#{no})")
int insert(OrderPO po);
```

### @TableField
`com.baomidou.mybatisplus.annotation` —— 字段名映射（列名与属性名不一致时）。

```java
@TableField("order_no")         // 列 order_no ↔ 属性 orderNo
private String orderNo;
```

### @TableLogic
`com.baomidou.mybatisplus.annotation` —— 逻辑删除标记，删除转为改标志位。

```java
@TableLogic
private Integer deleted;        // 删除时 UPDATE deleted=1 而非物理删
```

## 三、Lombok　`lombok`
----

### @Data　★高频
`getter + setter + toString + equals + hashCode` 一把梭。

```java
@Data
public class Order { private Long id; private String no; }
```

### @Builder　★高频
链式构建对象。

```java
@Builder
public class User { private Long id; private String name; }
// User.builder().id(1L).name("x").build();
```

### @RequiredArgsConstructor　★高频
为 `final` 字段生成构造器（★推荐，配构造器注入最常用）。

```java
@RequiredArgsConstructor
@Service
public class OrderAppServiceImpl {
    private final IOrderRepository repo;   // 自动生成含 repo 的构造器
}
```

### @Slf4j　★高频
`lombok.extern.slf4j` —— 注入 `log` 字段，直接用。

```java
@Slf4j
public class OrderService {
    public void run() { log.info("下单成功 id={}", 1L); }
}
```

### @NoArgsConstructor
生成无参构造器。

```java
@NoArgsConstructor
public class Order { }          // 生成 public Order() {}
```

### @AllArgsConstructor
生成全参构造器。

```java
@AllArgsConstructor
public class Order { private Long id; private String no; }  // Order(Long, String)
```

### @Getter / @Setter
只需要 getter / setter 时单独用（有 `@Data` 就不用它俩）。

```java
@Getter @Setter
public class Order { private Long id; }
```

> **注意处理器顺序**：Lombok 与 MapStruct 同用时，`annotationProcessorPaths` 里 Lombok 要放前面，否则 getter/setter 生成不出来导致映射失败。

## 四、Jakarta Validation（参数校验）
----

### @Valid　★高频
`jakarta.validation` —— 在 Controller 触发对象内的校验注解。

```java
public OrderVO create(@RequestBody @Valid OrderCreateDTO dto) { }   // 校验不过自动抛异常
```

### @NotNull　★高频
`jakarta.validation.constraints` —— 不能为 null。

```java
@NotNull(message = "用户ID不能为空")
private Long userId;
```

### @NotBlank　★高频
`jakarta.validation.constraints` —— 字符串非 null 且非空白。

```java
@NotBlank(message = "收货人不能为空")
private String receiver;
```

### @NotEmpty
`jakarta.validation.constraints` —— 集合 / 数组 / 字符串非空。

```java
@NotEmpty
private List<Long> itemIds;
```

### @Min / @Max
`jakarta.validation.constraints` —— 数值范围。

```java
@Min(1) @Max(999)
private Integer quantity;
```

### @Size
`jakarta.validation.constraints` —— 字符串 / 集合长度范围。

```java
@Size(min = 6, max = 20)
private String remark;
```

### @Email
`jakarta.validation.constraints` —— 邮箱格式。

```java
@Email
private String email;
```

### @Pattern
`jakarta.validation.constraints` —— 正则校验。

```java
@Pattern(regexp = "^1[3-9]\\d{9}$")     // 手机号
private String phone;
```

### @DecimalMin　☆低频
`jakarta.validation.constraints` —— 数值 / 金额下限。

```java
@DecimalMin("0.01")
private BigDecimal amount;
```

## 五、Jakarta Annotation　`jakarta.annotation`
----

### @Resource
依赖注入，默认按**名字**匹配（对比 Spring 的 `@Autowired` 按类型；Spring 项目里 `@Autowired` 更常见）。

```java
@Resource
private IOrderRepository orderRepo;
```

## 六、Jackson（JSON 序列化）　`com.fasterxml.jackson.annotation`
----

### @JsonIgnore　★高频
序列化时忽略该字段（如密码，防止泄露给前端）。

```java
@JsonIgnore
private String password;
```

### @JsonFormat　★高频
日期时间格式化。

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime createTime;
```

### @JsonProperty
指定序列化后的 JSON 字段名。

```java
@JsonProperty("user_name")
private String userName;        // 属性 userName ↔ JSON user_name
```

## 七、AspectJ（AOP 切面）　`org.aspectj.lang.annotation`
----

### @Aspect
声明切面（日志、权限、限流常用），配合 Spring 的 `@Component` 注册。

```java
@Aspect
@Component
public class LogAspect { }
```

### @Around
环绕通知 + 切点表达式，方法前后都能插逻辑。

```java
@Around("execution(* com.company..*Service.*(..))")
public Object log(ProceedingJoinPoint pjp) throws Throwable {
    return pjp.proceed();       // 执行原方法
}
```

## 八、JUnit（单元测试）　`org.junit.jupiter.api`
----

### @Test　★高频
标记测试方法。

```java
@Test
void should_create_order() { /* 断言 */ }
```

## 附：按层速记
----

| 层 | 高频注解（含所属包） |
|---|---|
| 启动/配置 | `@SpringBootApplication` `@Configuration` `@Bean` `@Value` `@ConfigurationProperties`（spring） |
| adapter（接口） | `@RestController` `@RequestMapping` `@GetMapping` `@RequestBody` `@PathVariable`（spring web）· `@Valid`（jakarta.validation） |
| application（应用） | `@Service` `@Transactional`（spring） |
| domain（领域） | **零注解**（纯 Java，不依赖框架） |
| infrastructure（设施） | `@Repository` `@Component`（spring）· `@Mapper`（mybatis）· `@TableName`（mybatis-plus） |
| 通用/注入 | `@Autowired` `@Qualifier` `@Primary`（spring）· `@Resource`（jakarta.annotation） |
| POJO | `@Data` `@Builder` `@Slf4j`（lombok） |
