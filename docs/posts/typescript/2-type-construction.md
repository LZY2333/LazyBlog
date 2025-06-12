---
title: TS类型技巧(二):构造
date: 2025-05-21 21:36:07
categories: 技术栈
tags: 
    - TypeScript
---

TS类型系统不能对原类型进行修改，而是每次都构造新类型

extends + infer 提取类型，下一步便是 __构造新类型__

## 1. 数组:解构

__解构__,只需要掌握解构语法

```ts
type Push<Arr extends  unknown[], Ele> = [...Arr, Ele];
```

```ts
type Zip<
    T extends [unknown, unknown],
    U extends [unknown, unknown]
> = T extends [infer A, infer B]
    ? U extends [infer C, infer D]
        ? [[A, C], [B, D]]
        : never
    : never
// [[1, 'a'], [2, 'b']];
type tuple1 = Zip<[1, 2], ['a', 'b']> 
```

```ts
// 任意个元组类型构造Zip2(递归)
type Zip2< T extends unknown[], U extends unknown[] > =
    T extends [infer FT, ...infer RT]
        ? U extends [infer FU, ...infer RU]
            ? [[FT, FU], ...Zip2<RT, RU>]
            : []
        : []

// [[1, 4], [2, 5], [3, 6]]
type testZip2 = Zip2<[1, 2, 3], [4, 5, 6]>

```

## 字符串:解构,正则,内置工具

__解构__,__正则__,__内置工具类__

下划线改驼峰
```ts
type CamelCase<Str extends string> = 
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
        : Str;
// "helloWorldTest"
type camelCase = CamelCase<'hello_world_test'>;
```

## 函数:解构

__解构__

```ts
// 加一个参数
type AppendArgument<T extends Function, arg> =
    T extends (...args: infer Args) => infer ReturnType ?
    (...args: [...Args, arg]) => ReturnType : never;

type appendArgument = AppendArgument<() => void, boolean>; // (args_0: boolean) => void
```

## 索引:keyof,in,as

__keyof__ 生成Key的联合类型

__in__ 进行key遍历,以修改value

__as__ 修改key

### 修改value

```ts
type obj = {
    name: string;
    age: number;
    gender: boolean;
}
// 基础用法，可在此基础上修改value
type Mapping<Obj extends object> = { 
    [Key in keyof Obj]: Obj[Key]
}
// { name: string; age: number; gender: boolean }
type mapping = Mapping<obj>;
```

### 修改key, as 重命名

__as__ 修改key叫做 Key Remapping（键重映射）

```ts 
type UppercaseKey<Obj extends object> = { 
    [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
}

// { NAME: string; AGE: number; GENDER: boolean; }
type uppercaseKey = UppercaseKey<obj>

type Record<K extends keyof any, T> = {
    [P in K]: T;
}
// { [x: string]: number; [x: number]: number }
type record = Record<string | number, number>;

// 有了record之后，可以更具体约束为 key 为 string，值为任意类型的索引类型
type UppercaseKey2<Obj extends Record<string, any>> = { 
    [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
}
```
`& string` 是 __通用写法__, Key 可能为string、number、symbol, 代表只取string

`<K extends keyof any>`  约束 K 是可以作为对象键的类型

`K extends string | number | symbol` 与这条完全相等

## `Record<string, any>` 

`Record` 专门用来创建索引类型,class、对象 等都是 索引类型

`Obj extends Record<string, any>` 对比 `Obj extends Object`

后者 无法确保是“纯粹的对象字面量结构”,

`string, number, boolean, array, function` 都属于 `Object`

__以后都可以用`Record<string, any>`代替`Obj extends Object`__

另外 `<T, Key extends keyof T>` 也是常见写法，

此时 Key 为 `string | number | symbol`, 使用 Uppercase需要`Uppercase<Key & string>`

### 删除key, as 条件类型

```ts
// 过滤只保留指定value类型的key
type FilterByValueType<
    Obj extends Record<string, any>,
    ValueType
> = {
    [Key in keyof Obj as Obj[Key] extends ValueType
        ? Key
        : never]: Obj[Key]
}
// { a: string }
type filterByValueType = FilterByValueType<
    { a: string; b: number },
    string
>
```
`Key in keyof Obj` 遍历Obj的key,用 as 修改key

这些key 如果 `extends ValueType`，则保留该key,否则剔除

### 修改修饰符

```ts
type ToReadonly<T> =  {
    readonly [Key in keyof T]: T[Key];
}
type ToPartial<T> = {
    [Key in keyof T]?: T[Key]
}
type ToMutable<T> = {
    -readonly [Key in keyof T]: T[Key]
}
type ToRequired<T> = {
    [Key in keyof T]-?: T[Key]
}
```

__联合类型 归一化技巧__
```ts
// 删除指定属性的readonly修饰符
type RemoveReadonly<
    T extends Record<string, any>,
    K extends keyof T
> =
    // 1. 将 K 中的属性设为可变（移除 readonly）
    { -readonly [P in K]: T[P] }
    // 2. 保留非 K 的其它属性（原样）
    & { [P in Exclude<keyof T, K>]: T[P] }

// 对联合类型归一化
type RemoveReadonly2<
    T extends Record<string, any>,
    K extends keyof T
> =
    { -readonly [P in K]: T[P] }
    & { [P in Exclude<keyof T, K>]: T[P] } extends infer O
    // 3. 重新整理属性顺序（避免交叉类型不易使用）
    ? { [P in keyof O]: O[P] }
    : never

// { name: string; } & { age: number; }
type test1 = RemoveReadonly<
    { readonly name: string; age: number },
    'name'
>
// { name: string; age: number; }
type test2 = RemoveReadonly2<
    { readonly name: string; age: number },
    'name'
>

```

`extends infer O` 这里是小type推导出大type，而之前常见的是大type中infer提取小type

`P in Exclude<keyof T, K>` 属于是 `K in keyof T` 高阶用法，对T进行了先一步过滤，再遍历

`type Exclude<T, U> = T extends U ? never : T` T中排除U

`type Extract<T, U> = T extends U ? T : never` T中只保留U

上面两个内置类型同时还用到了 __联合类的分发策略__ 

## 其他

extends 就是 if条件判断

infer 就是 if条件内进行 解构+变量声明

递归 就是 for循环

in 是遍历

keyof 是解构索引类型

as 键重映射

[神光大佬的TypeScript 类型体操通关秘籍](https://juejin.cn/book/7047524421182947366/section/7048282176701333508)

