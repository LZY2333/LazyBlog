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

`[...BuildArray<Num2>, ...infer Rest]` 完全等同

仅 `TS 4.1–4.9` 必须整个元组都带标签，或整个都不带，上半arr1，而下半没有标签

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
    // 之前累加的数值
    PrevArr extends unknown[], 
    // 当前数值
    CurrentArr extends unknown[], 
    // index
    IndexArr extends unknown[] = [], 
    // 数列的第几个数
    Num extends number = 1
> = IndexArr['length'] extends Num
    ? CurrentArr['length']
    : FibonacciLoop<CurrentArr, [...PrevArr, ...CurrentArr], [...IndexArr, unknown], Num> 

// 构建斐波那契数列，真正要传入的是Num
type Fibonacci<Num extends number> = FibonacciLoop<[1], [], [], Num>;
```