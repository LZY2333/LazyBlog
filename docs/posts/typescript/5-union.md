---
title: TS类型技巧(五):联合类型
date: 2025-05-27 03:37:02
categories: 技术栈
tags: 
    - TypeScript
---

TypeScript 对联合类型做了专门的处理，得到了写法上的简化

联合类型的分发策略:

条件类型会分别作用于 联合类型的每一个元素做类型计算，最后合并。

目的:

简化类型编程逻辑，不需要递归提取每个元素再处理。

## 0. 例子

```ts
type UppercaseA<Item extends string> = 
    Item extends 'a' ?  Uppercase<Item> : Item;

// "b" | "c" | "A"
type Result = UppercaseA<'a' | 'b' | 'c'>
```

`<Item extends string>` 联合类型 需要每一个子类型 均能通过泛型约束，才算通过

## 1. 转驼峰

```ts
// 下划线转驼峰
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
    : Str;

// 数组转驼峰
type CamelCaseArr<
    Arr extends unknown[]
> = Arr extends [infer Item, ...infer RestArr]
    ? [CamelCase<Item & string>, ...CamelCaseArr<RestArr>]
    : [];

// 联合类型转驼峰
type CamelCaseUnion<Item extends string> =
    Item extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelCaseUnion<Rest>}`
    : Item;
```

`CamelCase<Item & string>` 转string 供CamelCase使用