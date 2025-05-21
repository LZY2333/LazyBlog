---
title: 构造类型
date: 2025-05-21 21:36:07
categories: 技术栈
tags: 
    - TypeScript
---


## 类型构造

TS类型系统不能对原类型进行修改，而是每次都构造新类型

那么有哪些方法会让我们获得一个新类型

`type` `infer` 以及直接使用类型

## 数组类型的构造

__解构__,只需要掌握解构语法

```ts
type Push<Arr extends  unknown[], Ele> = [...Arr, Ele];
```

```ts
type Zip<T extends [unknown, unknown], U extends [unknown, unknown]> =
    T extends [infer A, infer B] ?
    U extends [infer C, infer D] ?
    [[A, C], [B, D]] : never : never;

type tuple1 = Zip<[1, 2], ['a', 'b']>; // [[1, 'a'], [2, 'b']];
```

```ts
// 任意个元组类型构造Zip2(递归)
type Zip2<T extends unknown[], U extends unknown[]> =
type Zip2<T extends unknown[], U extends unknown[]> =
    T extends [infer A, ...infer rest] ?
    U extends [infer B, ...infer rest2] ?
    [[A, B], ...Zip2<rest, rest2>] : [] : []

// [[1, "a"], [2, "b"], [3, "c"]]
type tuple6 = Zip2<[1, 2, 3], ['a', 'b', 'c']>;

```

## 字符串类型的构造

## 函数类型的构造

## 索引类型的构造


extends 就是 if条件判断
infer 就是 if条件内进行 解构+变量声明
递归 就是 for循环
[神光大佬的TypeScript 类型体操通关秘籍](https://juejin.cn/book/7047524421182947366/section/7048282176701333508)