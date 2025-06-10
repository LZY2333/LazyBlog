---
title: TS类型技巧(七):函数
date: 2025-06-10 16:58:30
categories: 技术栈
tags: 
    - TypeScript
---


## 逆变与协变

协变: 要求被赋值给变量的值必须是其 子类型
逆变: 要求被赋值给变量的值必须是其 父类型

双向协变: 要求被赋值给变量的值必须是其 父类型或子类型(兼容老版本的妥协)
不变: 不考虑任何继承关系

```ts

```
如何理解




## 技巧！对最终结果进行最后处理

__当需要对最终结果进行一次处理时，请使用积累参数Result__

JoinType 就用到了这个技巧，JoinType本可以不使用积累参数
```ts
// "l-z-y"
declare const join:Join;
let res = join('-')('l', 'z', 'y')

interface Join{
    <Delimiter extends string>(delimiter: Delimiter):
        <Items extends string[]>(...items: Items) =>
            JoinType<Items, Delimiter>
}

type RemoveFirstDelimiter<Str extends string> =
    Str extends `${infer _}${infer Rest}` ? Rest : Str

type JoinType<
    Items extends any[],
    Delimiter extends string,
    Result extends string = ''
> = Items extends [infer Cur, ...infer Rest]
    ? JoinType<Rest, Delimiter, `${Result}${Delimiter}${Cur & string}`>
    : RemoveFirstDelimiter<Result>
```

另外注意到:

__Join 中第一个函数返回值使用了`:`,第二个函数返回值使用了`=>`__

`:` 是 `interface` 中定义函数的要求

`=>` 是 `type` 中定义函数的要求
```ts
// 这里与 join 的语法一致
interface Add1 {
  (a: number): (b: number) => number;
}
// 使用type就可以改写成都为 => 的写法
type Add2 = (a: number) => (b: number) => number;
// 二者用法一致
declare const add1:Add1
declare const add2:Add2
```