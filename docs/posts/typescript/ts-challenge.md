---
title: TS类型体操
date: 2025-05-29 16:57:51
categories: 技术栈
tags: 
    - TypeScript
---


## 0. 内置工具类速查

### Extract 联合类型保留指定部分

`type Extract<T, U> = T extends U ? T : never;`

### Exclude 联合类型去除指定部分

`type Exclude<T, U> = T extends U ? never : T`

### Record 创建索引类型

`type Record<K extends keyof any, T> = { [P in K]: T };`

### Pick 选取索引

`type Pick<T, K extends keyof T> = { [P in K]: T[P] };`

### Omit 去除索引

`type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>`

### Partial 索引变可选

`type Partial<T> = { [P in keyof T]?: T[P] };`

### Required 索引取消可选

`type Required<T> = { [P in keyof T]-?: T[P] };`

### Readonly 索引变只读

`type Readonly<T> = { readonly [P in keyof T]: T[P] };`

### 字符串大小写

大写，小写，首字母大写，首字母小写  
`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize`

### Awaited

```ts
type Awaited<T> =
    T extends null | undefined
        ? T 
        : T extends object & { then(onfulfilled: infer F, ...args: any): any }
            ? F extends ((value: infer V, ...args: any) => any)
                ? Awaited<V>
                : never 
            : T;
```

### 提取函数内类型

```ts
// 提取函数 参数类型
type Parameters0<T extends (...args: any) => any> =
    T extends (...args: infer P) => any ? P : never

// 提取函数 返回类型
type ReturnType0<T extends (...args: any) => any> =
    T extends (...args: any) => infer R ? R : never

// 提取函数 this类型
type ThisParameterType0<T> =
    T extends ( this: infer U, ...args: any[] ) => any
    ? U : unknown

// 移除函数 this类型
type OmitThisParameter0<T> =
    unknown extends ThisParameterType<T>
        ? T
        : T extends (...args: infer A) => infer R
            ? (...args: A) => R
            : T

// 提取构造器 参数类型
type ConstructorParameters0<
    T extends abstract new (...args: any) => any
> = T extends abstract new (...args: infer P) => any
    ? P : never

// 提取构造器 返回类型(实例)
type InstanceType0<
    T extends abstract new (...args: any) => any
> = T extends abstract new (...args: any) => infer R
    ? R : never
```

这里尝试写, 删除函数this类型, 暴露了两个问题

this必须显示声明类型, 数组类型 不能直接在函数中参数展开

```ts
// 这里的实现方式也是错的
type OmitThisParameter0<T> =
    // this: any 这里any必须加, 
    T extends (this, ...args: infer A) => infer R
    // ...A 这里必须改 ...args:A, 因为A是数组类型，不能参数展开
    ? (...A) => R : T; 
```

提取函数This类型必须显示声明this，即变量名必须写this

```TS
// 提取函数第一个参数类型,和提取this只差个参数名， 可见this必须显示声明
type FirstParameter<T> =
    T extends ( arg1: infer A, ...args: any[] ) => any
    ? A : never

type NthParameter<T, N extends number> =
    T extends (...args: infer P) => any
    ? P[N] : never;
```

## 1. a=1&a=2&b=2&c=3

要求

```ts
// { a: ["1", "2"]; b: "2"; c: "3"; }
type ParseQueryStringResult = ParseQueryString<'a=1&a=2&b=2&c=3'>
```

```ts
// 工具，解析形如 key=value 的字符串为对象类型
type ParseParam<Param extends string> =
    Param extends `${infer Key}=${infer Value}`
        // 直接写 {[Key]: Value} Key会被识别为字面量而非变量
        ? {[K in Key]: Value}
        : {}

// 工具: Key相同的两个value合并为数组
// 注意: value本身可能已经是数组，由于是从后往前，所以只有Other可能是数组
type MergeValues<One, Other> =
    One extends Other
        // 俩value相等, 随便返回谁
        ? One
        // 俩value不相等, 开始合并
        : Other extends unknown[]
            // Other是数组, 解构other合并
            ? [One, ...Other]
            // Other不是数组, 直接合并
            : [One, Other]

// 第二层，这里都是ParseParam过的数据，从<{b:3}, {c:4}>开始
type MergeParams<
    T extends Record<string, any>,
    U extends Record<string, any>
> = {
    // 遍历两个对象的key
    [Key in keyof T | keyof U]:
        Key extends keyof T
            ? Key extends keyof U
                // Key在1中,又在2中,value就要合并为数组
                ? MergeValues<T[Key], U[Key]>
                // Key在1中,不在2中,返回1的value
                : T[Key]
            : Key extends keyof U
                // Key不在1中,在2中,返回2的value
                ? U[Key]
                // Key不在1中,不在2中,返回never
                : never
}

// 第一层
type ParseQueryString<Str extends string> =
    Str extends `${infer Param}&${infer Rest}`
        // MergeParams 会在回溯阶段从后往前执行,也就是说最后两个参数会先合并,然后往前推
        ? MergeParams< ParseParam<Param>, ParseQueryString<Rest> >
        // 到这里其实是，最后一个参数，直接parse并返回上一层,然后开始 MergeParams
        : ParseParam<Str>

// { a: ["1", "2"]; b: "2"; c: "3"; }
type ParseQueryStringResult = ParseQueryString<'a=1&a=2&b=2&c=3'>
```

__keyof 是一种内置操作符, 联合类型不对 keyof 分发__

`keyof T | keyof U`不能写成 `keyof (T | U)`，这样是拿交集的Key

## 2. 大小驼峰转中分线

```ts
// PascalCase/CamelCase To KebabCase
// 遍历Letter转小写, 同时发现下一个Rest首字母大写就加`-`

// Letter = "F", Rest = "ooBarBaz"
// Rest 首字母小写 => "f" + KebabCase<"ooBarBaz">
// Letter = "o", Rest = "oBarBaz"
// Rest 首字母小写 => "o" + KebabCase<"oBarBaz">
// Letter = "o", Rest = "BarBaz"
// Rest 首字母大写 => "o" + "-" + KebabCase<"BarBaz">
// Letter = "B", Rest = "arBaz"
// Rest 首字母小写 => "b" + KebabCase<"arBaz">
type KebabCase<S> =
    S extends `${infer Letter}${infer Rest}`
        ? Rest extends Uncapitalize<Rest>
            ? `${Lowercase<Letter>}${KebabCase<Rest>}` 
            : `${Lowercase<Letter>}-${KebabCase<Rest>}`
        : S;
// "foo-bar-baz"
type testKebabCase = KebabCase<'FooBarBaz'>
// 只能用 Uncapitalize 不能用 Capitalize
// 因为 二者对于 遍历到末尾必现的 Rest为'' extends结果均为true
// Capitalize 为true 会导致 末尾多加一个'-'
```

```ts
// 中分线转小驼峰
type KebaCaseToCamelCase<T extends string> =
    T extends `${infer First}-${infer Rest}`
        ? `${First}${KebaCaseToCamelCase<Capitalize<Rest>>}`
        : T
// "aaaBbbCcc"
type testKebaCaseToCamelCase = KebaCaseToCamelCase<'aaa-bbb-ccc'>
```

## 3. 数组分组

要求

```ts
//  [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
type testChunk = Chunk<[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3>
```

```ts
type Chunk<
    T extends unknown[],
    ItemLen extends number,
    CurItem extends unknown[] = [],
    R extends unknown[] = []
> = T extends [infer First, ...infer Rest]
    ? CurItem['length'] extends ItemLen
        ? Chunk<Rest, ItemLen, [First], [...R, CurItem]>
        : Chunk<Rest, ItemLen, [...CurItem, First], R>
    : [...R, CurItem]

//  [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
type testChunk = Chunk<[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3>
```

## 4. 路径变对象

```ts
// { a: { b: { c: 'xxx' } } }
type testTupleToNestedObject =
    TupleToNestedObject<['a', 'b', 'c'], 'xxx'>
```

```ts
type TupleToNestedObject<
    Tuple extends unknown[],
    Value
> = Tuple extends [infer First, ...infer Rest]
    ? { [Key in First as Key extends keyof any ? Key : never]
            : Rest extends unknown[]
                ? TupleToNestedObject<Rest, Value>
                : Value }
    : Value
```

过滤key,再给value 递归调用Rest进行赋值

`[Key in First as Key extends keyof any ? Key : never]`

过滤Key,应该是常用写法了,可以记

## 5. 指定Key变可选

```ts
// { name?: string | undefined; age: number; address: string; }
type testPartialObjectPropByKeys = PartialObjectPropByKeys<
    Dong,
    'name'
>
```

```ts
interface Dong {
    name: string
    age: number
    address: string
}

type Copy<Obj extends Record<string, any>> =
    { [Key in keyof Obj]: Obj[Key] }

type PartialObjectPropByKeys<
    T extends Record<string, any>,
    Key extends keyof any
> = Copy< Partial<Pick<T, Extract<keyof T, Key>>> & Omit<T, Key> >

// { name?: string | undefined; age: number; address: string; }
type testPartialObjectPropByKeys =
    PartialObjectPropByKeys< Dong, 'name' >

```

## 6. 柯里化

返回值类型与当时传入参数有关，需要动态生成类型

```ts
const func = (a: boolean, b: number, c: string) => {}
// (arg: boolean) => (arg: number) => (arg: string) => never
const curriedFunc = currying(func)
```

```ts
type CurriedFunc<Params, Return> =
    Params extends [ infer Arg, ...infer Rest ]
        ? (arg: Arg) => CurriedFunc<Rest, Return>
        : never

declare function currying<Func>(fn: Func):
    Func extends (...args: infer Params) => infer Result
        ? CurriedFunc<Params, Result>
        : never

// 使用 interface 表达 currying 函数的类型签名
interface Currying {
    <Func>(fn: Func):
    Func extends (...args: infer Params) => infer Result
        ? CurriedFunc<Params, Result>
        : never
}

const func = (a: boolean, b: number, c: string) => {}
// (arg: boolean) => (arg: number) => (arg: string) => never
const curriedFunc = currying(func)
// (arg: boolean) => (arg: number) => (arg: string) => never
declare const currying2: Currying;
const curriedFunc2 = currying2(func)
```

`declare function` 是直接声明一个 实际存在的函数（通常由 JS 提供或实现）

## 7. 索引类型所有Key的路径

```ts
type Obj = {
    a: {
        b: {
            b1: string
            b2: string
        }
        c: {
            c1: string
            c2: string
        }
    }
}

// "a" | "a.b" | "a.c" | "a.b.b1" | "a.b.b2" | "a.c.c1" | "a.c.c2"
type AllKeyPathRes = AllKeyPath<Obj>

type AllKeyPath<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Key extends string
        ? Obj[Key] extends Record<string, any>
            ? Key | `${Key}.${AllKeyPath<Obj[Key]>}`
            : Key
        : never
}[keyof Obj]
```

## 8. 合并两个索引类型

要求 a有b没有 或 a没有b有 的属性变为 可选属性

```ts
type AA = { aaa: 111; bbb: 222 }
type BB = { bbb: 222; ccc: 333 }

// { aaa: 111; bbb?: 222 | undefined; ccc?: 333 | undefined; }
type DefaultizeRes = Copy<Defaultize<AA, BB>>

type Defaultize<A, B> = Pick<A, Exclude<keyof A, keyof B>> &
    Partial<Pick<A, Extract<keyof A, keyof B>>> &
    Partial<Pick<B, Exclude<keyof B, keyof A>>>

type Copy<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Obj[Key]
}
```

## 9. 日期

```ts
type Separator = '-' | '.' | '/';

type Num = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type Num2 = Num | 0

type YY = `19${Num2}${Num2}` | `20${Num2}${Num2}`;

type MM = `0${Num}` | `1${0 | 1 | 2}`;

type DD = `${0}${Num}` | `${1 | 2}${Num2}` | `3${0 | 1}`;

type GenStr<Type extends string> = 
  Type extends 'YY'
    ? YY
    : Type extends 'MM'
      ? MM
      : DD;

type FormatDate<Pattern extends string> = 
  Pattern extends `${infer Aaa}${Separator}${infer Bbb}${Separator}${infer Ccc}`
    ? Pattern extends `${Aaa}${infer Sep}${Bbb}${infer _}${Ccc}`
      ? `${GenStr<Aaa>}${Sep}${GenStr<Bbb>}${Sep}${GenStr<Ccc>}`
      : never
    : never;

const a: FormatDate<'YY-MM-DD'> = '2023-01-02';

const b: FormatDate<'DD/MM/YY'> = '01/02/2024';

const c: FormatDate<'DD/MM/YY'> = '2024-01-02';
```

## 10. TupleToObject

```ts
type TupleToObject<T extends readonly (keyof any)[]> =
    { [Key in T[number]]: Key}
```

`T extends readonly (keyof any)[]` 是限定 元组类型 标准写法

```ts
// readonly 修饰数组，代表是一个元组类型
const tupleNumber = [1, 2, 3, 4] as const
// typeof tupleNumber(内涵as const) 就是元组类型，无readonly会报错
type test = TupleToObject<typeof tupleNumber>
```

## MyReadOnly2

将 T 中的 K属性变为ReadOnly, 且没传K时, 全部变为ReadOnly

```ts
type MyReadonly2<T, K extends keyof T = keyof T> =
    Simplify<Omit1<T, K> & Readonly1<Pick1<T,K>>>
// 下面是用到的工具类型
type Exclude1<T, U> = T extends U ? never: T;
type Pick1<T, K extends keyof T> = 
    { [P in K]: T[P] }
type Omit1<T, K extends keyof T> =
    Pick1<T, Exclude1<keyof T, K>>
type Readonly1<T> =
    { readonly [ P in keyof T ]: T[P]}
type Simplify<T> =
    { [P in keyof T]: T[P] }
// 下面是test Case
interface Todo1 {
  title: string
  description?: string
  completed: boolean
}
type test = MyReadonly2<Todo2, 'title' | 'description'>
```

## Promise.all

```ts
import type { Equal, Expect } from './test-utils'
const promiseAllTest1 = PromiseAll([1, 2, 3] as const)
const promiseAllTest2 = PromiseAll([1, 2, Promise.resolve(3)] as const)
const promiseAllTest3 = PromiseAll([1, 2, Promise.resolve(3)])
const promiseAllTest4 = PromiseAll<Array<number | Promise<number>>>([1, 2, 3])
const promiseAllTest5 = PromiseAll<(number | Promise<string>)[]>([1, 2, Promise.resolve('3')])

type cases = [
  Expect<Equal<typeof promiseAllTest1, Promise<[1, 2, 3]>>>,
  Expect<Equal<typeof promiseAllTest2, Promise<[1, 2, number]>>>,
  Expect<Equal<typeof promiseAllTest3, Promise<[number, number, number]>>>,
  Expect<Equal<typeof promiseAllTest4, Promise<number[]>>>,
  Expect<Equal<typeof promiseAllTest5, Promise<(number | string)[]>>>,
]

declare function PromiseAll<T extends unknown[]>(values: readonly [...T] ): Promise<{
    [ K in keyof T ]: Awaited<T[K]>
}>
    // Awaited<>：用于展开 PromiseLike(或普通值),获取内部类型
    // readonly [...T]：用于限定T 强制「保留传入元组的结构」, 不然后续推断结果会不准确(test3)
    // 同时，实现的时候也会限制函数体内 不能修改values参数
```
