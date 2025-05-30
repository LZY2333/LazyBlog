---
title: TS类型体操
date: 2025-05-29 16:57:51
categories: 技术栈
tags: 
    - TypeScript
---


## 内置工具类速查

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
`type Partial0<T> = { [P in keyof T]?: T[P] };`

### Required 索引取消可选
`type Required0<T> = { [P in keyof T]-?: T[P] };`

### Readonly 索引变只读
`type Readonly0<T> = { readonly [P in keyof T]: T[P] };`

### 字符串大小写
大写，小写，首字母大写，字母小写
`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize`

### Awaited
```ts
type Awaited<T> =
    T extends null | undefined
        ? T 
        : T extends object & { then(onfulfilled: infer F): any }
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
        ? T : T extends (...args: infer A) => infer R
            ? (...args: A) => R : T

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


## a=1&a=2&b=2&c=3

要求
```ts
// { a: ["1", "2"]; b: "2"; c: "3"; }
type ParseQueryStringResult = ParseQueryString<'a=1&a=2&b=2&c=3'>
```

```ts
// 工具，解析形如 key=value 的字符串为对象类型
type ParseParam<Param extends string> =
    Param extends `${infer Key}=${infer Value}`
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
    OneParam extends Record<string, any>,
    OtherParam extends Record<string, any>
> = {
    // 遍历两个对象的key
    [Key in | keyof OneParam | keyof OtherParam]:
        Key extends keyof OneParam
            ? Key extends keyof OtherParam
                // Key在1中,又在2中,value就要合并为数组
                ? MergeValues<OneParam[Key], OtherParam[Key]>
                // Key在1中,不在2中,返回1的value
                : OneParam[Key]
            : Key extends keyof OtherParam
                // Key不在1中,在2中,返回2的value
                ? OtherParam[Key]
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

## 驼峰转中分线

要求
```ts
// "aaaBbbCcc"
type testKebaCaseToCamelCase = KebaCaseToCamelCase<'aaa-bbb-ccc'>

// "aaa-bbb-ccc"
type testCamelCaseToKebaCase = CamelCaseToKebaCase<'aaaBbbCcc'>
```

```ts
type KebaCaseToCamelCase<T extends string> =
    T extends `${infer First}-${infer Rest}`
        ? `${First}${KebaCaseToCamelCase<Capitalize<Rest>>}`
        : T
// "aaaBbbCcc"
type testKebaCaseToCamelCase = KebaCaseToCamelCase<'aaa-bbb-ccc'>

type CamelCaseToKebaCase<T extends string> =
    T extends `${infer First}${infer Rest}`
        ? First extends Lowercase<First>
            ? `${First}${CamelCaseToKebaCase<Rest>}`
            : `-${Lowercase<First>}${CamelCaseToKebaCase<Rest>}`
        : T
// "aaa-bbb-ccc"
type testCamelCaseToKebaCase = CamelCaseToKebaCase<'aaaBbbCcc'>
```

## 数组分组

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

## 路径变对象

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
