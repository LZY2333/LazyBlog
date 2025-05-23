---
title: TS类型技巧(三):递归
date: 2025-05-22 21:40:37
categories: 技术栈
tags: 
    - TypeScript
---

应对数量不确定的情况时，需要使用 __递归__

## 提取Promise value类型
```ts
type ttt = Promise<Promise<Promise<number>>>
type DeepPromiseValueType<T> = T extends Promise<infer U>
    ? DeepPromiseValueType<U>
    : T
type ttt2 = DeepPromiseValueType<ttt> // number
```

## 反转数组
```ts
type ReverseArr<Arr extends unknown[]> = Arr extends [
    infer First,
    ...infer Rest
]
    ? [...ReverseArr<Rest>, First]
    : Arr
type arr2 = ReverseArr<arr> // [5,4,3,2,1]
```
注意泛型不能写成 `type ReverseArray<T: any[]>`, `:`是函数的语法

## 查找数组元素

```ts
type Includes<Arr extends unknown[], FindItem> = Arr extends [
    infer First,
    ...infer Rest
]
    ? IsEqual<First, FindItem> extends true
        ? true
        : Includes<Rest, FindItem>
    : false

type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false)

type arr3 = [1, 2, 3, 4, 5]
type res = Includes<arr3, 3> // true
type res2 = Includes<arr3, 6> // false
```

## 删除数组元素

```ts
type RemoveItem<T extends unknown[], DeleteItem, Result extends unknown[] = []> =
    // 不管相不相等都继续递归 RemoveItem, 直到数组为空返回Result, 做到全部删除
    T extends [infer First, ...infer Rest]
        ? IsEqual<First, DeleteItem> extends true
            ? // 如果相等就不放进Result,
              RemoveItem<Rest, DeleteItem, Result>
            : // 如果不相等,就放进Result, 注意...Result在前面，因为Result是前面传下来的结果
              RemoveItem<Rest, DeleteItem, [...Result, First]>
        : Result
        
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

type arr5 = [1, 2, 3, 3, 4, 5, 3]
type res4 = RemoveItem<arr5, 3> // [1,2,4,5]
```

## 扁平化数组

```ts
// 两层
type Flatten< Arr extends unknown[], Result extends unknown[] = [] > =
    Arr extends [infer First, ...infer Rest]
        ? First extends unknown[]
            ? Flatten<Rest, [...Result, ...First]>
            : Flatten<Rest, [...Result, First]>
        : Result

// 多层
type DeepFlatten< Arr extends unknown[], Result extends unknown[] = [] > =
    Arr extends [infer First, ...infer Rest]
        ? First extends unknown[]
            ? Flatten<[...First, ...Rest], Result>
            : Flatten<Rest, [...Result, First]>
        : Result

```

## 技巧! 积累参数（accumulator）