---
title: TS类型技巧(四):计数
date: 2025-05-27 02:20:44
categories: 技术栈
tags: 
    - TypeScript
---

通过构建元组做计数

```ts
// 计算的基础
type BuildArray<
    Length extends number,
    Ele = unknown,
    Arr extends unknown[] = []
> = Arr['length'] extends Length
    ? Arr
    : BuildArray<Length, Ele, [...Arr, Ele]>;
```

## 1. 加法

```ts
type Add<Num1 extends number, Num2 extends number> =
    [...BuildArray<Num1>, ...BuildArray<Num2>]['length'];
```

## 2. 减法

`infer Rest`提取 本质上就是减法

```ts
type Subtract<Num1 extends number, Num2 extends number> =
    BuildArray<Num1> extends [...arr1: BuildArray<Num2>, ...arr2: infer Rest]
    ? Rest['length']
    : never;
```

`arr1:` 和 `arr2`: tuple label（标签）语法，提高可读性, 和不加标签一样

`arr1:` 和 `arr2` 并不能作为变量供后续使用，仅 `infer Rest` 可供后续使用

使用上述 元组标签时, `Rest['length']` 会被视为元组类型（tuple）

不使用时`[...BuildArray<Num2>, ...infer Rest]`,

`Rest['length']` 会视为数组类型而报错: 类型`length`无法用于索引类型`Rest`

仅 `TS 4.1–4.9` 必须整个元组都带标签，或整个都不带, 这里其实只留arr2就行

## 3. 乘法

```ts
type Multiply<
    N1 extends number,
    N2 extends number,
    R extends unknown[] = []
> = N2 extends 0 ? R['length']
    : Multiply<N1, Subtract<N2, 1>, [...R, ...BuildArray<N1>]>;
```

Result 每次加N1, N2每次-1, 直到N2为0, 返回Result

## 4. 除法

```ts
type Divide<
    N1 extends number,
    N2 extends number,
    R extends unknown[] = []
> = N1 extends 0 ? R['length']
        : Divide<Subtract<N1, N2>, N2, [...R, unknown]>;
```

## 5. 字符串长度

字符串类型不能取 length

```ts
type StrLen<Str extends string, R extends unknown[] = []> =
    Str extends `${string}${infer Rest}`
    ? StrLen<Rest, [...R, unknown]>
    : R['length']
```

## 6. 数值比较

往一个数组类型中不断放入元素取长度，如果先到了 A，那就是 B 大，否则是 A 大

```ts
type GreaterThan<
    N1 extends number,
    N2 extends number,
    R extends unknown[] = []
> = N1 extends N2 
    ? false
    : R['length'] extends N2
        ? true
        : R['length'] extends N1
            ? false
            : GreaterThan<N1, N2, [...R, unknown]>;
```

## 7. Fibonacci

```ts
type FibonacciLoop<
    // 前一项
    PrevArr extends unknown[],
    // 当前项
    CurrentArr extends unknown[],
    // 当前索引
    IndexArr extends unknown[] = [],
    // 目标索引
    Num extends number = 1
> = IndexArr['length'] extends Num
    ? CurrentArr['length']
    : FibonacciLoop<CurrentArr, [...PrevArr, ...CurrentArr], [...IndexArr, unknown], Num>

// 取第 Num 项的斐波那契数
type Fibonacci<Num extends number> = FibonacciLoop<[1], [], [], Num>;

```
