---
title: TS类型技巧(一):提取
date: 2025-05-15 21:58:58
categories: 技术栈
tags: 
    - TypeScript
---

Extends + Infer

```ts
type GetValueType<P> = P extends Promise<infer Value>
    ? Value
    : never

// '123'
type a = GetValueType<Promise<'123'>>
```

extends 对 P 做类型匹配

顺便 infer 声明并储存变量

如果extends匹配成立，就返回infer 储存的变量，否则就返回 never。

## 1. 数组 提取类型

```ts
type arr = [1, 2, 3]
// 其中的<Arr extends unknown[]>约束了GetFirst接收的必须是一个数组
type GetFirst<Arr extends unknown[]> = Arr extends [
    infer First,
    ...unknown[]
]
    ? First
    : never

type a = GetFirst<arr> // 1
```

## 2. 字符串 提取类型

```ts
type GetStartWord<Str extends string> =
    Str extends `${infer Prefix} ${string}` ? Prefix : never

type GetStartChar<Str extends string> =
    Str extends `${infer Prefix}${string}` ? Prefix : never

type StartsWith<
    Str extends string,
    Prefix extends string
> = Str extends `${Prefix}${string}` ? true : false

type a = GetStartWord<'hello world'> // 'hello'
type b = GetStartChar<'hello world'> // 'h'
type c = StartsWith<'hello world', 'h'> // true
```

借此可以对字符串的改动进行约束

__Replace__

```ts
// 替换一段内容，仅限一段
type ReplaceStr<
    Str extends string,
    From extends string,
    To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${Suffix}`
    : Str

// 'hello typescript'
type e = ReplaceStr<'hello world', 'world', 'typescript'> 
```

__ReplaceAll__

```ts
// 替换所有内容(递归)
type ReplaceStrAll<
    Str extends string,
    From extends string,
    To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${ReplaceStrAll<Suffix, From, To>}`
    : Str

// 'hello typescript typescript'
type f = ReplaceStrAll<'hello world world', 'world', 'typescript'> 
```

__SubString__

```ts
type SubString<
    Str extends string,
    SubStr extends string
> = Str extends `${infer Prefix}${SubStr}${infer Suffix}`
    ? SubString<`${Prefix}${Suffix}`, SubStr>
    : Str
    
// "hello_world"
type subString = SubString<'hello_world_t_t_t', '_t'>
```

__Trim__

```ts
// 去除所有空格
type Trim<str extends string> =
    str extends `${infer Prefix}${
        | ' '
        | '\n'
        | '\t'}${infer Suffix}`
        ? Trim<`${Prefix}${Suffix}`>
        : str

// 'helloworld'
type g = Trim<' hello world '>
```

## infer extends 和 & string

```ts
type TestInferLast<T extends string[]> =
    T extends [ ...infer _Rest, infer Last ]
      // 报错，不能将类型“Last”分配给类型“string | xxx
      // 因为，infer推导的元素默认为unknown类型
      ? `last${Last}`
      : never
```

通用解决方案

```ts
// 改 Last 调用处
`last${Last & string}`
// 或
Last extends string ? `last${Last}` : never
```

ts 4.7 开始进行了优化, 可以这样写 `infer xxx extends string`

```ts
// 改 Last 生成处
T extends [ ...infer _Rest, infer Last extends string ]
```

__infer extends__ 对infer变量进行了类型转换

```ts
type StrToBoolean<Str> =
    Str extends `${infer Bool extends boolean}` ? Bool : Str
// true
type res2 = StrToBoolean<'true'>

type StrToNull<Str> =
    Str extends `${infer Null extends null}` ? Null : Str
// null
type res3 = StrToNull<'null'>
```

```ts
// string 转 number
type StringToNumber<Str> =
    Str extends `${infer Num extends number}` ? Num : Str;

// 123
type testStringToNumber = StringToNumber<'123'>;

enum Code { a = 111, b = 222, c = 'abc' }

// "111" | "222" | "abc". 获取enum 的value
type getEnumValue = `${Code}`;

// 111 | 222 | "abc", string转number
type testStrToNum = StringToNumber<`${Code}`>;
```

## 3. 函数 提取类型

```ts
type GetParameters<Func extends Function> = Func extends (
    ...args: infer Args
) => unknown
    ? Args
    : never

// [a: string, b: number]
type h = GetParameters<(a: string, b: number) => void>
```

__提取this类型__

函数中对this 进行约束

```ts
class Dong {
    name: string;
    constructor() {
        this.name = "dong";
    }
    hello() {
        return 'hello, I\'m ' + this.name;
    }
    hello2(this: Dong) { // 约束 this 的类型为 Dong
        return 'hello, I\'m ' + this.name;
    }
}
const dong = new Dong();
// hello2 约束了this类型必须为dong，这里的this不会被计入参数列表中
dong.hello2();
// 报错。如果没有报错，说明没开启 strictBindCallApply 的编译选项
dong.hello2.call({something: 'lazy'});
// hello1 不报错
dong.hello.call({something: 'lazy'});
```

函数中提取 约束过的this类型

```ts
// 提取约束过的this的类型
type GetThisParameter<
    Func extends (this: any, ...args: any[]) => any
> = Func extends ( this: infer ThisType, ...args: any[] ) => any
    ? ThisType
    : never

type i = GetThisParameter<typeof dong.hello> // unknown
type j = GetThisParameter<typeof dong.hello2> // Dong
```

注意，不能直接 Dong.hello 访问hello，除非hello是静态属性

本质是因为 class 只是一个语法糖，只有在 new关键字执行时，hello才被创建并挂载进实例

Dong本身并不是变量值，也不是命名空间，仅仅是一个类型，所以不能Dong.hello

__提取构造器类型__

```ts
// 首先约束GetInstanceType<T>接收的T为构造器类型
type GetInstanceType<
    ConstructorType extends new (...args: any) => any
> = ConstructorType extends new (
    ...args: any
) => infer InstanceType
    ? InstanceType
    : any

interface Person { name: string }

interface PersonConstructor { new (name: string): Person }
// Person
type k = GetInstanceType<PersonConstructor>
```

## 4. 索引类型 提取类型

索引类型就是 键值对的对象类型(可通过T[K]访问)

```ts
// React中 PropsWithRef 就是这个原理，找到props中的ref属性的类型
type GetRefProps<Props> = 
    'ref' extends keyof Props
        ? Props extends { ref?: infer Value | undefined}
            ? Value
            : never
        : never;
```

`'ref' extends keyof Props` 的作用是:明确限制只有在 'ref' 存在时才进行下一步infer推断

`Props extends { ref?: infer Value | undefined}` 匹配并推断value类型

`| undefined` 作用是 从infer value 推断中额外排除了undefined，此时会是never

那就奇怪了，第二句 既做到了匹配ref 又做到了去除undefined，那第一句还有什么作用?

在 ts3.0 里面如果没有对应的索引，Obj[Key] 返回的是 {} 而不是 never，所以这样做下兼容处理。

所以第一句本质上只是一句兼容处理！！！ 没有它也一样！！！

## 5. 一句话用法总结

使用 类型 extends 另一个类型 的模式判断是否匹配，

在匹配的同时 从另一个类型中把需要提取的部分 infer 提取变量，  

后续可对此变量进行进一步处理
