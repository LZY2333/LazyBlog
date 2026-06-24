# Java 开发问题记录

## MapStruct 无法生成实现类

报错位置：含 `List` 字段的 Mapper 接口。

```java
// AccountTypeConverter.java
@Mapper(componentModel = "spring")
// AccountTypeConverter标红 hover报错：
// No implementation was created for AccountTypeConverter due to having a problem
// in the erroneous element java.util.ArrayList.
public interface AccountTypeConverter {
    AccountTypeVO toVO(AccountType accountType);  // AccountType 含 List 字段
    List<AccountTypeVO> toVOList(List<AccountType> list);
}
```

原因：注解处理器顺序错误，Lombok 未先于 MapStruct 运行，MapStruct 读不到实体类的 getter/setter。

解决：在 `pom.xml` 的 `maven-compiler-plugin` 中显式声明处理器顺序，**Lombok 必须在 MapStruct 前**：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </path>
            <!-- Lombok 1.18.16+ 需要此桥接器 -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </path>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>${mapstruct.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

改完后执行 `mvn clean compile` 重新构建。

> Lombok + MapStruct 同在 `dependencies` 的项目大多能正常运行，Maven 自动发现的顺序在常见版本组合下刚好正确。出现此报错再迁移到 `annotationProcessorPaths` 即可。
