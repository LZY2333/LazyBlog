---
title: TS小技巧总结
date: 2025-05-22 20:57:36
hide: true
---

前面零零散散顺序写了很多小技巧，这里汇总一下，每个技巧精简举个例子，供快速查询

积累参数（accumulator）



## 高级技巧术语库(未整理)
| 技巧术语                                  | 说明                                                          | 示例或用途                                                          |                                  |                 |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------- | --------------- |
| ✅ **类型归一化**                          | 把交叉类型 / 推导类型「扁平化」成普通对象                     | `{ a: string } & { b: number }` → `{ a: string; b: number }`        |                                  |                 |
| ✅ **条件键重映射**                        | 在 mapped type 中使用 `as ... ? ... : never` 进行键筛选或改名 | `FilterByValueType`                                                 |                                  |                 |
| ✅ **分布式条件类型**                      | 条件类型在联合类型上会分布执行                                | `T extends string ? X : Y` 对 \`T = A                               | B`会变成`A extends ...           | B extends ...\` |
| ✅ **多层 Mapped Types 组合**              | 嵌套使用 mapped type，完成深度遍历 / 重命名 / 类型加工        | 深拷贝类型 / 深只读                                                 |                                  |                 |
| ✅ **交叉类型归并**                        | 使用 `infer O` 归一化交叉类型结构，使其可再映射               | `type O = A & B extends infer O ? { [K in keyof O]: O[K] } : never` |                                  |                 |
| ✅ **Key Remapping**                       | 通过 `as` 实现键重命名、键过滤                                | 参考上面示例                                                        |                                  |                 |
| ✅ **联合转交叉（Union to Intersection）** | 把 \`A                                                        | B`转成`A & B\`                                                      | 常用于 Props 合并、Overload 提取 |                 |
| ✅ **联合类型取交集 / 排除**               | 通过 `Extract` / `Exclude` 精确控制联合类型                   | `Exclude<keyof T, K>`                                               |                                  |                 |
| ✅ **Tuple 操作类型**                      | 长度控制、头尾操作、递归构造                                  | `Shift<T>`, `Push<T, V>` 等                                         |                                  |                 |
| ✅ **递归类型（Recursive Type）**          | 深度转换嵌套结构，通常结合条件 + mapped                       | `DeepReadonly<T>`                                                   |                                  |                 |
| ✅ **Template Literal 类型推导**           | 用模板字符串推导出新的 key 或类型                             | `K extends \`on\${Capitalize<string>}\`\`                           |                                  |                 |
| ✅ **类型收窄与过滤**                      | 用 `infer` 精准提取部分结构                                   | `infer U extends string`、过滤 Promise 等结构                       |                                  |                 |
| ✅ **键值互换（Invert）**                  | 键值互换映射，比如 `{ a: 1 } → { 1: 'a' }`                    | 结合 `as T[K]`                                                      |                                  |                 |
| ✅ **Value to Key 映射**                   | 根据值反推 key，类似数据库索引的结构                          | 倒排索引类型生成                                                    |                                  |                 |
