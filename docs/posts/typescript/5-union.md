---
title: TS类型技巧(五):联合类型
date: 2025-05-27 03:37:02
categories: 技术栈
tags: 
    - TypeScript
---

TypeScript 对联合类型做了专门的处理，具有 Distributive 特性, 得到了写法上的简化。

效果: 联合类型 的每一个元素会分别参与 类型计算,结果再次合并为 联合类型

目的: 简化类型编程逻辑，不需要递归提取每个元素再处理

缺点: 带来了理解上的门槛

## 1. 条件类型

这种效果叫 __分布式条件类型__

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

`B = A` 首先复制一个 `A`

`A extends A` 必然为true, 但联合类型, 会被分发为子类型分别进行后续推导

`[B] extends [A]` 避免了`B`的分布式条件类型，与 多个拆成子类型的 `A` 比较

此时 相等 则代表`A`不存在分发 `false`, 不相等 则代表`A` 产生了分发 `true`

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

## 4. 索引类型

__数组转联合类型, 使用number下标访问__

```ts
type test = ['aaa', 'bbb']
// "aaa" | "bbb"
type test2 = ['aaa', 'bbb'][number]
// "aaa" | "bbb"
type test3 = test[number]
```

```ts
type T = { a: number } | { b: string };

// number | string 
type Keys = T['a' | 'b']; 
```

## 5. 利用分发机制

利用 4.数组转联合类型 3.联合类型自动交叉组合, 对数组进行全组合。

```ts
type test4<T extends string[]> = `__${T[number]}`

// "__aaa" | "__bbb"
type test5 = test4<['aaa', 'bbb']>
```

`T extends string[]` 和 `T[number]` 这两点是实现能传入数组变成联合类型的关键

联合类型的分发 代替 循环， 达到遍历子类型的效果

```ts
// 任意两个类型的全组合
type Combination<A extends string, B extends string> =
    | A
    | B
    | `${A}${B}`
    | `${B}${A}`

// 任意个数类型的全组合, 利用联合类型做到循环，同时加入递归
type AllCombinations<
    A extends string,
    B extends string = A
> = A extends A
    ? Combination<A, AllCombinations<Exclude<B, A>>>
    : never

// "A" | "B" | "C" | "BC" | "CB" | "AB" | "AC" | "ABC" | "ACB" | "BA" | "CA" | "BCA" | "CBA" | "BAC" | "CAB"
type test6 = AllCombinations<'A' | 'B' | 'C'>
```

`A extends A` 将A分发, 相当于循环遍历了A的每个子类型

接下来对每个 单A 都调用一次 Combination，循环+递归 完成全组合

```ts
type Permutation<T, B = T> =
    [T] extends [never]
        ? []
        : T extends T
            ? [T, ...Permutation<Exclude<B,T>>]
            : []
// ['a', 'b'] | ['b' | 'a']
type Permuted = Permutation<'a' | 'b'>
```

## 7. boolean any never 的分发

```ts
type ActiveDistribute<T> = T extends true ? 1 : 2
// 1 | 2
type testActiveDistribute = ActiveDistribute<any>
// 1 | 2
type testActiveDistribute1 = ActiveDistribute<boolean>
// never，严格来说也是分布式条件类型，分别比较，分别返回never,结果还是never
type testActiveDistribute2 = ActiveDistribute<never>
```

## 8. 联合类型的最后一个类型

联合类型不能直接 infer 来取其中的某个类型, 必须通过特殊技巧

联合类型转元组

```ts
// [1, 2, 3]
type testUnionToTuple = UnionToTuple<1 | 2 | 3>
```

```ts
// 联合类型转交叉类型
type UnionToIntersection<U> =
    (U extends U ? (x: U) => unknown : never) extends
    (x: infer R) => unknown
        ? R // { [K in keyof R]: R[K] }
        : never

// 联合类型转元组类型
type UnionToTuple<T> = 
    UnionToIntersection<
        T extends any ? () => T : never
    > extends () => infer ReturnType
        ? [...UnionToTuple<Exclude<T, ReturnType>>, ReturnType]
        : [];

// [1, 2, 3]
type testUnionToTuple = UnionToTuple<1 | 2 | 3>
```

__UnionToIntersection__ A | B | C 转成交叉类型 A & B & C

0. 假设传入 `A | B | C`

1. `(x: A) => unknown | (x: B) => unknown | (x: C) => unknown`

2. 与`extends (x: infer R) => unknown`比较, 此时由于函数参数为逆变

3. `infer R` 收紧为 交叉类型 `A & B & C`

__UnionToTuple__ `1 | 2 | 3` 转 `[1, 2, 3]`

0. 传入 `1 | 2 | 3`

1. `UnionToIntersection<() => 1 | () => 2 | () => 3>`

2. `(() => 1) & (() => 2) & (() => 3)`

3. 与 `extends () => infer ReturnType`比较, 此时由于 函数返回值为协变

4. `infer ReturnType` 取最后一个函数的返回值类型, 即 `3`

5. `[...UnionToTuple<1 | 2>, 3]` 进入递归

> 函数交叉类型 即 函数重载(见TS基础8函数重载)  
> 函数重载的 ReturnType 特性是: 其值为最后一个重载的 ReturnType

## 9. 其他

`keyof T | keyof U`不能写成 `keyof (T | U)`，这样是拿交集的Key

__keyof 是一种内置操作符, 联合类型不对 keyof 分发__
