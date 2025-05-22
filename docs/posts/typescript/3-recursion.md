---
title: TS类型技巧(三):递归
date: 2025-05-22 21:40:37
categories: 技术栈
tags: 
    - TypeScript
---

应对数量不确定的情况时，需要使用 __递归__

## 提取不确定层数的 Promise 中的 value 类型
```ts
type ttt = Promise<Promise<Promise<number>>>;
type DeepPromiseValueType<T> =
    T extends Promise<infer U> ? DeepPromiseValueType<U> : T;
type ttt2 = DeepPromiseValueType<ttt>; // number
```

## 反转不确定数量的 数组
```ts
type arr = [1, 2, 3, 4, 5];
type ReverseArr<Arr extends unknown[]> =
    Arr extends [infer First, ...infer Rest]
    ? [...ReverseArr<Rest>, First]
    : Arr;
type arr2 = ReverseArr<arr>; // [5,4,3,2,1]
```
注意泛型不能写成 `type ReverseArray<T: any[]>`, `:`是函数的语法

## 查找不确定数量数组 的指定元素

```ts
type Includes<Arr extends unknown[], FindItem> = 
    Arr extends [infer First, ...infer Rest]
        ? IsEqual<First, FindItem> extends true
            ? true
            : Includes<Rest, FindItem>
        : false;

type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

type arr3 = [1, 2, 3, 4, 5];
type res = Includes<arr3, 3>; // true
type res2 = Includes<arr3, 6>; // false
```

## 删除数组的 不确定数量指定元素


```ts

type Delete<Arr extends unknown[], DeleteItem> =
    Arr extends [infer First, ...infer Rest] ? IsEqual<First, DeleteItem> extends false ? Delete<Rest, DeleteItem> : [...Rest] : false;

type arr4 = [1, 2, 3, 4, 5];
type res3 = Delete<arr4, 3>; // [1,2,4,5]
```

```ts
type RemoveItem<
    Arr extends unknown[], 
    Item, 
    Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
        ? IsEqual<First, Item> extends true
            ? RemoveItem<Rest, Item, Result>
            : RemoveItem<Rest, Item, [...Result, First]>
        : Result;
        
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

```

## 技巧! 积累参数（accumulator）