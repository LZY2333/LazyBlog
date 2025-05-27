---
title: TS类型技巧(五):联合类型
date: 2025-05-27 03:37:02
categories: 技术栈
tags: 
    - TypeScript
---

TypeScript 对联合类型做了专门的处理，得到了写法上的简化。

效果: 联合类型 的每一个元素会分别参与 类型计算,结果再次合并为 联合类型

目的: 简化类型编程逻辑，不需要递归提取每个元素再处理

缺点: 带来了理解上的门槛

| 类型系统结构                     | 是否对联合类型逐个处理（"分发"）              | 说明                                    |
| -------------------------------- | --------------------------------------------- | --------------------------------------- |
| 条件类型                         | ✅ 会分布式地应用每个成员                      | 最经典的分发机制，`T extends U ? A : B` |
| 模板字符串类型                   | ✅ 会交叉组合成员生成新联合                    | 隐式地展开每个组合                      |
| 映射类型（Mapped Types）         | ❌ 不分发联合类型本身，但会映射联合 key        | 不对整个联合类型本身做拆分              |
| 索引访问类型 `T[K]`              | ✅ `T extends { [K]: ... }` 会对联合做交叉分布 | 有时候会触发分布行为                    |
| 函数参数推导（infer）            | ✅ 有时能触发 union 分布式推导                 | 特别是在 `infer T` 中嵌套 union         |
| infer 条件中交叉分布（函数变种） | ✅ `T extends (...args: infer A) => any ? ...` | 会对每种函数变体分发                    |
| 对象赋值/类型兼容判断            | ❌ 不会显式分发                                | 静态兼容，不涉及类型操作                |


## 1. 条件类型

```ts
type UppercaseA<Item extends string> = 
    Item extends 'a' ?  Uppercase<Item> : Item;

// "b" | "c" | "A"
type Result = UppercaseA<'a' | 'b' | 'c'>
```

`<Item extends string>` 联合类型 需要每一个子类型 均能通过泛型约束，才算通过

__体验其特点__

```ts
// 下划线转驼峰
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
    : Str;

// 如果想对整个数组调用CamelCase，需要递归
type CamelCaseArr<
    Arr extends unknown[]
> = Arr extends [infer Item, ...infer RestArr]
    ? [CamelCase<Item & string>, ...CamelCaseArr<RestArr>]
    : [];

// 如果想对联合类型调用CamelCase，不需要递归
type CamelCaseUnion<Item extends string> = CamelCase<Item>

// "aAA" | "bBB"
type test = CamelCaseUnion<'a_a_a' | 'b_b_b'>
```

`CamelCase<Item & string>` 转string 供CamelCase使用

## 2. 如何判断联合类型

```ts
type IsUnion<A, B = A> = A extends A
    ? [B] extends [A]
        ? false
        : true
    : never

// true
type test3 = IsUnion<'a' | 'b'>
```

`B = A` 复制一个 `A`

`A extends A` 仅为了 触发分布式条件类型, 让A 变成单独的子类型

`[B] extends [A]` 避免触发`B`的分布式条件类型，与 已经变成子类型的 `A` 比较

如果相等，就是不存在分发，就不是 联合类型，

如果不相等，            就是 联合类型

__只有extends左边的联合类型会触发 分别单独传入计算__
```ts
// A B 是同一个类型，属性a b却不同
type TestUnion<A, B = A> = A  extends A ? { a: A, b: B} : never;

// {
//     a: "a";
//     b: "a" | "b" | "c";
// } | {
//     a: "b";
//     b: "a" | "b" | "c";
// } | {
//     a: "c";
//     b: "a" | "b" | "c";
// }
type TestUnionResult = TestUnion<'a' | 'b' | 'c'>;
```

## 3. 模板字符串类型

__字符串模板类型 传入联合类型，会产生 展开及交叉组合__

```ts
type ConcatStr<T extends string, U extends string> = `${T}-${U}`;

// "A-a" | "A-b" | "B-a" | "B-b"
type A = ConcatStr<'A' | 'B', 'a' | 'b'>;
```

## 4. 映射类型

Key值分发, Value值不分发

```ts
// { a: true, b: true }
type DistributeKey = {
    [K in 'a' | 'b']: true
}
type DistributeValue = {
    k: 'a' | 'b'
}
```



__数组转联合类型, 使用number下标访问__

```ts
type test = ['aaa', 'bbb']
// "aaa" | "bbb"
type test2 = ['aaa', 'bbb'][number]
// "aaa" | "bbb"
type test3 = test[number]
```


