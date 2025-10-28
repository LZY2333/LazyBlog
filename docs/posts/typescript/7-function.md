---
title: TS类型技巧(七):函数
date: 2025-06-10 16:58:30
categories: 技术栈
tags: 
    - TypeScript
---

TS 的类型检查是“结构检查 + 静态推导”，不是运行时逻辑判断。

泛型没有缩小机制,不会因为if语句而缩小范围。

如果某个结构推导必须基于运行结果才能判定是否安全，那 TS 就会报错。

## 函数重载

之前 2构造 篇中的zip类型放进函数得这样写

```ts
// [[1, 4], [2, 5], [3, 6]]
type testZipType = Zip<[1, 2, 3], [4, 5, 6]>

type Zip<
    T extends unknown[],
    U extends unknown[]
> = T extends [infer FT, ...infer RT]
    ? U extends [infer FU, ...infer RU]
        ? [[FT, FU], ...Zip<RT, RU>]
        : []
    : []
```

真正用在函数上要怎么写呢

```ts
// 针对符合 Zip结构 的重载，返回类型为 Zip<T, U>
function zipFunc<T extends unknown[], U extends unknown[]>(a1: T, a2: U): Zip<T, U>
function zipFunc<T, U>(a1: T[], a2: U[]): [T, U][]
function zipFunc(a1: any[], a2: any[]) {
    return a1.map((item, index) => [item, a2[index]])
}

// [[1, 4], [2, 5], [3, 6]]
const testZip = zipFunc([1, 2, 3] as const, [4, 5, 6] as const)
// []
const testZip2 = zipFunc([1, 2, 3], [4, 5, 6])

```

__1. 函数重载2的作用__: 放宽类型要求，不强制检查`Zip<T, U>`的结构

如果没有函数重载2，两处return处会分别报错:

不能将类型`[]` / `[[unknown, unknown]]`分配给类型`Zip<T, U>`

这是因为:

1. TS不会因为if语句而缩小`Zip<T, U>`的范围，`Zip<T, U>`依旧存在多种情况

2. TS无法判断 当前return处是否也是Zip的结束处

__2. 函数重载1匹配上的条件__: 使用元组

__元组是“定长、定元素类型”的数组，能被结构性地完全静态推导。__

使用元组 时会被匹配上函数重载1，即`testZip`

不使用元组 时则会匹配上函数重载2，即`testZip2`

## 逆变与协变

协变: 要求被赋值给变量的值必须是其 子类型

逆变: 要求被赋值给变量的值必须是其 父类型

双向协变: 要求被赋值给变量的值必须是其 父类型或子类型(兼容老版本的妥协)

不变: 不考虑任何继承关系

## 技巧！对最终结果进行最后处理

__当需要对最终结果进行一次处理时，请使用积累参数Result__

JoinType 就用到了这个技巧，JoinType本可以不使用积累参数

```ts
// "l-z-y"
declare const join:Join;
let res = join('-')('l', 'z', 'y')

type RemoveFirstDelimiter<Str extends string> =
    Str extends `${infer _}${infer Rest}` ? Rest : Str

type JoinType<
    Items extends any[],
    Delimiter extends string,
    Result extends string = ''
> = Items extends [infer Cur, ...infer Rest]
    ? JoinType<Rest, Delimiter, `${Result}${Delimiter}${Cur & string}`>
    : RemoveFirstDelimiter<Result>

interface Join{
    <Delimiter extends string>(delimiter: Delimiter):
        <Items extends string[]>(...items: Items) =>
            JoinType<Items, Delimiter>
}
```

__Join 中第一个函数返回值使用了`:`,第二个函数返回值使用了`=>`__

`:` 是 `interface` 定义函数/定义调用签名 的语法要求

`=>` 是 `type` 定义函数 的语法, Join 可以改成 下面示例Join2

```ts
type Join2 =
    <Delimiter extends string>(delimiter: Delimiter) =>
        <Items extends string[]>(...items: Items) =>
            JoinType<Items, Delimiter>
// interface 定义函数/定义调用签名
interface Add1 { (a: number): (b: number) => number; }
// type 定义函数/定义调用签名
type Add2 = { (a: number): (b: number) => number; }
// type 定义函数
type Add3 = (a: number) => (b: number) => number;
// 三者用法一致
declare const add1:Add1
declare const add2:Add2
declare const add3:Add3
```

## 调用签名

| 类型     | 示例                            | 含义             |
|----------|---------------------------------|------------------|
| 调用签名 | `{ (x: number): string }`       | 对象本身可被调用 |
| 属性签名 | `{ foo: (x: number)=> string }` | 对象的属性       |
| 方法签名 | `{ foo(x: number): string }`    | 对象的方法       |
| 构造签名 | `{ new (x: number): Person }`   | 对象可被 new     |
| 索引签名 | `{ [key: string]: number }`     | 索引类型约束     |

## 泛型函数类型

当我想约束一个replace函数，第一反应是ReplaceFn1，然而ReplaceFn2才是我想要的效果

```ts
type ReplaceFn1<
    Str extends string,
    From extends string,
    To extends string
> = (
    str: Str,
    searchValue: From,
    replaceValue: To
) => Str extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${Suffix}`
    : Str;

type ReplaceFn2 = <
    Str extends string,
    From extends string,
    To extends string
>(
    str: Str,
    searchValue: From,
    replaceValue: To
) => Str extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${Suffix}`
    : Str;

const replace: ReplaceFn2 = (str, s, r) =>
  str.replace(s, r) as any;

const result = replace('hello world', 'world', 'TS');
```

ReplaceFn1 是 泛型类型别名, 是 类型工厂, 使用时必须传参才算获得了最终类型

ReplaceFn2 是 泛型函数类型, 本身已经是最终类型, 可直接使用，且自动进行类型推导

ReplaceFn2 本质上是一个对函数的约束，然后在此基础上加入泛型，提取TS变量名，才能写类型推导

如果我们去掉 `<s, sv, r>` 就无法写类型推导，因为函数形参是不能直接作为TS推导使用的

在 TypeScript 中，

函数参数名仅存在于值层（runtime level），而类型推导依赖的是类型层（type level）变量。

要在类型层做推导，必须显式声明一组类型参数`<S, F, T>`，并将值层的参数与类型层的变量建立映射关系。
