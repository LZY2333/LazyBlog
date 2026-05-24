# Java 常用类速查 Demo

按 JDK 内置 + 第三方两大维度，覆盖日常开发高频类与其常用方法。每个类附独立可运行 Demo，方法后用 `// →` 标注返回值或效果。

---

## 一、基础数据类型相关

### 1. String
**用途**：所有文本处理场景——字段拼接、日志、参数校验、JSON 字符串操作。

```java
String s = "Hello,World";
s.length();                    // → 11
s.charAt(0);                   // → 'H'
s.indexOf(",");                // → 5
s.substring(6);                // → "World"
s.substring(0, 5);             // → "Hello"
s.split(",");                  // → ["Hello", "World"]
s.replace(",", "-");           // → "Hello-World"
s.toUpperCase();               // → "HELLO,WORLD"
s.trim();                      // → 去首尾空格
s.contains("World");           // → true
s.startsWith("He");            // → true
s.equals("Hello,World");       // → true（比较内容，禁用 ==）
s.equalsIgnoreCase("hello,world"); // → true
String.format("id=%d", 5);     // → "id=5"
String.join("-", "a", "b");    // → "a-b"
s.isEmpty();                   // → false
s.isBlank();                   // → false（Java 11+，判全空白）
```

### 2. StringBuilder
**用途**：循环内字符串拼接、动态构造 SQL/JSON 文本，避免 `+` 产生大量临时对象。

```java
StringBuilder sb = new StringBuilder();
sb.append("a").append(1).append(true); // → "a1true"
sb.insert(0, ">>");            // → ">>a1true"
sb.delete(0, 2);               // → "a1true"
sb.reverse();                  // → "eurt1a"
sb.length();                   // → 6
sb.toString();                 // → 转为 String
```

### 3. StringBuffer
**用途**：多线程下需要可变字符串时（实际开发极少用，单线程一律用 StringBuilder）。API 与 StringBuilder 完全一致，方法加了 `synchronized`。

### 4. Integer / Long / Double / Boolean
**用途**：集合元素（List/Map 不能存基本类型）、字符串与数字互转、null 表示无值。

```java
Integer.parseInt("123");        // → 123
Integer.valueOf("123");         // → Integer 对象
Integer.toString(123);          // → "123"
Integer.toBinaryString(10);     // → "1010"
Integer.max(1, 2);              // → 2
Integer.MAX_VALUE;              // → 2147483647
Long.parseLong("123456789012"); // → long
Double.parseDouble("3.14");     // → 3.14
Boolean.parseBoolean("true");   // → true
```

### 5. BigDecimal
**用途**：金额、利率、税费等任何不能丢精度的小数计算。**禁止用 double 表示金额**。

```java
BigDecimal a = new BigDecimal("0.1");   // 字符串构造
BigDecimal b = new BigDecimal("0.2");
a.add(b);                       // → 0.3
a.subtract(b);                  // → -0.1
a.multiply(b);                  // → 0.02
a.divide(b, 2, RoundingMode.HALF_UP); // → 0.50（必须指定精度和舍入）
a.compareTo(b);                 // → -1（不要用 equals，0.1 ≠ 0.10）
a.setScale(2, RoundingMode.HALF_UP);  // → 0.10
BigDecimal.ZERO; BigDecimal.ONE;      // 常量
```

### 6. BigInteger
**用途**：超过 long 范围的整数运算（加密、大数阶乘、雪花 ID 等）。

```java
BigInteger x = new BigInteger("999999999999999999999");
x.add(BigInteger.ONE);
x.multiply(BigInteger.TEN);
x.mod(BigInteger.valueOf(7));   // → 取模
x.pow(3);                       // → 立方
```

---

## 二、集合框架

### 1. ArrayList
**用途**：90% 的列表场景——查询数据返回、遍历、按索引访问。

```java
List<String> list = new ArrayList<>();
list.add("a");                  // 尾部添加
list.add(0, "b");               // 指定位置插入
list.get(0);                    // → "b"
list.set(0, "c");               // 替换
list.remove(0);                 // 按索引删
list.remove("a");               // 按值删
list.size();                    // → 元素数量
list.contains("a");             // → 是否包含
list.indexOf("a");              // → 索引，找不到返回 -1
list.isEmpty();
list.clear();
List.of("a", "b", "c");         // → 不可变 List（Java 9+）
```

### 2. LinkedList
**用途**：频繁在头尾增删（队列、栈），或当作 Deque 使用。

```java
LinkedList<String> ll = new LinkedList<>();
ll.addFirst("a"); ll.addLast("b");
ll.getFirst(); ll.getLast();
ll.removeFirst(); ll.removeLast();
ll.push("x"); ll.pop();         // 栈
ll.offer("y"); ll.poll();       // 队列
```

### 3. HashMap
**用途**：键值映射首选——缓存、分组统计、配置项、ID 映射对象。

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.get("a");                   // → 1
map.getOrDefault("x", 0);       // → 0
map.containsKey("a");           // → true
map.remove("a");
map.size();
map.keySet();                   // → Set<String>
map.values();                   // → Collection<Integer>
map.entrySet();                 // → Set<Entry>，遍历用
map.putIfAbsent("a", 1);        // 不存在才放
map.merge("a", 1, Integer::sum);// 计数神器：存在则累加
map.computeIfAbsent("k", k -> new ArrayList<>()).add("v"); // 一对多
map.forEach((k, v) -> {});
Map.of("a", 1, "b", 2);         // 不可变 Map（Java 9+）
```

### 4. LinkedHashMap
**用途**：需要保持插入顺序（如导出 Excel 的列顺序），或实现 LRU 缓存（`accessOrder=true`）。

```java
Map<String, Integer> m = new LinkedHashMap<>(); // 用法同 HashMap
// LRU 缓存：
new LinkedHashMap<K,V>(16, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry e) { return size() > 100; }
};
```

### 5. TreeMap
**用途**：需要 key 自动排序（按时间、按字典序），或范围查询。

```java
TreeMap<String, Integer> tm = new TreeMap<>();
tm.put("b", 2); tm.put("a", 1);
tm.firstKey();                  // → "a"
tm.lastKey();                   // → "b"
tm.floorKey("ab");              // → "a"（≤ 给定值的最大 key）
tm.ceilingKey("ab");            // → "b"
tm.subMap("a", "c");            // → 范围视图
```

### 6. ConcurrentHashMap
**用途**：多线程共享的 Map（缓存、计数器、注册中心）。**绝不用 HashMap 在多线程下**。

```java
ConcurrentHashMap<String, Integer> cm = new ConcurrentHashMap<>();
cm.put("a", 1);
cm.computeIfAbsent("k", k -> 0);
cm.merge("counter", 1, Integer::sum); // 线程安全计数
```

### 7. HashSet / TreeSet
**用途**：去重（HashSet）、排序去重（TreeSet）。

```java
Set<String> set = new HashSet<>();
set.add("a"); set.add("a");     // 重复无效
set.contains("a");              // → true
set.remove("a"); set.size();
Set.of("a", "b");               // 不可变 Set
new TreeSet<>(list);            // → 自动排序去重
```

### 8. Queue / Deque / ArrayDeque
**用途**：BFS、任务队列、撤销栈、滑动窗口。`ArrayDeque` 是 Stack 和 LinkedList 队列的更快替代。

```java
Deque<Integer> dq = new ArrayDeque<>();
dq.offer(1); dq.poll();         // 队列：尾入头出
dq.push(1); dq.pop();           // 栈：头入头出
dq.peek();                      // 看头部，不移除
```

### 9. Collections
**用途**：对集合排序、查找、反转、不可变包装。

```java
Collections.sort(list);
Collections.sort(list, Comparator.reverseOrder());
Collections.reverse(list);
Collections.shuffle(list);
Collections.max(list);
Collections.min(list);
Collections.frequency(list, "a"); // → 出现次数
Collections.unmodifiableList(list); // 不可变包装
Collections.emptyList();
```

### 10. Arrays
**用途**：数组排序、转 List、复制、填充、调试打印。

```java
int[] arr = {3, 1, 2};
Arrays.sort(arr);
Arrays.toString(arr);           // → "[1, 2, 3]"
Arrays.asList("a", "b");        // → List（注意：底层定长，不能 add）
Arrays.copyOf(arr, 5);          // 扩容/截断
Arrays.copyOfRange(arr, 1, 3);
Arrays.fill(arr, 0);
Arrays.equals(arr1, arr2);
Arrays.stream(arr);             // → IntStream
```

---

## 三、IO / NIO

### 1. File
**用途**：判断文件存在、创建/删除、列目录、获取文件信息。

```java
File f = new File("a.txt");
f.exists(); f.isFile(); f.isDirectory();
f.length();                     // → 字节数
f.getName(); f.getAbsolutePath(); f.getParent();
f.createNewFile(); f.mkdirs();  // 创建文件/多级目录
f.delete(); f.renameTo(new File("b.txt"));
f.listFiles();                  // → File[]
```

### 2. FileInputStream / FileOutputStream
**用途**：读写二进制文件（图片、视频）。文本文件优先用字符流。

```java
try (FileInputStream in = new FileInputStream("a.bin")) {
    byte[] buf = new byte[1024];
    int len = in.read(buf);
}
try (FileOutputStream out = new FileOutputStream("a.bin")) {
    out.write(new byte[]{1, 2, 3});
}
```

### 3. BufferedReader / BufferedWriter
**用途**：按行读写文本文件、读取大文件。

```java
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    String line;
    while ((line = br.readLine()) != null) { /* ... */ }
}
try (BufferedWriter bw = new BufferedWriter(new FileWriter("a.txt"))) {
    bw.write("hello"); bw.newLine();
}
```

### 4. Files / Paths（NIO，强烈推荐）
**用途**：一行代码读写文件、复制、移动、遍历目录——替代繁琐的 IO 流。

```java
Path p = Paths.get("a.txt");
Files.exists(p);
Files.readString(p);             // → 整个文件内容（Java 11+）
Files.readAllLines(p);           // → List<String>
Files.writeString(p, "hello");   // 一行写入
Files.write(p, list);            // 写入行列表
Files.copy(src, dest);
Files.move(src, dest);
Files.delete(p);
Files.createDirectories(Paths.get("a/b/c"));
Files.walk(Paths.get(".")).forEach(System.out::println);
Files.size(p);
```

### 5. Scanner
**用途**：命令行交互、读取标准输入。生产环境基本不用。

```java
Scanner sc = new Scanner(System.in);
sc.nextLine(); sc.nextInt();
sc.hasNext();
```

---

## 四、并发编程

### 1. Thread / Runnable
**用途**：起一个独立执行线程（实际项目优先用线程池）。

```java
new Thread(() -> System.out.println("run")).start();
Thread.sleep(1000);
Thread.currentThread().getName();
Thread.currentThread().interrupt();
```

### 2. ExecutorService / Executors
**用途**：所有需要异步执行任务的场景——HTTP 异步处理、批量调用、定时任务。

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.execute(() -> {});                    // 无返回
Future<Integer> f = pool.submit(() -> 1);  // 有返回
f.get();                                   // 阻塞拿结果
f.cancel(true);
pool.shutdown();                           // 优雅关闭
pool.shutdownNow();                        // 强制关闭

// 实际生产用 ThreadPoolExecutor 显式指定参数：
new ThreadPoolExecutor(4, 8, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100));
```

### 3. CompletableFuture
**用途**：异步编排、并行调用多个接口后聚合结果。

```java
CompletableFuture.supplyAsync(() -> "hi")
    .thenApply(s -> s + "!")
    .thenAccept(System.out::println)
    .exceptionally(e -> null);

CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture.allOf(a, b).join();     // 等全部完成
a.thenCombine(b, (x, y) -> x + y);        // 合并两个结果
```

### 4. CountDownLatch / CyclicBarrier / Semaphore
**用途**：主线程等待 N 个子任务完成（CountDownLatch）、限流（Semaphore）、批量同步（CyclicBarrier）。

```java
CountDownLatch latch = new CountDownLatch(3);
// 子线程：latch.countDown();
latch.await();                          // 主线程阻塞至归零

Semaphore sem = new Semaphore(5);       // 限制 5 个并发
sem.acquire(); /* 业务 */ sem.release();
```

### 5. ReentrantLock
**用途**：需要 `tryLock`、可中断、公平锁等 `synchronized` 不支持的场景。

```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try { /* ... */ } finally { lock.unlock(); }
lock.tryLock(1, TimeUnit.SECONDS);
```

### 6. AtomicInteger / AtomicLong
**用途**：无锁计数器（PV、UV、限流计数）。

```java
AtomicInteger ai = new AtomicInteger(0);
ai.incrementAndGet();           // → 1，原子 ++i
ai.getAndIncrement();           // → 0，原子 i++
ai.addAndGet(5);
ai.compareAndSet(6, 100);       // CAS
ai.get();
```

---

## 五、日期时间（Java 8+）

### 1. LocalDate
**用途**：只表示日期（生日、订单日期），不含时分秒。

```java
LocalDate d = LocalDate.now();          // → 2026-05-24
LocalDate.of(2026, 1, 1);
LocalDate.parse("2026-01-01");
d.plusDays(7); d.minusMonths(1); d.plusYears(1);
d.getYear(); d.getMonthValue(); d.getDayOfWeek();
d.isAfter(other); d.isBefore(other);
d.withDayOfMonth(1);                    // → 当月第一天
```

### 2. LocalTime / LocalDateTime
**用途**：时分秒 / 完整日期时间。日志、订单时间、定时任务。

```java
LocalDateTime dt = LocalDateTime.now();
LocalDateTime.of(2026, 1, 1, 12, 0);
dt.plusHours(2); dt.minusMinutes(30);
dt.toLocalDate(); dt.toLocalTime();
```

### 3. Instant
**用途**：时间戳（数据库存储、跨时区通信）。

```java
Instant.now();                          // → 当前 UTC 时间戳
Instant.ofEpochMilli(1700000000000L);
instant.toEpochMilli();                 // → 毫秒
```

### 4. Duration / Period
**用途**：计算时间差。Duration 用于秒/纳秒，Period 用于年/月/日。

```java
Duration.between(t1, t2).toMillis();
Duration.ofSeconds(30);
Period.between(birthday, today).getYears(); // → 年龄
```

### 5. DateTimeFormatter
**用途**：日期与字符串互转。**线程安全**（替代 SimpleDateFormat）。

```java
DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
dt.format(f);                           // → "2026-05-24 12:00:00"
LocalDateTime.parse("2026-05-24 12:00:00", f);
DateTimeFormatter.ISO_LOCAL_DATE_TIME;  // 内置常量
```

### 6. ~~Date / SimpleDateFormat~~
**用途**：老 API，线程不安全。新代码请用 `LocalDateTime` + `DateTimeFormatter`。仅在维护旧代码时接触。

---

## 六、函数式 & 流（Java 8+）

### 1. Stream
**用途**：集合的链式处理——过滤、映射、聚合、分组。日常开发出现频率极高。

```java
list.stream()
    .filter(s -> s.length() > 2)
    .map(String::toUpperCase)
    .sorted()
    .distinct()
    .limit(10)
    .skip(2)
    .collect(Collectors.toList());

list.stream().count();
list.stream().anyMatch(s -> s.startsWith("a"));
list.stream().allMatch(...); list.stream().noneMatch(...);
list.stream().findFirst();              // → Optional
list.stream().reduce(0, Integer::sum);  // → 求和
list.stream().mapToInt(String::length).sum();

// 收集器
.collect(Collectors.toSet());
.collect(Collectors.toMap(User::getId, u -> u));
.collect(Collectors.groupingBy(User::getDept));     // 分组
.collect(Collectors.partitioningBy(u -> u.age>18)); // 二分
.collect(Collectors.joining(","));                  // 拼字符串
```

### 2. Optional
**用途**：方法返回值可能为空时，强制调用方处理 null。

```java
Optional<User> opt = Optional.ofNullable(user);
opt.isPresent(); opt.isEmpty();
opt.get();                              // 不推荐，可能抛异常
opt.orElse(defaultUser);
opt.orElseGet(() -> loadDefault());
opt.orElseThrow(() -> new NotFoundException());
opt.ifPresent(u -> System.out.println(u));
opt.map(User::getName).orElse("匿名");
```

### 3. Function / Predicate / Consumer / Supplier
**用途**：lambda 的类型容器，写 API 时作为参数类型。

```java
Function<String, Integer> len = String::length;  // 输入到输出
Predicate<String> notEmpty = s -> !s.isEmpty();  // 输入到 boolean
Consumer<String> print = System.out::println;    // 输入到无返回
Supplier<String> get = () -> "hi";               // 无输入到输出
BiFunction<Integer, Integer, Integer> add = Integer::sum;
```

---

## 七、反射与工具

### 1. Class / Method / Field
**用途**：框架核心（Spring、MyBatis）、动态调用、注解扫描。业务代码偶尔用于通用工具。

```java
Class<?> c = User.class;                // 或 Class.forName("com.x.User")
c.getName(); c.getSimpleName();
c.getDeclaredFields();                  // 所有字段（含 private）
c.getDeclaredMethods();
Field f = c.getDeclaredField("name");
f.setAccessible(true);
f.get(userObj); f.set(userObj, "x");
Method m = c.getMethod("getName");
m.invoke(userObj);
c.getAnnotation(Deprecated.class);
```

### 2. Objects
**用途**：null 安全的 equals、hashCode、参数校验。

```java
Objects.equals(a, b);                   // a/b 都可能为 null
Objects.hash(a, b, c);                  // 生成 hashCode
Objects.requireNonNull(arg, "arg 不能为空"); // 参数校验
Objects.isNull(x); Objects.nonNull(x);
Objects.toString(obj, "default");
```

### 3. Math
**用途**：数学运算——金额计算、随机算法、几何。

```java
Math.max(a, b); Math.min(a, b);
Math.abs(-5);                           // → 5
Math.ceil(1.2); Math.floor(1.8); Math.round(1.5);
Math.pow(2, 10);                        // → 1024
Math.sqrt(16);                          // → 4.0
Math.random();                          // → [0,1)
Math.PI; Math.E;
```

### 4. Random / ThreadLocalRandom
**用途**：生成随机数。多线程下用 `ThreadLocalRandom` 避免争用。

```java
Random r = new Random();
r.nextInt(100);                         // → [0, 100)
r.nextDouble(); r.nextBoolean();
ThreadLocalRandom.current().nextInt(1, 10);  // → [1, 10)
```

### 5. UUID
**用途**：生成唯一 ID——文件名、请求 ID、临时 token。

```java
UUID.randomUUID().toString();           // → "550e8400-e29b-..."
UUID.randomUUID().toString().replace("-", "");
```

### 6. System
**用途**：读环境变量、JVM 参数、当前时间、退出程序。

```java
System.currentTimeMillis();             // → 毫秒时间戳
System.nanoTime();                      // → 纳秒（计时用）
System.getProperty("user.dir");         // JVM 属性
System.getenv("PATH");                  // 环境变量
System.lineSeparator();                 // 平台换行符
System.exit(0);
System.arraycopy(src, 0, dest, 0, len); // 高效数组复制
```

---

## 八、异常类

### 常见异常一览

```java
// 运行时异常（不强制 try-catch）
throw new NullPointerException("user 为空");
throw new IllegalArgumentException("id 必须 > 0");
throw new IllegalStateException("订单已支付，不能取消");
throw new IndexOutOfBoundsException();
throw new ClassCastException();
throw new NumberFormatException();
throw new UnsupportedOperationException();
throw new ArithmeticException("除零");

// 受检异常（必须处理）
throw new IOException("文件读取失败");
throw new SQLException();
throw new InterruptedException();

// 自定义异常
public class BizException extends RuntimeException {
    private final int code;
    public BizException(int code, String msg) { super(msg); this.code = code; }
}
```

**try-catch-finally**：

```java
try {
    // 业务
} catch (BizException e) {
    log.error("业务异常", e);
} catch (Exception e) {
    log.error("未知异常", e);
} finally {
    // 资源释放
}

// try-with-resources（推荐）
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    // 自动 close
}
```

---

## 九、第三方常用库

### 1. Lombok
**用途**：消除 getter/setter/构造器/toString 等样板代码。

```java
@Data                                   // 自动生成 get/set/toString/equals/hashCode
@NoArgsConstructor @AllArgsConstructor
@Builder                                // 链式构造
@Slf4j                                  // 自动注入 log 字段
public class User {
    private Long id;
    private String name;
}

// 使用
User u = User.builder().id(1L).name("x").build();
log.info("user={}", u);
```

### 2. Hutool（StrUtil / DateUtil / CollUtil）
**用途**：国产工具库，API 友好，一站式工具集。

```java
StrUtil.isBlank(s); StrUtil.isNotBlank(s);
StrUtil.format("name={},age={}", "Tom", 18);
StrUtil.split("a,b,c", ',');

DateUtil.now();                         // → "2026-05-24 12:00:00"
DateUtil.parse("2026-05-24");
DateUtil.offsetDay(date, 7);
DateUtil.betweenDay(d1, d2, true);

CollUtil.isEmpty(list);
CollUtil.join(list, ",");
```

### 3. Apache Commons Lang3
**用途**：最经典的 Java 工具库，`StringUtils` 几乎人人用过。

```java
StringUtils.isBlank(s);                 // null/空/全空白 → true
StringUtils.isNotBlank(s);
StringUtils.defaultIfBlank(s, "默认");
StringUtils.join(list, ",");
StringUtils.equalsIgnoreCase(a, b);

CollectionUtils.isEmpty(coll);
CollectionUtils.isNotEmpty(coll);
```

### 4. Guava（Google）
**用途**：高质量集合工具、缓存、不可变集合、Multimap。

```java
Lists.newArrayList("a", "b");
Maps.newHashMap();
ImmutableList.of("a", "b");             // 不可变
ImmutableMap.of("k", "v");

Multimap<String, String> mm = ArrayListMultimap.create();
mm.put("k", "v1"); mm.put("k", "v2");   // 一对多

// 本地缓存
Cache<String, User> cache = CacheBuilder.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .build();
cache.put("k", user); cache.getIfPresent("k");
```

### 5. Jackson（ObjectMapper）
**用途**：JSON 序列化/反序列化（Spring Boot 默认集成）。

```java
ObjectMapper om = new ObjectMapper();
String json = om.writeValueAsString(user);          // 对象转 JSON
User u = om.readValue(json, User.class);            // JSON 转对象
List<User> list = om.readValue(json, new TypeReference<List<User>>(){});
JsonNode node = om.readTree(json);                  // 树模型
node.get("name").asText();
```

### 6. SLF4J + Logback
**用途**：日志记录。SLF4J 是门面，Logback 是实现。

```java
private static final Logger log = LoggerFactory.getLogger(MyClass.class);
// 或 @Slf4j（Lombok）

log.debug("详细信息 id={}", id);          // 占位符，不要用 + 拼接
log.info("用户登录: {}", username);
log.warn("重试 {} 次", count);
log.error("调用失败", e);                  // 异常作为最后一个参数
```

---

## 附：选型速查

| 场景 | 推荐 |
|---|---|
| 字符串拼接（循环） | `StringBuilder` |
| 金额计算 | `BigDecimal`（字符串构造 + 指定精度） |
| 列表 | `ArrayList`，并发用 `CopyOnWriteArrayList` |
| 映射 | `HashMap`，并发用 `ConcurrentHashMap`，有序用 `LinkedHashMap` / `TreeMap` |
| 文件读写 | `Files.readString` / `Files.writeString` |
| 异步任务 | `CompletableFuture` + 自定义 `ThreadPoolExecutor` |
| 日期时间 | `LocalDateTime` + `DateTimeFormatter` |
| 集合处理 | `Stream` + `Collectors` |
| null 处理 | `Optional` / `Objects.requireNonNull` |
| JSON | `Jackson` |
| 日志 | `SLF4J` + `Logback` + Lombok `@Slf4j` |
| POJO | Lombok `@Data` `@Builder` |
| 字符串工具 | `StringUtils`（Commons）或 `StrUtil`（Hutool） |
