---
title: TS类型技巧(六):特殊类型判断
date: 2025-05-27 22:05:31
categories: 技术栈
tags: 
    - TypeScript
---


## 1. IsAny

__any 与任何类型的交叉类型都是 any__
```ts
type IsAny<T> = 0 extends (2 & T) ? true : false
```
0 和 1 可以换成任意两个不同的类型

## 2. IsEqual(待理解)

```ts
// 之前的简易实现
type IsEqual0<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)
// true, 无法判别any
type isEqualRes0 = IsEqual0<'a', any>
```

```ts
// 最终实现
type IsEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends 
    (<T>() => T extends B ? 1 : 2)
    ? true : false;
// false
type isEqualRes1 = IsEqual<'a', any>
```

`IsEqual` 中 `any` 的万能特性似乎失效了

__函数参数的双重泛型分发差异__, `IsEqual` 中

这是比较两个泛型函数签名的 assignability（能否赋值给彼此）。

当 A 是 any 时，T extends A 会总是 true，所以整个函数返回类型恒为 1。

而 T extends B 就看 B 是否为 any 或其它类型，结果是变化的。

函数类型的判断是整体结构相同且参数类型相容才算相等；

在泛型中加入条件逻辑后，any 的透明性会失效。

```ts
type F1 = <T>() => T extends any ? 1 : 2;    // always 1
type F2 = <T>() => T extends string ? 1 : 2;

type Test = F1 extends F2 ? true : false;    // false ✅
```
如果 F1 是完全相同的结构，它应该被认为是 F2 的子类型；

但由于 F1 总是返回 1，而 F2 的行为依赖于 T，因此两者不等。

这就是 any 被“识破”的机制。

## 3. NotEqual

```ts
type NotEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? false : true
```

## 4. IsUnion

```ts
type IsUnion<A, B = A> = A extends A
    ? [B] extends [A]
        ? false
        : true
    : never
```

## 5. IsNever

如果条件类型左边是never, 那永远返回never, 所以判定never要写右边
```ts
type IsNever<T> = [T] extends [never] ? true : false
```

## 6. IsTuple

元组类型的 length 是数字字面量，而数组的 length 是 number

```ts
type IsTuple<T> = T extends [...params: infer args]
    ? NotEqual<args['length'], number>
    : false
    
type NotEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? false : true
// true
type test9 = IsTuple<[1, 2, 3]>
```

## 7. UnionToIntersection

联合类型转交叉类型
```ts
type UnionToIntersection<U> =
    (U extends U ? (x: U) => unknown : never) extends
    (x: infer R) => unknown
    ? R
    : never
```

`U extends U` 是为了触发联合类型的分发，每个类型单独计算,最后合并

利用 U 做为参数构造个函数，通过模式匹配取参数的类型

TS 中有函数参数是有逆变性，如果参数是多个类型，参数类型会变成它们的交叉类型

## 8. GetOptional

提取索引类型中的可选索引

可选索引的特性：可选索引的值为 undefined 和值类型的联合类型

https://juejin.cn/book/7047524421182947366/section/7048282437238915110?enter_from=course_center&utm_source=course_center#heading-7